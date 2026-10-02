import Image from "next/image";
import Link from "next/link";
import { Clock, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { formatLabel, getAsset, type DisplayOffer } from "@/data/catalog";
import { cn } from "@/lib/utils";

export function OfferCard({ offer, href }: { offer: DisplayOffer; href?: string }) {
  const asset = getAsset(offer.assetId);
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
        {offer.variants?.length ? (
          <div className="offer-variants" aria-label="خيارات السعر">
            {offer.variants.map((variant) => (
              <span key={variant.id}>
                {variant.title}: {variant.price.status === "unknown" ? "00" : `${variant.price.amountUsd}$`}
              </span>
            ))}
          </div>
        ) : null}
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-2">
          <div>
            <p className="price-badge" dir="ltr">{offer.priceLabel}</p>
            {offer.priceClarification ? (
              <p className="text-sm text-muted">{offer.priceClarification}</p>
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
