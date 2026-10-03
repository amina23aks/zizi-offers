import type { Metadata } from "next";
import { Compass } from "@phosphor-icons/react/dist/ssr";
import type { CSSProperties } from "react";
import { ZoomableImage } from "@/components/zoomable-image";
import { compassCards, compassLaunchAsset, compassPricing } from "@/data/catalog";

export const metadata: Metadata = {
  title: "بوصلة المشاعر | عروض زيزي",
};

export default function CompassPage() {
  return (
    <main className="site-main page-shell">
      <section className="category-page-hero compass-hero">
        <Compass size={38} weight="duotone" />
        <h1>بوصلة المشاعر</h1>
        <div className="compass-prices" aria-label="أسعار بوصلة المشاعر">
          {compassPricing.map((item) => (
            <span key={item.title}>
              {item.title}: <strong>{item.price}</strong>
            </span>
          ))}
        </div>
      </section>

      <section className="compass-path" aria-label="مسار بوصلة المشاعر">
        {compassLaunchAsset ? (
          <article className="compass-launch-card">
            <h2>مسار الانطلاق</h2>
            <ZoomableImage asset={compassLaunchAsset} alt="مسار الانطلاق" className="compass-image-frame" />
          </article>
        ) : null}
        <div className="compass-card-row">
          {compassCards.map((card, index) => (
            <article key={card.id} className="compass-card" style={{ "--step": index } as CSSProperties}>
              <span>{index + 1}</span>
              <h2>{card.title}</h2>
              <ZoomableImage asset={card.asset} alt={`بطاقة ${card.title}`} className="compass-image-frame" />
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
