import { Slideshow } from '@/vibes/soul/sections/slideshow';

type ButtonColor = 'primary' | 'secondary' | 'tertiary' | 'ghost';
type TextAlignment = 'left' | 'center' | 'right';
type ImagePosition = 'top' | 'center' | 'bottom';

interface Slide {
  eyebrow?: string;
  title: string;
  description: string;
  showDescription: boolean;
  textAlignment: TextAlignment;
  imageSrc?: string;
  imageAlt: string;
  imagePosition: ImagePosition;
  showButton: boolean;
  buttonLink?: { href?: string; target?: string };
  buttonText: string;
  buttonColor: ButtonColor;
  showSecondaryButton: boolean;
  secondaryButtonText: string;
  secondaryButtonLink?: { href?: string; target?: string };
  secondaryButtonColor: ButtonColor;
}

interface MSSlideshowProps {
  className: string;
  slides: Slide[];
  autoplay: boolean;
  interval: number;
  cardStyle: boolean;
  heightMode: 'sm' | 'md' | 'lg' | 'xl';
  overlayOpacity: number;
  overlayFrom: 'none' | 'top' | 'bottom' | 'left' | 'right';
  overlayColor?: string;
  overlayFadeTo: number;
  verticalAlignment: 'top' | 'center' | 'bottom';
  contentWidth: 'narrow' | 'medium' | 'wide' | 'full';
  ctaStyle: 'button' | 'arrow';
  accentColor?: string;
  paginationColor?: string;
  paginationStyle: 'bars' | 'arrows';
  cornerRadius: number;
  roundedSides: 'none' | 'bottom' | 'all';
  showPagination: boolean;
  showAutoplayControl: boolean;
}

export function MSSlideshow({
  className,
  slides,
  autoplay,
  interval,
  cardStyle,
  heightMode,
  overlayOpacity,
  overlayFrom,
  overlayColor,
  overlayFadeTo,
  verticalAlignment,
  contentWidth,
  ctaStyle,
  accentColor,
  paginationColor,
  paginationStyle,
  cornerRadius,
  roundedSides,
  showPagination,
  showAutoplayControl,
}: MSSlideshowProps) {
  return (
    <Slideshow
      accentColor={accentColor}
      cardStyle={cardStyle}
      className={className}
      contentWidth={contentWidth}
      cornerRadius={cornerRadius}
      ctaStyle={ctaStyle}
      heightMode={heightMode}
      interval={interval * 1000}
      overlayColor={overlayColor}
      overlayFadeTo={overlayFadeTo}
      overlayFrom={overlayFrom}
      overlayOpacity={overlayOpacity}
      paginationColor={paginationColor}
      paginationStyle={paginationStyle}
      playOnInit={autoplay}
      roundedSides={roundedSides}
      showAutoplayControl={showAutoplayControl}
      showPagination={showPagination}
      slides={slides.map(
        ({
          eyebrow,
          title,
          description,
          showDescription,
          textAlignment,
          imageSrc,
          imageAlt,
          imagePosition,
          showButton,
          buttonLink,
          buttonText,
          buttonColor,
          showSecondaryButton,
          secondaryButtonText,
          secondaryButtonLink,
          secondaryButtonColor,
        }) => {
          return {
            eyebrow,
            title,
            description,
            showDescription,
            textAlignment,
            image: imageSrc ? { alt: imageAlt, src: imageSrc, position: imagePosition } : undefined,
            showCta: showButton,
            cta: { label: buttonText, href: buttonLink?.href ?? '#', variant: buttonColor },
            showSecondaryCta: showSecondaryButton,
            secondaryCta: {
              label: secondaryButtonText,
              href: secondaryButtonLink?.href ?? '#',
              variant: secondaryButtonColor,
            },
          };
        },
      )}
      verticalAlignment={verticalAlignment}
    />
  );
}
