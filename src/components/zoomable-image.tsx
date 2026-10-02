"use client";

import { X } from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import type { ImageAsset } from "@/data/assets";

type ZoomableImageProps = {
  asset: ImageAsset;
  alt: string;
  buttonLabel?: string;
  className?: string;
  priority?: boolean;
};

export function ZoomableImage({
  asset,
  alt,
  buttonLabel = "تكبير الصورة",
  className,
  priority,
}: ZoomableImageProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    window.setTimeout(() => closeRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={className ? `${className} image-view-trigger` : "image-view-trigger"}
        onClick={() => setOpen(true)}
        aria-label={buttonLabel}
      >
        <Image
          src={asset.publicPath}
          alt={alt}
          width={asset.width}
          height={asset.height}
          priority={priority}
          className="asset-image-contain"
          sizes="(max-width: 768px) 92vw, 520px"
        />
      </button>
      {open ? (
        <div
          className="image-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="image-dialog-panel">
            <div className="flex items-center justify-between gap-3">
              <h2 id={titleId} className="text-lg font-bold">
                {alt}
              </h2>
              <button ref={closeRef} type="button" className="icon-button" onClick={() => setOpen(false)} aria-label="إغلاق">
                <X size={20} weight="bold" />
              </button>
            </div>
            <div className="image-dialog-canvas">
              <Image
                src={asset.publicPath}
                alt={alt}
                width={asset.width}
                height={asset.height}
                className="max-h-[78vh] w-auto max-w-full object-contain"
                sizes="96vw"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
