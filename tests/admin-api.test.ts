import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/lib/invalidate-public-offers", () => ({ invalidatePublicOffers: vi.fn() }));
const store = vi.hoisted(() => new Map<string, Record<string, unknown>>());
vi.mock("../src/lib/firebase/admin", () => ({ getFirebaseAdmin: () => ({
  auth: { verifyIdToken: async (token: string) => { if (token === "expired") throw new Error("expired"); return { uid: token, admin: token === "admin" }; } },
  db: { runTransaction: async (fn: (tx: unknown) => Promise<unknown>) => fn({ get: (ref: { get: () => unknown }) => ref.get(), set: (ref: { set: (data: unknown) => unknown }, data: unknown) => ref.set(data), update: (ref: { update: (data: unknown) => unknown }, data: unknown) => ref.update(data), delete: (ref: { delete: () => unknown }) => ref.delete() }), collection: () => ({
    where: () => ({ limit: () => ({ get: async () => ({ docs: [...store.values()].filter((data) => data.status === "published").slice(0, 2) }) }) }),
    get: async () => ({ docs: [...store.entries()].map(([id, data]) => ({ id, data: () => data })) }),
    doc: (id: string) => ({ delete: async () => { store.delete(id); }, get: async () => ({ exists: store.has(id), data: () => store.get(id) }), create: async (data: Record<string, unknown>) => { store.set(id, data); }, set: async (data: Record<string, unknown>) => { store.set(id, { ...store.get(id), ...data }); }, update: async (data: Record<string, unknown>) => { store.set(id, { ...store.get(id), ...data }); } }),
  }) },
}) }));
import { GET, POST } from "../src/app/api/admin/offers/route";
import { PUT, DELETE } from "../src/app/api/admin/offers/[id]/route";
import { POST as upload } from "../src/app/api/admin/upload/route";
import { GET as session } from "../src/app/api/admin/session/route";
import { blankOffer, newVariant } from "../src/lib/offer-editor";

