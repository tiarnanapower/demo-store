import { Inter, Plus_Jakarta_Sans, Roboto_Mono } from 'next/font/google';

export const inter = Inter({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-family-inter',
});

export const plusJakartaSans = Plus_Jakarta_Sans({
  display: 'swap',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-family-plus-jakarta-sans',
});

export const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-family-roboto-mono',
});

export const fonts = [inter, plusJakartaSans, robotoMono];
