import { clsx } from 'clsx';

import { Image } from '~/components/image';
import { Link } from '~/components/link';

export interface CategoryGridItem {
  label: string;
  href: string;
  image?: { src: string; alt: string };
}

interface Props {
  title?: string;
  categories: CategoryGridItem[];
  className?: string;
}

/**
 * DNA.fi-style quick category navigation grid.
 * Displays a responsive icon/image + label grid below the hero.
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
export function CategoryGrid({ title, categories, className }: Props) {
  return (
    <section
      className={clsx(
        'bg-[var(--category-grid-background,hsl(var(--background)))] px-4 py-8 @container @xl:px-8 @xl:py-10',
        className,
      )}
    >
      <div className="mx-auto max-w-screen-2xl">
        {title != null && title !== '' && (
          <h2 className="mb-6 font-[family-name:var(--font-family-heading)] text-xl font-bold text-[var(--category-grid-label,hsl(var(--foreground)))] @xl:text-2xl">
            {title}
          </h2>
        )}
        <ul className="grid grid-cols-3 gap-3 @sm:grid-cols-4 @md:gap-4 @lg:grid-cols-6 @xl:grid-cols-8">
          {categories.map(({ label, href, image }, i) => (
            <li key={i}>
              <Link
                className={clsx(
                  'group flex flex-col items-center gap-2 rounded-xl border border-[var(--category-grid-item-border,hsl(var(--contrast-100)))] bg-[var(--category-grid-item-background,hsl(var(--contrast-100)))] p-3 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--category-grid-focus,hsl(var(--primary)))] hover:border-[var(--category-grid-focus,hsl(var(--primary)))] hover:bg-[var(--category-grid-item-background-hover,hsl(var(--accent)))] @md:p-4',
                )}
                href={href}
              >
                <div className="relative aspect-square w-full max-w-[64px] overflow-hidden rounded-lg">
                  {image != null ? (
                    <Image
                      alt={image.alt}
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                      fill
                      sizes="64px"
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
                <span className="line-clamp-2 text-xs font-medium leading-tight text-[var(--category-grid-label,hsl(var(--foreground)))] @md:text-sm">
                  {label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
