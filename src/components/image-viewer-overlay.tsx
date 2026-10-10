"use client";

import { ArrowsIn, CaretLeft, CaretRight, MagnifyingGlassMinus, MagnifyingGlassPlus, X } from "@phosphor-icons/react";
import Image from "next/image";
import type { CSSProperties, KeyboardEvent, PointerEvent, RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ImageAsset } from "@/data/assets";

export type ViewerImageItem = {
  id: string;
  name: string;
  asset: ImageAsset;
};

export function ImageViewerOverlay({
  items,
  index,
  closeButtonRef,
  openerRef,
  onClose,
  onMove,
  labelPrefix = "صورة",
}: {
  items: readonly ViewerImageItem[];
  index: number;
  closeButtonRef?: RefObject<HTMLButtonElement | null>;
  openerRef?: RefObject<HTMLElement | null>;
  onClose: () => void;
  onMove: (direction: 1 | -1) => void;
  labelPrefix?: string;
}) {
  const fallbackCloseRef = useRef<HTMLButtonElement | null>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const panStart = useRef<{ x: number; y: number; translateX: number; translateY: number } | null>(null);
  const pinchStart = useRef<{ distance: number; scale: number } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const activeCloseRef = closeButtonRef ?? fallbackCloseRef;
  const item = items[index];
  const zoomed = scale > 1.01;

  const resetZoom = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    pointers.current.clear();
    panStart.current = null;
    pinchStart.current = null;
  }, []);

  const zoomBy = (delta: number) => {
    setScale((value) => {
      const next = Math.min(4, Math.max(1, Number((value + delta).toFixed(2))));
      if (next === 1) setTranslate({ x: 0, y: 0 });
      return next;
    });
  };

  const moveBy = useCallback((direction: 1 | -1) => {
    resetZoom();
    onMove(direction);
  }, [onMove, resetZoom]);

  const focusClose = useCallback(() => {
    window.setTimeout(() => activeCloseRef.current?.focus(), 0);
  }, [activeCloseRef]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const scrollY = window.scrollY;
    const opener = openerRef?.current;
    document.body.style.overflow = "hidden";
    focusClose();

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") moveBy(1);
      if (event.key === "ArrowRight") moveBy(-1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.scrollTo({ top: scrollY, behavior: "auto" });
      window.removeEventListener("keydown", onKeyDown);
      window.setTimeout(() => opener?.focus(), 0);
    };
  }, [focusClose, moveBy, onClose, openerRef]);

  if (!item) return null;

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2) {
      const [first, second] = Array.from(pointers.current.values());
      pinchStart.current = {
        distance: Math.hypot(second.x - first.x, second.y - first.y),
        scale,
      };
      return;
    }
    if (zoomed) {
      event.currentTarget.setPointerCapture(event.pointerId);
      panStart.current = { x: event.clientX, y: event.clientY, translateX: translate.x, translateY: translate.y };
      return;
    }
    swipeStart.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2 && pinchStart.current) {
      event.preventDefault();
      const [first, second] = Array.from(pointers.current.values());
      const distance = Math.hypot(second.x - first.x, second.y - first.y);
      const next = Math.min(4, Math.max(1, pinchStart.current.scale * (distance / pinchStart.current.distance)));
      setScale(next);
      if (next === 1) setTranslate({ x: 0, y: 0 });
      return;
    }
    if (zoomed && panStart.current) {
      event.preventDefault();
      setTranslate({
        x: panStart.current.translateX + event.clientX - panStart.current.x,
        y: panStart.current.translateY + event.clientY - panStart.current.y,
      });
    }
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    panStart.current = null;
    if (pointers.current.size < 2) pinchStart.current = null;
    if (zoomed) {
      swipeStart.current = null;
      return;
    }
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < 42 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    moveBy(dx < 0 ? 1 : -1);
  };

  const onDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const controls = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not([disabled])"),
    );
    if (!controls.length) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className="image-viewer"
      role="dialog"
      aria-modal="true"
      aria-label={`${labelPrefix} ${item.name}`}
      tabIndex={-1}
      onKeyDown={onDialogKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <button ref={activeCloseRef} type="button" className="image-viewer-close" onClick={onClose} aria-label="إغلاق">
        <X size={22} weight="bold" />
      </button>
      <div className="image-viewer-tools" aria-label="تكبير الصورة">
        <button type="button" onClick={() => zoomBy(0.35)} aria-label="تكبير">
          <MagnifyingGlassPlus size={20} weight="bold" />
        </button>
        <button type="button" onClick={() => zoomBy(-0.35)} aria-label="تصغير">
          <MagnifyingGlassMinus size={20} weight="bold" />
        </button>
        <button type="button" onClick={resetZoom} aria-label="ملاءمة الشاشة">
          <ArrowsIn size={20} weight="bold" />
        </button>
      </div>
      <button type="button" className="image-viewer-nav image-viewer-prev" onClick={() => moveBy(-1)} aria-label="الصورة السابقة">
        <CaretRight size={28} weight="bold" />
      </button>
      <figure className="image-viewer-figure">
        <Image
          unoptimized={item.asset.publicPath.startsWith("https://")}
          src={item.asset.publicPath}
          alt={`${labelPrefix} ${item.name}`}
          width={item.asset.width}
          height={item.asset.height}
          className="image-viewer-image"
          style={{
            "--viewer-scale": scale,
            "--viewer-x": `${translate.x}px`,
            "--viewer-y": `${translate.y}px`,
          } as CSSProperties}
          sizes="100vw"
          priority
        />
        <figcaption>
          <strong>{item.name}</strong>
          <span>{index + 1} / {items.length}</span>
        </figcaption>
      </figure>
      <button type="button" className="image-viewer-nav image-viewer-next" onClick={() => moveBy(1)} aria-label="الصورة التالية">
        <CaretLeft size={28} weight="bold" />
      </button>
    </div>
  );
}
