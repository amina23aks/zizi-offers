export default function Home() {
  return (
    <main className="flex min-h-svh flex-1 items-center justify-center bg-[var(--background)] px-6 py-16 text-[var(--foreground)]">
      <section className="w-full max-w-2xl rounded-lg border border-[var(--border)] bg-white p-8 shadow-sm">
        <p className="mb-3 text-sm font-semibold text-[var(--brand-green)]">
          مرحلة التجهيز
        </p>
        <h1 className="text-3xl font-bold text-[var(--brand-blue-dark)]">
          عروض زيزي
        </h1>
        <p className="mt-4 leading-8 text-[var(--muted)]">
          تم تجهيز مشروع Next.js العربي. سنراجع الوثائق والأصول قبل بناء
          الواجهة الكاملة.
        </p>
      </section>
    </main>
  );
}
