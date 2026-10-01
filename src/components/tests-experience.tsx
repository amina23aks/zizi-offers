"use client";

import {
  Brain,
  Cards,
  Heart,
  Plant,
  Sparkle,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { CardFanCarousel } from "@/components/ui/card-fan-carousel";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { ZoomableImage } from "@/components/zoomable-image";
import {
  codeCards,
  ethoAnimals,
  mindsets,
  mindsetCoverAsset,
  spectraAssets,
  triadAsset,
} from "@/data/catalog";
import { cn } from "@/lib/utils";

const testsNav = [
  { href: "#codes", label: "الأكواد" },
  { href: "#etho", label: "الإيثو" },
  { href: "#mindsets", label: "العقليات" },
  { href: "#spectra", label: "الأطياف" },
  { href: "#triple", label: "الثلاثي" },
] as const;

const codeLayout = ["C", "A", "B", "D"] as const;

const codeIcon = {
  A: Brain,
  B: Plant,
  C: Heart,
  D: Sparkle,
} as const;

export function TestsExperience() {
  const orderedCodes = useMemo(
    () => codeLayout.map((code) => codeCards.find((card) => card.code === code)!),
    [],
  );

  return (
    <div className="tests-page">
      <nav className="tests-sticky-nav" aria-label="أقسام صفحة الاختبارات">
        {testsNav.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>

      <section id="codes" className="page-section scroll-mt-28">
        <SectionHeading number="01" title="الأكواد ABCD" />
        <div className="codes-sketch-grid">
          {orderedCodes.map((card) => (
            <CodeFlipCard key={card.code} card={card} />
          ))}
        </div>
      </section>

      <section id="etho" className="page-section scroll-mt-28">
        <SectionHeading number="02" title="الإيثو" />
        <CardFanCarousel items={ethoAnimals} />
      </section>

      <section id="mindsets" className="page-section scroll-mt-28">
        <SectionHeading number="03" title="العقليات" />
        <div className="mindset-layout">
          {mindsetCoverAsset ? (
            <ZoomableImage
              asset={mindsetCoverAsset}
              alt="غلاف اختبار العقليات"
              className="mindset-image-frame"
            />
          ) : null}
          <AnimatedTabs
            label="عقليات زيزي"
            items={mindsets.map((mindset) => ({
              id: mindset.id,
              label: mindset.label,
              content: (
                <div className="mindset-copy">
                  <h3>{mindset.label}</h3>
                  <p>{mindset.text}</p>
                </div>
              ),
            }))}
          />
        </div>
      </section>

      <section id="spectra" className="page-section scroll-mt-28">
        <SectionHeading number="04" title="الأطياف" />
        <AnimatedTabs
          label="الطيف الهندسي"
          items={spectraAssets.map((asset) => ({
            id: asset.id,
            label: asset.stem,
            content: (
              <article className="spectra-tab-card">
                <ZoomableImage asset={asset} alt={`شكل ${asset.stem}`} className="spectra-image-frame" />
                <h3>{asset.stem}</h3>
              </article>
            ),
          }))}
        />
      </section>

      <section id="triple" className="page-section scroll-mt-28">
        <SectionHeading number="05" title="الاختبار الثلاثي" />
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

function SectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="section-heading compact">
      <p className="eyebrow">{number}</p>
      <h2>{title}</h2>
    </div>
  );
}

function CodeFlipCard({ card }: { card: (typeof codeCards)[number] }) {
  const [revealed, setRevealed] = useState(false);
  const Icon = codeIcon[card.code];

  return (
    <article className={cn("code-card", card.accent, `code-position-${card.code}`, revealed && "revealed")}>
      <div className="code-card-shell">
        <div className="code-card-face code-card-front" aria-hidden={revealed}>
          <Icon size={38} weight="duotone" />
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
      <div className="code-study">
        <Cards size={18} weight="duotone" />
        <p>{card.study}</p>
      </div>
    </article>
  );
}
