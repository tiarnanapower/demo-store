import { clsx } from 'clsx';

import { Image } from '~/components/image';
import { Link } from '~/components/link';

export interface CategoryGridItem {
  label: string;
  href: string;
  image?: { src: string; alt: string };
}

type Columns = 2 | 3 | 4 | 5 | 6 | 8;
type CardSize = 'sm' | 'md' | 'lg';

interface Props {
  title?: string;
  categories: CategoryGridItem[];
  columns?: Columns;
  cardSize?: CardSize;
  /** Override the max-width of each card in px */
  cardWidth?: number;
  /** Override the min-height of each card in px */
  cardHeight?: number;
  /** Gap between cards in px */
  gap?: number;
  className?: string;
}

const columnClasses: Record<Columns, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 @sm:grid-cols-3',
  4: 'grid-cols-2 @sm:grid-cols-4',
  5: 'grid-cols-2 @sm:grid-cols-3 @md:grid-cols-5',
  6: 'grid-cols-2 @sm:grid-cols-3 @md:grid-cols-6',
  8: 'grid-cols-2 @sm:grid-cols-4 @md:grid-cols-8',
};

const cardSizeClasses: Record<CardSize, { card: string; image: string; imageSizes: string; label: string }> = {
  sm: {
    card: 'p-2 gap-1.5',
    image: 'max-w-[48px]',
    imageSizes: '60px',
    label: 'text-xs',
  },
  md: {
    card: 'p-3 @md:p-4 gap-2',
    image: 'max-w-[96px]',
    imageSizes: '120px',
    label: 'text-xs @md:text-sm',
  },
  lg: {
    card: 'p-4 @md:p-6 gap-3',
    image: 'max-w-[128px]',
    imageSizes: '160px',
    label: 'text-sm @md:text-base',
  },
};

/**
 * DNA.fi-style quick category navigation grid.
 *
 * CSS variables:
 * ```css
 * :root {
 *   --category-grid-background: hsl(var(--background));
 *   --category-grid-label: hsl(var(--foreground));
 *   --category-grid-item-background: hsl(var(--contrast-100));
 *   --category-grid-item-background-hover: hsl(var(--accent));
 *   --category-grid-item-border: hsl(var(--contrast-100));
 *   --category-grid-focus: hsl(var(--primary));
 * }
 * ```
 */
export function CategoryGrid({
  title,
  categories,
  columns = 4,
  cardSize = 'md',
  cardWidth,
  cardHeight,
  gap,
  className,
}: Props) {
  const size = cardSizeClasses[cardSize];

  return (
    <section
      className={clsx(
        'bg-[var(--category-grid-background,hsl(var(--background)))] px-4 py-8 @container @xl:px-6 @xl:py-10',
        className,
      )}
    >
      {title != null && title !== '' && (
        <h2 className="mb-6 font-[family-name:var(--font-family-heading)] text-xl font-bold text-[var(--category-grid-label,hsl(var(--foreground)))] @xl:text-2xl">
          {title}
        </h2>
      )}
      <ul
        className={clsx('grid', gap == null && 'gap-3 @md:gap-4', columnClasses[columns])}
        style={gap != null ? { gap: `${gap}px` } : undefined}
      >
        {categories.map(({ label, href, image }, i) => (
          <li key={i}>
            <Link
              className={clsx(
                'group flex flex-col items-center rounded-xl border border-[var(--category-grid-item-border,hsl(var(--contrast-100)))] bg-[var(--category-grid-item-background,hsl(var(--contrast-100)))] text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--category-grid-focus,hsl(var(--primary)))] hover:border-[var(--category-grid-focus,hsl(var(--primary)))] hover:bg-[var(--category-grid-item-background-hover,hsl(var(--accent)))]',
                size.card,
              )}
              href={href}
              style={{
                ...(cardWidth != null ? { maxWidth: `${cardWidth}px` } : {}),
                ...(cardHeight != null ? { minHeight: `${cardHeight}px` } : {}),
              }}
            >
              <div className={clsx('relative aspect-square w-full overflow-hidden rounded-lg', size.image)}>
                {image != null ? (
                  <Image
                    alt={image.alt}
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                    fill
                    sizes={size.imageSizes}
                    src={image.src}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-lg bg-[var(--category-grid-item-border,hsl(var(--contrast-100)))]">
                    <span className="text-2xl font-bold text-[var(--category-grid-label,hsl(var(--foreground)))] opacity-30">
                      {label.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <span
                className={clsx(
                  'line-clamp-2 font-medium leading-tight text-[var(--category-grid-label,hsl(var(--foreground)))]',
                  size.label,
                )}
              >
                {label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
