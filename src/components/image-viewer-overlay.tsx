"use client";

import { CaretLeft, CaretRight, X } from "@phosphor-icons/react";
import Image from "next/image";
import type { KeyboardEvent, PointerEvent, RefObject } from "react";
import { useCallback, useEffect, useRef } from "react";
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
  const activeCloseRef = closeButtonRef ?? fallbackCloseRef;
  const item = items[index];

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
      if (event.key === "ArrowLeft") onMove(1);
      if (event.key === "ArrowRight") onMove(-1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.scrollTo({ top: scrollY, behavior: "auto" });
      window.removeEventListener("keydown", onKeyDown);
      window.setTimeout(() => opener?.focus(), 0);
    };
  }, [focusClose, onClose, onMove, openerRef]);

  if (!item) return null;

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    swipeStart.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < 42 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    onMove(dx < 0 ? 1 : -1);
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
      onPointerUp={onPointerUp}
    >
      <button ref={activeCloseRef} type="button" className="image-viewer-close" onClick={onClose} aria-label="إغلاق">
        <X size={22} weight="bold" />
      </button>
      <button type="button" className="image-viewer-nav image-viewer-prev" onClick={() => onMove(-1)} aria-label="الصورة السابقة">
        <CaretRight size={28} weight="bold" />
      </button>
      <figure className="image-viewer-figure">
        <Image
          src={item.asset.publicPath}
          alt={`${labelPrefix} ${item.name}`}
          width={item.asset.width}
          height={item.asset.height}
          className="image-viewer-image"
          sizes="100vw"
          priority
        />
        <figcaption>
          <strong>{item.name}</strong>
          <span>{index + 1} / {items.length}</span>
        </figcaption>
      </figure>
      <button type="button" className="image-viewer-nav image-viewer-next" onClick={() => onMove(1)} aria-label="الصورة التالية">
        <CaretLeft size={28} weight="bold" />
      </button>
    </div>
  );
}
