import {
  Checkbox,
  Image,
  Link,
  Number,
  Select,
  Style,
  TextArea,
  TextInput,
} from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MSCustomComponent } from './client';

runtime.registerComponent(MSCustomComponent, {
  type: 'section-custom-component',
  label: 'Sections / Custom Component',
  icon: 'layout',
  props: {
    className: Style(),
    eyebrow: TextInput({ label: 'Eyebrow', defaultValue: 'New' }),
    title: TextInput({ label: 'Title', defaultValue: 'Feature title' }),
    description: TextArea({
      label: 'Description',
      defaultValue: 'A short, punchy description of this feature or promotion.',
    }),
    imageSrc: Image({ label: 'Image' }),
    imageAlt: TextInput({ label: 'Image alt', defaultValue: 'Feature image' }),
    layout: Select({
      label: 'Layout',
      options: [
        { value: 'image-left', label: 'Image left' },
        { value: 'image-right', label: 'Image right' },
        { value: 'image-top', label: 'Image top' },
        { value: 'text-only', label: 'Text only' },
      ],
      defaultValue: 'image-left',
    }),
    background: Select({
      label: 'Background',
      options: [
        { value: 'light', label: 'Light' },
        { value: 'muted', label: 'Muted' },
        { value: 'dark', label: 'Dark' },
        { value: 'primary', label: 'Primary' },
        { value: 'transparent', label: 'Transparent' },
      ],
      defaultValue: 'light',
    }),
    textAlignment: Select({
      label: 'Text alignment',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
      defaultValue: 'left',
    }),
    padding: Select({
      label: 'Padding',
      options: [
        { value: 'sm', label: 'Small' },
        { value: 'md', label: 'Medium' },
        { value: 'lg', label: 'Large' },
      ],
      defaultValue: 'md',
    }),
    rounded: Checkbox({ label: 'Rounded corners', defaultValue: true }),
    showPrimaryButton: Checkbox({ label: 'Show primary button', defaultValue: true }),
    primaryButtonText: TextInput({ label: 'Primary button text', defaultValue: 'Shop now' }),
    primaryButtonLink: Link({ label: 'Primary button link' }),
    primaryButtonColor: Select({
      label: 'Primary button color',
      options: [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
        { value: 'tertiary', label: 'Tertiary' },
        { value: 'ghost', label: 'Ghost' },
      ],
      defaultValue: 'primary',
    }),
    showSecondaryButton: Checkbox({ label: 'Show secondary button', defaultValue: false }),
    secondaryButtonText: TextInput({ label: 'Secondary button text', defaultValue: 'Learn more' }),
    secondaryButtonLink: Link({ label: 'Secondary button link' }),
    imageWidth: Number({
      label: 'Image width',
      defaultValue: 50,
      min: 20,
      max: 80,
      suffix: '%',
    }),
  },
});
