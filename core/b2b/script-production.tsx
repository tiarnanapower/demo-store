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
   * The referenced build must be produced with `VITE_DISABLE_BUILD_HASH=TRUE` so the
   * entry filename is a stable `index.js`, and with `VITE_ASSETS_ABSOLUTE_PATH` set to
   * this same base URL (with a trailing slash) so lazy-loaded chunks resolve.
   *
   * Note this cannot go through the portal's own `headless.js`: that bootstrapper asks
   * the B2B API for its script URLs and is always answered with BigCommerce-hosted
   * assets, so a custom build has to be referenced directly.
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
          src={`${buyerPortalBaseUrl}/index.js`}
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
