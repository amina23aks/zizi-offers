import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  BookOpenText,
  Brain,
  Compass,
  Fingerprint,
  GraduationCap,
  HandHeart,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import { OfferCard } from "@/components/offer-card";
import { getAsset, homeSections, publicCategories, ziziAbout } from "@/data/catalog";
import { ziziIdentityAssetIds } from "@/data/assets";

const categoryIcons = {
  tests: Brain,
  coaching: HandHeart,
  courses: GraduationCap,
  programs: Sparkle,
  sessions: BookOpenText,
  fingerprints: Fingerprint,
  compass: Compass,
} as const;

export default function Home() {
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
        <Link href="#offers-sections" className="primary-action hero-action">
          استكشفي العروض
        </Link>
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
                {section.id === "compass" ? <p className="section-note">كل عنصر منفرد: 500$</p> : null}
              </div>
              <Link href={section.href} className="secondary-action">
                عرض الكل
              </Link>
            </div>
            <div className="home-carousel-row" tabIndex={0} aria-label={`عروض ${section.title}`}>
              {"offers" in section
                ? section.offers.map((offer) => (
                    <div className="home-carousel-item" key={offer.id}>
                      <OfferCard
                        offer={offer}
                        href={offer.id === "emotional-communication" ? "/offers/emotional-communication" : undefined}
                      />
                    </div>
                  ))
                : section.cards.map((card) => (
                    <Link key={card.id} href={card.href} className="home-overview-card">
                      <strong>{card.title}</strong>
                      {"summary" in card && card.summary ? <span>{card.summary}</span> : null}
                      <div className="mini-meta">
                        {"availabilityLabel" in card && card.availabilityLabel ? <em>{card.availabilityLabel}</em> : null}
                        {"priceLabel" in card && card.priceLabel ? <b dir="ltr">{card.priceLabel}</b> : null}
                      </div>
                      {"priceClarification" in card && card.priceClarification ? <small>{String(card.priceClarification)}</small> : null}
                    </Link>
                  ))}
            </div>
          </section>
        ))}
      </section>
    </main>
  );
}
