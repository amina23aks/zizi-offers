import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { OfferCard } from "@/components/offer-card";
import { categoryLinks, getAsset, homePreviewOffers } from "@/data/catalog";
import { ziziIdentityAssetIds } from "@/data/assets";

export default function Home() {
  const groupLogo = getAsset(ziziIdentityAssetIds.groupLogo);

  return (
    <main className="site-main">
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-copy">
            <p className="eyebrow">مساحة عربية هادئة للاستكشاف</p>
            <h1>عروض زيزي</h1>
            <p className="hero-lead">
              مساحة للتأمل في ذاتك، وفهم أنماطك، واختيار خطوتك التالية
            </p>
            <div className="hero-actions">
              <Link href="/tests" className="primary-action">
                استكشفي العروض
              </Link>
              <a href="#booking" className="secondary-action">
                حالة الحجز
              </a>
            </div>
          </div>
          <div className="hero-visual" aria-label="هوية عروض زيزي">
            {groupLogo ? (
              <Image
                src={groupLogo.publicPath}
                alt="علامة المجموعة البصرية، وليست صورة شخصية لزيزي"
                width={groupLogo.width}
                height={groupLogo.height}
                priority
                className="hero-logo"
              />
            ) : null}
            <div className="hero-orbit desktop-only" aria-label="أقسام العروض">
              {categoryLinks.map((item, index) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="orbit-link"
                  style={{ "--i": index } as CSSProperties}
                >
                  <span>{item.label}</span>
                  <small>{item.note}</small>
                </Link>
              ))}
            </div>
          </div>
          <div className="mobile-category-grid" aria-label="أقسام العروض">
            {categoryLinks.map((item) => (
              <Link key={item.label} href={item.href}>
                <strong>{item.label}</strong>
                <span>{item.note}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="content-band">
        <div className="section-heading">
          <p className="eyebrow">عن المساحة</p>
          <h2>عن الذات وأنماط التعبير</h2>
          <p>
            عن الذات: التفكير، السلوك، النفس والشخصية، وتعبيرها بلغة الجسد والخط
            وطبقات الصوت وطريقة اللبس والتفضيلات الأخرى.
          </p>
        </div>
      </section>

      <section id="selected-offers" className="content-band alt-band">
        <div className="section-heading">
          <p className="eyebrow">مختارات أولى</p>
          <h2>معاينات بعينات من الأصول الأصلية</h2>
          <p>
            هذه بداية بصرية فقط. بقية الصفحات والعروض تُبنى بعد مراجعة هذا الاتجاه.
          </p>
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

      <section id="booking" className="content-band">
        <div className="booking-panel">
          <p className="eyebrow">الحجز</p>
          <h2>رابط الحجز غير متوفر بعد</h2>
          <p>
            لم يتم تزويد المشروع برابط بوت أو نموذج حجز معتمد، لذلك لا يوجد زر حجز
            فعّال الآن.
          </p>
        </div>
      </section>
    </main>
  );
}
