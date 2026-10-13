import Image from "next/image";
import Link from "next/link";
import type { DisplayOffer } from "@/data/catalog";
import { testDetailsHref } from "@/lib/test-details";
import { PackageItems, PackageFooter } from "./package-pricing";

export function HomeTestCard({ offer }: { offer: Partial<DisplayOffer> & { id: string; title: string } }) {
  const href = testDetailsHref(offer.id);
  const packaged = offer.packagePresentation?.enabled;
  return <article className="home-overview-card home-test-card">
    {offer.image ? <span className="offer-card-media-wrap home-test-media-wrap">
      <Image src={offer.image.src} alt={offer.image.alt} width={offer.image.width} height={offer.image.height}
        unoptimized={offer.image.src.startsWith("https://")} className="home-overview-image asset-image-contain" sizes="180px" />
      {offer.badge ? <em className="offer-promo-badge">{offer.badge}</em> : null}
    </span> : offer.badge ? <em className="offer-promo-badge">{offer.badge}</em> : null}
    <div className="home-test-title-row">
      {offer.availabilityLabel ? <em className={`status-${offer.availability}`}>{offer.availabilityLabel}</em> : null}
      <strong>{offer.title}</strong>
    </div>
    {offer.summary ? <span>{offer.summary}</span> : null}
    {offer.bullets?.length ? <ul className="home-test-topics">{offer.bullets.map((topic) => <li key={topic}>{topic}</li>)}</ul> : null}
    <PackageItems presentation={offer.packagePresentation} />
    <div className="mini-meta home-test-footer">
      <span className="home-test-footer-left">
        {packaged ? <PackageFooter presentation={offer.packagePresentation} /> : offer.priceLabel ? <b dir={offer.priceLabel === "حسب الطلب" ? "rtl" : "ltr"}>{offer.priceLabel}</b> : null}
        {href ? <Link href={href} className="secondary-action home-test-details">عرض التفاصيل</Link> : null}
      </span>
    </div>
    {!packaged && offer.priceClarification ? <small>{offer.priceClarification}</small> : null}
  </article>;
}
