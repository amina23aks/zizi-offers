"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImageViewerOverlay } from "@/components/image-viewer-overlay";
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

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
        <ImageViewerOverlay
          items={[{ id: asset.id, name: alt, asset }]}
          index={0}
          openerRef={triggerRef}
          closeButtonRef={closeRef}
          onClose={() => setOpen(false)}
          onMove={() => undefined}
        />
      ) : null}
    </>
  );
}
