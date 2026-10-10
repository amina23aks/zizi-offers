import Link from "next/link";
import { type CoachingFormatFilter } from "@/components/offer-card";
import { OfferCardCollection } from "@/components/offer-card-collection";
import { categoryPageInfo, type DisplayOffer } from "@/data/catalog";
import { getPublicOffers } from "@/lib/public-offers";
import { matchesDelivery } from "@/lib/public-offer-model";
import type { OfferCategory } from "@/data/offers";

export async function CategoryPage({
  category,
  coachingFormat = null,
}: {
  category: Exclude<OfferCategory, "tests" | "compass">;
  coachingFormat?: CoachingFormatFilter | null;
}) {
  const info = categoryPageInfo[category as keyof typeof categoryPageInfo];
  const offers = (await getPublicOffers()).filter((offer) => offer.category === category);

  return (
    <main className={`site-main page-shell category-${category}`}>
      <section className="category-page-hero">
        <h1>{info.title}</h1>
        {info.intro ? <p>{info.intro}</p> : null}
      </section>
      {category === "coaching" ? (
        <CoachingOfferList offers={offers} activeFilter={coachingFormat} />
      ) : (
        <OfferList offers={offers} />
      )}
    </main>
  );
}
export function OfferList({ offers }: { offers: readonly DisplayOffer[] }) {
  return (
    <section className="page-section">
      <div className="offer-grid dense">
        <OfferCardCollection offers={offers} />
      </div>
    </section>
  );
}

const filterLabels: Record<CoachingFormatFilter, string> = {
  group: "جماعي",
  individual: "فردي",
};

export function CoachingOfferList({
  offers,
  activeFilter,
}: {
  offers: readonly DisplayOffer[];
  activeFilter: CoachingFormatFilter | null;
}) {
  const filteredOffers = activeFilter ? offers.filter((offer) => matchesDelivery(offer, activeFilter)) : offers;

  return (
    <section className="page-section">
      <div className="format-filter" aria-label="تصفية عروض الكوتشينغ">
        {(Object.keys(filterLabels) as CoachingFormatFilter[]).map((filter) => {
          const selected = activeFilter === filter;
          return (
            <Link
              key={filter}
              href={selected ? "/coaching" : `/coaching?format=${filter}`}
              className={`format-filter-button${selected ? " selected" : ""}`}
              role="button"
              aria-pressed={selected}
            >
              {filterLabels[filter]}
            </Link>
          );
        })}
      </div>
      <div className="offer-grid dense">
        <OfferCardCollection offers={filteredOffers} formatFilter={activeFilter} />
      </div>
    </section>
  );
}
