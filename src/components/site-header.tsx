"use client";

import { CaretDown, House } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/tests", label: "الاختبارات" },
  { href: "/coaching", label: "الكوتشينغ" },
  { href: "/courses", label: "الدورات" },
  { href: "/programs", label: "البرمجات" },
  { href: "/sessions", label: "الجلسات" },
  { href: "/compass", label: "بوصلة المشاعر" },
  { href: "/fingerprints", label: "البصمات" },
] as const;

type HistoryEntry = {
  href: string;
  scrollY: number;
};

const historyKey = "zizi-in-site-history";
const restoreKey = "zizi-restore-scroll";
const pendingNavigationKey = "zizi-pending-navigation";
const previousPageKey = "zizi-previous-page";
const lastScrollKey = "zizi-last-scroll";

const currentHref = () => `${window.location.pathname}${window.location.search}`;

const readHistory = (): HistoryEntry[] => {
  try {
    const value = window.sessionStorage.getItem(historyKey);
    return value ? JSON.parse(value) as HistoryEntry[] : [];
  } catch {
    return [];
  }
};

const writeHistory = (entries: HistoryEntry[]) => {
  window.sessionStorage.setItem(historyKey, JSON.stringify(entries.slice(-12)));
};

const findLastEntryIndex = (entries: readonly HistoryEntry[], href: string) => {
  for (let index = entries.length - 1; index >= 0; index -= 1) {
    if (entries[index]?.href === href) return index;
  }

  return -1;
};

const rememberLastScroll = (entry: HistoryEntry) => {
  if (entry.scrollY > 0) {
    window.sessionStorage.setItem(lastScrollKey, JSON.stringify(entry));
    return entry;
  }

  try {
    const previous = window.sessionStorage.getItem(lastScrollKey);
    if (previous) {
      const parsed = JSON.parse(previous) as HistoryEntry;
      if (parsed.href === entry.href) return parsed;
    }
  } catch {
    window.sessionStorage.removeItem(lastScrollKey);
  }

  return entry;
};

const updateCurrentScroll = () => {
  const href = currentHref();
  try {
    const pending = window.sessionStorage.getItem(pendingNavigationKey);
    if (pending && (JSON.parse(pending) as HistoryEntry).href === href) return;
  } catch {
    window.sessionStorage.removeItem(pendingNavigationKey);
  }

  const entries = readHistory();
  const index = findLastEntryIndex(entries, href);
  const nextEntry = rememberLastScroll({ href, scrollY: window.scrollY });

  if (index >= 0) {
    entries[index] = nextEntry;
    writeHistory(entries);
    return;
  }

  writeHistory([...entries, nextEntry]);
};

