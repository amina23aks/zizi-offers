import { v2 as cloudinary } from "cloudinary";
import { requireAdmin, safeAdminError } from "@/lib/admin-auth";

export const runtime = "nodejs";
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxBytes = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const required = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"] as const;
    const missing = required.filter((name) => !process.env[name]);
    if (missing.length) throw new Error(`Missing server configuration: ${missing.join(", ")}`);
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "اختاري ملف صورة." }, { status: 400 });
    if (!allowedTypes.has(file.type)) return Response.json({ error: "الصيغ المسموحة: JPG وPNG وWebP." }, { status: 400 });
    if (file.size > maxBytes) return Response.json({ error: "حجم الصورة يجب ألا يتجاوز 10 ميغابايت." }, { status: 400 });
    cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, secure: true });
    const dataUri = `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString("base64")}`;
    const result = await cloudinary.uploader.upload(dataUri, { folder: "zizi-offers/admin", resource_type: "image", allowed_formats: ["jpg", "jpeg", "png", "webp"], use_filename: false, unique_filename: true, overwrite: false });
    return Response.json({ image: { kind: "cloudinary", secureUrl: result.secure_url, publicId: result.public_id, width: result.width, height: result.height, alt: String(form.get("alt") ?? "").slice(0, 300) } });
  } catch (error) { return safeAdminError(error); }
}
