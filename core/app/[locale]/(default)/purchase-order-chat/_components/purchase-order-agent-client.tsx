'use client';

import { PurchaseOrderChat } from '@takeshape/purchase-order-chat/shadow';

import { useRouter } from '~/i18n/routing';

interface Props {
  projectId: string;
  apiKey: string;
  channelId: number;
}

/**
 * Deliberately uses the `/shadow` entry point rather than the bare
 * `@takeshape/purchase-order-chat` root export. The root export's
 * `PurchaseOrderAgent` wrapper adds a `checkoutUrl` prop that, if set,
 * silently replaces the single-use redirect URL BigCommerce generates for the
 * agent's own cart -- that was traced back as the cause of checkout landing
 * on an empty cart in the separate buyer-portal integration of this same
 * widget. The `/shadow` export has no such prop; `onCheckout` below is the
 * only way to act on it, so there is nothing to misconfigure into that bug.
 * @returns {JSX.Element} the widget, wired to this route's own GraphQL proxy
 */
export function PurchaseOrderAgentClient({ projectId, apiKey, channelId }: Props) {
  const router = useRouter();

  return (
    <PurchaseOrderChat
      bigcommerce={{
        // Same-origin route handler; see its module comment for why no
        // storefront token is passed from here. Trailing slash matches this
        // project's `trailingSlash: true` config -- without it every request
        // takes a 308 redirect round trip first.
        endpoint: '/api/purchase-order-agent/graphql/',
        channelId,
      }}
      onCheckout={(checkoutUrl) => {
        // This URL is single-use, BigCommerce-hosted, and off-origin -- a
        // Next.js client-side route transition can't carry the browser to a
        // different host, so this needs a real navigation.
        window.location.href = checkoutUrl;
      }}
      onViewProduct={(product) => {
        if (product.path) router.push(product.path);
      }}
      takeshape={{ projectId, apiKey }}
    />
  );
}
