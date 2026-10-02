import Link from "next/link";
import type { CSSProperties } from "react";
import {
  Binoculars,
  BookOpenText,
  Brain,
  Compass,
  Fingerprint,
  GraduationCap,
  HandHeart,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import { publicCategories, ziziAbout } from "@/data/catalog";

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
          <p>مساحة للتأمل في ذاتك، وفهم أنماطك، واختيار خطوتك التالية</p>
          <Link href="#categories" className="primary-action hero-action">
            استكشفي العروض
          </Link>
        </div>
      </section>

      <section id="about" className="content-band about-band">
        <div className="about-layout no-avatar">
          <div className="about-copy">
            <p className="eyebrow">عن زيزي</p>
            <h2>{ziziAbout.heading}</h2>
            <p>{ziziAbout.body}</p>
          </div>
        </div>
      </section>

      <section id="categories" className="content-band">
        <div className="section-heading centered">
          <p className="eyebrow">الأقسام</p>
          <h2>استكشفي الأقسام</h2>
        </div>
        <div className="category-card-grid">
          {publicCategories.map((category) => {
            const Icon = categoryIcons[category.id];
            return (
              <Link key={category.id} href={category.href} className={`category-card accent-${category.accent}`}>
                <Icon size={30} weight="duotone" aria-hidden="true" />
                <span>{category.label}</span>
                <p>{category.note}</p>
                <strong>
                  استكشفي
                  <Binoculars size={16} weight="bold" aria-hidden="true" />
                </strong>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
