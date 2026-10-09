import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const upload = vi.hoisted(() => vi.fn());
vi.mock("../src/lib/firebase/admin", () => ({ getFirebaseAdmin: () => ({ auth: { verifyIdToken: async () => ({ admin: true }) } }) }));
vi.mock("cloudinary", () => ({ v2: { config: vi.fn(), uploader: { upload } } }));
import { POST } from "../src/app/api/admin/upload/route";

beforeEach(() => {
  // Test markers only. No real credentials or network requests are used.
  for (const name of ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"]) vi.stubEnv(name, "fixture-only");
  upload.mockReset();
});
afterEach(() => vi.unstubAllEnvs());
const request = (file?: File) => {
  const data = new FormData(); if (file) data.set("file", file); data.set("alt", "وصف الصورة");
  return new Request("http://localhost/api/admin/upload", { method: "POST", headers: { Authorization: "Bearer fixture-admin" }, body: data });
};
describe("authenticated upload validation and save separation", () => {
  it("rejects missing files, unsupported formats and files over the actual 10 MiB limit", async () => {
    for (const file of [undefined, new File(["not an image"], "offer.svg", { type: "image/svg+xml" }), new File([new Uint8Array(10 * 1024 * 1024 + 1)], "offer.png", { type: "image/png" })]) {
      expect((await POST(request(file))).status).toBe(400);
    }
    expect(upload).not.toHaveBeenCalled();
  });
  it("uses the signed server SDK and returns image metadata without saving or deleting an offer", async () => {
    upload.mockResolvedValue({ secure_url: "https://res.cloudinary.com/fixture/image/upload/offer.png", public_id: "fixture/offer", width: 100, height: 200 });
    const response = await POST(request(new File(["fixture bytes"], "offer.png", { type: "image/png" })));
    expect(response.status).toBe(200);
    expect(upload).toHaveBeenCalledTimes(1);
    expect(upload.mock.calls[0][1]).toMatchObject({ resource_type: "image", overwrite: false, unique_filename: true, allowed_formats: ["jpg", "jpeg", "png", "webp"] });
    expect((await response.json()).image).toMatchObject({ kind: "cloudinary", publicId: "fixture/offer", width: 100, height: 200, alt: "وصف الصورة" });
  });
  it("returns a readable failure and accepts an explicit retry", async () => {
    upload.mockRejectedValueOnce(new Error("fixture network failure")).mockResolvedValueOnce({ secure_url: "https://res.cloudinary.com/fixture/image/upload/offer.png", public_id: "fixture/offer", width: 100, height: 200 });
    const file = new File(["fixture bytes"], "offer.png", { type: "image/png" });
    const failed = await POST(request(file)); expect(failed.status).toBe(500); expect((await failed.json()).error).toContain("تعذر");
    expect((await POST(request(file))).status).toBe(200);
  });
});