const request = (token?: string, data?: unknown) => new Request("http://localhost/api/admin/offers", { method: data ? "POST" : "GET", headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(data ? { "Content-Type": "application/json" } : {}) }, ...(data ? { body: JSON.stringify(data) } : {}) });
beforeEach(() => store.clear());
describe("admin offer API", () => {
  it.each([undefined, "member", "expired"])("blocks unauthorized %s list, save, update and upload", async (token) => {
    const data = { ...blankOffer(0), title: "عرض" };
    for (const result of [await DELETE(request(token), { params: Promise.resolve({ id: data.id }) }), await GET(request(token)), await POST(request(token, data)), await PUT(request(token, data), { params: Promise.resolve({ id: data.id }) }), await upload(request(token, data)), await session(request(token))]) {
      expect([401, 403]).toContain(result.status);
    }
    expect(store.size).toBe(0);
  });
  it("uses the submitted status when publishing a new offer", async () => {
    const data = { ...blankOffer(7), title: "عرض منشور جديد", status: "published" as const };
    const response = await POST(request("admin", data));
    expect(response.status).toBe(201);
    expect((await response.json()).offer).toMatchObject({ id: data.id, title: "عرض منشور جديد", status: "published" });
    expect(store.get(data.id)).toMatchObject({ status: "published" });
  });
  it("lists drafts and old documents without displayOrder using document IDs", async () => {
    const legacy = { ...blankOffer(0), id: "legacy-offer", title: "قديم", status: "draft" };
    delete (legacy as Partial<typeof legacy>).displayOrder;
    store.set("legacy-offer", legacy);
    store.set("new-offer", { ...blankOffer(2), id: "new-offer", title: "جديد", status: "published", displayOrder: 2 });
    const response = await GET(request("admin"));
    const { offers } = await response.json();
    expect(offers).toHaveLength(2); expect(offers[0]).toMatchObject({ id: "legacy-offer", displayOrder: 0 });
  });
  it("loads valid offers with private diagnostics for compatible legacy price fields", async () => {
    const data = { ...blankOffer(0), id: "codes-abcd", title: "الأكواد", status: "draft" as const, price: { status: "known" as const, amountUsd: 12 }, delivery: "general" as const, variants: [{ ...newVariant("general"), price: { status: "published", amountUsd: 12 } }] };
    store.set(data.id, data);
    const response = await GET(request("admin"));
    const body = await response.json();
    expect(body.offers).toHaveLength(1);
    expect(body.offers[0].variants[0].price).toMatchObject({ status: "known", amountUsd: 12 });
    expect(body.diagnostics[0]).toMatchObject({ id: "codes-abcd", fieldPath: "variants.0.price.status" });
  });
  it("saves a normalized repaired offer without recreating an invalid price status", async () => {
    const data = { ...blankOffer(0), id: "codes-abcd", title: "الأكواد", status: "published" as const, price: { status: "known" as const, amountUsd: 12 }, delivery: "general" as const, variants: [{ ...newVariant("general"), price: { status: "published", amountUsd: 12 } }] };
    store.set(data.id, data);
    const listed = await (await GET(request("admin"))).json();
    const normalized = { ...listed.offers[0], title: "الأكواد بعد الحفظ" };
    expect((await PUT(request("admin", normalized), { params: Promise.resolve({ id: data.id }) })).status).toBe(200);
    expect(store.get(data.id)).toMatchObject({ status: "published", variants: [{ price: { status: "known", amountUsd: 12 } }] });
  });
  it("replaces the saved image map so stale Cloudinary fields cannot survive under kind none", async () => {
    const data = { ...blankOffer(1), id: "image-offer", title: "صورة", image: { kind: "cloudinary" as const, secureUrl: "https://res.cloudinary.com/demo/image/upload/offer.jpg", publicId: "demo/offer", width: 640, height: 640, alt: "صورة" } };
    store.set(data.id, data);
    const next = { ...data, image: { kind: "none" as const, alt: "صورة" } };
    expect((await PUT(request("admin", next), { params: Promise.resolve({ id: data.id }) })).status).toBe(200);
    expect(store.get(data.id)?.image).toEqual({ kind: "none", alt: "صورة" });
  });
  it("isolates unsupported malformed records while keeping valid records readable", async () => {
    store.set("valid-offer", { ...blankOffer(0), id: "valid-offer", title: "صالح" });
    store.set("bad-offer", { ...blankOffer(1), id: "bad-offer", title: "سيئ", category: "unknown-section" });
    const response = await GET(request("admin"));
    const body = await response.json();
    expect(body.offers.map((offer: { id: string }) => offer.id)).toEqual(["valid-offer"]);
    expect(body.diagnostics.some((item: { id: string; fieldPath: string }) => item.id === "bad-offer" && item.fieldPath === "category")).toBe(true);
  });
  it("creates, reloads and updates a draft retaining all package variants and extra persisted metadata", async () => {
    const data = { ...blankOffer(3), title: "عرض", slug: "reviewed-offer", source: "approved source", availability: "available" as const, price: { status: "variant" as const, amountUsd: null }, delivery: "general", variants: [{ ...newVariant("general"), price: { status: "free" as const, amountUsd: 0 } }, { ...newVariant("general"), id: "two-months", title: "شهران", price: { status: "known" as const, amountUsd: 500 } }] };
    expect((await POST(request("admin", data))).status).toBe(201);
    expect((await GET(request("admin"))).status).toBe(200);
    expect((await (await GET(request("admin"))).json()).offers[0].variants).toEqual(data.variants);
    store.set(data.id, { ...store.get(data.id), legacyMetadata: "retain me" });
    expect((await PUT(request("admin", { ...data, title: "تعديل" }), { params: Promise.resolve({ id: data.id }) })).status).toBe(200);
    expect(store.get(data.id)).toMatchObject({ title: "تعديل", status: "draft", legacyMetadata: "retain me", slug: "reviewed-offer", source: "approved source", availability: "available", price: { status: "variant", amountUsd: null }, variants: data.variants });
  });
  it("preserves a published offer on update unless unpublish is explicit", async () => {
    const data = { ...blankOffer(4), title: "منشور", status: "published" as const };
    expect((await POST(request("admin", data))).status).toBe(201);
    expect((await PUT(request("admin", { ...data, title: "تعديل", status: "draft" }), { params: Promise.resolve({ id: data.id }) })).status).toBe(200);
    expect(store.get(data.id)).toMatchObject({ title: "تعديل", status: "published" });
    const explicit = new Request(`http://localhost/api/admin/offers/${data.id}?unpublish=true`, { method: "PUT", headers: { Authorization: "Bearer admin", "Content-Type": "application/json" }, body: JSON.stringify({ ...data, title: "مسودة", status: "draft" }) });
    expect((await PUT(explicit, { params: Promise.resolve({ id: data.id }) })).status).toBe(200);
    expect(store.get(data.id)).toMatchObject({ title: "مسودة", status: "draft" });
  });
  it("rejects duplicate creation, invalid price and ID changes", async () => {
    const data = { ...blankOffer(0), title: "عرض" };
    await POST(request("admin", data));
    expect((await POST(request("admin", data))).status).toBe(409);
    expect((await POST(request("admin", { ...data, variants: [{ ...newVariant("individual"), price: { status: "known", amountUsd: null } }] }))).status).toBe(400);
    expect((await PUT(request("admin", { ...data, id: "different" }), { params: Promise.resolve({ id: data.id }) })).status).toBe(400);
    expect(store.size).toBe(1);
  });
});

