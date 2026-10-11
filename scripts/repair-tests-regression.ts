import { mkdir, writeFile } from "node:fs/promises";
import { cert, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { loadEnvConfig } from "@next/env";

const excludedTestIds = [
  "multiple-intelligences",
  "colors-test",
  "formative-geometry-test",
] as const;

const approvedTests = {
  "codes-abcd": {
    title: "اختبار الأكواد الدماغية ABCD",
    description:
      "اختبار يساعدك على فهم نشاط الأقسام الأربعة وفق نموذج الأكواد: A للمنطق والتحليل، وB للإنجاز والتنافس، وC للعاطفة ونشاطها المتغير، وD للتواصل والخيال.",
    price: { amountUsd: 12, status: "known" as const },
  },
  etho: {
    title: "اختبار الإيثو",
    description:
      "اختبار يساعدك على اكتشاف ترتيب أنماط السلوك الغريزي الفردي والاجتماعي، باستخدام تشبيهات بسلوك الحيوانات. يشمل 51 حيوانًا تُرتّب بحسب نتيجة الاختبار.",
    price: { amountUsd: 12, status: "known" as const },
  },
  mindsets: {
    title: "اختبار العقليات",
    description:
      "يقسّم هذا الاختبار استجاباتك في المواقف غير المتوقعة إلى أربع عقليات: الصواب، والفوز، والمرتاح، والمحبوب. وتُعرض النتيجة بنسب مئوية لفهم نشاط كل منها.",
    price: { amountUsd: 12, status: "known" as const },
  },
  "geometric-spectra": {
    title: "اختبار الطيف",
    description: "اختبار يساعدك على فهم تناسق استجاباتك المختلفة خلال الأشهر الأخيرة.",
    price: { amountUsd: 12, status: "known" as const },
  },
  "triple-test": {
    title: "الاختبارات النفسية للميولات السلوكية",
    description: "مثلث الدراما، الأدوار الأربعة، والسلوك النفسي.",
  },
} as const;

type MutableRecord = Record<string, unknown> & { variants?: unknown };
type KnownPrice = { amountUsd: number; status: "known" };
type ApprovedTest = {
  title: string;
  description: string;
  price?: KnownPrice;
};

function requireCredentials() {
  const required = [
    "FIREBASE_ADMIN_PROJECT_ID",
    "FIREBASE_ADMIN_CLIENT_EMAIL",
    "FIREBASE_ADMIN_PRIVATE_KEY",
  ] as const;
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Missing trusted server credentials: ${missing.join(", ")}`);
  if (process.env.FIREBASE_ADMIN_PROJECT_ID !== "zizi-offers") throw new Error("Unexpected Firebase project.");
}

function variantsWithGeneralPrice(record: MutableRecord, price: { amountUsd: number; status: "known" }) {
  if (!Array.isArray(record.variants)) return record.variants;
  return record.variants.map((variant) => {
    if (!variant || typeof variant !== "object") return variant;
    const current = variant as Record<string, unknown>;
    return current.id === "general" ? { ...current, price } : current;
  });
}

function hasKnownPrice(test: ApprovedTest): test is ApprovedTest & { price: KnownPrice } {
  return Boolean(test.price);
}

async function main() {
  loadEnvConfig(process.cwd());
  requireCredentials();

  const apply = process.argv.includes("--apply");
  const runId = Date.now();
  const db = getFirestore(initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  }));

  const ids = [...Object.keys(approvedTests), ...excludedTestIds];
  const refs = ids.map((id) => db.collection("offers").doc(id));
  const snapshots = await Promise.all(refs.map((ref) => ref.get()));
  const existing = snapshots.map((snapshot) => ({ id: snapshot.id, exists: snapshot.exists, data: snapshot.data() ?? null }));

  await mkdir(".verification", { recursive: true, mode: 0o700 });
  await writeFile(`.verification/tests-regression-backup-${runId}.json`, JSON.stringify(existing, null, 2), { mode: 0o600 });

  const updates: Record<string, Record<string, unknown>> = {};
  for (const [id, approved] of Object.entries(approvedTests) as [string, ApprovedTest][]) {
    const current = existing.find((item) => item.id === id)?.data as MutableRecord | null | undefined;
    if (!current) continue;
    updates[id] = {
      title: approved.title,
      description: approved.description,
      ...(hasKnownPrice(approved) ? {
        price: approved.price,
        variants: variantsWithGeneralPrice(current, approved.price),
      } : {}),
      updatedAt: FieldValue.serverTimestamp(),
    };
  }
  for (const id of excludedTestIds) {
    const current = existing.find((item) => item.id === id)?.data;
    if (!current) continue;
    updates[id] = { status: "draft", updatedAt: FieldValue.serverTimestamp() };
  }

  const report = {
    apply,
    backedUp: existing.filter((item) => item.exists).map((item) => item.id),
    missing: existing.filter((item) => !item.exists).map((item) => item.id),
    updates: Object.fromEntries(Object.entries(updates).map(([id, update]) => [id, Object.keys(update).filter((key) => key !== "updatedAt")])),
  };
  await writeFile(`.verification/tests-regression-repair-${runId}.json`, JSON.stringify(report, null, 2), { mode: 0o600 });
  console.log(JSON.stringify(report, null, 2));

  if (!apply) {
    console.log("DRY RUN: no Firestore writes. Re-run with --apply after reviewing the private backup/report.");
    return;
  }

  const batch = db.batch();
  for (const [id, update] of Object.entries(updates)) batch.update(db.collection("offers").doc(id), update);
  await batch.commit();
  console.log(`Applied ${Object.keys(updates).length} Firestore updates.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Tests regression repair failed.");
  process.exitCode = 1;
});
