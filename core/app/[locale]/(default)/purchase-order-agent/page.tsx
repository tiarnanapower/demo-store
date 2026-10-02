import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { PurchaseOrderAgentClient } from './_components/purchase-order-agent-client';

interface Props {
  params: Promise<{ locale: string }>;
}

export function generateMetadata(): Metadata {
  return { title: 'Purchase order agent' };
}

/**
 * Catalyst-native home for the Purchase Order Agent, as an alternative to
 * embedding it in the separate buyer portal app. See
 * `core/app/api/purchase-order-agent/graphql/route.ts` for why that matters:
 * running here means the widget rides the buyer's actual signed-in session
 * instead of an anonymous storefront token with no customer attached.
 *
 * Project id and API key are read server-side and passed down as props
 * rather than inlined into the client bundle via `NEXT_PUBLIC_*`, simply
 * because nothing below needs them available before this page's own props
 * arrive -- there's no earlier client-only code path that would require the
 * `NEXT_PUBLIC_` build-time substitution instead.
 * @returns {Promise<JSX.Element>} the page, or a short notice if the required env vars are unset
 */
export default async function PurchaseOrderAgentPage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const projectId = process.env.TAKESHAPE_PROJECT_ID ?? '';
  const apiKey = process.env.TAKESHAPE_API_KEY ?? '';
  const channelId = Number(process.env.BIGCOMMERCE_CHANNEL_ID ?? 1);

  if (!projectId || !apiKey) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-gray-500">
          Purchase order agent is not configured. Set <code>TAKESHAPE_PROJECT_ID</code> and{' '}
          <code>TAKESHAPE_API_KEY</code> to enable it.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PurchaseOrderAgentClient apiKey={apiKey} channelId={channelId} projectId={projectId} />
    </div>
  );
}
