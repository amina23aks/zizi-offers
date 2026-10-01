"use client";

import { CaretLeft, CaretRight, MagnifyingGlass, SquaresFour } from "@phosphor-icons/react";
import gsap from "gsap";
import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { normalizeArabic } from "@/data/catalog";
import type { ImageAsset } from "@/data/assets";
import { cn } from "@/lib/utils";
import { ZoomableImage } from "@/components/zoomable-image";

export type FanCardItem = {
  name: string;
  aliases: string[];
  asset: ImageAsset;
};

export function CardFanCarousel({ items }: { items: readonly FanCardItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const normalized = normalizeArabic(query);
    if (!normalized) return items;
    return items.filter((item) =>
      item.aliases.some((alias) => normalizeArabic(alias).includes(normalized)),
    );
  }, [items, query]);

  const activeItem = items[activeIndex] ?? items[0];

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cards = stage.querySelectorAll<HTMLElement>(".fan-card");
    gsap.fromTo(
      cards,
      { y: 20, opacity: 0, rotate: 0 },
      { y: 0, opacity: 1, rotate: (index) => (index - 2) * 7, stagger: 0.025, duration: 0.35, ease: "power2.out" },
    );
  }, [activeIndex]);

  const move = (direction: 1 | -1) => {
    setActiveIndex((current) => (current + direction + items.length) % items.length);
  };

  const visibleItems = [-2, -1, 0, 1, 2].map((offset) => {
    const index = (activeIndex + offset + items.length) % items.length;
    return { item: items[index], offset, index };
  });

  return (
    <div className="fan-shell">
      <div className="fan-toolbar">
        <label className="search-label" htmlFor="etho-search">
          <MagnifyingGlass size={18} weight="bold" />
          <span>ابحثي باسم الحيوان</span>
        </label>
        <input
          id="etho-search"
          className="search-input"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setShowAll(true);
          }}
          placeholder="ذيب، ذئب، أرنب..."
        />
      </div>

      <div className="fan-stage" ref={stageRef} aria-live="polite">
        {visibleItems.map(({ item, offset, index }) => {
          const isActive = offset === 0;
          return (
            <button
              type="button"
              key={`${item.asset.id}-${offset}`}
              className={cn("fan-card", isActive && "active")}
              style={{
                "--fan-offset": offset,
                "--fan-abs": Math.abs(offset),
              } as CSSProperties}
              aria-label={`عرض ${item.name}`}
              aria-hidden={!isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveIndex(index)}
            >
              <Image
                src={item.asset.publicPath}
                alt=""
                width={item.asset.width}
                height={item.asset.height}
                className="h-full w-full object-contain"
                sizes="(max-width: 768px) 70vw, 280px"
              />
            </button>
          );
        })}
      </div>

      <div className="fan-controls">
        <button type="button" className="secondary-action" onClick={() => move(-1)}>
          <CaretRight size={18} weight="bold" />
          السابق
        </button>
        <div className="fan-current">
          <strong>{activeItem.name}</strong>
          <span>{activeIndex + 1} / {items.length}</span>
        </div>
        <button type="button" className="primary-action small-action" onClick={() => move(1)}>
          التالي
          <CaretLeft size={18} weight="bold" />
        </button>
      </div>

      <ZoomableImage asset={activeItem.asset} alt={`صورة ${activeItem.name}`} className="fan-active-image" />

      <button
        type="button"
        className="secondary-action fan-grid-toggle"
        aria-expanded={showAll}
        onClick={() => setShowAll((value) => !value)}
      >
        <SquaresFour size={18} weight="bold" />
        عرض الكل
      </button>

      {showAll ? (
        <div className="animal-grid roomy" aria-live="polite">
          {filtered.map((item) => (
            <button
              type="button"
              className="animal-grid-item"
              key={item.asset.id}
              onClick={() => {
                const next = items.findIndex((animal) => animal.asset.id === item.asset.id);
                if (next >= 0) setActiveIndex(next);
              }}
            >
              <Image
                src={item.asset.publicPath}
                alt=""
                width={item.asset.width}
                height={item.asset.height}
                className="h-full w-full object-contain"
                sizes="150px"
              />
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
