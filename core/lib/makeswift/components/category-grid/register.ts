import { Group, Image, Link, List, Style, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MSCategoryGrid } from './client';

runtime.registerComponent(MSCategoryGrid, {
  type: 'section-category-grid',
  label: 'Sections / Category Grid',
  icon: 'carousel',
  props: {
    className: Style(),
    title: TextInput({ label: 'Section title', defaultValue: '' }),
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
