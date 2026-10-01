import type { Metadata } from "next";
import { TestsExperience } from "@/components/tests-experience";

export const metadata: Metadata = {
  title: "الاختبارات | عروض زيزي",
  description: "الأكواد والإيثو والعقليات والأطياف والاختبار الثلاثي.",
};

export default function TestsPage() {
  return (
    <main className="site-main page-shell">
      <section className="page-hero compact">
        <p className="eyebrow">صفحة الاختبارات</p>
        <h1>اختبارات زيزي</h1>
        <p>
          ترتيب الصفحة المعتمد: الأكواد، الإيثو، العقليات، الأطياف، ثم الاختبار
          الثلاثي.
        </p>
      </section>
      <TestsExperience />
    </main>
  );
}
