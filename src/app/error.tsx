"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="site-main page-shell">
      <section className="category-page-hero">
        <h1>تعذّر تحميل العروض</h1>
        <p>الخدمة غير متاحة مؤقتًا. جرّبي تحديث الصفحة بعد قليل.</p>
        <button type="button" className="primary-action" onClick={reset}>
          إعادة المحاولة
        </button>
      </section>
    </main>
  );
}
