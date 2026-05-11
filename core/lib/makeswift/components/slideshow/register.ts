import {
  Checkbox,
  Group,
  Image,
  Link,
  List,
  Number,
  Select,
  Style,
  TextArea,
  TextInput,
} from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MSSlideshow } from './client';

const buttonColorOptions = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'tertiary', label: 'Tertiary' },
  { value: 'ghost', label: 'Ghost' },
] as const;

runtime.registerComponent(MSSlideshow, {
  type: 'section-slideshow',
  label: 'Sections / Slideshow',
  icon: 'carousel',
  props: {
    className: Style(),
    slides: List({
      label: 'Slides',
      type: Group({
        props: {
          eyebrow: TextInput({ label: 'Eyebrow', defaultValue: '' }),
          title: TextInput({ label: 'Title', defaultValue: 'Slide title' }),
          showDescription: Checkbox({ label: 'Show description', defaultValue: true }),
          description: TextArea({ label: 'Description', defaultValue: 'Slide description' }),
          textAlignment: Select({
            label: 'Text alignment',
            options: [
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'right', label: 'Right' },
            ],
            defaultValue: 'left',
          }),
          imageSrc: Image(),
          imageAlt: TextInput({ label: 'Image alt', defaultValue: 'Slide image' }),
          imagePosition: Select({
            label: 'Image position',
            options: [
              { value: 'top', label: 'Top' },
              { value: 'center', label: 'Center' },
              { value: 'bottom', label: 'Bottom' },
            ],
            defaultValue: 'center',
          }),
          showButton: Checkbox({ label: 'Show button', defaultValue: true }),
          buttonText: TextInput({ label: 'Button text', defaultValue: 'Shop all' }),
          buttonLink: Link({ label: 'Button link' }),
          buttonColor: Select({
            label: 'Button color',
            options: buttonColorOptions,
            defaultValue: 'primary',
          }),
          showSecondaryButton: Checkbox({ label: 'Show secondary button', defaultValue: false }),
          secondaryButtonText: TextInput({
            label: 'Secondary button text',
            defaultValue: 'Learn more',
          }),
          secondaryButtonLink: Link({ label: 'Secondary button link' }),
          secondaryButtonColor: Select({
            label: 'Secondary button color',
            options: buttonColorOptions,
            defaultValue: 'ghost',
          }),
        },
      }),
      getItemLabel(slide) {
        return slide?.title || 'Slide title';
      },
    }),
    autoplay: Checkbox({ label: 'Autoplay', defaultValue: true }),
    interval: Number({ label: 'Duration', defaultValue: 5, suffix: 's' }),
    cardStyle: Checkbox({ label: 'Card style (DNA hero)', defaultValue: false }),
    heightMode: Select({
      label: 'Height',
      options: [
        { value: 'sm', label: 'Small' },
        { value: 'md', label: 'Medium' },
        { value: 'lg', label: 'Large' },
        { value: 'xl', label: 'Full screen' },
      ],
      defaultValue: 'lg',
    }),
    overlayOpacity: Number({
      label: 'Overlay darkness',
      defaultValue: 80,
      min: 0,
      max: 100,
      suffix: '%',
    }),
    showPagination: Checkbox({ label: 'Show pagination', defaultValue: true }),
    showAutoplayControl: Checkbox({ label: 'Show play/pause button', defaultValue: true }),
  },
});
