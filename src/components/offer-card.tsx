import Image from "next/image";
import Link from "next/link";
import { formatLabel, getAsset, type DisplayOffer } from "@/data/catalog";

export function OfferCard({ offer, href }: { offer: DisplayOffer; href?: string }) {
  const asset = getAsset(offer.assetId);

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
          <p className="eyebrow">{formatLabel(offer.format)}</p>
          {offer.availabilityLabel ? <span className="status-badge">{offer.availabilityLabel}</span> : null}
        </div>
        <h3 className="text-xl font-bold">{offer.title}</h3>
        {offer.summary ? <p className="text-sm leading-7 text-muted">{offer.summary}</p> : null}
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-2">
          <div>
            <p className="text-2xl font-bold text-brand-blue">{offer.priceLabel}</p>
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
