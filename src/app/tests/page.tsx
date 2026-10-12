import type { Metadata } from "next";
import { getPublicOffers } from "@/lib/public-offers";
import { TestsExperience } from "@/components/tests-experience";

const specializedTestIds = new Set(["codes-abcd", "etho", "mindsets", "geometric-spectra", "triple-test"]);

export const metadata: Metadata = {
  title: "الاختبارات | عروض زيزي",
  description: "الأكواد والإيثو والعقليات والأطياف والاختبار الثلاثي.",
};

export default async function TestsPage() {
  const offers = (await getPublicOffers()).filter((o) => o.category === "tests" && specializedTestIds.has(o.id));
  return (
    <main className="site-main page-shell">
      <TestsExperience savedOffers={process.env.PUBLIC_OFFERS_SOURCE === "firestore" ? offers : undefined} />
    </main>
  );
}
