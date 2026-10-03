import type { Metadata } from "next";
import { FingerprintExplorer } from "@/components/ui/fingerprint-explorer";

export const metadata: Metadata = {
  title: "البصمات | عروض زيزي",
};

export default function FingerprintsPage() {
  return (
    <main className="site-main page-shell">
      <section className="category-page-hero">
        <h1>البصمات</h1>
      </section>
      <FingerprintExplorer />
    </main>
  );
}
