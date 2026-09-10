'use client';

import { clsx } from 'clsx';
import { EmblaCarouselType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import Fade from 'embla-carousel-fade';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { ComponentPropsWithoutRef, CSSProperties, useCallback, useEffect, useState } from 'react';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

type ButtonLinkProps = ComponentPropsWithoutRef<typeof ButtonLink>;

type TextAlignment = 'left' | 'center' | 'right';
type ImagePosition = 'top' | 'center' | 'bottom';
type HeightMode = 'sm' | 'md' | 'lg' | 'xl';
/** Edge where the colour overlay is strongest; it fades towards the opposite edge. */
type OverlayFrom = 'none' | 'top' | 'bottom' | 'left' | 'right';
type VerticalAlignment = 'top' | 'center' | 'bottom';
type ContentWidth = 'narrow' | 'medium' | 'wide' | 'full';
type CtaStyle = 'button' | 'arrow';
type PaginationStyle = 'bars' | 'arrows';
type RoundedSides = 'none' | 'bottom' | 'all';

interface SlideCta {
  label: string;
  href: string;
  variant?: ButtonLinkProps['variant'];
  size?: ButtonLinkProps['size'];
  shape?: ButtonLinkProps['shape'];
}

interface Slide {
  eyebrow?: string;
  title: string;
  description?: string;
  showDescription?: boolean;
  textAlignment?: TextAlignment;
  image?: { alt: string; blurDataUrl?: string; src: string; position?: ImagePosition };
  cta?: SlideCta;
  showCta?: boolean;
  secondaryCta?: SlideCta;
  showSecondaryCta?: boolean;
}

interface Props {
  slides: Slide[];
  playOnInit?: boolean;
  interval?: number;
  className?: string;
  /**
   * When true, renders slide content as a floating white card overlapping the bottom of the hero
   * (DNA.fi style) instead of a gradient text overlay.
   */
  cardStyle?: boolean;
  heightMode?: HeightMode;
  /** 0–100 — overlay strength at the `overlayFrom` edge, in non-card mode. */
  overlayOpacity?: number;
  /** Which edge the overlay is strongest at. `none` disables the overlay entirely. */
  overlayFrom?: OverlayFrom;
  /**
   * Any CSS colour for the overlay tint. When omitted, the original `--slideshow-mask` gradient is
   * used so existing pages render unchanged.
   */
  overlayColor?: string;
  /** 0–100 — overlay strength at the opposite edge. Only applies when `overlayColor` is set. */
  overlayFadeTo?: number;
  /** Vertical placement of the slide text within the hero. */
  verticalAlignment?: VerticalAlignment;
  /** Maximum width of the slide text block. */
  contentWidth?: ContentWidth;
  /** `arrow` renders the primary CTA as a circular arrow button with a label beside it. */
  ctaStyle?: CtaStyle;
  /** Accent colour for the arrow CTA circle. */
  accentColor?: string;
  /**
   * Colour for the arrow pagination controls. Kept separate from `accentColor` because the CTA
   * circle is a filled shape while the pagination is an outline, so a colour that reads well as a
   * fill is often too dim as a border on top of a tinted image.
   */
  paginationColor?: string;
  /** `bars` is the progress-bar pagination; `arrows` is prev/next with an "n of total" counter. */
  paginationStyle?: PaginationStyle;
  /** Corner radius in px, applied per `roundedSides`. */
  cornerRadius?: number;
  roundedSides?: RoundedSides;
  showPagination?: boolean;
  showAutoplayControl?: boolean;
}

interface UseProgressButtonType {
  selectedIndex: number;
  scrollSnaps: number[];
  onProgressButtonClick: (index: number) => void;
}

const heightClasses: Record<HeightMode, string> = {
  sm: 'h-[40vh] min-h-[300px]',
  md: 'h-[60vh] min-h-[420px]',
  lg: 'h-[80vh] min-h-[520px]',
  xl: 'h-screen min-h-[600px]',
};

const cardHeightClasses: Record<HeightMode, string> = {
  sm: 'h-[35vh] min-h-[260px]',
  md: 'h-[45vh] min-h-[340px]',
  lg: 'h-[55vh] min-h-[380px]',
  xl: 'h-[70vh] min-h-[480px]',
};

const textAlignmentClasses: Record<TextAlignment, string> = {
  left: 'text-left items-start',
  center: 'text-center items-center mx-auto',
  right: 'text-right items-end ml-auto',
};

const imagePositionClasses: Record<ImagePosition, string> = {
  top: 'object-top',
  center: 'object-center',
  bottom: 'object-bottom',
};

// The overlay is strongest at the named edge, so the gradient runs towards the opposite one.
const overlayDirections: Record<Exclude<OverlayFrom, 'none'>, string> = {
  bottom: 'to top',
  top: 'to bottom',
  left: 'to right',
  right: 'to left',
};

const verticalAlignmentClasses: Record<VerticalAlignment, string> = {
  top: 'justify-start',
  center: 'justify-center',
  bottom: 'justify-end',
};

const contentWidthClasses: Record<ContentWidth, string> = {
  narrow: 'max-w-md',
  medium: 'max-w-xl',
  wide: 'max-w-3xl',
  full: 'max-w-none',
};

interface OverlayArgs {
  overlayFrom: OverlayFrom;
  overlayColor?: string;
  overlayOpacity: number;
  overlayFadeTo: number;
}

function buildOverlayStyle({
  overlayFrom,
  overlayColor,
  overlayOpacity,
  overlayFadeTo,
}: OverlayArgs): CSSProperties | undefined {
  if (overlayFrom === 'none') return undefined;

  const direction = overlayDirections[overlayFrom];

  // Without an explicit colour, keep the original mask expression verbatim: `--slideshow-mask`
  // already carries its own alpha, so wrapping it in color-mix would double up the transparency.
  if (overlayColor == null || overlayColor === '') {
    return {
      backgroundImage: `linear-gradient(${direction}, var(--slideshow-mask, hsl(var(--foreground) / ${overlayOpacity}%)), transparent)`,
    };
  }

  return {
    backgroundImage: `linear-gradient(${direction}, color-mix(in srgb, ${overlayColor} ${overlayOpacity}%, transparent), color-mix(in srgb, ${overlayColor} ${overlayFadeTo}%, transparent))`,
  };
}

function buildRadiusStyle(
  cornerRadius: number,
  roundedSides: RoundedSides,
): CSSProperties | undefined {
  const radius = Math.max(0, cornerRadius);

  if (radius === 0 || roundedSides === 'none') return undefined;
  if (roundedSides === 'all') return { borderRadius: `${radius}px` };

  return {
    borderBottomLeftRadius: `${radius}px`,
    borderBottomRightRadius: `${radius}px`,
  };
}

// Applies a Makeswift accent colour when one is set, otherwise defers to the CSS variables.
function buildAccentStyle(accentColor?: string): CSSProperties | undefined {
  if (accentColor == null || accentColor === '') return undefined;

  return { borderColor: accentColor, color: accentColor };
}

interface ArrowCtaProps {
  href: string;
  label: string;
  accentColor?: string;
}

function ArrowCta({ href, label, accentColor }: ArrowCtaProps) {
  return (
    <Link className="group inline-flex items-center gap-4 focus-visible:outline-0" href={href}>
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--slideshow-accent,hsl(var(--primary)))] transition-transform duration-300 group-hover:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-[var(--slideshow-focus,hsl(var(--primary)))] @xl:h-14 @xl:w-14"
        style={
          accentColor != null && accentColor !== '' ? { backgroundColor: accentColor } : undefined
        }
      >
        <ArrowRight
          className="h-5 w-5 text-[var(--slideshow-accent-foreground,hsl(var(--background)))] @xl:h-6 @xl:w-6"
          strokeWidth={2}
        />
      </span>
      <span className="font-[family-name:var(--slideshow-title-font-family,var(--font-family-heading))] text-base font-bold text-[var(--slideshow-title,hsl(var(--background)))] @xl:text-lg">
        {label}
      </span>
    </Link>
  );
}

