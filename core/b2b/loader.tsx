import { z } from 'zod';

import { auth } from '~/auth';

import { ScriptDev } from './script-dev';
import { ScriptProduction } from './script-production';

// Store/channel config is genuinely fatal, so it stays a hard parse.
const EnvironmentSchema = z.object({
  BIGCOMMERCE_STORE_HASH: z.string({ message: 'BIGCOMMERCE_STORE_HASH is required' }),
  BIGCOMMERCE_CHANNEL_ID: z.string({ message: 'BIGCOMMERCE_CHANNEL_ID is required' }),
  STAGING_B2B_CDN_ORIGIN: z.string().optional(),
  BIGCOMMERCE_GRAPHQL_API_DOMAIN: z.string().optional().default('mybigcommerce.com'),
});

// `z.string().url()` alone is not enough for these: `new URL('localhost:3001')` parses
// happily with protocol `localhost:`, so a scheme-less value passes validation and then
// renders as a *relative* script URL that silently 404s against the storefront origin.
//
// These two only select where the Buyer Portal is loaded from, and B2BLoader renders in
// the root layout -- throwing here would take down every page over a script URL. So a
// malformed value is reported and ignored, falling back to the hosted portal.
function readPortalUrl(name: string, value: string | undefined): string | undefined {
  if (value == null || value === '') {
    return undefined;
  }

  if (!/^https?:\/\//.test(value)) {
    // eslint-disable-next-line no-console
    console.error(
      `[b2b] Ignoring ${name}="${value}": it must start with http:// or https://. ` +
        `Falling back to the BigCommerce-hosted Buyer Portal.`,
    );

    return undefined;
  }

  return value.replace(/\/+$/, '');
}

export async function B2BLoader() {
  const {
    BIGCOMMERCE_STORE_HASH,
    BIGCOMMERCE_CHANNEL_ID,
    STAGING_B2B_CDN_ORIGIN,
    BIGCOMMERCE_GRAPHQL_API_DOMAIN,
  } = EnvironmentSchema.parse(process.env);

  const localBuyerPortalHost = readPortalUrl(
    'LOCAL_BUYER_PORTAL_HOST',
    process.env.LOCAL_BUYER_PORTAL_HOST,
  );
  const prodBuyerPortalBaseUrl = readPortalUrl(
    'PROD_BUYER_PORTAL_BASE_URL',
    process.env.PROD_BUYER_PORTAL_BASE_URL,
  );

  const session = await auth();

  if (localBuyerPortalHost) {
    return (
      <ScriptDev
        bcGraphqlDomain={BIGCOMMERCE_GRAPHQL_API_DOMAIN}
        cartId={session?.user?.cartId ?? undefined}
        channelId={BIGCOMMERCE_CHANNEL_ID}
        hostname={localBuyerPortalHost}
        storeHash={BIGCOMMERCE_STORE_HASH}
        token={session?.b2bToken}
      />
    );
  }

  const environment = STAGING_B2B_CDN_ORIGIN === 'true' ? 'staging' : 'production';

  return (
    <ScriptProduction
      bcGraphqlDomain={BIGCOMMERCE_GRAPHQL_API_DOMAIN}
      buyerPortalBaseUrl={prodBuyerPortalBaseUrl}
      cartId={session?.user?.cartId}
      channelId={BIGCOMMERCE_CHANNEL_ID}
      environment={environment}
      storeHash={BIGCOMMERCE_STORE_HASH}
      token={session?.b2bToken}
    />
  );
}
