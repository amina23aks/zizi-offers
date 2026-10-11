import { z } from "zod";

const availability = z.enum(["available", "unavailable", "completed", "unknown"]);
const priceFields = z.object({
  amountUsd: z.number().min(0).nullable(),
  status: z.enum(["known", "unknown", "free"]),
  displayWhenUnknown: z.literal("00").optional(),
  clarification: z.string().trim().max(160).optional(),
});
const price = priceFields.superRefine((value, ctx) => {
  if (value.status === "unknown" && value.amountUsd !== null) ctx.addIssue({ code: "custom", message: "السعر المجهول يجب أن يكون null" });
  if (value.status === "free" && value.amountUsd !== 0) ctx.addIssue({ code: "custom", message: "السعر المجاني يجب أن يكون 0" });
  if (value.status === "known" && value.amountUsd === null) ctx.addIssue({ code: "custom", message: "السعر المدفوع مطلوب" });
  if (value.status !== "unknown" && (value.displayWhenUnknown || value.clarification)) ctx.addIssue({ code: "custom", message: "توضيح السعر المجهول يستخدم فقط مع السعر غير المحدد" });
});
const offerPrice = priceFields.extend({ status: z.enum(["known", "unknown", "free", "variant"]) }).superRefine((value, ctx) => {
  if (value.status === "unknown" && value.amountUsd !== null) ctx.addIssue({ code: "custom", message: "السعر المجهول يجب أن يكون null" });
  if (value.status === "free" && value.amountUsd !== 0) ctx.addIssue({ code: "custom", message: "السعر المجاني يجب أن يكون 0" });
  if (value.status === "known" && value.amountUsd === null) ctx.addIssue({ code: "custom", message: "السعر المدفوع مطلوب" });
  if (value.status === "variant" && value.amountUsd !== null) ctx.addIssue({ code: "custom", message: "السعر المركب يجب أن يكون null" });
  if (value.status !== "unknown" && (value.displayWhenUnknown || value.clarification)) ctx.addIssue({ code: "custom", message: "توضيح السعر المجهول يستخدم فقط مع السعر غير المحدد" });
});

export const adminOfferSchema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]{1,79}$/),
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]{1,79}$/).optional(),
  source: z.string().trim().max(300).optional(),
  title: z.string().trim().min(1, "اسم العرض مطلوب.").max(160, "اسم العرض طويل جدًا."),
  category: z.enum(["tests", "coaching", "programs", "courses", "sessions", "compass"]),
  description: z.string().max(5000).default(""),
  topics: z.array(z.string().trim().min(1).max(300)).max(30).default([]),
  image: z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("none"), alt: z.string().max(300) }),
    z.object({ kind: z.literal("local"), assetId: z.string().min(1).max(300), alt: z.string().max(300) }),
    z.object({ kind: z.literal("cloudinary"), secureUrl: z.string().url().startsWith("https://"), publicId: z.string().min(1).max(300), width: z.number().int().positive(), height: z.number().int().positive(), alt: z.string().max(300) }),
  ]),
  badge: z.string().trim().max(20, "شارة البطاقة لا تتجاوز 20 حرفًا.").optional(),
  catalogDetails: z.object({ format: z.enum(["test", "course", "coaching", "program", "session", "consultation", "package"]).optional(), durationKind: z.enum(["program", "training"]).optional(), priceBasis: z.string().max(160).optional(), availableThroughoutYear: z.boolean().optional() }).optional(),
  price: offerPrice.optional(),
  availability: availability.optional(),
  delivery: z.enum(["individual", "group", "both", "general"]).optional(),
  variants: z.array(z.object({ id: z.string().min(1).max(80), title: z.string().trim().min(1, "اسم الخيار مطلوب.").max(160), price, availability, note: z.string().max(300).optional() })).min(1, "أضيفي خيار سعر واحدًا على الأقل.").max(30),
  duration: z.string().max(160).refine(validDuration, "المدة يجب أن تكون موجبة.").default(""),
  sessionDuration: z.string().max(160).refine(validDuration, "المدة يجب أن تكون موجبة.").default(""),
  capacity: z.string().max(160).refine((value) => !/^[-+]?\d+(?:\.\d+)?$/.test(value) || (Number.isSafeInteger(Number(value)) && Number(value) > 0), "عدد المشاركين يجب أن يكون عددًا صحيحًا موجبًا.").default(""),
  displayOrder: z.number().int().min(0).max(100000),
  status: z.enum(["draft", "published"]),
  legacyImported: z.boolean().optional(),
}).superRefine((offer, ctx) => {
  if (new Set(offer.variants.map((v) => v.id)).size !== offer.variants.length) ctx.addIssue({ code: "custom", path: ["variants"], message: "خيارات العرض مكررة." });
  if (offer.delivery) {
    const expected = offer.delivery === "both" ? ["individual", "group"] : [offer.delivery];
    for (const id of expected) if (!offer.variants.some((v) => v.id === id || v.id.startsWith(`${id}-`) || (id === "general" && !["individual", "group"].includes(v.id)))) ctx.addIssue({ code: "custom", path: ["variants"], message: "أكملي خيارات طريقة التقديم المحددة." });
    for (const v of offer.variants) if (["individual", "group", "general"].includes(v.id) && !expected.includes(v.id)) ctx.addIssue({ code: "custom", path: ["variants"], message: "احفظي الخيارات النشطة فقط." });
  }
});

