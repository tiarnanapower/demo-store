/* eslint-disable @next/next/no-before-interactive-script-outside-document */
'use client';

import Script from 'next/script';

import { useB2BAuth } from './use-b2b-auth';

interface Props {
  storeHash: string;
  channelId: string;
  token?: string;
  environment: 'staging' | 'production';
}

export function B2BProductionScripts({ storeHash, channelId, token, environment }: Props) {
  useB2BAuth(token);

return (
    <>
      <Script id="b3-config" strategy="beforeInteractive">
        {`
          window.b3CheckoutConfig = {
            routes: {
              dashboard: '/account.php?action=order_status',
            },
          };

          window.B3 = {
            setting: {
              store_hash: '${storeHash}',
              channel_id: ${channelId},
              platform: 'catalyst',
              token: '${token ?? ''}',
            },
            'dom.checkoutRegisterParentElement': '#checkout-app',
            'dom.registerElement': '[href^="/login.php"], #checkout-customer-login, [href="/login.php"] .navUser-item-loginLabel, #checkout-customer-returning .form-legend-container [href="#"]',
            'dom.openB3Checkout': 'checkout-customer-continue',
            before_login_goto_page: '/account.php?action=order_status',
            checkout_super_clear_session: 'true',
            'dom.navUserLoginElement': '.navUser-item.navUser-item--account',
          };
        `}
      </Script>

      <Script
        type="module"
        crossOrigin="anonymous"
        src="https://demostoreb2b.netlify.app/index.C-1RMyzg.js"
      />
      <Script
        crossOrigin="anonymous"
        src="https://demostoreb2b.netlify.app/polyfills-legacy.D32xEujE.js"
      />
      <Script
        crossOrigin="anonymous"
        src="https://demostoreb2b.netlify.app/index-legacy.I7pICwj-.js"
      />
    </>
  );
}

interface DevProps {
  storeHash: string;
  channelId: string;
  hostname: string;
  token?: string;
}

export function B2BDevScripts({ hostname, storeHash, channelId, token }: DevProps) {
  useB2BAuth(token);

  const src = `${hostname}/src/main.ts`;

  return (
    <>
      <Script id="b2b-react-refresh" strategy="beforeInteractive" type="module">
        {`
              import RefreshRuntime from '${hostname}/@react-refresh'
              RefreshRuntime.injectIntoGlobalHook(window)
              window.$RefreshReg$ = () => {}
              window.$RefreshSig$ = () => (type) => type
              window.__vite_plugin_react_preamble_installed__ = true
          `}
      </Script>
      <Script
        id="b2b-vite-client"
        src={`${hostname}/@vite/client`}
        strategy="beforeInteractive"
        type="module"
      />

      <Script id="b2b-config">
        {`
              window.B3 = {
                setting: {
                  store_hash: '${storeHash}',
                  channel_id: ${channelId},
                  platform: 'catalyst',
                  cart_url: '/cart',
                },
              };
          `}
      </Script>
      <Script data-channelid={storeHash} data-storehash={channelId} src={src} type="module" />
    </>
  );
}
