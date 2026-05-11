'use client';

import { clsx } from 'clsx';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { Image } from '~/components/image';

type Layout = 'image-left' | 'image-right' | 'image-top' | 'text-only';
type Background = 'light' | 'muted' | 'dark' | 'primary' | 'transparent';
type TextAlignment = 'left' | 'center' | 'right';
type Padding = 'sm' | 'md' | 'lg';
type ButtonColor = 'primary' | 'secondary' | 'tertiary' | 'ghost';

interface Props {
  className?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  imageSrc?: string;
  imageAlt: string;
  layout: Layout;
  background: Background;
  textAlignment: TextAlignment;
  padding: Padding;
  rounded: boolean;
  showPrimaryButton: boolean;
  primaryButtonText: string;
  primaryButtonLink?: { href?: string; target?: string };
  primaryButtonColor: ButtonColor;
  showSecondaryButton: boolean;
  secondaryButtonText: string;
  secondaryButtonLink?: { href?: string; target?: string };
  imageWidth: number;
}

const backgroundClasses: Record<Background, string> = {
  light: 'bg-[hsl(var(--background))] text-[hsl(var(--foreground))]',
  muted: 'bg-[hsl(var(--contrast-100))] text-[hsl(var(--foreground))]',
  dark: 'bg-[hsl(var(--foreground))] text-[hsl(var(--background))]',
  primary: 'bg-[hsl(var(--primary))] text-[hsl(var(--background))]',
  transparent: 'bg-transparent text-[hsl(var(--foreground))]',
};

const paddingClasses: Record<Padding, string> = {
  sm: 'p-4 @xl:p-6',
  md: 'p-6 @xl:p-10',
  lg: 'p-8 @xl:p-16',
};

const alignmentClasses: Record<TextAlignment, string> = {
  left: 'text-left items-start',
  center: 'text-center items-center',
  right: 'text-right items-end',
};

const buttonRowJustify: Record<TextAlignment, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

const wrapperLayoutClasses: Record<Layout, string> = {
  'image-left': 'flex-col @2xl:flex-row @2xl:items-center',
  'image-right': 'flex-col @2xl:flex-row-reverse @2xl:items-center',
  'image-top': 'flex-col',
  'text-only': 'flex-col',
};

interface ContentProps {
  eyebrow?: string;
  title: string;
  description?: string;
  textAlignment: TextAlignment;
  isStacked: boolean;
  showPrimaryButton: boolean;
  primaryButtonText: string;
  primaryButtonHref: string;
  primaryButtonColor: ButtonColor;
  showSecondaryButton: boolean;
  secondaryButtonText: string;
  secondaryButtonHref: string;
}

function Content({
  eyebrow,
  title,
  description,
  textAlignment,
  isStacked,
  showPrimaryButton,
  primaryButtonText,
  primaryButtonHref,
  primaryButtonColor,
  showSecondaryButton,
  secondaryButtonText,
  secondaryButtonHref,
}: ContentProps) {
  const showEyebrow = eyebrow != null && eyebrow !== '';
  const showDescription = description != null && description !== '';
  const showButtons = showPrimaryButton || showSecondaryButton;

  return (
    <div
      className={clsx(
        'flex flex-col gap-3 @xl:gap-4',
        alignmentClasses[textAlignment],
        isStacked ? 'w-full' : 'flex-1',
      )}
    >
      {showEyebrow && (
        <span className="text-xs font-semibold uppercase tracking-[0.18em] opacity-80 @xl:text-sm">
          {eyebrow}
        </span>
      )}
      <h2 className="font-[family-name:var(--font-family-heading)] text-2xl font-bold leading-tight @xl:text-4xl">
        {title}
      </h2>
      {showDescription && (
        <p className="max-w-prose text-base leading-relaxed opacity-90 @xl:text-lg">
          {description}
        </p>
      )}
      {showButtons && (
        <div className={clsx('mt-2 flex flex-wrap gap-3', buttonRowJustify[textAlignment])}>
          {showPrimaryButton && (
            <ButtonLink
              href={primaryButtonHref}
              shape="pill"
              size="medium"
              variant={primaryButtonColor}
            >
              {primaryButtonText}
            </ButtonLink>
          )}
          {showSecondaryButton && (
            <ButtonLink href={secondaryButtonHref} shape="pill" size="medium" variant="ghost">
              {secondaryButtonText}
            </ButtonLink>
          )}
        </div>
      )}
    </div>
  );
}

export function MSCustomComponent({
  className,
  eyebrow,
  title,
  description,
  imageSrc,
  imageAlt,
  layout,
  background,
  textAlignment,
  padding,
  rounded,
  showPrimaryButton,
  primaryButtonText,
  primaryButtonLink,
  primaryButtonColor,
  showSecondaryButton,
  secondaryButtonText,
  secondaryButtonLink,
  imageWidth,
}: Props) {
  const resolvedImageSrc =
    layout !== 'text-only' && imageSrc != null && imageSrc !== '' ? imageSrc : null;
  const hasImage = resolvedImageSrc != null;
  const clampedWidth = Math.max(20, Math.min(80, imageWidth));
  const isStacked = layout === 'image-top' || !hasImage;
  const wrapperLayout = hasImage ? wrapperLayoutClasses[layout] : wrapperLayoutClasses['text-only'];

  const imageBlock = resolvedImageSrc != null && (
    <div
      className={clsx(
        'relative overflow-hidden bg-[hsl(var(--contrast-100))]',
        rounded && 'rounded-xl',
        layout === 'image-top'
          ? 'aspect-[16/9] w-full'
          : 'min-h-[240px] self-stretch @xl:min-h-[320px]',
      )}
      style={layout !== 'image-top' ? { flexBasis: `${clampedWidth}%` } : undefined}
    >
      <Image
        alt={imageAlt}
        className="block h-full w-full object-cover"
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        src={resolvedImageSrc}
      />
    </div>
  );

  return (
    <section
      className={clsx(
        '@container',
        backgroundClasses[background],
        rounded && 'rounded-2xl',
        paddingClasses[padding],
        className,
      )}
    >
      <div className={clsx('flex w-full gap-6 @xl:gap-10', wrapperLayout)}>
        {imageBlock}
        <Content
          description={description}
          eyebrow={eyebrow}
          isStacked={isStacked}
          primaryButtonColor={primaryButtonColor}
          primaryButtonHref={primaryButtonLink?.href ?? '#'}
          primaryButtonText={primaryButtonText}
          secondaryButtonHref={secondaryButtonLink?.href ?? '#'}
          secondaryButtonText={secondaryButtonText}
          showPrimaryButton={showPrimaryButton}
          showSecondaryButton={showSecondaryButton}
          textAlignment={textAlignment}
          title={title}
        />
      </div>
    </section>
  );
}
