import { z } from 'zod';

import { auth } from '~/auth';

import { ScriptDev } from './script-dev';
import { ScriptProduction } from './script-production';

// `z.string().url()` alone is not enough here: `new URL('localhost:3001')` parses
// happily with protocol `localhost:`, so a scheme-less value passes validation and
// then renders as a relative script URL. Require http(s) explicitly.
const httpUrl = (label: string) =>
  z
    .string()
    .url()
    .refine((value) => /^https?:\/\//.test(value), {
      message: `${label} must start with http:// or https://`,
    });

const EnvironmentSchema = z.object({
  BIGCOMMERCE_STORE_HASH: z.string({ message: 'BIGCOMMERCE_STORE_HASH is required' }),
  BIGCOMMERCE_CHANNEL_ID: z.string({ message: 'BIGCOMMERCE_CHANNEL_ID is required' }),
  LOCAL_BUYER_PORTAL_HOST: httpUrl('LOCAL_BUYER_PORTAL_HOST').optional(),
  // Base URL of a self-hosted production Buyer Portal build. Trailing slashes are
  // trimmed so callers can set it either way.
  PROD_BUYER_PORTAL_BASE_URL: httpUrl('PROD_BUYER_PORTAL_BASE_URL')
    .optional()
    .transform((url) => url?.replace(/\/+$/, '')),
  STAGING_B2B_CDN_ORIGIN: z.string().optional(),
  BIGCOMMERCE_GRAPHQL_API_DOMAIN: z.string().optional().default('mybigcommerce.com'),
});

export async function B2BLoader() {
  const {
    BIGCOMMERCE_STORE_HASH,
    BIGCOMMERCE_CHANNEL_ID,
    LOCAL_BUYER_PORTAL_HOST,
    PROD_BUYER_PORTAL_BASE_URL,
    STAGING_B2B_CDN_ORIGIN,
    BIGCOMMERCE_GRAPHQL_API_DOMAIN,
  } = EnvironmentSchema.parse(process.env);

  const session = await auth();

  if (LOCAL_BUYER_PORTAL_HOST) {
    return (
      <ScriptDev
        bcGraphqlDomain={BIGCOMMERCE_GRAPHQL_API_DOMAIN}
        cartId={session?.user?.cartId ?? undefined}
        channelId={BIGCOMMERCE_CHANNEL_ID}
        hostname={LOCAL_BUYER_PORTAL_HOST}
        storeHash={BIGCOMMERCE_STORE_HASH}
        token={session?.b2bToken}
      />
    );
  }

  const environment = STAGING_B2B_CDN_ORIGIN === 'true' ? 'staging' : 'production';

  return (
    <ScriptProduction
      bcGraphqlDomain={BIGCOMMERCE_GRAPHQL_API_DOMAIN}
      buyerPortalBaseUrl={PROD_BUYER_PORTAL_BASE_URL}
      cartId={session?.user?.cartId}
      channelId={BIGCOMMERCE_CHANNEL_ID}
      environment={environment}
      storeHash={BIGCOMMERCE_STORE_HASH}
      token={session?.b2bToken}
    />
  );
}
