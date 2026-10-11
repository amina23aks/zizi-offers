import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/lib/invalidate-public-offers", () => ({ invalidatePublicOffers: vi.fn() }));
const readback = vi.hoisted(() => ({ corrupt: false }));
const store = vi.hoisted(() => new Map<string, Record<string, unknown>>());
vi.mock("../src/lib/firebase/admin", () => ({ getFirebaseAdmin: () => ({
  auth: { verifyIdToken: async (token: string) => { if (token === "expired") throw new Error("expired"); return { uid: token, admin: token === "admin" }; } },
  db: { runTransaction: async (fn: (tx: unknown) => Promise<unknown>) => fn({ get: (ref: { get: () => unknown }) => ref.get(), set: (ref: { set: (data: unknown) => unknown }, data: unknown) => ref.set(data) }), collection: () => ({
    get: async () => ({ docs: [...store.entries()].map(([id, data]) => ({ id, data: () => data })) }),
    doc: (id: string) => ({ get: async () => ({ exists: store.has(id), data: () => readback.corrupt && store.has(id) ? { ...store.get(id), title: "Unexpected stale title" } : store.get(id) }), create: async (data: Record<string, unknown>) => { store.set(id, data); }, set: async (data: Record<string, unknown>) => { store.set(id, { ...store.get(id), ...data }); } }),
  }) },
}) }));
import { GET, POST } from "../src/app/api/admin/offers/route";
import { PUT } from "../src/app/api/admin/offers/[id]/route";
import { POST as upload } from "../src/app/api/admin/upload/route";
import { GET as session } from "../src/app/api/admin/session/route";
import { blankOffer, newVariant } from "../src/lib/offer-editor";

const request = (token?: string, data?: unknown) => new Request("http://localhost/api/admin/offers", { method: data ? "POST" : "GET", headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(data ? { "Content-Type": "application/json" } : {}) }, ...(data ? { body: JSON.stringify(data) } : {}) });
beforeEach(() => { store.clear(); readback.corrupt = false; });
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
    store.set("legacy-offer", { title: "قديم", status: "draft" });
    store.set("new-offer", { title: "جديد", status: "published", displayOrder: 2 });
    const response = await GET(request("admin"));
    const { offers } = await response.json();
    expect(offers).toHaveLength(2); expect(offers[0]).toMatchObject({ id: "legacy-offer", displayOrder: 0 });
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
  it("publishes the current codes fields and keeps them published after a stale ordinary save", async () => {
    const data = { ...blankOffer(0), id: "codes-abcd", slug: "codes-abcd", category: "tests" as const,
      title: "اختبار الأكواد الدماغية ABCDd", description: "اختبار aaa يساعدك", availability: "available" as const,
      image: { kind: "cloudinary" as const, publicId: "zizi-offers/admin/k3lufslgt2kczczwsnhv", secureUrl: "https://res.cloudinary.com/test/image/upload/codes.jpg", width: 300, height: 300, alt: "الأكواد" } };
    await POST(request("admin", data));
    const context = { params: Promise.resolve({ id: data.id }) };
    const published = await PUT(request("admin", { ...data, status: "published" }), context);
    expect(published.status).toBe(200);
    expect((await published.json()).offer).toEqual({ ...data, status: "published" });
    const edited = await PUT(request("admin", { ...data, description: "اختبار aaa يساعدك — تعديل" }), context);
    expect(edited.status).toBe(200);
    expect((await edited.json()).offer).toEqual({ ...data, description: "اختبار aaa يساعدك — تعديل", status: "published" });
  });
  it("does not report success when readback has the right status but wrong fields", async () => {
    const data = { ...blankOffer(0), title: "Current title", status: "published" as const };
    readback.corrupt = true;
    expect((await POST(request("admin", data))).status).toBe(500);
    expect((await PUT(request("admin", data), { params: Promise.resolve({ id: data.id }) })).status).toBe(500);
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
