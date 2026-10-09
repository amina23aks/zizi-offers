import { beforeEach, describe, expect, it, vi } from "vitest";

const store = vi.hoisted(() => new Map<string, Record<string, unknown>>());
vi.mock("../src/lib/firebase/admin", () => ({ getFirebaseAdmin: () => ({
  auth: { verifyIdToken: async (token: string) => { if (token === "expired") throw new Error("expired"); return { uid: token, admin: token === "admin" }; } },
  db: { collection: () => ({
    get: async () => ({ docs: [...store.entries()].map(([id, data]) => ({ id, data: () => data })) }),
    doc: (id: string) => ({ get: async () => ({ exists: store.has(id), data: () => store.get(id) }), create: async (data: Record<string, unknown>) => { store.set(id, data); }, set: async (data: Record<string, unknown>) => { store.set(id, { ...store.get(id), ...data }); } }),
  }) },
}) }));
import { GET, POST } from "../src/app/api/admin/offers/route";
import { PUT } from "../src/app/api/admin/offers/[id]/route";
import { POST as upload } from "../src/app/api/admin/upload/route";
import { blankOffer, newVariant } from "../src/lib/offer-editor";

const request = (token?: string, data?: unknown) => new Request("http://localhost/api/admin/offers", { method: data ? "POST" : "GET", headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(data ? { "Content-Type": "application/json" } : {}) }, ...(data ? { body: JSON.stringify(data) } : {}) });
beforeEach(() => store.clear());
describe("admin offer API", () => {
  it.each([undefined, "member", "expired"])("blocks unauthorized %s list, save, update and upload", async (token) => {
    const data = { ...blankOffer(0), title: "عرض" };
    for (const result of [await GET(request(token)), await POST(request(token, data)), await PUT(request(token, data), { params: Promise.resolve({ id: data.id }) }), await upload(request(token, data))]) {
      expect([401, 403]).toContain(result.status);
    }
    expect(store.size).toBe(0);
  });
  it("lists drafts and old documents without displayOrder using document IDs", async () => {
    store.set("legacy-offer", { title: "قديم", status: "draft" });
    store.set("new-offer", { title: "جديد", status: "published", displayOrder: 2 });
    const response = await GET(request("admin"));
    const { offers } = await response.json();
    expect(offers).toHaveLength(2); expect(offers[0]).toMatchObject({ id: "legacy-offer", displayOrder: 0 });
  });
  it("creates, reloads and updates a draft retaining all package variants and extra persisted metadata", async () => {
    const data = { ...blankOffer(3), title: "عرض", delivery: "general", variants: [{ ...newVariant("general"), price: { status: "free", amountUsd: 0 } }, { ...newVariant("general"), id: "two-months", title: "شهران", price: { status: "known", amountUsd: 500 } }] };
    expect((await POST(request("admin", data))).status).toBe(201);
    expect((await GET(request("admin"))).status).toBe(200);
    expect((await (await GET(request("admin"))).json()).offers[0].variants).toEqual(data.variants);
    store.set(data.id, { ...store.get(data.id), legacyMetadata: "retain me" });
    expect((await PUT(request("admin", { ...data, title: "تعديل" }), { params: Promise.resolve({ id: data.id }) })).status).toBe(200);
    expect(store.get(data.id)).toMatchObject({ title: "تعديل", status: "draft", legacyMetadata: "retain me", variants: data.variants });
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
