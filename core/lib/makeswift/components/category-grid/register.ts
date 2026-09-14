import { Group, Image, Link, List, Number, Select, Style, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MSCategoryGrid } from './client';

runtime.registerComponent(MSCategoryGrid, {
  type: 'section-category-grid',
  label: 'Sections / Category Grid',
  icon: 'carousel',
  props: {
    className: Style(),
    title: TextInput({ label: 'Section title', defaultValue: '' }),
    cardWidth: Number({ label: 'Card width', suffix: 'px', defaultValue: 0 }),
    cardHeight: Number({ label: 'Card height', suffix: 'px', defaultValue: 0 }),
    gap: Number({ label: 'Gap', suffix: 'px', defaultValue: 0 }),
    cardSize: Select({
      label: 'Card size',
      options: [
        { value: 'sm', label: 'Small' },
        { value: 'md', label: 'Medium' },
        { value: 'lg', label: 'Large' },
      ],
      defaultValue: 'md',
    }),
    columns: Select({
      label: 'Columns',
      options: [
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '5', label: '5' },
        { value: '6', label: '6' },
        { value: '8', label: '8' },
      ],
      defaultValue: '4',
    }),
    categories: List({
      label: 'Categories',
      type: Group({
        label: 'Category',
        props: {
          label: TextInput({ label: 'Label', defaultValue: 'Category' }),
          href: Link({ label: 'Link' }),
          imageSrc: Image({ label: 'Image' }),
          imageAlt: TextInput({ label: 'Image alt text', defaultValue: 'Category image' }),
        },
      }),
      getItemLabel: (item) => item?.label ?? 'Category',
    }),
  },
});
