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
  title: z.string().trim().min(1).max(160),
  category: z.enum(["tests", "coaching", "programs", "courses", "sessions", "compass"]),
  description: z.string().max(5000).default(""),
  topics: z.array(z.string().trim().min(1).max(300)).max(30).default([]),
  image: z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("none"), alt: z.string().max(300) }),
    z.object({ kind: z.literal("local"), assetId: z.string().min(1).max(300), alt: z.string().max(300) }),
    z.object({ kind: z.literal("cloudinary"), secureUrl: z.string().url().startsWith("https://"), publicId: z.string().min(1).max(300), width: z.number().int().positive(), height: z.number().int().positive(), alt: z.string().max(300) }),
  ]),
  variants: z.array(z.object({ id: z.enum(["individual", "group"]), title: z.string().min(1).max(160), price, availability })).max(2),
  duration: z.string().max(160).default(""),
  sessionDuration: z.string().max(160).default(""),
  capacity: z.string().max(160).default(""),
  displayOrder: z.number().int().min(0).max(100000),
  status: z.enum(["draft", "published"]),
});

export type AdminOffer = z.infer<typeof adminOfferSchema>;
