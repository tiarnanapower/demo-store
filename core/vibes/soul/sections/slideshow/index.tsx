'use client';

import { clsx } from 'clsx';
import { EmblaCarouselType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import Fade from 'embla-carousel-fade';
import useEmblaCarousel from 'embla-carousel-react';
import { Pause, Play } from 'lucide-react';
import { ComponentPropsWithoutRef, CSSProperties, useCallback, useEffect, useState } from 'react';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { Image } from '~/components/image';

type ButtonLinkProps = ComponentPropsWithoutRef<typeof ButtonLink>;

type TextAlignment = 'left' | 'center' | 'right';
type ImagePosition = 'top' | 'center' | 'bottom';
type HeightMode = 'sm' | 'md' | 'lg' | 'xl';

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
  /** 0–100 — how dark the bottom gradient overlay is in non-card mode. */
  overlayOpacity?: number;
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

interface SlideContentProps {
  slide: Slide;
  overlayOpacity: number;
}

function SlideContent({ slide, overlayOpacity }: SlideContentProps) {
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

  const gradientStyle: CSSProperties = {
    backgroundImage: `linear-gradient(to top, var(--slideshow-mask, hsl(var(--foreground) / ${overlayOpacity}%)), transparent)`,
  };

  return (
    <div className="absolute inset-x-0 bottom-0 z-10" style={gradientStyle}>
      <div
        className={clsx(
          'mx-auto flex w-full max-w-screen-2xl flex-col text-balance px-4 pb-20 pt-16 @xl:px-8 @xl:pb-24 @xl:pt-20 @4xl:px-12 @4xl:pb-28 @4xl:pt-24',
          textAlignmentClasses[textAlignment],
        )}
      >
        {showEyebrow && (
          <span className="mb-3 inline-block font-[family-name:var(--slideshow-description-font-family,var(--font-family-body))] text-xs font-semibold uppercase tracking-[0.18em] text-[var(--slideshow-description,hsl(var(--background)/80%))] @xl:text-sm">
            {eyebrow}
          </span>
        )}
        <h1 className="m-0 max-w-xl font-[family-name:var(--slideshow-title-font-family,var(--font-family-heading))] text-4xl font-bold leading-none text-[var(--slideshow-title,hsl(var(--background)))] @2xl:text-5xl @2xl:leading-[.9] @4xl:text-7xl">
          {title}
        </h1>
        {showDescription && (
          <p className="mt-2 max-w-xl font-[family-name:var(--slideshow-description-font-family,var(--font-family-body))] text-base leading-normal text-[var(--slideshow-description,hsl(var(--background)/80%))] @xl:mt-3 @xl:text-lg">
            {description}
          </p>
        )}
        {showButtons && (
          <div
            className={clsx(
              'mt-8 flex flex-wrap gap-3 @xl:mt-10',
              textAlignment === 'center' && 'justify-center',
              textAlignment === 'right' && 'justify-end',
            )}
          >
            {showCta && (
              <ButtonLink
                href={cta?.href ?? '#'}
                shape={cta?.shape ?? 'pill'}
                size={cta?.size ?? 'large'}
                variant={cta?.variant ?? 'primary'}
              >
                {cta?.label ?? 'Learn more'}
              </ButtonLink>
            )}
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

const useProgressButton = (
  emblaApi: EmblaCarouselType | undefined,
  onButtonClick?: (emblaApi: EmblaCarouselType) => void,
): UseProgressButtonType => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onProgressButtonClick = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
      if (onButtonClick) onButtonClick(emblaApi);
    },
    [emblaApi, onButtonClick],
  );

  const onInit = useCallback((emblaAPI: EmblaCarouselType) => {
    setScrollSnaps(emblaAPI.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaAPI: EmblaCarouselType) => {
    setSelectedIndex(emblaAPI.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);

    emblaApi.on('reInit', onInit).on('reInit', onSelect).on('select', onSelect);
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
  showPagination = true,
  showAutoplayControl = true,
}: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 20 }, [
    Autoplay({ delay: interval, playOnInit }),
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
      .on('reInit', () => {
        setIsPlaying(autoplay.isPlaying());
      });
  }, [emblaApi, playCount]);

  const activeSlide = slides[selectedIndex];
  const clampedOpacity = Math.max(0, Math.min(100, overlayOpacity));
  const hasControls = showPagination || showAutoplayControl;

  return (
    <section
      className={clsx(
        'relative bg-[var(--slideshow-background,color-mix(in_oklab,hsl(var(--primary)),black_75%))] @container',
        cardStyle
          ? `${cardHeightClasses[heightMode]} mb-[-5rem] overflow-visible pb-0`
          : heightClasses[heightMode],
        className,
      )}
    >
      <div className="h-full overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, idx) => {
            const { image } = slide;
            const hasImage = image?.src != null && image.src !== '';

            return (
              <div className="relative h-full w-full min-w-0 shrink-0 grow-0 basis-full" key={idx}>
                {!cardStyle && <SlideContent overlayOpacity={clampedOpacity} slide={slide} />}

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
                    priority={idx === 0}
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
            'absolute left-1/2 flex w-full max-w-screen-2xl -translate-x-1/2 flex-wrap items-center px-4 @xl:px-6 @4xl:px-8',
            cardStyle ? 'bottom-[5.5rem]' : 'bottom-4 @xl:bottom-6',
          )}
        >
          {/* Progress Buttons */}
          {showPagination &&
            scrollSnaps.map((_: number, index: number) => {
              return (
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
                    {/* White Bar - Current Index Indicator / Progress Bar */}
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
                        width: `${150 / slides.length}px`,
                      }}
                    />
                    {/* Grey Bar BG */}
                    <div
                      className="h-0.5 bg-[var(--slideshow-pagination,hsl(var(--background)))] opacity-30"
                      style={{ width: `${150 / slides.length}px` }}
                    />
                  </div>
                </button>
              );
            })}

          {/* Carousel Count - "01/03" */}
          {showPagination && (
            <span className="ml-auto mr-3 mt-px font-[family-name:var(--slideshow-number-font-family,var(--font-family-mono))] text-sm text-[var(--slideshow-number,hsl(var(--background)))]">
              {selectedIndex + 1 < 10 ? `0${selectedIndex + 1}` : selectedIndex + 1}/
              {slides.length < 10 ? `0${slides.length}` : slides.length}
            </span>
          )}

          {/* Stop / Start Button */}
          {showAutoplayControl && (
            <button
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className={clsx(
                'flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--slideshow-play-border,hsl(var(--contrast-300)/50%))] text-[var(--slideshow-play-text,hsl(var(--background)))] ring-[var(--slideshow-focus)] transition-opacity duration-300 hover:border-[var(--slideshow-play-border-hover,hsl(var(--contrast-300)/80%))] focus-visible:outline-0 focus-visible:ring-2',
                !showPagination && 'ml-auto',
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
