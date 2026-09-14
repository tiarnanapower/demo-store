import { themeToCssVars } from './to-css';

export const colors = {
  primary: '327 100% 44%',
  accent: '327 100% 91%',
  background: '0 0% 100%',
  foreground: '0 0% 7%',
  success: '116 78% 65%',
  error: '0 100% 60%',
  warning: '40 100% 60%',
  info: '220 70% 45%',
  contrast: {
    100: '0 0% 96%',
    200: '0 0% 87%',
    300: '0 0% 74%',
    400: '0 0% 55%',
    500: '0 0% 20%',
  },
  primaryMix: {
    white: {
      75: '327 100% 86%',
    },
    black: {
      75: '327 74% 11%',
    },
  },
};

export const BaseColors = () => (
  <style data-makeswift="theme-base-colors">{`:root {
      ${themeToCssVars(colors).join('\n')}
    }
  `}</style>
);