const captureNavigationScroll = () => {
  const href = currentHref();
  let entry = { href, scrollY: window.scrollY };

  if (entry.scrollY <= 0) {
    try {
      const last = window.sessionStorage.getItem(lastScrollKey);
      if (last) {
        const parsed = JSON.parse(last) as HistoryEntry;
        if (parsed.href === href && parsed.scrollY > entry.scrollY) {
          entry = parsed;
        }
      }
    } catch {
      window.sessionStorage.removeItem(lastScrollKey);
    }
  }

  try {
    const previous = window.sessionStorage.getItem(previousPageKey);
    if (previous) {
      const parsed = JSON.parse(previous) as HistoryEntry;
      if (parsed.href === href && parsed.scrollY > entry.scrollY) {
        entry = parsed;
      }
    }
  } catch {
    window.sessionStorage.removeItem(previousPageKey);
  }

  const entries = readHistory();
  const index = findLastEntryIndex(entries, href);

  if (index >= 0) {
    entries[index] = entry;
    writeHistory(entries);
  } else {
    writeHistory([...entries, entry]);
  }

  window.sessionStorage.setItem(pendingNavigationKey, JSON.stringify(entry));
  window.sessionStorage.setItem(previousPageKey, JSON.stringify(entry));
};

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDetailsElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const currentPage = navLinks.find((link) => pathname === link.href || pathname.startsWith(`${link.href}/`));
  const showBackButton = pathname !== "/";

  useEffect(() => {
    const href = currentHref();
    const pending = window.sessionStorage.getItem(pendingNavigationKey);
    if (pending) {
      try {
        const entry = JSON.parse(pending) as HistoryEntry;
        if (entry.href !== href) {
          const entries = readHistory();
          const index = findLastEntryIndex(entries, entry.href);
          if (index >= 0) {
            entries[index] = entry;
            writeHistory(entries);
          }
          window.sessionStorage.removeItem(pendingNavigationKey);
        }
      } catch {
        window.sessionStorage.removeItem(pendingNavigationKey);
      }
    }

    const entries = readHistory();
    if (entries.at(-1)?.href !== href) {
      writeHistory([...entries, { href, scrollY: window.scrollY }]);
    }

    const restore = window.sessionStorage.getItem(restoreKey);
    if (restore) {
      try {
        const target = JSON.parse(restore) as HistoryEntry;
        if (target.href === href) {
          window.sessionStorage.removeItem(restoreKey);
          window.requestAnimationFrame(() => window.scrollTo({ top: target.scrollY, behavior: "auto" }));
        }
      } catch {
        window.sessionStorage.removeItem(restoreKey);
      }
    }
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updateCurrentScroll();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", updateCurrentScroll);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", updateCurrentScroll);
    };
  }, []);

  const goBack = useCallback(() => {
    updateCurrentScroll();

    const href = currentHref();
    try {
      const previousPage = window.sessionStorage.getItem(previousPageKey);
      if (previousPage) {
        const previous = JSON.parse(previousPage) as HistoryEntry;
        if (previous.href !== href) {
          window.sessionStorage.setItem(restoreKey, JSON.stringify(previous));
          router.push(previous.href);
          return;
        }
      }
    } catch {
      window.sessionStorage.removeItem(previousPageKey);
    }

    const entries = readHistory();
    const currentIndex = findLastEntryIndex(entries, href);
    const previous = currentIndex > 0 ? entries[currentIndex - 1] : null;

    if (previous) {
      writeHistory(entries.slice(0, currentIndex));
      window.sessionStorage.setItem(restoreKey, JSON.stringify(previous));
      router.push(previous.href);
      return;
    }

    router.push("/");
  }, [router]);

  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;

  return (
    <header className="site-header">
      <nav className="header-nav-shell mx-auto max-w-6xl px-5 py-3 md:px-8">
        <div className="header-home-slot">
          <Link
            href="/"
            className="home-pill home-icon-link"
            aria-label="الرئيسية"
            onPointerDown={captureNavigationScroll}
            onClick={captureNavigationScroll}
          >
            <House size={17} weight="bold" />
            <span className="sr-only">الرئيسية</span>
          </Link>
        </div>
        <details
          ref={menuRef}
          className="mobile-nav-menu header-page-menu"
          open={menuOpen}
          onToggle={(event) => setMenuOpen(event.currentTarget.open)}
        >
          <summary aria-expanded={menuOpen} onPointerDown={captureNavigationScroll}>
            <span>{currentPage?.label ?? "الأقسام"}</span>
            <CaretDown size={16} weight="bold" />
          </summary>
          <div className="mobile-nav-menu-panel" aria-label="روابط الأقسام">
            {navLinks.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn("mobile-nav-link", active && "active")}
                  aria-current={active ? "page" : undefined}
                  onPointerDown={captureNavigationScroll}
                  onClick={() => {
                    captureNavigationScroll();
                    setMenuOpen(false);
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </details>
        <div className="site-nav-links desktop-nav-links" aria-label="روابط الصفحات">
          {navLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                className={cn("nav-link", active && "active")}
                href={link.href}
                aria-current={active ? "page" : undefined}
                onPointerDown={captureNavigationScroll}
                onClick={captureNavigationScroll}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <div className="header-utility-controls">
          <ThemeToggle />
          {showBackButton ? (
            <button type="button" className="header-back-chevron" onClick={goBack} aria-label="العودة للصفحة السابقة">
              <span aria-hidden="true">&lt;</span>
            </button>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
