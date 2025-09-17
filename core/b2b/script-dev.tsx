/* eslint-disable @next/next/no-before-interactive-script-outside-document */
'use client';

import Script from 'next/script';

import { useB2BAuth } from './use-b2b-auth';
import { useB2BCart } from './use-b2b-cart';

interface DevProps {
  storeHash: string;
  channelId: string;
  hostname: string;
  token?: string;
  cartId?: string;
}

export function ScriptDev({ cartId, hostname, storeHash, channelId, token }: DevProps) {
  useB2BAuth(token);
  useB2BCart(cartId);

  const src = `${hostname}/src/main.ts`;
  
  return (
    <>
      <Script id="b2b-react-refresh" strategy="beforeInteractive" type="module">
        {`
              import RefreshRuntime from 'http://localhost:3001/@react-refresh'
              RefreshRuntime.injectIntoGlobalHook(window)
              window.$RefreshReg$ = () => {}
              window.$RefreshSig$ = () => (type) => type
              window.__vite_plugin_react_preamble_installed__ = true
          `}
      </Script>
      <Script
        id="b2b-vite-client"
        src={`http://localhost:3001/@vite/client`}
        strategy="beforeInteractive"
        type="module"
      />
      <Script type="module" src="http://localhost:3001/src/main.ts"></Script>
      <Script id="b2b-config">
        {`
              window.B3 = {
                setting: {
                  store_hash: '${storeHash}',
                  channel_id: ${channelId},
                },
              };
          `}
      </Script>
      {/* <Script data-channelid={storeHash} data-storehash={channelId} src={src} type="module" /> */}
    </>
  );
}
