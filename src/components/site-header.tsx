import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="site-header">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3 md:px-8">
        <Link href="/" className="home-pill" aria-label="العودة إلى الرئيسية">
          الرئيسية
        </Link>
        <div className="hidden items-center gap-1 md:flex" aria-label="روابط الأقسام">
          <Link className="nav-link" href="/tests">
            الاختبارات
          </Link>
          <Link className="nav-link" href="/coaching">
            الكوتشينغ
          </Link>
          <Link className="nav-link" href="/courses">
            الدورات
          </Link>
          <Link className="nav-link" href="/programs">
            البرمجات
          </Link>
        </div>
        <ThemeToggle />
      </nav>
    </header>
  );
}
