import type { Metadata } from "next";
import { TestsExperience } from "@/components/tests-experience";

export const metadata: Metadata = {
  title: "الاختبارات | عروض زيزي",
  description: "الأكواد والإيثو والعقليات والأطياف والاختبار الثلاثي.",
};

export default function TestsPage() {
  return (
    <main className="site-main page-shell">
      <TestsExperience />
    </main>
  );
}
