"use client";

import type { ReactNode } from "react";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        openTelegramLink?: (url: string) => void;
      };
    };
  }
}

export function TelegramContactLink({
  href,
  className,
  ariaLabel,
  children,
}: {
  href: string;
  className?: string;
  ariaLabel: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="noreferrer"
      aria-label={ariaLabel}
      onClick={(event) => {
        const openTelegramLink = window.Telegram?.WebApp?.openTelegramLink;
        if (!openTelegramLink) return;
        event.preventDefault();
        openTelegramLink(href);
      }}
    >
      {children}
    </a>
  );
}
