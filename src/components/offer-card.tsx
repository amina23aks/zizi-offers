"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, MagnifyingGlassPlus, User, UsersThree } from "@phosphor-icons/react";
import type { CSSProperties } from "react";
import { formatAvailability, formatLabel, formatPrice, getAsset, type DisplayOffer } from "@/data/catalog";
import { cn } from "@/lib/utils";

export type CoachingFormatFilter = "group" | "individual";

const variantMatchesFormat = (title: string, filter: CoachingFormatFilter) =>
  filter === "group" ? title.includes("جماعي") : title.includes("فردي");

export function OfferCard({
  offer,
  href,
  formatFilter,
  onImageOpen,
}: {
  offer: DisplayOffer;
  href?: string;
  formatFilter?: CoachingFormatFilter;
  onImageOpen?: (opener: HTMLButtonElement) => void;
}) {
  const asset = getAsset(offer.assetId);
  const visibleVariants = formatFilter && offer.variants?.length
    ? offer.variants.filter((variant) => variantMatchesFormat(variant.title, formatFilter))
    : offer.variants;
  const matchingVariant = formatFilter && visibleVariants?.length === 1 ? visibleVariants[0] : null;
  const displayPrice = matchingVariant ? formatPrice(matchingVariant.price) : {
    label: offer.priceLabel,
    clarification: offer.priceClarification,
  };
  const displayAvailability = matchingVariant?.availability
    ? formatAvailability(matchingVariant.availability)
    : offer.availabilityLabel;
  const displayAvailabilityStatus = matchingVariant?.availability ?? offer.availability;
  const meta = [
    offer.programDuration ? { icon: "clock", label: `مدة البرنامج: ${offer.programDuration}` } : null,
    offer.sessionDuration ? { icon: "clock", label: `مدة الجلسة: ${offer.sessionDuration}` } : null,
    offer.totalTrainingDuration ? { icon: "clock", label: `مدة التدريب: ${offer.totalTrainingDuration}` } : null,
    offer.capacity ? { icon: "group", label: `السعة: ${offer.capacity}` } : null,
  ].filter(Boolean) as { icon: "clock" | "group"; label: string }[];
  const mediaStyle = asset
    ? ({ "--asset-ratio": `${asset.width} / ${asset.height}` } as CSSProperties)
    : undefined;

  return (
    <article className="offer-card">
      {asset && onImageOpen ? (
        <button
          type="button"
          className="offer-card-media image-view-trigger"
          style={mediaStyle}
          onClick={(event) => onImageOpen?.(event.currentTarget)}
          aria-label="عرض الصورة وتكبيرها"
        >
          <Image
            src={asset.publicPath}
            alt={`غلاف ${offer.title}`}
            width={asset.width}
            height={asset.height}
            className="asset-image-contain"
            sizes="(max-width: 768px) 88vw, 280px"
          />
          <span className="image-expand-affordance" aria-hidden="true">
            <MagnifyingGlassPlus size={18} weight="bold" />
          </span>
        </button>
      ) : asset ? (
        <div className="offer-card-media" style={mediaStyle}>
          <Image
            src={asset.publicPath}
            alt={`غلاف ${offer.title}`}
            width={asset.width}
            height={asset.height}
            className="asset-image-contain"
            sizes="(max-width: 768px) 88vw, 280px"
          />
        </div>
      ) : null}
      <div className="offer-card-body">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="eyebrow">{offer.category === "programs" ? "برمجة" : formatLabel(offer.format)}</p>
          {displayAvailability ? (
            <span className={cn("status-badge", `status-${displayAvailabilityStatus}`)}>{displayAvailability}</span>
          ) : null}
        </div>
        <h3 className="text-xl font-bold">{offer.title}</h3>
        {offer.summary ? <p className="text-sm leading-7 text-muted">{offer.summary}</p> : null}
        {offer.bullets?.length ? (
          <ul className="offer-bullets">
            {offer.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        ) : null}
        {meta.length ? (
          <div className="offer-meta-list">
            {meta.map((item) => (
              <span key={item.label}>
                {item.icon === "clock" ? <Clock size={15} weight="bold" /> : <UsersThree size={15} weight="bold" />}
                {item.label}
              </span>
            ))}
          </div>
        ) : null}
        {visibleVariants?.length ? (
          <div className="offer-variants" aria-label="خيارات السعر">
            {visibleVariants.map((variant) => (
              <span key={variant.id} className="offer-variant-pill">
                {variant.title.includes("جماعي") ? <UsersThree size={15} weight="bold" /> : <User size={15} weight="bold" />}
                <strong>{variant.title}</strong>
                <b dir="ltr">{formatPrice(variant.price).label}</b>
                {formatPrice(variant.price).clarification ? <small>{formatPrice(variant.price).clarification}</small> : null}
                {variant.availability ? (
                  <em className={cn("variant-status", `status-${variant.availability}`)}>
                    {formatAvailability(variant.availability)}
                  </em>
                ) : null}
              </span>
            ))}
          </div>
        ) : null}
        <div className="offer-card-footer">
          <div className="offer-price-block">
            <p className="price-badge" dir="ltr">{displayPrice.label}</p>
            {displayPrice.clarification ? (
              <p className="text-sm text-muted">{displayPrice.clarification}</p>
            ) : null}
          </div>
          {href ? (
            <Link href={href} className="secondary-action">
              التفاصيل
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
