"use client";

import { CaretRight, House } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/tests", label: "الاختبارات" },
  { href: "/coaching", label: "الكوتشينغ" },
  { href: "/courses", label: "الدورات" },
  { href: "/programs", label: "البرمجات" },
  { href: "/sessions", label: "الجلسات" },
  { href: "/fingerprints", label: "البصمات" },
  { href: "/compass", label: "البوصلة" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1 && document.referrer.startsWith(window.location.origin)) {
      router.back();
      return;
    }
    router.push("/");
  };

  return (
    <header className="site-header">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3 md:px-8">
        {isHome ? (
          <Link href="/" className="home-pill" aria-label="الرئيسية">
            <House size={17} weight="bold" />
            الرئيسية
          </Link>
        ) : (
          <button type="button" className="home-pill header-back" onClick={goBack} aria-label="العودة">
            <CaretRight size={18} weight="bold" />
            رجوع
          </button>
        )}
        <div className="site-nav-links" aria-label="روابط الأقسام">
          {navLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                className={cn("nav-link", active && "active")}
                href={link.href}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <ThemeToggle />
      </nav>
    </header>
  );
}
