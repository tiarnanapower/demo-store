'use client';

import { CategoryGrid } from '@/vibes/soul/sections/category-grid';

interface Category {
  label: string;
  href?: { href?: string; target?: string };
  imageSrc?: string;
  imageAlt: string;
}

const VALID_COLUMNS = [2, 3, 4, 5, 6, 8] as const;
type Columns = (typeof VALID_COLUMNS)[number];

interface Props {
  title?: string;
  categories: Category[];
  columns?: string;
  cardSize?: 'sm' | 'md' | 'lg';
  cardWidth?: number;
  cardHeight?: number;
  gap?: number;
  className?: string;
}

function parseColumns(value: string | undefined): Columns {
  const n = Number(value);
  return (VALID_COLUMNS as readonly number[]).includes(n) ? (n as Columns) : 4;
}

export function MSCategoryGrid({ title, categories, columns, cardSize, cardWidth, cardHeight, gap, className }: Props) {
  return (
    <CategoryGrid
      cardHeight={cardHeight != null && cardHeight > 0 ? cardHeight : undefined}
      cardSize={cardSize}
      cardWidth={cardWidth != null && cardWidth > 0 ? cardWidth : undefined}
      gap={gap != null && gap > 0 ? gap : undefined}
      categories={categories.map(({ label, href, imageSrc, imageAlt }) => ({
        label,
        href: href?.href ?? '#',
        image: imageSrc ? { src: imageSrc, alt: imageAlt } : undefined,
      }))}
      className={className}
      columns={parseColumns(columns)}
      title={title}
    />
  );
}
