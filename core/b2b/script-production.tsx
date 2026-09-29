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
}

export function ScriptProduction({
  cartId,
  storeHash,
  channelId,
  token,
  environment,
  bcGraphqlDomain,
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
      {/*
        Points at the built bundle (index.js), not this host's headless.js. headless.js is only a
        loader: it calls initHeadlessScripts(), which asks the B2B API for the portal's script URLs
        and is answered with BigCommerce-hosted ones -- verified directly against
        api-b2b.bigcommerce.com, which returns
        microapps.bigcommerce.com/b2b-buyer-portal/index.*.js for this store and channel. Routing
        through it therefore runs stock BigCommerce rather than this build.
      */}
      <Script
        data-channelid={channelId}
        data-environment={environment}
        data-storehash={storeHash}
        src="https://mainbuyer-portal-po-agent.netlify.app/index.js"
        type="module"
      />
    </>
  );
}