export type AdminOffer = z.infer<typeof adminOfferSchema>;
export type AdminOfferDiagnostic = {
  id: string;
  fieldPath: string;
  expected: string;
  actual: string;
  message: string;
};

export function parseAdminOfferRecord(record: Record<string, unknown>, fallback: { id: string; displayOrder?: number }) {
  const candidate = normalizeLegacyOffer({ ...record, id: fallback.id, displayOrder: record.displayOrder ?? fallback.displayOrder ?? 0 });
  const parsed = adminOfferSchema.safeParse(candidate.data);
  if (parsed.success) return { offer: parsed.data, diagnostics: candidate.diagnostics };
  return { offer: null, diagnostics: parsed.error.issues.map((issue) => diagnostic(fallback.id, issue, candidate.data)) };
}

function validDuration(value: string) {
  const match = /^(-?\d+(?:\.\d+)?) (ساعة|يوم|أسبوع|شهر)$/.exec(value);
  return !match || Number(match[1]) > 0;
}

function normalizeLegacyOffer(input: Record<string, unknown>) {
  const data = { ...input };
  const diagnostics: AdminOfferDiagnostic[] = [];
  const title = typeof data.title === "string" ? data.title : "";
  if (data.image === undefined || data.image === null) data.image = { kind: "none", alt: title };
  if (data.topics === undefined || data.topics === null) data.topics = [];
  for (const key of ["description", "duration", "sessionDuration", "capacity"] as const) {
    if (data[key] === undefined || data[key] === null) data[key] = "";
  }
  for (const key of ["slug", "source", "badge", "catalogDetails", "price", "availability", "delivery", "legacyImported"] as const) {
    if (data[key] === null || data[key] === "") delete data[key];
  }
  if (!Array.isArray(data.variants) || data.variants.length === 0) {
    data.variants = [{
      id: "general",
      title: "السعر",
      price: normalizePrice(data.price, ["price"], diagnostics, String(data.id ?? "")),
      availability: typeof data.availability === "string" ? data.availability : "unknown",
    }];
  } else {
    data.variants = data.variants.map((variant, index) => {
      if (!variant || typeof variant !== "object" || Array.isArray(variant)) return variant;
      const value = { ...variant } as Record<string, unknown>;
      value.price = normalizePrice(value.price, ["variants", index, "price"], diagnostics, String(data.id ?? ""), data.price);
      if (value.availability === undefined || value.availability === null || value.availability === "") value.availability = typeof data.availability === "string" ? data.availability : "unknown";
      if (value.title === undefined || value.title === null || value.title === "") value.title = value.id === "general" ? "السعر" : String(value.id ?? "الخيار");
      return value;
    });
  }
  return { data, diagnostics };
}

function normalizePrice(value: unknown, path: (string | number)[], diagnostics: AdminOfferDiagnostic[], id: string, offerPrice?: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { status: "unknown", amountUsd: null, displayWhenUnknown: "00", clarification: "السعر غير محدد" };
  const priceValue = { ...value } as Record<string, unknown>;
  if (priceValue.status === "published" && typeof priceValue.amountUsd === "number") {
    priceValue.status = "known";
    diagnostics.push({
      id,
      fieldPath: [...path, "status"].join("."),
      expected: 'price status "known" | "unknown" | "free"',
      actual: 'string "published"',
      message: "تمت قراءة السعر كسعر محدد لأن المبلغ محفوظ، لكن السجل يحتاج إصلاحًا ضيقًا ليعود حقله إلى known.",
    });
  }
  if (priceValue.status === undefined && offerPrice && typeof offerPrice === "object" && !Array.isArray(offerPrice)) {
    const fallback = offerPrice as Record<string, unknown>;
    if (["known", "unknown", "free"].includes(String(fallback.status))) priceValue.status = fallback.status;
  }
  if (priceValue.status === "unknown") {
    if (priceValue.amountUsd === undefined) priceValue.amountUsd = null;
    if (priceValue.displayWhenUnknown === undefined) priceValue.displayWhenUnknown = "00";
    if (priceValue.clarification === undefined) priceValue.clarification = "السعر غير محدد";
  }
  return priceValue;
}

function diagnostic(id: string, issue: z.core.$ZodIssue, candidate: Record<string, unknown>): AdminOfferDiagnostic {
  const value = issue.path.reduce<unknown>((current, key) => (current && typeof current === "object" ? (current as Record<string, unknown>)[String(key)] : undefined), candidate);
  return {
    id,
    fieldPath: issue.path.join(".") || "(root)",
    expected: expectedFor(issue.path),
    actual: describe(value),
    message: issue.message,
  };
}

function expectedFor(path: PropertyKey[]) {
  const joined = path.join(".");
  if (joined.endsWith("price.status")) return 'price status "known" | "unknown" | "free"';
  if (joined === "status") return 'publication status "draft" | "published"';
  if (joined.endsWith("availability")) return 'availability "available" | "unavailable" | "completed" | "unknown"';
  if (joined === "image") return "image object with kind none, local, or cloudinary";
  if (joined === "variants") return "non-empty array of pricing variants";
  return "current admin offer schema";
}

function describe(value: unknown): string {
  if (value === undefined) return "undefined";
  if (value === null) return "null";
  if (Array.isArray(value)) return `array(length=${value.length})`;
  if (typeof value === "object") return `object(keys=${Object.keys(value).slice(0, 8).join(",")})`;
  return `${typeof value} ${JSON.stringify(value)}`;
}
