"use client";

import { CaretLeft, CaretRight, MagnifyingGlass, SquaresFour } from "@phosphor-icons/react";
import Image from "next/image";
import type { CSSProperties, MouseEvent, PointerEvent, TouchEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { normalizeArabic } from "@/data/catalog";
import type { ImageAsset } from "@/data/assets";
import { cn } from "@/lib/utils";

export type FanCardItem = {
  name: string;
  aliases: string[];
  asset: ImageAsset;
};

export function CardFanCarousel({ items }: { items: readonly FanCardItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [paused, setPaused] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtered = useMemo(() => {
    const normalized = normalizeArabic(query);
    if (!normalized) return items;
    return items.filter((item) =>
      item.aliases.some((alias) => normalizeArabic(alias).includes(normalized)),
    );
  }, [items, query]);

  const activeItem = items[activeIndex] ?? items[0];

  const move = useCallback((direction: 1 | -1) => {
    setActiveIndex((current) => (current + direction + items.length) % items.length);
  }, [items.length]);

  const pauseBriefly = () => {
    setInteractionPaused(true);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setInteractionPaused(false), 2800);
  };

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches || paused || interactionPaused || !inView) return;
    const tick = window.setInterval(() => {
      if (document.hidden) return;
      move(1);
    }, 5600);
    return () => window.clearInterval(tick);
  }, [paused, interactionPaused, inView, move]);

  useEffect(() => {
    if (!shellRef.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.18 },
    );
    observer.observe(shellRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, []);

  const startDrag = (x: number, y: number) => {
    pauseBriefly();
    dragStart.current = { x, y };
  };

  const endDrag = (x: number, y: number) => {
    if (!dragStart.current) return;
    const dx = x - dragStart.current.x;
    const dy = y - dragStart.current.y;
    dragStart.current = null;
    if (Math.abs(dx) < 34 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
    move(dx > 0 ? -1 : 1);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    startDrag(event.clientX, event.clientY);
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    endDrag(event.clientX, event.clientY);
  };

  const onMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    startDrag(event.clientX, event.clientY);
  };

  const onMouseUp = (event: MouseEvent<HTMLDivElement>) => {
    endDrag(event.clientX, event.clientY);
  };

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.changedTouches[0];
    if (touch) startDrag(touch.clientX, touch.clientY);
  };

  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.changedTouches[0];
    if (touch) endDrag(touch.clientX, touch.clientY);
  };

  const visibleItems = [-3, -2, -1, 0, 1, 2, 3].map((offset) => {
    const index = (activeIndex + offset + items.length) % items.length;
    return { item: items[index], offset, index };
  });

  return (
    <div className="fan-shell" ref={shellRef}>
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

      <div
        className="fan-stage"
        aria-live="polite"
        onMouseEnter={() => setInteractionPaused(true)}
        onMouseLeave={pauseBriefly}
        onFocus={() => setInteractionPaused(true)}
        onBlur={pauseBriefly}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onPointerCancel={() => {
          dragStart.current = null;
        }}
      >
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
                alt={isActive ? `صورة ${item.name}` : ""}
                width={item.asset.width}
                height={item.asset.height}
                className="h-full w-full object-contain"
                sizes="(max-width: 768px) 175px, 220px"
              />
            </button>
          );
        })}
      </div>

      <div className="fan-controls">
        <button type="button" className="secondary-action" onClick={() => move(-1)}>
          <CaretRight size={18} weight="bold" />
          <span className="sr-only">السابق</span>
        </button>
        <div className="fan-current">
          <strong>{activeItem.name}</strong>
          <span>{activeIndex + 1} / {items.length}</span>
        </div>
        <button type="button" className="primary-action small-action" onClick={() => move(1)}>
          <span className="sr-only">التالي</span>
          <CaretLeft size={18} weight="bold" />
        </button>
      </div>

      <button
        type="button"
        className="secondary-action fan-pause"
        aria-pressed={paused}
        onClick={() => setPaused((value) => !value)}
      >
        {paused ? "استئناف الحركة" : "إيقاف الحركة"}
      </button>

      <button
        type="button"
        className="secondary-action fan-grid-toggle"
        aria-expanded={showAll}
        onClick={() => setShowAll((value) => !value)}
      >
        <SquaresFour size={18} weight="bold" />
        {showAll ? "إخفاء الكل" : "عرض الكل"}
      </button>

      {showAll ? (
        <div className="animal-grid roomy" aria-live="polite">
          {filtered.length ? (
            filtered.map((item) => (
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
            ))
          ) : (
            <p className="empty-state">لا توجد نتيجة مطابقة.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
