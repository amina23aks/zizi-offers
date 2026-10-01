import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { ZoomableImage } from "@/components/zoomable-image";
import {
  emotionalCommunicationOffer,
  emotionalCommunicationTopics,
  getAsset,
} from "@/data/catalog";

export const metadata: Metadata = {
  title: "التواصل العاطفي | عروض زيزي",
  description: "نموذج صفحة تفاصيل عرض التواصل العاطفي.",
};

export default function EmotionalCommunicationPage() {
  const offer = emotionalCommunicationOffer;
  const asset = getAsset(offer.assetId);

  return (
    <main className="site-main page-shell">
      <section className="offer-detail-hero">
        <div className="offer-detail-copy">
          <Link href="/" className="text-link">
            الرئيسية
          </Link>
          <p className="eyebrow">كوتشينغ جماعي</p>
          <h1>{offer.title}</h1>
          <p>
            مسار يركّز على إدارة الضغوط والنزاعات، وفهم الحدود الصحية والعاطفية
            في العلاقات.
          </p>
          <div className="detail-meta">
            {offer.availabilityLabel ? <span className="status-badge">{offer.availabilityLabel}</span> : null}
            <span>
              <UsersThree size={18} weight="bold" />
              جماعي، السعة 10
            </span>
            <strong>{offer.priceLabel} للمقعد</strong>
          </div>
        </div>
        {asset ? (
          <ZoomableImage
            asset={asset}
            alt="غلاف كوتش التواصل العاطفي"
            className="detail-image-frame"
            priority
          />
        ) : null}
      </section>

      <section className="content-band">
        <div className="section-heading">
          <p className="eyebrow">المحاور المعتمدة</p>
          <h2>ما الذي يظهر في هذا النموذج؟</h2>
        </div>
        <div className="topic-grid">
          {emotionalCommunicationTopics.map((topic) => (
            <article key={topic} className="topic-item">
              <CheckCircle size={22} weight="fill" />
              <h3>{topic}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band alt-band">
        <div className="booking-panel">
          <p className="eyebrow">الحجز</p>
          <h2>الحجز غير متاح من الموقع بعد</h2>
          <p>
            لا يوجد رابط بوت أو نموذج حجز معتمد في الإعدادات الحالية. لم نضف
            تواريخ بدء أو مقاعد متبقية أو وعود نتائج.
          </p>
          <Link href="/tests" className="secondary-action">
            تصفحي الاختبارات
          </Link>
        </div>
      </section>
    </main>
  );
}
