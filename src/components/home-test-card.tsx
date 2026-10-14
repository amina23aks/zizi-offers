"use client";

import Image from "next/image";
import Link from "next/link";
import { MagnifyingGlassPlus } from "@phosphor-icons/react";
import { useRef, useState, type PointerEvent } from "react";
import { ImageViewerOverlay, type ViewerImageItem } from "@/components/image-viewer-overlay";
import { formatPrice, type DisplayOffer } from "@/data/catalog";
import { testDetailsHref } from "@/lib/test-details";
import { PackageItems, PackageFooter } from "./package-pricing";

export function HomeTestCard({ offer }: { offer: Partial<DisplayOffer> & { id: string; title: string } }) {
  const href = testDetailsHref(offer.id);
  const packaged = offer.packagePresentation?.enabled;
  const isPackage = offer.format === "package";
  const [viewerOpen, setViewerOpen] = useState(false);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const suppressOpen = useRef(false);
  const viewerItems: ViewerImageItem[] = offer.image ? [{
    id: offer.id,
    name: offer.title,
    asset: {
      id: offer.id,
      section: "tests",
      fileName: offer.title,
      stem: offer.title,
      extension: "",
      bytes: 0,
      purpose: "cover",
      status: "available",
      notes: null,
      publicPath: offer.image.src,
      width: offer.image.width,
      height: offer.image.height,
    } as ViewerImageItem["asset"],
  }] : [];

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    pointerStart.current = { x: event.clientX, y: event.clientY };
    suppressOpen.current = false;
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const start = pointerStart.current;
    if (!start) return;
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) {
      suppressOpen.current = true;
    }
  };

  const openViewer = () => {
    if (suppressOpen.current) {
      suppressOpen.current = false;
      return;
    }
    setViewerOpen(true);
  };

  return <article className="home-overview-card home-test-card">
    {offer.image ? <span className="offer-card-media-wrap home-test-media-wrap">
      <button
        ref={openerRef}
        type="button"
        className="home-test-image-trigger image-view-trigger"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onClick={openViewer}
        aria-label="تكبير الصورة"
      >
        <Image src={offer.image.src} alt={offer.image.alt} width={offer.image.width} height={offer.image.height}
          unoptimized={offer.image.src.startsWith("https://")} className="home-overview-image asset-image-contain" sizes="180px" />
        <span className="image-expand-affordance home-test-zoom-icon" aria-hidden="true">
          <MagnifyingGlassPlus size={18} weight="bold" />
        </span>
      </button>
      {offer.badge ? <em className="offer-promo-badge">{offer.badge}</em> : null}
    </span> : offer.badge ? <em className="offer-promo-badge">{offer.badge}</em> : null}
    <div className="home-test-title-row">
      {offer.availabilityLabel ? <em className={`status-${offer.availability}`}>{offer.availabilityLabel}</em> : null}
      <strong>{offer.title}</strong>
    </div>
    {offer.summary ? <span>{offer.summary}</span> : null}
    {offer.bullets?.length ? <ul className="home-test-topics">{offer.bullets.map((topic) => <li key={topic}>{topic}</li>)}</ul> : null}
    {isPackage && offer.variants?.length ? (
      <div className="offer-variants package-item-list" aria-label="عناصر الباقة">
        {offer.variants.map((variant) => {
          const price = formatPrice(variant.price);
          return (
            <span key={variant.id} className="offer-variant-pill">
              <strong>{variant.title}</strong>
              <b dir={price.label === "حسب الطلب" ? "rtl" : "ltr"}>{price.label}</b>
              {price.clarification ? <small>{price.clarification}</small> : null}
            </span>
          );
        })}
      </div>
    ) : null}
    <PackageItems presentation={offer.packagePresentation} />
    <div className="mini-meta home-test-footer">
      <span className="home-test-footer-left">
        {packaged ? <PackageFooter presentation={offer.packagePresentation} /> : offer.priceLabel ? <b dir={offer.priceLabel === "حسب الطلب" ? "rtl" : "ltr"}>{offer.priceLabel}</b> : null}
        {href ? <Link href={href} className="secondary-action home-test-details">عرض التفاصيل</Link> : null}
      </span>
    </div>
    {!packaged && offer.priceClarification ? <small>{offer.priceClarification}</small> : null}
    {viewerOpen && offer.image ? (
      <ImageViewerOverlay
        items={viewerItems}
        index={0}
        openerRef={openerRef}
        onClose={() => setViewerOpen(false)}
        onMove={() => undefined}
        labelPrefix="صورة"
      />
    ) : null}
  </article>;
}
