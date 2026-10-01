import Link from "next/link";
import type { CSSProperties } from "react";
import { OfferCard } from "@/components/offer-card";
import { categoryLinks, homePreviewOffers, publicCategories } from "@/data/catalog";

export default function Home() {
  return (
    <main className="site-main home-main">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="hero-bubble-field desktop-only" aria-label="أقسام عروض زيزي">
          {categoryLinks.map((item, index) => (
            <Link
              key={item.id}
              href={item.href}
              className={`category-bubble accent-${item.accent}`}
              style={{ "--i": index } as CSSProperties}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="home-title-wrap">
          <h1 id="home-title">عروض زيزي</h1>
          <p>مساحة للتأمل في ذاتك، وفهم أنماطك، واختيار خطوتك التالية</p>
          <Link href="#categories" className="primary-action">
            استكشفي العروض
          </Link>
        </div>

        <div className="mobile-category-grid" aria-label="أقسام عروض زيزي">
          {categoryLinks.map((item) => (
            <Link key={item.id} href={item.href}>
              <strong>{item.label}</strong>
              <span>{item.note}</span>
            </Link>
          ))}
        </div>
      </section>

      <section id="about" className="content-band about-band">
        <div className="about-copy">
          <p className="eyebrow">عن زيزي</p>
          <h2>زيزي… قراءة أعمق للتفاصيل</h2>
          <p>
            عن الذات: التفكير، السلوك، النفس والشخصية، وتعبيرها بلغة الجسد والخط
            وطبقات الصوت وطريقة اللبس والتفضيلات الأخرى.
          </p>
        </div>
      </section>

      <section id="categories" className="content-band">
        <div className="section-heading">
          <p className="eyebrow">الأقسام</p>
          <h2>استكشفي الأقسام</h2>
        </div>
        <div className="category-card-grid">
          {publicCategories.map((category) => (
            <Link key={category.id} href={category.href} className={`category-card accent-${category.accent}`}>
              <span>{category.label}</span>
              <p>{category.note}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="content-band alt-band">
        <div className="section-heading">
          <p className="eyebrow">مختارات</p>
          <h2>لمحة من العروض</h2>
        </div>
        <div className="offer-grid">
          {homePreviewOffers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              href={offer.id === "emotional-communication" ? "/offers/emotional-communication" : undefined}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
