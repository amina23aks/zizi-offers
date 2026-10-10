import { invalidatePublicOffers } from "@/lib/invalidate-public-offers";
import { FieldValue } from "firebase-admin/firestore";
import { requireAdmin, safeAdminError } from "@/lib/admin-auth";
import { adminOfferSchema } from "@/lib/admin-offer";
import { getFirebaseAdmin } from "@/lib/firebase/admin";

export const runtime = "nodejs";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;
    const parsed = adminOfferSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "راجعي الحقول المطلوبة والقيم المدخلة.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
    if (parsed.data.id !== id) return Response.json({ error: "المعرّف غير صالح." }, { status: 400 });
    const ref = getFirebaseAdmin().db.collection("offers").doc(id);
    if (!(await ref.get()).exists) return Response.json({ error: "العرض غير موجود." }, { status: 404 });
    const db = getFirebaseAdmin().db;
    await db.runTransaction(async (tx) => {
      const current = await tx.get(ref);
      if (!current.exists) throw new Error("Offer missing");
      const previous = current.data()!;
      const firstPublication = previous.status !== "published" && parsed.data.status === "published" && !previous.firstPublishedAt && !previous.legacyImported;
      tx.set(ref, { ...parsed.data, updatedAt: FieldValue.serverTimestamp(), ...(firstPublication ? { firstPublishedAt: FieldValue.serverTimestamp() } : {}) }, { merge: true });
    });
    invalidatePublicOffers();
    return Response.json({ offer: (await ref.get()).data() });
  } catch (error) { return safeAdminError(error); }
}
