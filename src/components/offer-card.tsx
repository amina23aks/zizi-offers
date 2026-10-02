import Image from "next/image";
import Link from "next/link";
import { Clock, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { formatLabel, formatPrice, getAsset, type DisplayOffer } from "@/data/catalog";
import { cn } from "@/lib/utils";

export type CoachingFormatFilter = "group" | "individual";

const variantMatchesFormat = (title: string, filter: CoachingFormatFilter) =>
  filter === "group" ? title.includes("جماعي") : title.includes("فردي");

export function OfferCard({
  offer,
  href,
  formatFilter,
}: {
  offer: DisplayOffer;
  href?: string;
  formatFilter?: CoachingFormatFilter;
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
  const meta = [
    offer.programDuration ? `مدة البرنامج: ${offer.programDuration}` : null,
    offer.sessionDuration ? `مدة الجلسة: ${offer.sessionDuration}` : null,
    offer.totalTrainingDuration ? `التدريب: ${offer.totalTrainingDuration}` : null,
    offer.capacity ? `السعة: ${offer.capacity}` : null,
    offer.priceBasis ?? null,
  ].filter(Boolean);

  return (
    <article className="offer-card">
      {asset ? (
        <div className="offer-card-media">
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
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="eyebrow">{offer.category === "programs" ? "برمجة" : formatLabel(offer.format)}</p>
          {offer.availabilityLabel ? (
            <span className={cn("status-badge", `status-${offer.availability}`)}>{offer.availabilityLabel}</span>
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
            {meta.map((item, index) => (
              <span key={item}>
                {index % 2 === 0 ? <Clock size={15} weight="bold" /> : <UsersThree size={15} weight="bold" />}
                {item}
              </span>
            ))}
          </div>
        ) : null}
        {visibleVariants?.length ? (
          <div className="offer-variants" aria-label="خيارات السعر">
            {visibleVariants.map((variant) => (
              <span key={variant.id}>
                {variant.title}: {variant.price.status === "unknown" ? "00" : `${variant.price.amountUsd}$`}
              </span>
            ))}
          </div>
        ) : null}
        <div className="offer-card-footer mt-auto flex flex-wrap items-end justify-between gap-3 pt-2">
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
