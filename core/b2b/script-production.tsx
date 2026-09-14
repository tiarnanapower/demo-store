'use client';

import Script from 'next/script';

import { useB2BAuth } from './use-b2b-auth';
import { useB2BCart } from './use-b2b-cart';

interface Props {
  /**
   * Base URL of a self-hosted Buyer Portal build, no trailing slash. When set, the portal is
   * loaded from that build instead of the BigCommerce-hosted one.
   *
   * This points at `index.js`, the built application bundle, which is what the portal's own
   * docs/headless.md prescribes for a self-hosted deployment. It deliberately does NOT go via
   * that build's `headless.js`: that entry only calls initHeadlessScripts(), which asks the B2B
   * API for its script URLs and is answered with BigCommerce-hosted ones -- so routing through it
   * would quietly run stock BigCommerce rather than this build.
   *
   * The build must set VITE_ASSETS_ABSOLUTE_PATH to this same base URL (with a trailing slash) so
   * its lazily-loaded chunks resolve against this host, and VITE_DISABLE_BUILD_HASH=TRUE so the
   * entry filename is a stable `index.js`.
   */
  buyerPortalBaseUrl?: string;
  storeHash: string;
  channelId: string;
  token?: string;
  environment: 'staging' | 'production';
  cartId?: string | null;
  bcGraphqlDomain?: string;
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
      {buyerPortalBaseUrl == null || buyerPortalBaseUrl === '' ? (
        <Script
          data-channelid={channelId}
          data-environment={environment}
          data-storehash={storeHash}
          src="https://microapps.bigcommerce.com/b2b-buyer-portal/headless.js"
          type="module"
        />
      ) : (
        <Script
          crossOrigin=""
          data-channelid={channelId}
          data-environment={environment}
          data-storehash={storeHash}
          src={`${buyerPortalBaseUrl.replace(/\/+$/, '')}/index.js`}
          type="module"
        />
      )}
    </>
  );
}
