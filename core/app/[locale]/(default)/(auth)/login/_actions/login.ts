'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { AuthError } from 'next-auth';
import { getLocale, getTranslations } from 'next-intl/server';

import { schema } from '@/vibes/soul/sections/sign-in-section/schema';
import { signIn } from '~/auth';
import { redirect } from '~/i18n/routing';
import { getCartId } from '~/lib/cart';
const [STOREFRONT_HOME_LOCATION, BUYER_PORTAL_HOME_LOCATION] = ['0', '1'];

export const login = async (
  { redirectTo }: { redirectTo: string },
  _lastResult: SubmissionResult | null,
  formData: FormData,
) => {
  const locale = await getLocale();
  const t = await getTranslations('Auth.Login');
  const cartId = await getCartId();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return submission.reply();
  }

  try {
    await signIn('password', {
      email: submission.value.email,
      password: submission.value.password,
      cartId,
      redirect: false,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    if (error instanceof BigCommerceGQLError) {
      return submission.reply({
        formErrors: error.errors.map(({ message }) => message),
      });
    }

    if (
      error instanceof AuthError &&
      error.type === 'CallbackRouteError' &&
      error.cause &&
      error.cause.err instanceof BigCommerceGQLError &&
      error.cause.err.message.includes('Invalid credentials')
    ) {
      return submission.reply({ formErrors: [t('invalidCredentials')] });
    }

    return submission.reply({ formErrors: [t('somethingWentWrong')] });
  }
   const landingLoginLocation = formData.get('landingLoginLocation');
  if([BUYER_PORTAL_HOME_LOCATION, STOREFRONT_HOME_LOCATION].includes(landingLoginLocation as string)) {
    const href = landingLoginLocation === BUYER_PORTAL_HOME_LOCATION ? '/?section=orders' : '/';
    return redirect({ href, locale });
  }

  return redirect({ href: '/?section=orders', locale });
};
