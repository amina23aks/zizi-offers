import type { Metadata } from "next";
import { InnerBackLink } from "@/components/category-page";
import { FingerprintExplorer } from "@/components/ui/fingerprint-explorer";

export const metadata: Metadata = {
  title: "البصمات | عروض زيزي",
};

export default function FingerprintsPage() {
  return (
    <main className="site-main page-shell">
      <InnerBackLink />
      <section className="category-page-hero">
        <p className="eyebrow">عروض زيزي</p>
        <h1>البصمات</h1>
      </section>
      <FingerprintExplorer />
    </main>
  );
}
