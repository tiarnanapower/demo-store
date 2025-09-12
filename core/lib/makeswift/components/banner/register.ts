import { Select, Style, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MSBanner } from './client';
import { FontFamily } from '../../controls/font-tokens';

runtime.registerComponent(MSBanner, {
  type: 'primitive-banner',
  label: 'Basic / My Banner',
  icon: 'form',
  props: {
    className: Style(),
    bannerText: TextInput({ label: 'Name', defaultValue: '' }),
    fontFamily: FontFamily({ label: 'Font', defaultValue: FontFamily.Body }),
    textSize: Select({
         label: 'Text size',
         options: [
           { value: 'small', label: 'Small' },
           { value: 'medium', label: 'Medium' },
           { value: 'large', label: 'Large' },
           { value: 'x-large', label: 'X-Large' },
         ],
         defaultValue: 'small',
       }),
  },
});
