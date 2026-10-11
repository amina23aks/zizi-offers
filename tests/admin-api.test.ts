import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/lib/invalidate-public-offers", () => ({ invalidatePublicOffers: vi.fn() }));
const store = vi.hoisted(() => new Map<string, Record<string, unknown>>());
vi.mock("../src/lib/firebase/admin", () => ({ getFirebaseAdmin: () => ({
  auth: { verifyIdToken: async (token: string) => { if (token === "expired") throw new Error("expired"); return { uid: token, admin: token === "admin" }; } },
  db: { runTransaction: async (fn: (tx: unknown) => Promise<unknown>) => fn({ get: (ref: { get: () => unknown }) => ref.get(), set: (ref: { set: (data: unknown) => unknown }, data: unknown) => ref.set(data), update: (ref: { update: (data: unknown) => unknown }, data: unknown) => ref.update(data) }), collection: () => ({
    get: async () => ({ docs: [...store.entries()].map(([id, data]) => ({ id, data: () => data })) }),
    doc: (id: string) => ({ get: async () => ({ exists: store.has(id), data: () => store.get(id) }), create: async (data: Record<string, unknown>) => { store.set(id, data); }, set: async (data: Record<string, unknown>) => { store.set(id, { ...store.get(id), ...data }); }, update: async (data: Record<string, unknown>) => { store.set(id, { ...store.get(id), ...data }); } }),
  }) },
}) }));
import { GET, POST } from "../src/app/api/admin/offers/route";
import { PUT } from "../src/app/api/admin/offers/[id]/route";
import { POST as upload } from "../src/app/api/admin/upload/route";
import { GET as session } from "../src/app/api/admin/session/route";
import { blankOffer, newVariant } from "../src/lib/offer-editor";

const request = (token?: string, data?: unknown) => new Request("http://localhost/api/admin/offers", { method: data ? "POST" : "GET", headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(data ? { "Content-Type": "application/json" } : {}) }, ...(data ? { body: JSON.stringify(data) } : {}) });
beforeEach(() => store.clear());
describe("admin offer API", () => {
  it.each([undefined, "member", "expired"])("blocks unauthorized %s list, save, update and upload", async (token) => {
    const data = { ...blankOffer(0), title: "عرض" };
    for (const result of [await GET(request(token)), await POST(request(token, data)), await PUT(request(token, data), { params: Promise.resolve({ id: data.id }) }), await upload(request(token, data)), await session(request(token))]) {
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
