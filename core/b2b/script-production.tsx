'use client';

import Script from 'next/script';

import { useB2BAuth } from './use-b2b-auth';
import { useB2BCart } from './use-b2b-cart';

interface Props {
  storeHash: string;
  channelId: string;
  token?: string;
  environment: 'staging' | 'production';
  cartId?: string | null;
  bcGraphqlDomain?: string;
  /**
   * Base URL of a self-hosted Buyer Portal build (no trailing slash), e.g.
   * `https://demostoreb2b.netlify.app`. When set, the portal is loaded from that
   * build instead of the BigCommerce-hosted one.
   *
   * This must point at the build's `headless.js`, not `index.js`. They are two separate
   * Vite entry points: `index.js` is `src/main.ts`, the Stencil entry, which expects a
   * Stencil DOM (`login.php`, `account.php`, the `dom.registerElement` selectors) and
   * does not establish the shopper session on Catalyst -- B2B calls then run as a guest,
   * which surfaces as a quote checkout producing a cart with `customers: 0`. `headless.js`
   * is `src/headless.ts`, the bootstrap the hosted portal uses.
   *
   * `headless.js` is always emitted unhashed by the portal's Vite config, so no build flag
   * is needed for the filename to be stable. `VITE_ASSETS_ABSOLUTE_PATH` still matters, so
   * that the chunks it pulls in resolve against the custom host.
   */
  buyerPortalBaseUrl?: string;
}

export function ScriptProduction({
  cartId,
  storeHash,
  channelId,
  token,
  environment,
  bcGraphqlDomain,
  buyerPortalBaseUrl,
}: Props) {
  useB2BAuth(token);
  useB2BCart(cartId);

  return (
    <>
      <Script id="b2b-config">
        {`
            window.B3 = {
              setting: {
                store_hash: '${storeHash}',
                channel_id: ${channelId},
                platform: 'catalyst',
                cart_url: '/cart',
                bc_graphql_domain: '${bcGraphqlDomain ?? 'mybigcommerce.com'}',
              }
            }
        `}
      </Script>
      {buyerPortalBaseUrl ? (
        <Script
          crossOrigin=""
          data-channelid={channelId}
          data-environment={environment}
          data-storehash={storeHash}
          src={`${buyerPortalBaseUrl}/headless.js`}
          type="module"
        />
      ) : (
        <Script
          data-channelid={channelId}
          data-environment={environment}
          data-storehash={storeHash}
          src="https://microapps.bigcommerce.com/b2b-buyer-portal/headless.js"
          type="module"
        />
      )}
    </>
  );
}
