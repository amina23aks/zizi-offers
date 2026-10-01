import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="site-header">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
        <Link href="/" className="brand-mark" aria-label="عروض زيزي - الرئيسية">
          <span className="brand-dot" aria-hidden="true" />
          <span>عروض زيزي</span>
        </Link>
        <div className="hidden items-center gap-2 md:flex">
          <Link className="nav-link" href="/tests">
            الاختبارات
          </Link>
          <Link className="nav-link" href="/offers/emotional-communication">
            نموذج عرض
          </Link>
          <Link className="nav-link" href="/#about">
            عن زيزي
          </Link>
          <Link className="nav-link" href="/#booking">
            احجزي
          </Link>
        </div>
        <ThemeToggle />
      </nav>
    </header>
  );
}
