import { BigCommerceAPIError } from '@bigcommerce/catalyst-client';
import { NextRequest, NextResponse } from 'next/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

/**
 * Same-origin GraphQL proxy for the Purchase Order Agent widget
 * (`@takeshape/purchase-order-chat`).
 *
 * The widget is a client-side React component that needs to call the
 * BigCommerce Storefront GraphQL API directly. Rather than hand it a
 * storefront token to carry in the browser bundle, it is pointed at this
 * route and given no credentials of its own -- every request is re-issued
 * here using Catalyst's own GraphQL client, the same one every other page on
 * this site already uses.
 *
 * That gets us three things for free, none of which a client-held token can
 * provide:
 *  - The right channel. `~/client` already resolves it the same way as the
 *    rest of the site; there is no second, independent channel to drift out
 *    of sync with the real one.
 *  - The right customer. `X-Bc-Customer-Access-Token` is BigCommerce's own
 *    supported mechanism for binding a Storefront API request to a signed-in
 *    shopper -- the same header every other authenticated query on this site
 *    sends. A cart the agent creates while the buyer is signed in belongs to
 *    that buyer, with their company pricing and saved addresses, without
 *    resolving or forwarding any customer id ourselves.
 *  - No secret in the browser. The storefront token never leaves this
 *    function. A signed-out visitor still gets a working, anonymous agent --
 *    `customerAccessToken` is simply undefined and BigCommerce creates a
 *    guest cart, same as browsing the store signed out does anywhere else.
 */

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body: unknown = await request.json().catch(() => null);

  if (!isRecord(body) || typeof body.query !== 'string') {
    return NextResponse.json(
      { errors: [{ message: 'Expected a JSON body with a string `query` field.' }] },
      { status: 400 },
    );
  }

  const variables = isRecord(body.variables) ? body.variables : {};
  const customerAccessToken = await getSessionCustomerAccessToken();

  try {
    // `body.query` is a runtime value, not a literal template string, so
    // gql.tada has no schema to extract types from here and this produces a
    // loosely-typed document -- but it's the same tag every other query in
    // this codebase uses, so it stays structurally compatible with
    // `client.fetch`'s `document` parameter with no cast required.
    const result = await client.fetch({
      document: graphql(body.query),
      variables,
      customerAccessToken,
      // GraphQL-level errors should reach the widget in the response body, the
      // same shape BigCommerce itself returns, rather than throwing here --
      // the widget has its own handling for a GraphQL `errors` array.
      errorPolicy: 'all',
    });

    return NextResponse.json(result);
  } catch (error) {
    // With errorPolicy 'all', client.fetch only throws for an HTTP-level
    // failure (BigCommerceAPIError and its subclasses) -- a GraphQL error on
    // an otherwise-successful response is returned above, not thrown.
    if (error instanceof BigCommerceAPIError) {
      return NextResponse.json(
        {
          errors: error.graphqlErrors.length ? error.graphqlErrors : [{ message: error.message }],
        },
        { status: error.status },
      );
    }

    // eslint-disable-next-line no-console
    console.error('[purchase-order-agent/graphql] Unexpected error:', error);

    return NextResponse.json(
      { errors: [{ message: 'Unexpected error contacting BigCommerce.' }] },
      { status: 500 },
    );
  }
}
