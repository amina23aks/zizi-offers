"use client";

import {
  ArrowLeft,
  ArrowRight,
  Cards,
  GridFour,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { codeCards, ethoAnimals, mindsets, normalizeArabic, spectraAssets, triadAsset } from "@/data/catalog";
import { cn } from "@/lib/utils";
import { ZoomableImage } from "@/components/zoomable-image";

const testsNav = [
  { href: "#codes", label: "الأكواد" },
  { href: "#etho", label: "الإيثو" },
  { href: "#mindsets", label: "العقليات" },
  { href: "#spectra", label: "الأطياف" },
  { href: "#triple", label: "الثلاثي" },
] as const;

export function TestsExperience() {
  const [activeAnimal, setActiveAnimal] = useState(0);
  const [query, setQuery] = useState("");
  const [activeMindset, setActiveMindset] = useState<(typeof mindsets)[number]["id"]>(
    mindsets[0].id,
  );

  const filteredAnimals = useMemo(() => {
    const normalized = normalizeArabic(query);
    if (!normalized) return ethoAnimals;
    return ethoAnimals.filter((animal) =>
      animal.aliases.some((alias) => normalizeArabic(alias).includes(normalized)),
    );
  }, [query]);

  const carouselAnimal = ethoAnimals[activeAnimal] ?? ethoAnimals[0];

  const goToAnimal = (direction: "next" | "previous") => {
    setActiveAnimal((current) => {
      const next = direction === "next" ? current + 1 : current - 1;
      if (next < 0) return ethoAnimals.length - 1;
      if (next >= ethoAnimals.length) return 0;
      return next;
    });
  };

  return (
    <div className="tests-page">
      <nav className="tests-sticky-nav" aria-label="أقسام صفحة الاختبارات">
        {testsNav.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>

      <section id="codes" className="page-section scroll-mt-32">
        <SectionHeading
          eyebrow="01"
          title="الأكواد ABCD"
          text="أربع بطاقات تفاعلية تعرض الواجهة المختصرة، ثم الصورة الأصلية كاملة عند الكشف."
        />
        <div className="grid gap-5 lg:grid-cols-4">
          {codeCards.map((card) => (
            <CodeFlipCard key={card.code} card={card} />
          ))}
        </div>
      </section>

      <section id="etho" className="page-section scroll-mt-32">
        <SectionHeading
          eyebrow="02"
          title="الإيثو"
          text="اختبار واحد يضم 51 نمطًا بصريًا. البحث يعمل بالأسماء والمرادفات مع الحفاظ على أسماء الملفات الأصلية."
        />
        <div className="etho-layout">
          <div className="interactive-panel">
            <div className="flex items-center justify-between gap-3">
              <p className="eyebrow">كاروسيل الحيوانات</p>
              <span className="text-sm text-muted">{activeAnimal + 1} / {ethoAnimals.length}</span>
            </div>
            <div className="animal-stage">
              <ZoomableImage
                asset={carouselAnimal.asset}
                alt={`صورة ${carouselAnimal.name}`}
                className="animal-zoom-frame"
              />
              <h3>{carouselAnimal.name}</h3>
            </div>
            <div className="flex gap-3">
              <button type="button" className="secondary-action" onClick={() => goToAnimal("previous")}>
                <ArrowRight size={18} weight="bold" />
                السابق
              </button>
              <button type="button" className="primary-action small-action" onClick={() => goToAnimal("next")}>
                التالي
                <ArrowLeft size={18} weight="bold" />
              </button>
            </div>
          </div>
          <div className="interactive-panel">
            <label className="search-label" htmlFor="animal-search">
              <MagnifyingGlass size={18} weight="bold" />
              <span>ابحثي باسم الحيوان</span>
            </label>
            <input
              id="animal-search"
              className="search-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="مثال: ذئب، ذيب، أرنب"
            />
            <div className="mt-5 flex items-center gap-2 text-sm text-muted">
              <GridFour size={18} weight="bold" />
              <span>عرض الكل: {filteredAnimals.length} نتيجة</span>
            </div>
            <div className="animal-grid" aria-live="polite">
              {filteredAnimals.map((animal) => (
                <button
                  type="button"
                  className="animal-grid-item"
                  key={animal.asset.id}
                  onClick={() => setActiveAnimal(ethoAnimals.findIndex((item) => item.asset.id === animal.asset.id))}
                >
                  <Image
                    src={animal.asset.publicPath}
                    alt=""
                    width={animal.asset.width}
                    height={animal.asset.height}
                    className="h-full w-full object-contain"
                    sizes="120px"
                  />
                  <span>{animal.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="mindsets" className="page-section scroll-mt-32">
        <SectionHeading
          eyebrow="03"
          title="العقليات"
          text="تبويبات نصية فقط الآن، لأن الأصول الفردية غير موجودة ولا توجد نسب أو نتائج معتمدة."
        />
        <div className="tabs" role="tablist" aria-label="عقليات زيزي">
          {mindsets.map((mindset) => (
            <button
              key={mindset.id}
              id={`tab-${mindset.id}`}
              type="button"
              role="tab"
              aria-selected={activeMindset === mindset.id}
              aria-controls={`panel-${mindset.id}`}
              className={cn("tab-button", activeMindset === mindset.id && "active")}
              onClick={() => setActiveMindset(mindset.id)}
            >
              {mindset.label}
            </button>
          ))}
        </div>
        {mindsets.map((mindset) => (
          <div
            key={mindset.id}
            id={`panel-${mindset.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${mindset.id}`}
            hidden={activeMindset !== mindset.id}
            className="tab-panel"
          >
            <h3>{mindset.label}</h3>
            <p>{mindset.text}</p>
          </div>
        ))}
      </section>

      <section id="spectra" className="page-section scroll-mt-32">
        <SectionHeading
          eyebrow="04"
          title="الطيف الهندسي"
          text="الصور الاثنتا عشرة المسجلة فعليًا، مع عرض كامل يحافظ على النصوص داخل الصور."
        />
        <div className="spectra-grid">
          {spectraAssets.map((asset) => (
            <article key={asset.id} className="image-tile">
              <ZoomableImage asset={asset} alt={`شكل ${asset.stem}`} className="tile-zoom-frame" />
              <h3>{asset.stem}</h3>
            </article>
          ))}
        </div>
      </section>

      <section id="triple" className="page-section scroll-mt-32">
        <SectionHeading eyebrow="05" title="الاختبار الثلاثي" />
        <div className="triple-panel">
          <span className="status-badge">متاح</span>
          <ZoomableImage
            asset={triadAsset}
            alt="الاختبار الثلاثي - الميولات السوكيه"
            className="triple-image-frame"
          />
        </div>
      </section>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
    </div>
  );
}

function CodeFlipCard({ card }: { card: (typeof codeCards)[number] }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <article className={cn("code-card", card.accent, revealed && "revealed")}>
      <div className="code-card-shell">
        <div className="code-card-face code-card-front" aria-hidden={revealed}>
          <Cards size={32} weight="duotone" />
          <span className="code-letter">{card.code}</span>
          <h3>{card.title}</h3>
          <p>{card.summary}</p>
          <button type="button" className="primary-action small-action" onClick={() => setRevealed(true)}>
            اعرضي البطاقة
          </button>
        </div>
        <div className="code-card-face code-card-back" aria-hidden={!revealed}>
          <ZoomableImage asset={card.asset} alt={`بطاقة كود ${card.code}`} className="code-image-frame" />
          <button type="button" className="secondary-action" onClick={() => setRevealed(false)}>
            رجوع
          </button>
        </div>
      </div>
      <p className="code-study">{card.study}</p>
    </article>
  );
}