interface PrimaryCtaProps {
  cta?: SlideCta;
  ctaStyle: CtaStyle;
  accentColor?: string;
}

function PrimaryCta({ cta, ctaStyle, accentColor }: PrimaryCtaProps) {
  const href = cta?.href ?? '#';
  const label = cta?.label ?? 'Learn more';

  if (ctaStyle === 'arrow') {
    return <ArrowCta accentColor={accentColor} href={href} label={label} />;
  }

  return (
    <ButtonLink
      href={href}
      shape={cta?.shape ?? 'pill'}
      size={cta?.size ?? 'large'}
      variant={cta?.variant ?? 'primary'}
    >
      {label}
    </ButtonLink>
  );
}

interface SlideContentProps {
  slide: Slide;
  ctaStyle: CtaStyle;
  accentColor?: string;
  verticalAlignment: VerticalAlignment;
  contentWidth: ContentWidth;
}

function SlideContent({
  slide,
  ctaStyle,
  accentColor,
  verticalAlignment,
  contentWidth,
}: SlideContentProps) {
  const {
    eyebrow,
    title,
    description,
    showDescription = true,
    textAlignment = 'left',
    cta,
    showCta = true,
    secondaryCta,
    showSecondaryCta = false,
  } = slide;

  const showEyebrow = eyebrow != null && eyebrow !== '';
  const showButtons = showCta || (showSecondaryCta && secondaryCta != null);

  return (
    <div
      className={clsx(
        'pointer-events-none absolute inset-0 z-20 flex flex-col',
        verticalAlignmentClasses[verticalAlignment],
      )}
    >
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col px-4 pb-20 pt-16 @xl:px-8 @xl:pb-24 @xl:pt-20 @4xl:px-12 @4xl:pb-28 @4xl:pt-24">
        <div
          className={clsx(
            'pointer-events-auto flex w-full flex-col text-balance',
            contentWidthClasses[contentWidth],
            textAlignmentClasses[textAlignment],
          )}
        >
          {showEyebrow && (
            <span className="mb-3 inline-block font-[family-name:var(--slideshow-description-font-family,var(--font-family-body))] text-xs font-semibold uppercase tracking-[0.18em] text-[var(--slideshow-description,hsl(var(--background)/80%))] @xl:text-sm">
              {eyebrow}
            </span>
          )}
          <h1 className="m-0 font-[family-name:var(--slideshow-title-font-family,var(--font-family-heading))] text-4xl font-bold leading-none text-[var(--slideshow-title,hsl(var(--background)))] @2xl:text-5xl @2xl:leading-[.9] @4xl:text-7xl">
            {title}
          </h1>
          {showDescription && (
            <p className="mt-2 font-[family-name:var(--slideshow-description-font-family,var(--font-family-body))] text-base leading-normal text-[var(--slideshow-description,hsl(var(--background)/80%))] @xl:mt-3 @xl:text-lg">
              {description}
            </p>
          )}
          {showButtons && (
            <div
              className={clsx(
                'mt-8 flex flex-wrap items-center gap-3 @xl:mt-10',
                textAlignment === 'center' && 'justify-center',
                textAlignment === 'right' && 'justify-end',
              )}
            >
              {showCta && <PrimaryCta accentColor={accentColor} cta={cta} ctaStyle={ctaStyle} />}
              {showSecondaryCta && secondaryCta != null && (
                <ButtonLink
                  href={secondaryCta.href}
                  shape={secondaryCta.shape ?? 'pill'}
                  size={secondaryCta.size ?? 'large'}
                  variant={secondaryCta.variant ?? 'ghost'}
                >
                  {secondaryCta.label}
                </ButtonLink>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface FloatingCardProps {
  slide: Slide;
  cardKey: number;
}

function FloatingCard({ slide, cardKey }: FloatingCardProps) {
  const {
    eyebrow,
    title,
    description,
    showDescription = true,
    textAlignment = 'left',
    cta,
    showCta = true,
    secondaryCta,
    showSecondaryCta = false,
  } = slide;
  const showEyebrow = eyebrow != null && eyebrow !== '';
  const showDescriptionText = showDescription && description != null && description !== '';
  const showButtons = showCta || (showSecondaryCta && secondaryCta != null);

  return (
    <div
      className={clsx(
        'absolute bottom-0 left-4 z-20 w-[calc(100%-2rem)] translate-y-16 rounded-2xl bg-white p-6 shadow-xl transition-opacity duration-300 @sm:left-6 @sm:w-auto @sm:min-w-[340px] @sm:max-w-md @sm:p-8 @xl:left-10 @xl:p-10',
        textAlignmentClasses[textAlignment],
      )}
      key={cardKey}
    >
      {showEyebrow && (
        <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.18em] text-[hsl(var(--contrast-400))]">
          {eyebrow}
        </span>
      )}
      <h2 className="font-[family-name:var(--slideshow-title-font-family,var(--font-family-heading))] text-2xl font-bold leading-tight text-[hsl(var(--foreground))] @sm:text-3xl">
        {title}
      </h2>
      {showDescriptionText && (
        <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--contrast-400))] @sm:text-base">
          {description}
        </p>
      )}
      {showButtons && (
        <div className="mt-6 flex flex-wrap gap-3">
          {showCta && (
            <ButtonLink
              href={cta?.href ?? '#'}
              shape={cta?.shape ?? 'pill'}
              size={cta?.size ?? 'medium'}
              variant={cta?.variant ?? 'primary'}
            >
              {cta?.label ?? 'Learn more'}
            </ButtonLink>
          )}
          {showSecondaryCta && secondaryCta != null && (
            <ButtonLink
              href={secondaryCta.href}
              shape={secondaryCta.shape ?? 'pill'}
              size={secondaryCta.size ?? 'medium'}
              variant={secondaryCta.variant ?? 'ghost'}
            >
              {secondaryCta.label}
            </ButtonLink>
          )}
        </div>
      )}
    </div>
  );
}

const arrowButtonClasses =
  'pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-[var(--slideshow-pagination,hsl(var(--background)))] text-[var(--slideshow-pagination,hsl(var(--background)))] transition-opacity duration-200 hover:opacity-70 focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-[var(--slideshow-focus,hsl(var(--primary)))] @xl:h-12 @xl:w-12';

interface BarsPaginationProps {
  scrollSnaps: number[];
  selectedIndex: number;
  totalSlides: number;
  isPlaying: boolean;
  playCount: number;
  interval: number;
  onProgressButtonClick: (index: number) => void;
  resetAutoplay: () => void;
}

function BarsPagination({
  scrollSnaps,
  selectedIndex,
  totalSlides,
  isPlaying,
  playCount,
  interval,
  onProgressButtonClick,
  resetAutoplay,
}: BarsPaginationProps) {
  const barWidth = `${150 / totalSlides}px`;
  const currentLabel = selectedIndex + 1 < 10 ? `0${selectedIndex + 1}` : `${selectedIndex + 1}`;
  const totalLabel = totalSlides < 10 ? `0${totalSlides}` : `${totalSlides}`;

  return (
    <>
      {scrollSnaps.map((_: number, index: number) => (
        <button
          aria-label={`View image number ${index + 1}`}
          className="rounded-lg px-1.5 py-2 focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-[var(--slideshow-focus,hsl(var(--primary)))]"
          key={index}
          onClick={() => {
            onProgressButtonClick(index);
            resetAutoplay();
          }}
        >
          <div className="relative overflow-hidden">
            {/* Current index indicator / progress bar */}
            <div
              className={clsx(
                'absolute h-0.5 bg-[var(--slideshow-pagination,hsl(var(--background)))]',
                'opacity-0 fill-mode-forwards',
                isPlaying ? 'running' : 'paused',
                index === selectedIndex
                  ? 'opacity-100 ease-linear animate-in slide-in-from-left'
                  : 'ease-out animate-out fade-out',
              )}
              key={`progress-${playCount}`}
              style={{
                animationDuration: index === selectedIndex ? `${interval}ms` : '200ms',
                width: barWidth,
              }}
            />
            {/* Track */}
            <div
              className="h-0.5 bg-[var(--slideshow-pagination,hsl(var(--background)))] opacity-30"
              style={{ width: barWidth }}
            />
          </div>
        </button>
      ))}

      {/* Carousel count - "01/03" */}
      <span className="ml-auto mr-3 mt-px font-[family-name:var(--slideshow-number-font-family,var(--font-family-mono))] text-sm text-[var(--slideshow-number,hsl(var(--background)))]">
        {currentLabel}/{totalLabel}
      </span>
    </>
  );
}

interface ArrowsPaginationProps {
  selectedIndex: number;
  totalSlides: number;
  paginationColor?: string;
  onPrev: () => void;
  onNext: () => void;
}

function ArrowsPagination({
  selectedIndex,
  totalSlides,
  paginationColor,
  onPrev,
  onNext,
}: ArrowsPaginationProps) {
  const accentStyle = buildAccentStyle(paginationColor);

  return (
    <div className="ml-auto flex items-center gap-3 @xl:gap-4">
      <button
        aria-label="Previous slide"
        className={arrowButtonClasses}
        onClick={onPrev}
        style={accentStyle}
        type="button"
      >
        <ChevronLeft className="pointer-events-none h-5 w-5" strokeWidth={1.5} />
      </button>
      <span
        className="font-[family-name:var(--slideshow-number-font-family,var(--font-family-body))] text-sm tabular-nums text-[var(--slideshow-number,hsl(var(--background)))] @xl:text-base"
        style={accentStyle == null ? undefined : { color: accentStyle.color }}
      >
        {selectedIndex + 1} of {totalSlides}
      </span>
      <button
        aria-label="Next slide"
        className={arrowButtonClasses}
        onClick={onNext}
        style={accentStyle}
        type="button"
      >
        <ChevronRight className="pointer-events-none h-5 w-5" strokeWidth={1.5} />
      </button>
    </div>
  );
}

const useProgressButton = (
  emblaApi: EmblaCarouselType | undefined,
  onButtonClick?: (emblaApi: EmblaCarouselType) => void,
): UseProgressButtonType => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onProgressButtonClick = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.goTo(index);
      if (onButtonClick) onButtonClick(emblaApi);
    },
    [emblaApi, onButtonClick],
  );

  const onInit = useCallback((emblaAPI: EmblaCarouselType) => {
    setScrollSnaps(emblaAPI.snapList());
  }, []);

  const onSelect = useCallback((emblaAPI: EmblaCarouselType) => {
    setSelectedIndex(emblaAPI.selectedSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);

    emblaApi.on('reinit', onInit).on('reinit', onSelect).on('select', onSelect);
  }, [emblaApi, onInit, onSelect]);

  return {
    selectedIndex,
    scrollSnaps,
    onProgressButtonClick,
  };
};

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --slideshow-focus: hsl(var(--primary));
 *   --slideshow-mask: hsl(var(--foreground) / 80%);
 *   --slideshow-background: color-mix(in oklab, hsl(var(--primary)), black 75%);
 *   --slideshow-title: hsl(var(--background));
 *   --slideshow-title-font-family: var(--font-family-heading);
 *   --slideshow-description: hsl(var(--background) / 80%);
 *   --slideshow-description-font-family: var(--font-family-body);
 *   --slideshow-pagination: hsl(var(--background));
 *   --slideshow-play-border: hsl(var(--contrast-300) / 50%);
 *   --slideshow-play-border-hover: hsl(var(--contrast-300) / 80%);
 *   --slideshow-play-text: hsl(var(--background));
 *   --slideshow-number: hsl(var(--background));
 *   --slideshow-number-font-family: var(--font-family-mono);
 *   --slideshow-accent: hsl(var(--primary));
 *   --slideshow-accent-foreground: hsl(var(--background));
 * }
 * ```
 */
export function Slideshow({
  slides,
  playOnInit = true,
  interval = 5000,
  className,
  cardStyle = false,
  heightMode = 'lg',
  overlayOpacity = 80,
  overlayFrom = 'bottom',
  overlayColor,
  overlayFadeTo = 0,
  verticalAlignment = 'bottom',
  contentWidth = 'medium',
  ctaStyle = 'button',
  accentColor,
  paginationColor,
  paginationStyle = 'bars',
  cornerRadius = 0,
  roundedSides = 'bottom',
  showPagination = true,
  showAutoplayControl = true,
}: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 20 }, [
    Autoplay({ delay: interval, active: playOnInit }),
    Fade(),
  ]);
  const { selectedIndex, scrollSnaps, onProgressButtonClick } = useProgressButton(emblaApi);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);

  const toggleAutoplay = useCallback(() => {
    const autoplay = emblaApi?.plugins().autoplay;

    if (!autoplay) return;

    const playOrStop = autoplay.isPlaying() ? autoplay.stop : autoplay.play;

    playOrStop();
  }, [emblaApi]);

  const resetAutoplay = useCallback(() => {
    const autoplay = emblaApi?.plugins().autoplay;

    if (!autoplay) return;

    autoplay.reset();
  }, [emblaApi]);

  useEffect(() => {
    const autoplay = emblaApi?.plugins().autoplay;

    if (!autoplay) return;

    setIsPlaying(autoplay.isPlaying());
    emblaApi
      .on('autoplay:play', () => {
        setIsPlaying(true);
        setPlayCount(playCount + 1);
      })
      .on('autoplay:stop', () => {
        setIsPlaying(false);
      })
      .on('reinit', () => {
        setIsPlaying(autoplay.isPlaying());
      });
  }, [emblaApi, playCount]);

  const activeSlide = slides[selectedIndex];
  const clampedOpacity = Math.max(0, Math.min(100, overlayOpacity));
  const clampedFadeTo = Math.max(0, Math.min(100, overlayFadeTo));
  const hasControls = showPagination || showAutoplayControl;

  // The overlay only applies in gradient mode; card mode has never had one, and defaulting it on
  // would change how existing card-style heroes look.
  const overlayStyle = cardStyle
    ? undefined
    : buildOverlayStyle({
        overlayFrom,
        overlayColor,
        overlayOpacity: clampedOpacity,
        overlayFadeTo: clampedFadeTo,
      });

  const radiusStyle = buildRadiusStyle(cornerRadius, roundedSides);

  return (
    <section
      className={clsx(
        'relative bg-[var(--slideshow-background,color-mix(in_oklab,hsl(var(--primary)),black_75%))] @container',
        cardStyle
          ? `${cardHeightClasses[heightMode]} mb-[-5rem] overflow-visible pb-0`
          : heightClasses[heightMode],
        className,
      )}
      style={radiusStyle}
    >
      <div className="h-full overflow-hidden" ref={emblaRef} style={radiusStyle}>
        <div className="flex h-full">
          {slides.map((slide, idx) => {
            const { image } = slide;
            const hasImage = image?.src != null && image.src !== '';

            return (
              <div className="relative h-full w-full min-w-0 shrink-0 grow-0 basis-full" key={idx}>
                {!cardStyle && (
                  <SlideContent
                    accentColor={accentColor}
                    contentWidth={contentWidth}
                    ctaStyle={ctaStyle}
                    slide={slide}
                    verticalAlignment={verticalAlignment}
                  />
                )}

                {overlayStyle != null && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-10"
                    style={overlayStyle}
                  />
                )}

                {hasImage && (
                  <Image
                    alt={image.alt}
                    blurDataURL={image.blurDataUrl}
                    className={clsx(
                      'block h-20 w-full object-cover',
                      imagePositionClasses[image.position ?? 'center'],
                    )}
                    fill
                    placeholder={
                      image.blurDataUrl != null && image.blurDataUrl !== '' ? 'blur' : 'empty'
                    }
                    preload={idx === 0}
                    sizes="100vw"
                    src={image.src}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating card — only shown in card mode, rendered outside embla so it can overflow */}
      {cardStyle && activeSlide != null && (
        <FloatingCard cardKey={selectedIndex} slide={activeSlide} />
      )}

      {/* Controls */}
      {hasControls && (
        <div
          className={clsx(
            'absolute left-1/2 z-30 flex w-full max-w-screen-2xl -translate-x-1/2 flex-wrap items-center px-4 @xl:px-6 @4xl:px-8',
            cardStyle ? 'bottom-[5.5rem]' : 'bottom-4 @xl:bottom-6',
          )}
        >
          {showPagination && paginationStyle === 'bars' && (
            <BarsPagination
              interval={interval}
              isPlaying={isPlaying}
              onProgressButtonClick={onProgressButtonClick}
              playCount={playCount}
              resetAutoplay={resetAutoplay}
              scrollSnaps={scrollSnaps}
              selectedIndex={selectedIndex}
              totalSlides={slides.length}
            />
          )}

          {showPagination && paginationStyle === 'arrows' && (
            <ArrowsPagination
              onNext={() => {
                emblaApi?.goToNext();
                resetAutoplay();
              }}
              onPrev={() => {
                emblaApi?.goToPrev();
                resetAutoplay();
              }}
              paginationColor={paginationColor}
              selectedIndex={selectedIndex}
              totalSlides={slides.length}
            />
          )}

          {/* Stop / Start Button */}
          {showAutoplayControl && (
            <button
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className={clsx(
                'flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--slideshow-play-border,hsl(var(--contrast-300)/50%))] text-[var(--slideshow-play-text,hsl(var(--background)))] ring-[var(--slideshow-focus)] transition-opacity duration-300 hover:border-[var(--slideshow-play-border-hover,hsl(var(--contrast-300)/80%))] focus-visible:outline-0 focus-visible:ring-2',
                !showPagination && 'ml-auto',
                showPagination && paginationStyle === 'arrows' && 'ml-3',
              )}
              onClick={toggleAutoplay}
              type="button"
            >
              {isPlaying ? (
                <Pause className="pointer-events-none" size={16} strokeWidth={1.5} />
              ) : (
                <Play className="pointer-events-none" size={16} strokeWidth={1.5} />
              )}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
