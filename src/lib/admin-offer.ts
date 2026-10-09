import { z } from "zod";

const availability = z.enum(["available", "unavailable", "completed", "unknown"]);
const price = z.object({
  amountUsd: z.number().min(0).nullable(),
  status: z.enum(["known", "unknown", "free"]),
}).superRefine((value, ctx) => {
  if (value.status === "unknown" && value.amountUsd !== null) ctx.addIssue({ code: "custom", message: "السعر المجهول يجب أن يكون null" });
  if (value.status === "free" && value.amountUsd !== 0) ctx.addIssue({ code: "custom", message: "السعر المجاني يجب أن يكون 0" });
  if (value.status === "known" && value.amountUsd === null) ctx.addIssue({ code: "custom", message: "السعر المدفوع مطلوب" });
});

export const adminOfferSchema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]{1,79}$/),
  title: z.string().trim().min(1, "اسم العرض مطلوب.").max(160, "اسم العرض طويل جدًا."),
  category: z.enum(["tests", "coaching", "programs", "courses", "sessions", "compass"]),
  description: z.string().max(5000).default(""),
  topics: z.array(z.string().trim().min(1).max(300)).max(30).default([]),
  image: z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("none"), alt: z.string().max(300) }),
    z.object({ kind: z.literal("local"), assetId: z.string().min(1).max(300), alt: z.string().max(300) }),
    z.object({ kind: z.literal("cloudinary"), secureUrl: z.string().url().startsWith("https://"), publicId: z.string().min(1).max(300), width: z.number().int().positive(), height: z.number().int().positive(), alt: z.string().max(300) }),
  ]),
  delivery: z.enum(["individual", "group", "both", "general"]).optional(),
  variants: z.array(z.object({ id: z.string().min(1).max(80), title: z.string().trim().min(1, "اسم الخيار مطلوب.").max(160), price, availability, note: z.string().max(300).optional() })).min(1, "أضيفي خيار سعر واحدًا على الأقل.").max(30),
  duration: z.string().max(160).refine(validDuration, "المدة يجب أن تكون موجبة.").default(""),
  sessionDuration: z.string().max(160).refine(validDuration, "المدة يجب أن تكون موجبة.").default(""),
  capacity: z.string().max(160).refine((value) => !/^[-+]?\d+(?:\.\d+)?$/.test(value) || (Number.isSafeInteger(Number(value)) && Number(value) > 0), "عدد المشاركين يجب أن يكون عددًا صحيحًا موجبًا.").default(""),
  displayOrder: z.number().int().min(0).max(100000),
  status: z.enum(["draft", "published"]),
}).superRefine((offer, ctx) => {
  if (new Set(offer.variants.map((v) => v.id)).size !== offer.variants.length) ctx.addIssue({ code: "custom", path: ["variants"], message: "خيارات العرض مكررة." });
  if (offer.delivery) {
    const expected = offer.delivery === "both" ? ["individual", "group"] : [offer.delivery];
    for (const id of expected) if (!offer.variants.some((v) => v.id === id || v.id.startsWith(`${id}-`) || (id === "general" && !["individual", "group"].includes(v.id)))) ctx.addIssue({ code: "custom", path: ["variants"], message: "أكملي خيارات طريقة التقديم المحددة." });
    for (const v of offer.variants) if (["individual", "group", "general"].includes(v.id) && !expected.includes(v.id)) ctx.addIssue({ code: "custom", path: ["variants"], message: "احفظي الخيارات النشطة فقط." });
  }
});

export type AdminOffer = z.infer<typeof adminOfferSchema>;

function validDuration(value: string) {
  const match = /^(-?\d+(?:\.\d+)?) (ساعة|يوم|أسبوع|شهر)$/.exec(value);
  return !match || Number(match[1]) > 0;
}
