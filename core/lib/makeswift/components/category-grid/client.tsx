'use client';

import { CategoryGrid } from '@/vibes/soul/sections/category-grid';

interface Category {
  label: string;
  href?: { href?: string; target?: string };
  imageSrc?: string;
  imageAlt: string;
}

interface Props {
  title?: string;
  categories: Category[];
  className?: string;
}

export function MSCategoryGrid({ title, categories, className }: Props) {
  return (
    <CategoryGrid
      categories={categories.map(({ label, href, imageSrc, imageAlt }) => ({
        label,
        href: href?.href ?? '#',
        image: imageSrc ? { src: imageSrc, alt: imageAlt } : undefined,
      }))}
      className={className}
      title={title}
    />
  );
}
