"use client";

import { CaretLeft, CaretRight, MagnifyingGlass, SquaresFour } from "@phosphor-icons/react";
import Image from "next/image";
import type { CSSProperties, PointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { normalizeArabic, searchableArabicForms } from "@/data/catalog";
import type { ImageAsset } from "@/data/assets";
import { cn } from "@/lib/utils";

export type FanCardItem = {
  name: string;
  aliases: string[];
  asset: ImageAsset;
};

export function CardFanCarousel({ items }: { items: readonly FanCardItem[] }) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [reducedMotionEnabled, setReducedMotionEnabled] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [userRunning, setUserRunning] = useState(
    () => !(typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches),
  );
  const [motionOffset, setMotionOffset] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inView, setInView] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef(0);
  const repeatDistance = useRef(0);
  const frameRef = useRef<number | null>(null);
  const previousTime = useRef<number | null>(null);
  const dragging = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    lastX: number;
    isHorizontal: boolean;
  } | null>(null);

  const filtered = useMemo(() => {
    const normalized = normalizeArabic(query);
    if (!normalized) return items;
    const queryForms = searchableArabicForms(normalized);
    return items.filter((item) =>
      item.aliases.some((alias) => {
        const aliasForms = searchableArabicForms(alias);
        return queryForms.some((queryForm) =>
          aliasForms.some((aliasForm) => aliasForm.includes(queryForm)),
        );
      }),
    );
  }, [items, query]);

  const hasQuery = Boolean(normalizeArabic(query));
  const loopingItems = hasQuery ? filtered : items;
  const canLoop = loopingItems.length > 1 && !hasQuery;
  const displayItems = canLoop ? [...loopingItems, ...loopingItems] : loopingItems;
  const activeItem = loopingItems[currentIndex % Math.max(loopingItems.length, 1)] ?? loopingItems[0] ?? items[0];
  const running = userRunning && canLoop && inView && !reducedMotionEnabled;

  const syncOffset = useCallback((nextOffset: number) => {
    const distance = repeatDistance.current;
    const normalized = distance > 0 ? ((nextOffset % distance) + distance) % distance : Math.max(0, nextOffset);
    offsetRef.current = normalized;
    setMotionOffset(normalized);

    if (distance > 0 && loopingItems.length) {
      const step = distance / loopingItems.length;
      setCurrentIndex(Math.floor((normalized + step / 2) / step) % loopingItems.length);
    } else {
      setCurrentIndex(0);
    }
  }, [loopingItems.length]);

  const measureRepeat = useCallback(() => {
    const track = trackRef.current;
    if (!track || !canLoop) {
      repeatDistance.current = 0;
      syncOffset(0);
      return;
    }
    repeatDistance.current = track.scrollWidth / 2;
    syncOffset(offsetRef.current);
  }, [canLoop, syncOffset]);

  const move = useCallback((direction: 1 | -1) => {
    const distance = repeatDistance.current;
    const step = distance > 0 && loopingItems.length ? distance / loopingItems.length : 190;
    syncOffset(offsetRef.current + direction * step);
  }, [loopingItems.length, syncOffset]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      setReducedMotionEnabled(media.matches);
      if (media.matches) setUserRunning(false);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    measureRepeat();
    window.addEventListener("resize", measureRepeat);
    return () => window.removeEventListener("resize", measureRepeat);
  }, [measureRepeat]);

  useEffect(() => {
    if (!running) {
      previousTime.current = null;
      return;
    }

    const tick = (time: number) => {
      if (previousTime.current === null) previousTime.current = time;
      const delta = time - previousTime.current;
      previousTime.current = time;
      if (!document.hidden && !dragging.current) {
        syncOffset(offsetRef.current + delta * 0.018);
      }
      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      previousTime.current = null;
    };
  }, [running, syncOffset]);

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
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  useEffect(() => {
    syncOffset(0);
  }, [query, syncOffset]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragging.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      isHorizontal: false,
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragging.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.isHorizontal && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      drag.isHorizontal = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (!drag.isHorizontal) return;
    event.preventDefault();
    const delta = event.clientX - drag.lastX;
    drag.lastX = event.clientX;
    syncOffset(offsetRef.current - delta);
  };

  const endDrag = () => {
    dragging.current = null;
    setIsDragging(false);
  };

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
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div
          ref={trackRef}
          className={cn("fan-track", running && "is-running", isDragging && "is-dragging")}
          style={{ "--fan-shift": `${motionOffset}px` } as CSSProperties}
        >
        {displayItems.map((item, index) => {
          const clone = canLoop && index >= loopingItems.length;
          return (
            <button
              type="button"
              key={`${item.asset.id}-${index}`}
              className={cn("fan-card", index % Math.max(loopingItems.length, 1) === currentIndex && "active")}
              aria-label={`عرض ${item.name}`}
              aria-hidden={clone}
              tabIndex={clone ? -1 : 0}
              onClick={() => {
                const next = loopingItems.findIndex((animal) => animal.asset.id === item.asset.id);
                if (next >= 0 && repeatDistance.current > 0) {
                  syncOffset((repeatDistance.current / loopingItems.length) * next);
                }
              }}
            >
              <Image
                src={item.asset.publicPath}
                alt={clone ? "" : `صورة ${item.name}`}
                width={item.asset.width}
                height={item.asset.height}
                className="h-full w-full object-contain"
                sizes="(max-width: 768px) 175px, 220px"
              />
            </button>
          );
        })}
        </div>
      </div>

      <div className="fan-controls">
        <button type="button" className="secondary-action" onClick={() => move(-1)}>
          <CaretRight size={18} weight="bold" />
          <span className="sr-only">السابق</span>
        </button>
        <div className="fan-current">
          <strong>{activeItem.name}</strong>
          <span>{loopingItems.length ? currentIndex + 1 : 0} / {loopingItems.length}</span>
        </div>
        <button type="button" className="primary-action small-action" onClick={() => move(1)}>
          <span className="sr-only">التالي</span>
          <CaretLeft size={18} weight="bold" />
        </button>
      </div>

      <button
        type="button"
        className="secondary-action fan-pause"
        aria-pressed={!userRunning}
        onClick={() => setUserRunning((value) => !value)}
      >
        {userRunning ? "إيقاف الحركة" : "استئناف الحركة"}
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
                  if (next >= 0) {
                    const filteredIndex = loopingItems.findIndex((animal) => animal.asset.id === item.asset.id);
                    if (filteredIndex >= 0 && repeatDistance.current > 0) {
                      syncOffset((repeatDistance.current / loopingItems.length) * filteredIndex);
                    }
                    setCurrentIndex(Math.max(filteredIndex, 0));
                  }
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
