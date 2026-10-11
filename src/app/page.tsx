import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  BookOpenText,
  Brain,
  Compass,
  Fingerprint,
  GraduationCap,
  Plant,
  Sparkle,
  TelegramLogo,
} from "@phosphor-icons/react/dist/ssr";
import { OfferCardCollection } from "@/components/offer-card-collection";
import { ZoomableImage } from "@/components/zoomable-image";
import { compassPricing, formatAvailability, getAsset, homeSections, publicCategories, ziziAbout } from "@/data/catalog";
import { getPublicOffers } from "@/lib/public-offers";
import { ziziIdentityAssetIds } from "@/data/assets";

const categoryIcons = {
  tests: Brain,
  coaching: Plant,
  courses: GraduationCap,
  programs: Sparkle,
  sessions: BookOpenText,
  fingerprints: Fingerprint,
  compass: Compass,
} as const;

const bookingContacts = [
  { country: "السعودية", href: "https://t.me/rawabiv" },
  { country: "الكويت", href: "https://t.me/mnjko89" },
  { country: "المغرب", href: "https://t.me/Slowallday" },
  { country: "الإمارات", href: "https://t.me/lamer_iam" },
] as const;

export default async function Home() {
  const savedOffers = await getPublicOffers();
  const connected = process.env.PUBLIC_OFFERS_SOURCE === "firestore";
  const savedOfferById = new Map(savedOffers.map((offer) => [offer.id, offer]));
  const identityAsset = getAsset(ziziIdentityAssetIds.avatar ?? ziziIdentityAssetIds.groupLogo);

  return (
    <main className="site-main home-main">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="hero-bubble-field" aria-label="أقسام عروض زيزي">
          {publicCategories.map((item, index) => {
            const Icon = categoryIcons[item.id];
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`category-bubble accent-${item.accent}`}
                style={{ "--i": index } as CSSProperties}
              >
                <Icon size={18} weight="duotone" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="home-title-wrap">
          <h1 id="home-title">عروض زيزي</h1>
        </div>
        <div className="hero-actions" aria-label="روابط سريعة">
          <Link href="#offers-sections" className="secondary-action hero-action">
            استكشفي العروض
          </Link>
          <Link href="#booking-contact" className="primary-action hero-action">
            احجزي الآن
          </Link>
        </div>
      </section>

      <section id="about" className="content-band about-band">
        <div className="about-layout">
          {identityAsset ? (
            <div className="about-avatar" aria-label="هوية زيزي البصرية">
              <Image
                src={identityAsset.publicPath}
                alt="هوية عروض زيزي"
                width={identityAsset.width}
                height={identityAsset.height}
                className="asset-image-contain"
                sizes="96px"
              />
            </div>
          ) : null}
          <div className="about-copy">
            <p className="eyebrow">عن زيزي</p>
            <h2>{ziziAbout.heading}</h2>
            <p>{ziziAbout.body}</p>
          </div>
        </div>
      </section>

      <section id="offers-sections" className="content-band home-offer-sections">
        {homeSections.map((section) => (
          <section
            key={section.id}
            className={`home-offer-section home-section-${section.id} accent-${section.accent}`}
            aria-labelledby={`${section.id}-title`}
          >
            <div className="home-section-head">
              <div>
                <h2 id={`${section.id}-title`}>{section.title}</h2>
                {section.intro ? <p>{section.intro}</p> : null}
                {section.id === "compass" ? (
                  <p className="section-note compass-price-note">
                    {compassPricing.map((item) => (
                      <span key={item.title}>{item.title}: <b dir="ltr">{item.price}</b></span>
                    ))}
                  </p>
                ) : null}
              </div>
              <Link href={section.href} className="secondary-action">
                عرض الكل
              </Link>
            </div>
            <div className="home-carousel-row" tabIndex={0} aria-label={`عروض ${section.title}`}>
              {section.id === "tests"
                ? section.cards.map((card) => {
                    const saved = savedOfferById.get(card.offerId);
                    const title = saved?.title ?? card.title;
                    const summary = saved?.summary ?? ("summary" in card ? card.summary : null);
                    const availabilityLabel = saved?.availabilityLabel ?? ("availabilityLabel" in card ? card.availabilityLabel : null);
                    const priceLabel = card.offerId === "triple-test"
                      ? ("priceLabel" in card ? card.priceLabel : null)
                      : saved?.priceLabel ?? ("priceLabel" in card ? card.priceLabel : null);
                    const priceClarification = saved?.priceClarification ?? ("priceClarification" in card ? card.priceClarification : null);
                    return (
                      <Link key={card.id} href={card.href} className="home-overview-card">
                        {saved?.image ? (
                          <span className="offer-card-media-wrap home-test-media-wrap">
                            <Image
                              src={saved.image.src}
                              alt={saved.image.alt}
                              width={saved.image.width}
                              height={saved.image.height}
                              unoptimized={saved.image.src.startsWith("https://")}
                              className="home-overview-image asset-image-contain"
                              sizes="180px"
                            />
                            {saved.badge ? <em className="offer-promo-badge">{saved.badge}</em> : null}
                          </span>
                        ) : saved?.badge ? <em className="offer-promo-badge">{saved.badge}</em> : null}
                        <strong>{title}</strong>
                        {summary ? <span>{summary}</span> : null}
                        <div className="mini-meta">
                          {availabilityLabel ? (
                            <em className={saved ? `status-${saved.availability}` : undefined}>{availabilityLabel}</em>
                          ) : saved ? formatAvailability(saved.availability) : null}
                          {priceLabel ? <b dir="ltr">{priceLabel}</b> : null}
                        </div>
                        {priceClarification ? <small>{String(priceClarification)}</small> : null}
                      </Link>
                    );
                  })
                : ((connected && !["fingerprints", "compass"].includes(section.id)) || "offers" in section)
                ? (
                    <OfferCardCollection
                      offers={savedOffers.filter((offer) => offer.category === section.id)}
                      itemClassName="home-carousel-item"
                    />
                  )
                : section.cards.map((card) => section.id === "compass" && "asset" in card && card.asset ? (
                    <div key={card.id} className="home-overview-card compass-overview-card">
                      <ZoomableImage
                        asset={card.asset}
                        alt={`بطاقة ${card.title}`}
                        className="compass-image-frame home-compass-image-frame"
                      />
                      <span className="sr-only">{card.title}</span>
                    </div>
                  ) : (
                    <Link key={card.id} href={card.href} className="home-overview-card">
                      {"asset" in card && card.asset ? (
                        <Image
                          src={card.asset.publicPath}
                          alt={`غلاف ${card.title}`}
                          width={card.asset.width}
                          height={card.asset.height}
                          className="home-overview-image asset-image-contain"
                          sizes="180px"
                        />
                      ) : null}
                      <strong>{card.title}</strong>
                      {"summary" in card && typeof card.summary === "string" && card.summary ? <span>{card.summary}</span> : null}
                      <div className="mini-meta">
                        {"availabilityLabel" in card && typeof card.availabilityLabel === "string" && card.availabilityLabel ? <em>{card.availabilityLabel}</em> : null}
                        {"priceLabel" in card && typeof card.priceLabel === "string" && card.priceLabel ? <b dir="ltr">{card.priceLabel}</b> : null}
                      </div>
                      {"priceClarification" in card && card.priceClarification ? <small>{String(card.priceClarification)}</small> : null}
                    </Link>
                  ))}
            </div>
          </section>
        ))}
      </section>
      <section id="booking-contact" className="content-band booking-contact-section" aria-labelledby="booking-contact-title">
        <div className="booking-contact-copy">
          <p className="eyebrow">تواصل مباشر</p>
          <h2 id="booking-contact-title">للحجز والاستفسار</h2>
          <p>
            تواصلي مع إحدى مساعدات زيزي حسب بلدك لإتمام الحجز.
            <br />
            وإذا كنتِ من بلد آخر، يمكنكِ التواصل مع أيٍّ منهن.
          </p>
        </div>
        <div className="booking-contact-grid" aria-label="مساعدات زيزي حسب البلد">
          {bookingContacts.map((contact) => (
            <a
              key={contact.country}
              href={contact.href}
              className="booking-contact-button"
              target="_blank"
              rel="noreferrer"
              aria-label={`التواصل مع مساعدة زيزي في ${contact.country}`}
            >
              <TelegramLogo size={19} weight="fill" aria-hidden="true" />
              <span>{contact.country}</span>
            </a>
          ))}
        </div>
        <div className="payment-methods" aria-label="طرق الدفع المتاحة">
          <p>طرق الدفع المتاحة</p>
          <div className="payment-method-tiles">
            <div className="payment-method-tile">Visa</div>
            <div className="payment-method-tile">PayPal</div>
          </div>
        </div>
      </section>
    </main>
  );
}
