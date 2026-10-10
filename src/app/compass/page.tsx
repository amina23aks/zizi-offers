import type { Metadata } from "next";
import { getPublicOffers } from "@/lib/public-offers";
import { OfferList } from "@/components/category-page";
import { ZoomableImage } from "@/components/zoomable-image";
import { compassCards, compassLaunchAsset, compassPricing } from "@/data/catalog";

export const metadata: Metadata = {
  title: "بوصلة المشاعر | عروض زيزي",
};

export default async function CompassPage() {
  const offers = (await getPublicOffers()).filter((o) => o.category === "compass");
  const connected = process.env.PUBLIC_OFFERS_SOURCE === "firestore";
  return (
    <main className="site-main page-shell">
      <section className="category-page-hero compass-hero">
        <h1>بوصلة المشاعر</h1>
        <div className="compass-prices" aria-label="أسعار بوصلة المشاعر">
          {!connected && compassPricing.map((item) => (
            <span key={item.title}>
              {item.title}: <strong dir="ltr">{item.price}</strong>
            </span>
          ))}
        </div>
      </section>

      {connected && <OfferList offers={offers} />}
      <section className="compass-path" aria-label="مسار بوصلة المشاعر">
        {compassLaunchAsset ? (
          <article className="compass-launch-card compass-card-image-only">
            <ZoomableImage asset={compassLaunchAsset} alt="مسار الانطلاق" className="compass-image-frame" />
          </article>
        ) : null}
        <div className="compass-card-row">
          {compassCards.map((card) => (
            <article key={card.id} className="compass-card compass-card-image-only">
              <ZoomableImage asset={card.asset} alt={`بطاقة ${card.title}`} className="compass-image-frame" />
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
