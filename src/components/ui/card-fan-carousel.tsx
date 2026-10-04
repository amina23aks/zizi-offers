"use client";

import { CaretLeft, CaretRight, MagnifyingGlass, SquaresFour } from "@phosphor-icons/react";
import Image from "next/image";
import type { CSSProperties, PointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ImageViewerOverlay } from "@/components/image-viewer-overlay";
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
  const [temporaryPaused, setTemporaryPaused] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const viewerCloseRef = useRef<HTMLButtonElement | null>(null);
  const viewerOpenerRef = useRef<HTMLButtonElement | null>(null);
  const offsetRef = useRef(0);
  const repeatDistance = useRef(0);
  const frameRef = useRef<number | null>(null);
  const previousTime = useRef<number | null>(null);
  const dragMoved = useRef(false);
  const resumeTimer = useRef<number | null>(null);
  const dragging = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    lastX: number;
    lastTime: number;
    velocity: number;
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

  const loopingItems = items;
  const canLoop = loopingItems.length > 1;
  const displayItems = canLoop ? [...loopingItems, ...loopingItems] : loopingItems;
  const activeItem = loopingItems[currentIndex % Math.max(loopingItems.length, 1)] ?? loopingItems[0] ?? items[0];
  const viewerOpen = viewerIndex !== null;
  const running = userRunning && canLoop && inView && !reducedMotionEnabled && !viewerOpen && !temporaryPaused && !pageHidden;
  const viewerItem = viewerIndex !== null ? items[viewerIndex] : null;

  const clearResumeTimer = useCallback(() => {
    if (resumeTimer.current) {
      window.clearTimeout(resumeTimer.current);
      resumeTimer.current = null;
    }
  }, []);

  const pauseBriefly = useCallback((delay = 1800) => {
    setTemporaryPaused(true);
    clearResumeTimer();
    resumeTimer.current = window.setTimeout(() => {
      setTemporaryPaused(false);
      resumeTimer.current = null;
    }, delay);
  }, [clearResumeTimer]);

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
    pauseBriefly(1500);
    syncOffset(offsetRef.current + direction * step);
  }, [loopingItems.length, pauseBriefly, syncOffset]);

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
      clearResumeTimer();
    };
  }, [clearResumeTimer]);

  useEffect(() => {
    const normalized = normalizeArabic(query);
    if (!normalized) return;
    const queryForms = searchableArabicForms(normalized);
    const next = items.findIndex((item) =>
      item.aliases.some((alias) => {
        const aliasForms = searchableArabicForms(alias);
        return queryForms.some((queryForm) =>
          aliasForms.some((aliasForm) => aliasForm.includes(queryForm)),
        );
      }),
    );
    if (next < 0) return;
    const distance = repeatDistance.current;
    if (distance > 0 && items.length) {
      pauseBriefly(2600);
      syncOffset((distance / items.length) * next);
    } else {
      setCurrentIndex(next);
    }
  }, [items, pauseBriefly, query, syncOffset]);

  useEffect(() => {
    const onVisibilityChange = () => setPageHidden(document.hidden);
    onVisibilityChange();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    clearResumeTimer();
    previousTime.current = null;
    setTemporaryPaused(true);
    pauseBriefly(2200);
    dragMoved.current = false;
    trackRef.current?.classList.add("is-dragging");
    setIsDragging(true);
    dragging.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocity: 0,
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
      dragMoved.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (!drag.isHorizontal) return;
    event.preventDefault();
    const delta = event.clientX - drag.lastX;
    const elapsed = Math.max(16, event.timeStamp - drag.lastTime);
    drag.lastX = event.clientX;
    drag.lastTime = event.timeStamp;
    drag.velocity = delta / elapsed;
    if (Math.abs(delta) > 1) dragMoved.current = true;
    syncOffset(offsetRef.current - delta);
  };

  const endDrag = () => {
    const drag = dragging.current;
    if (drag?.isHorizontal) {
      const distance = repeatDistance.current;
      const step = distance > 0 && loopingItems.length ? distance / loopingItems.length : 190;
      const momentum = Math.max(-step * 1.25, Math.min(step * 1.25, -drag.velocity * 220));
      if (Math.abs(momentum) > 10) syncOffset(offsetRef.current + momentum);
    }
    dragging.current = null;
    trackRef.current?.classList.remove("is-dragging");
    setIsDragging(false);
    pauseBriefly(1800);
    window.setTimeout(() => {
      dragMoved.current = false;
    }, 90);
  };

  const openViewer = (index: number, opener: HTMLButtonElement) => {
    pauseBriefly(3000);
    viewerOpenerRef.current = opener;
    setViewerIndex(index);
  };

  const closeViewer = useCallback(() => {
    setViewerIndex(null);
    window.setTimeout(() => viewerOpenerRef.current?.focus(), 0);
  }, []);

  const moveViewer = useCallback((direction: 1 | -1) => {
    setViewerIndex((index) => {
      if (index === null || !items.length) return index;
      return (index + direction + items.length) % items.length;
    });
  }, [items.length]);

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
          suppressHydrationWarning
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
              onClick={(event) => {
                if (dragMoved.current) return;
                const next = loopingItems.findIndex((animal) => animal.asset.id === item.asset.id);
                if (next >= 0 && repeatDistance.current > 0) {
                  syncOffset((repeatDistance.current / loopingItems.length) * next);
                }
                const viewerNext = items.findIndex((animal) => animal.asset.id === item.asset.id);
                if (viewerNext >= 0 && !clone) openViewer(viewerNext, event.currentTarget);
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
        <button type="button" className="secondary-action fan-control-button" onClick={() => move(1)}>
          <CaretRight size={18} weight="bold" />
          <span className="sr-only">اليمين</span>
        </button>
        <div className="fan-current">
          <strong>{activeItem.name}</strong>
          <span>{loopingItems.length ? currentIndex + 1 : 0} / {loopingItems.length}</span>
        </div>
        <button type="button" className="secondary-action fan-control-button" onClick={() => move(-1)}>
          <span className="sr-only">اليسار</span>
          <CaretLeft size={18} weight="bold" />
        </button>
      </div>

      <button
        type="button"
        className="secondary-action fan-pause"
        aria-pressed={!userRunning}
        onClick={() => {
          clearResumeTimer();
          setTemporaryPaused(false);
          setUserRunning((value) => !value);
        }}
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
                onClick={(event) => {
                  const next = items.findIndex((animal) => animal.asset.id === item.asset.id);
                  if (next >= 0) {
                    const filteredIndex = loopingItems.findIndex((animal) => animal.asset.id === item.asset.id);
                    if (filteredIndex >= 0 && repeatDistance.current > 0) {
                      syncOffset((repeatDistance.current / loopingItems.length) * filteredIndex);
                    }
                    setCurrentIndex(Math.max(filteredIndex, 0));
                    openViewer(next, event.currentTarget);
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

      {viewerItem ? (
        <ImageViewerOverlay
          items={items.map((item) => ({ id: item.asset.id, name: item.name, asset: item.asset }))}
          index={viewerIndex ?? 0}
          closeButtonRef={viewerCloseRef}
          openerRef={viewerOpenerRef}
          onClose={closeViewer}
          onMove={moveViewer}
        />
      ) : null}
    </div>
  );
}