it("deletes only the requested saved record, invalidates listings, and reports repeat/missing deletes", async () => {
  const image = { kind: "cloudinary" as const, secureUrl: "https://res.cloudinary.com/test/shared.png", publicId: "test/shared", width: 200, height: 200, alt: "shared" };
  const target = { ...blankOffer(1), id: "controlled-delete", title: "حذف تجريبي", status: "published", image };
  const other = { ...target, id: "controlled-retain", title: "محفوظ" };
  store.set(target.id, target); store.set(other.id, other);
  const context = { params: Promise.resolve({ id: target.id }) };
  const response = await DELETE(request("admin"), context);
  expect(response.status).toBe(200); expect(await response.json()).toEqual({ deletedId: target.id });
  expect(store.has(target.id)).toBe(false); expect(store.get(other.id)).toEqual(other);
  const { invalidatePublicOffers } = await import("../src/lib/invalidate-public-offers");
  expect(invalidatePublicOffers).toHaveBeenCalledWith(expect.objectContaining({ id: target.id }));
  expect((await DELETE(request("admin"), context)).status).toBe(404);
});
it("persists on-demand, overall availability and optional explicit packages without touching variants or publication", async () => {
  const data = { ...blankOffer(1), id: "controlled-package", title: "باقة تجريبية", status: "published" as const, delivery: "general" as const,
    availability: "unavailable" as const,
    price: { status: "on-demand" as const, amountUsd: null },
    variants: [{ ...newVariant("general"), price: { status: "on-demand" as const, amountUsd: null }, availability: "available" as const }],
    packagePresentation: { enabled: true, label: "الباقة الكاملة", items: [
      { id: "drama", title: "مثلث الدراما", price: { status: "known" as const, amountUsd: 30 } },
      { id: "roles", title: "تشخيص الأدوار الأربعة", price: { status: "known" as const, amountUsd: 30 } },
      { id: "behavior", title: "السلوك النفسي", price: { status: "known" as const, amountUsd: 60 } },
    ], fullPrice: { status: "known" as const, amountUsd: 90 } } };
  expect((await POST(request("admin", data))).status).toBe(201);
  const reloaded = (await (await GET(request("admin"))).json()).offers[0];
  expect(reloaded).toMatchObject(data);
  expect((await PUT(request("admin", { ...reloaded, availability: "unknown", packagePresentation: { ...data.packagePresentation, enabled: false, fullPrice: null } }), { params: Promise.resolve({ id: data.id }) })).status).toBe(200);
  const updated = (await (await GET(request("admin"))).json()).offers[0];
  expect(updated.variants).toEqual(data.variants); expect(updated.status).toBe("published");
  expect(updated.packagePresentation.items).toEqual(data.packagePresentation.items);
  expect(updated.packagePresentation.fullPrice).toBeNull();
  expect((await POST(request("admin", { ...data, id: "bad-demand", variants: [{ ...data.variants[0], price: { status: "on-demand", amountUsd: 0 } }] }))).status).toBe(400);
});

it.each([undefined, "member", "expired"])("retains an existing record when delete authorization is rejected: %s", async (token) => {
  const data = { ...blankOffer(0), id: "controlled-protected", title: "محمي" };
  store.set(data.id, data);
  const response = await DELETE(request(token), { params: Promise.resolve({ id: data.id }) });
  expect(response.status).toBe(token === "member" ? 403 : 401); expect(store.get(data.id)).toEqual(data);
});
