import Link from "next/link";
import { OfferCard } from "@/components/offer-card";
import { categoryPageInfo, offersByCategory, type DisplayOffer } from "@/data/catalog";
import type { OfferCategory } from "@/data/offers";

export function CategoryPage({ category }: { category: Exclude<OfferCategory, "tests" | "compass"> }) {
  const info = categoryPageInfo[category as keyof typeof categoryPageInfo];
  const offers = offersByCategory(category);

  return (
    <main className={`site-main page-shell category-${category}`}>
      <InnerBackLink />
      <section className="category-page-hero">
        <h1>{info.title}</h1>
        {info.intro ? <p>{info.intro}</p> : null}
      </section>
      <OfferList offers={offers} />
    </main>
  );
}

export function OfferList({ offers }: { offers: readonly DisplayOffer[] }) {
  return (
    <section className="page-section">
      <div className="offer-grid dense">
        {offers.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            href={offer.id === "emotional-communication" ? "/offers/emotional-communication" : undefined}
          />
        ))}
      </div>
    </section>
  );
}

export function InnerBackLink() {
  return (
    <div className="inner-route-link">
      <Link href="/">الرئيسية</Link>
    </div>
  );
}
