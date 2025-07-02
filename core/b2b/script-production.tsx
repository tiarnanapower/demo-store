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
}

export function ScriptProduction({ cartId, storeHash, channelId, token, environment }: Props) {
  useB2BAuth(token);
  useB2BCart(cartId);

   return (
    <>
      <Script>
        {`
        window.b3CheckoutConfig = {
          routes: {
            dashboard: '/#/dashboard',
          },
        }
        window.B3 = {
          setting: {
            store_hash: '${storeHash}',  
            channel_id: ${channelId},
          },
        }
        `}
      </Script>
      <Script
        type="module"
        crossOrigin=""
        src="https://demo-store-core.vercel.app/index.js"
      ></Script>
      <Script
        noModule
        crossOrigin=""
        src="https://demo-store-core.vercel.app/polyfills-legacy.js"
      ></Script>
      <Script
        noModule
        crossOrigin=""
        src="https://demo-store-core.vercel.app/index-legacy.js"
      ></Script>
    </>
  );
}
