'use client';

import { forwardRef, useEffect, useState } from 'react';
import Headroom from 'react-headroom';

import { Banner } from '@/vibes/soul/primitives/banner';
import { Navigation } from '@/vibes/soul/primitives/navigation';

interface Props {
  navigation: React.ComponentPropsWithoutRef<typeof Navigation>;
  banner?: React.ComponentPropsWithoutRef<typeof Banner>;
}

export const HeaderSection = forwardRef<React.ComponentRef<'div'>, Props>(
  ({ navigation, banner }, ref) => {
    const [bannerElement, setBannerElement] = useState<HTMLElement | null>(null);
    const [bannerHeight, setBannerHeight] = useState(0);
    const [isFloating, setIsFloating] = useState(false);
    const [headerElement, setHeaderElement] = useState<HTMLElement | null>(null);

    useEffect(() => {
      if (!bannerElement) return;

      const resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const entry of entries) {
          setBannerHeight(entry.contentRect.height);
        }
      });

      resizeObserver.observe(bannerElement);

      return () => {
        resizeObserver.disconnect();
      };
    }, [bannerElement]);

    // react-headroom measures the header once on mount and only recalculates on window resize,
    // so anything that changes the header's height afterwards (a streamed logo, a late font)
    // leaves the reserved wrapper height too short and the header overlaps the page below.
    // Dispatching a resize makes Headroom re-read the height using its own code path.
    useEffect(() => {
      if (!headerElement) return;

      let lastHeight = headerElement.offsetHeight;

      const resizeObserver = new ResizeObserver(() => {
        const nextHeight = headerElement.offsetHeight;

        if (nextHeight === lastHeight) return;

        lastHeight = nextHeight;
        window.dispatchEvent(new Event('resize'));
      });

      resizeObserver.observe(headerElement);

      return () => {
        resizeObserver.disconnect();
      };
    }, [headerElement]);

    return (
      <div ref={ref}>
        {banner && <Banner ref={setBannerElement} {...banner} />}
        <Headroom
          onUnfix={() => setIsFloating(false)}
          onUnpin={() => setIsFloating(true)}
          pinStart={bannerHeight}
        >
          <div
            className="border-b border-[var(--nav-border,hsl(var(--contrast-100)))] bg-[var(--nav-background,hsl(var(--background)))] shadow-sm"
            ref={setHeaderElement}
          >
            <Navigation {...navigation} isFloating={isFloating} />
          </div>
        </Headroom>
      </div>
    );
  },
);

HeaderSection.displayName = 'HeaderSection';
