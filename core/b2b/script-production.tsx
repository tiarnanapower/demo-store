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
      <Script id="b3-config" strategy="beforeInteractive">
        {`
          window.b3CheckoutConfig = {
            routes: {
              dashboard: '/#/dashboard',
            },
          };
          window.B3 = {
            setting: {
              store_hash: "${storeHash}",
              channel_id: ${channelId},
            },
          };
        `}
      </Script>

      <Script
        type="module"
        crossOrigin=""
        strategy="afterInteractive"
        src="https://demo-store-core.vercel.app/index.js"
      />
      <Script
        noModule
        crossOrigin=""
        strategy="afterInteractive"
        src="https://demo-store-core.vercel.app/polyfills-legacy.js"
      />
      <Script
        noModule
        crossOrigin=""
        strategy="afterInteractive"
        src="https://demo-store-core.vercel.app/index-legacy.js"
      />
    </>
  );
}
