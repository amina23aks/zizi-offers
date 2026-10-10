import { describe, expect, it } from "vitest";
import { adminOfferSchema } from "../src/lib/admin-offer";
import { activeVariants, blankOffer, editorPreview, inferDelivery, newVariant } from "../src/lib/offer-editor";
import { offers } from "../src/data/offers";

const offer = () => blankOffer(1);
describe("offer editor persistence and public preview", () => {
  it("creates stable unique IDs and drafts without a default group capacity", () => {
    const a = offer(); const b = offer();
    expect(a.id).not.toBe(b.id); expect(a.status).toBe("draft"); expect(a.capacity).toBe("");
    expect(adminOfferSchema.parse({ ...a, title: "عرض" }).id).toBe(a.id);
  });
  it.each(["individual", "group", "both", "general"] as const)("saves only active %s format slots", (delivery) => {
    const bank = [newVariant("individual"), newVariant("group"), newVariant("general")];
    const variants = activeVariants(bank, delivery);
    expect(variants.map((v) => v.id)).toEqual(delivery === "both" ? ["individual", "group"] : [delivery]);
    expect(adminOfferSchema.safeParse({ ...offer(), title: "عرض", delivery, variants }).success).toBe(true);
  });
  it("retains temporarily hidden input and independent availability", () => {
    const bank = [{ ...newVariant("individual"), price: { status: "known" as const, amountUsd: 123 }, availability: "available" as const }, { ...newVariant("group"), availability: "unavailable" as const }];
    activeVariants(bank, "group");
    expect(activeVariants(bank, "both")).toEqual(bank);
  });
  it("keeps every package and duration, without adding empty base variants", () => {
    const packages = offers.find((v) => v.id === "business-coaching")!.variants!.map((v) => ({ ...v, price: { amountUsd: v.price.amountUsd, status: "known" as const }, availability: v.availability ?? "unknown" as const }));
    const legacy = { ...offer(), delivery: undefined, variants: packages };
    expect(inferDelivery(legacy)).toBe("both");
    expect(activeVariants(packages, "both")).toEqual(packages);
    expect(adminOfferSchema.safeParse({ ...legacy, title: "عرض", delivery: "both" }).success).toBe(true);
    expect(activeVariants(packages, "general")).toEqual(packages);
  });
  it("preserves descriptive durations, local image identity and existing IDs", () => {
    const record = { ...offer(), title: "عرض", duration: "8 ساعات غير متواصلة", image: { kind: "local" as const, assetId: "coaching:القيم", alt: "صورة" } };
    const saved = adminOfferSchema.parse(record);
    expect(saved).toEqual(record);
    expect(editorPreview(saved).programDuration).toBe(record.duration);
    expect(editorPreview(saved).assetId).toBe(record.image.assetId);
  });
  it("renders general price and availability without a format badge", () => {
    const record = { ...offer(), delivery: "general" as const, variants: [{ ...newVariant("general"), availability: "available" as const }] };
    const preview = editorPreview(record);
    expect(preview.variants).toEqual([]); expect(preview.availabilityLabel).toBe("متاح"); expect(preview.priceClarification).toBe("السعر غير محدد");
  });
  it("distinguishes free, unknown and valid specified prices", () => {
    for (const price of [{ status: "free" as const, amountUsd: 0 }, { status: "unknown" as const, amountUsd: null }, { status: "known" as const, amountUsd: 12.5 }]) {
      expect(adminOfferSchema.safeParse({ ...offer(), title: "عرض", variants: [{ ...newVariant("individual"), price }] }).success).toBe(true);
    }
    for (const price of [{ status: "known", amountUsd: null }, { status: "free", amountUsd: null }, { status: "unknown", amountUsd: 0 }, { status: "known", amountUsd: -1 }, { status: "known", amountUsd: Infinity }]) {
      expect(adminOfferSchema.safeParse({ ...offer(), title: "عرض", variants: [{ ...newVariant("individual"), price }] }).success).toBe(false);
    }
  });
  it("rejects duplicate variants and inactive format slots", () => {
    expect(adminOfferSchema.safeParse({ ...offer(), title: "عرض", variants: [newVariant("individual"), newVariant("individual")] }).success).toBe(false);
    expect(adminOfferSchema.safeParse({ ...offer(), title: "عرض", variants: [newVariant("individual"), newVariant("group")] }).success).toBe(false);
  });
  it("validates every variant in a thirty-package server payload", () => {
    const record = { ...offer(), title: "عرض", delivery: "general" as const, variants: Array.from({ length: 30 }, (_, i) => ({ ...newVariant("general"), id: `package-${i}`, title: "باقة", price: { status: "known" as const, amountUsd: 100 } })) };
    expect(adminOfferSchema.safeParse(record).success).toBe(true);
    record.variants[29].price.amountUsd = -1;
    expect(adminOfferSchema.safeParse(record).success).toBe(false);
  });
  it("rejects numeric nonpositive or fractional capacity without corrupting descriptions", () => {
    for (const capacity of ["0", "-1", "1.5"]) expect(adminOfferSchema.safeParse({ ...offer(), title: "عرض", capacity }).success).toBe(false);
    for (const capacity of ["", "5", "10 مشاركين"]) expect(adminOfferSchema.safeParse({ ...offer(), title: "عرض", capacity }).success).toBe(true);
  });
  it("accepts a photo-free session", () => {
    expect(adminOfferSchema.safeParse({ ...offer(), title: "جلسة", category: "sessions", delivery: "general", variants: [newVariant("general")] }).success).toBe(true);
  });
});
