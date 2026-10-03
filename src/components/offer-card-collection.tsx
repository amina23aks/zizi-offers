"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { ImageViewerOverlay, type ViewerImageItem } from "@/components/image-viewer-overlay";
import { OfferCard, type CoachingFormatFilter } from "@/components/offer-card";
import { getAsset, type DisplayOffer } from "@/data/catalog";

export function OfferCardCollection({
  offers,
  itemClassName,
  formatFilter,
}: {
  offers: readonly DisplayOffer[];
  itemClassName?: string;
  formatFilter?: CoachingFormatFilter | null;
}) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const viewerItems = useMemo(
    () =>
      offers
        .map((offer) => {
          const asset = getAsset(offer.assetId);
          return asset ? ({ id: offer.id, name: offer.title, asset } satisfies ViewerImageItem) : null;
        })
        .filter(Boolean) as ViewerImageItem[],
    [offers],
  );

  const imageIndexByOfferId = useMemo(() => {
    const entries = viewerItems.map((item, index) => [item.id, index] as const);
    return new Map(entries);
  }, [viewerItems]);

  const closeViewer = useCallback(() => {
    setViewerIndex(null);
  }, []);

  const moveViewer = useCallback((direction: 1 | -1) => {
    setViewerIndex((index) => {
      if (index === null || !viewerItems.length) return index;
      return (index + direction + viewerItems.length) % viewerItems.length;
    });
  }, [viewerItems.length]);

  return (
    <>
      {offers.map((offer) => {
        const imageIndex = imageIndexByOfferId.get(offer.id);
        const card = (
          <OfferCard
            key={offer.id}
            offer={offer}
            formatFilter={formatFilter ?? undefined}
            href={offer.id === "emotional-communication" ? "/offers/emotional-communication" : undefined}
            onImageOpen={imageIndex === undefined ? undefined : (opener) => {
              openerRef.current = opener;
              setViewerIndex(imageIndex);
            }}
          />
        );

        return itemClassName ? (
          <div className={itemClassName} key={offer.id}>
            {card}
          </div>
        ) : card;
      })}

      {viewerIndex !== null ? (
        <ImageViewerOverlay
          items={viewerItems}
          index={viewerIndex}
          openerRef={openerRef}
          closeButtonRef={closeButtonRef}
          onClose={closeViewer}
          onMove={moveViewer}
          labelPrefix="غلاف"
        />
      ) : null}
    </>
  );
}
