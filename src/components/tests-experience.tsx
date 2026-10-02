"use client";

import { CaretLeft, CaretRight, Plant } from "@phosphor-icons/react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CardFanCarousel } from "@/components/ui/card-fan-carousel";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { BrainIcon, HeartIcon, SparklesIcon } from "@/components/ui/animated-icons";
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
  { href: "#behavioral-inclinations", label: "الميولات السلوكية" },
] as const;

const codeLayout = ["C", "A", "B", "D"] as const;

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
        <SectionHeading
          title="الأكواد"
          text="اختبار الأكواد الدماغية في نموذج زيزي يستكشف ميول A/B/C/D كما تظهر في طريقة التفكير والعمل والتعلّم، دون تحويله هنا إلى نظام نتائج آلي."
        />
        <TestMeta price="12$" />
        <div className="codes-sketch-grid" aria-label="بطاقات الأكواد">
          {orderedCodes.map((card) => (
            <CodeFlipCard key={card.code} card={card} />
          ))}
        </div>
      </section>

      <section id="etho" className="page-section scroll-mt-28">
        <SectionHeading
          title="الإيثو"
          text="استكشفي الأنماط السلوكية في نموذج الإيثو لدى زيزي، وتعرّفي على النمط المهيمن لديك وما يتيحه من أسئلة لفهم تفاعلاتك."
        />
        <TestMeta price="12$" />
        <CardFanCarousel items={ethoAnimals} />
      </section>

      <section id="mindsets" className="page-section scroll-mt-28">
        <SectionHeading
          title="العقليات"
          text="تعرّفي على استجاباتك الغالبة في المواقف والتعاملات، ضمن عقليات الصواب والفوز والمرتاح والمحبوب في نموذج زيزي."
        />
        <TestMeta price="12$" />
        <MindsetSlider />
      </section>

      <section id="spectra" className="page-section scroll-mt-28">
        <SectionHeading title="الأطياف" text="استكشفي تناسق استجاباتك خلال الأشهر الأخيرة وفق نموذج الطيف لدى زيزي." />
        <TestMeta price="12$" />
        <AnimatedTabs
          label="الطيف الهندسي"
          className="spectra-tabs"
          items={spectraAssets.map((asset) => ({
            id: asset.id,
            label: asset.stem,
            content: (
              <article className="spectra-tab-card">
                <ZoomableImage asset={asset} alt={`شكل ${asset.stem}`} className="spectra-image-frame" />
                <div className="spectra-copy">
                  <h3>{asset.stem}</h3>
                </div>
              </article>
            ),
          }))}
        />
      </section>

      <section id="behavioral-inclinations" className="page-section scroll-mt-28">
        <span id="triple" className="anchor-compat" aria-hidden="true" />
        <SectionHeading title="الاختبارات النفسية للميولات السلوكية" />
        <div className="triple-panel">
          <span className="status-badge">متاح</span>
          <ZoomableImage
            asset={triadAsset}
            alt="الاختبارات النفسية للميولات السلوكية"
            className="triple-image-frame"
          />
        </div>
      </section>

    </div>
  );
}

function SectionHeading({ title, text }: { title: string; text?: string }) {
  return (
    <div className="section-heading compact centered">
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
    </div>
  );
}

function CodeFlipCard({ card }: { card: (typeof codeCards)[number] }) {
  const [revealed, setRevealed] = useState(false);

  const icon =
    card.code === "A" ? (
      <BrainIcon className="code-icon" />
    ) : card.code === "B" ? (
      <Plant className="code-icon" size={28} weight="duotone" />
    ) : card.code === "C" ? (
      <HeartIcon className="code-icon" />
    ) : (
      <SparklesIcon className="code-icon" />
    );

  return (
    <article
      className={cn("code-card", card.accent, `code-position-${card.code}`, revealed && "revealed")}
      role="button"
      tabIndex={0}
      aria-label={`${revealed ? "إخفاء" : "عرض"} بطاقة كود ${card.code}`}
      onClick={() => setRevealed((value) => !value)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setRevealed((value) => !value);
        }
      }}
    >
      <div className="code-card-shell">
        <div className="code-card-face code-card-front" aria-hidden={revealed}>
          {icon}
          <span className="code-letter">{card.code}</span>
          <h3>{card.title}</h3>
          <span className="code-action">اكتشفي الكود</span>
        </div>
        <div className="code-card-face code-card-back" aria-hidden={!revealed}>
          <div className="code-image-frame">
            <Image
              src={card.asset.publicPath}
              alt={`بطاقة كود ${card.code}`}
              width={card.asset.width}
              height={card.asset.height}
              className="asset-image-contain"
              sizes="220px"
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function MindsetSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const active = mindsets[activeIndex] ?? mindsets[0];

  const move = (direction: 1 | -1) => {
    setActiveIndex((current) => (current + direction + mindsets.length) % mindsets.length);
    setExpanded(false);
  };

  return (
    <div className="mindset-slider">
      {mindsetCoverAsset ? (
        <ZoomableImage asset={mindsetCoverAsset} alt="غلاف اختبار العقليات" className="mindset-image-frame" />
      ) : null}
      <div className="mindset-copy-panel">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            <p className="eyebrow">{String(activeIndex + 1).padStart(2, "0")} / 04</p>
            <h3>{active.label}</h3>
            <p>{active.summary}</p>
            <div className="mindset-points">
              <strong>ملامح إيجابية</strong>
              <ul>
                {active.positives.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            {expanded ? (
              <div className="mindset-expanded">
                {"details" in active && active.details ? <p>{active.details}</p> : null}
                <strong>نقاط تحتاج انتباهًا</strong>
                <ul>
                  {active.attention.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
        <button type="button" className="secondary-action small-action" onClick={() => setExpanded((value) => !value)}>
          {expanded ? "عرض أقل" : "عرض المزيد"}
        </button>
        <div className="mindset-controls">
          <button type="button" className="icon-button subtle" onClick={() => move(-1)} aria-label="العقلية السابقة">
            <CaretRight size={18} weight="bold" />
          </button>
          <button type="button" className="icon-button subtle" onClick={() => move(1)} aria-label="العقلية التالية">
            <CaretLeft size={18} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}

function TestMeta({ price, clarification }: { price: string; clarification?: string }) {
  return (
    <div className="test-meta-row">
      <span className="status-badge">متاح</span>
      <span className="price-badge" dir="ltr">{price}</span>
      {clarification ? <small>{clarification}</small> : null}
    </div>
  );
}
