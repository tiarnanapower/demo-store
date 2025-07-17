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
      <script>
        {`
          window.b3CheckoutConfig = {
            routes: {
              dashboard: '/account.php?action=order_status',
            },
          }
          window.B3 = {
            setting: {
              store_hash: '${storeHash}',  
              channel_id: ${channelId},
              platform: 'catalyst',
            },
            'dom.checkoutRegisterParentElement': '#checkout-app',
            'dom.registerElement': '[href^="/login.php"], #checkout-customer-login, [href="/login.php"] .navUser-item-loginLabel, #checkout-customer-returning .form-legend-container [href="#"]',
            'dom.openB3Checkout': 'checkout-customer-continue',
            before_login_goto_page: '/account.php?action=order_status',
            checkout_super_clear_session: 'true',
            'dom.navUserLoginElement': '.navUser-item.navUser-item--account',
          }
        `}
      </script>
      <script
        type="module"
        crossOrigin=''
        src="https://mellow-sprite-147223.netlify.app/index.DCRBdQ0W.js"
      ></script>
      <script
        crossOrigin=''
        src="https://mellow-sprite-147223.netlify.app/polyfills-legacy.CRfQEHlo.js"
      ></script>
      <script
        crossOrigin=''
        src="https://mellow-sprite-147223.netlify.app/index-legacy.x_CMcoSq.js"
      ></script>
    </>
  );
}
