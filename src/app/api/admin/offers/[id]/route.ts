import { invalidatePublicOffers } from "@/lib/invalidate-public-offers";
import { FieldValue } from "firebase-admin/firestore";
import { requireAdmin, safeAdminError } from "@/lib/admin-auth";
import { adminOfferSchema, parseAdminOfferRecord, type AdminOffer } from "@/lib/admin-offer";
import { getFirebaseAdmin } from "@/lib/firebase/admin";

export const runtime = "nodejs";

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;
    if (!/^[a-z0-9][a-z0-9-]{1,79}$/.test(id)) return Response.json({ error: "المعرّف غير صالح." }, { status: 400 });
    const db = getFirebaseAdmin().db;
    const ref = db.collection("offers").doc(id);
    const deleted = await db.runTransaction(async (tx) => {
      const current = await tx.get(ref);
      if (!current.exists) return null;
      // Only the offer document is removed. Media and specialized content are shared.
      const record = parseAdminOfferRecord(current.data() ?? {}, { id }).offer;
      if (!record) throw new Error("Existing offer has unsupported saved data.");
      const published = record.status === "published"
        ? await tx.get(db.collection("offers").where("status", "==", "published").limit(2))
        : null;
      tx.delete(ref);
      // Mark an intentionally empty catalogue without bypassing the activation hash.
      if (published?.docs.length === 1) tx.set(db.collection("catalogState").doc("legacy-v1"), { allowEmptyPublishedCatalog: true }, { merge: true });
      return record;
    });
    if (!deleted) return Response.json({ error: "العرض غير موجود أو تم حذفه بالفعل." }, { status: 404 });
    invalidatePublicOffers(deleted);
    return Response.json({ deletedId: id });
  } catch (error) { return safeAdminError(error); }
}

async function readSavedOffer(id: string) {
  const snapshot = await getFirebaseAdmin().db.collection("offers").doc(id).get();
  if (!snapshot.exists) throw new Error("Saved offer was not found after write.");
  const parsed = parseAdminOfferRecord(snapshot.data() ?? {}, { id, displayOrder: snapshot.data()?.displayOrder as number | undefined });
  if (!parsed.offer) throw new Error("Saved offer could not be read after write.");
  return parsed.offer;
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;
    const parsed = adminOfferSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "راجعي الحقول المطلوبة والقيم المدخلة.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
    if (parsed.data.id !== id) return Response.json({ error: "المعرّف غير صالح." }, { status: 400 });
    const explicitUnpublish = new URL(request.url).searchParams.get("unpublish") === "true";
    const ref = getFirebaseAdmin().db.collection("offers").doc(id);
    if (!(await ref.get()).exists) return Response.json({ error: "العرض غير موجود." }, { status: 404 });
    const db = getFirebaseAdmin().db;
    let previousOffer: AdminOffer | null = null;
    let expectedStatus: AdminOffer["status"] | null = null;
    await db.runTransaction(async (tx) => {
      const current = await tx.get(ref);
      if (!current.exists) throw new Error("Offer missing");
      const previous = current.data()!;
      const previousParsed = parseAdminOfferRecord(previous, { id, displayOrder: (previous.displayOrder as number | undefined) ?? parsed.data.displayOrder });
      if (!previousParsed.offer) throw new Error("Existing offer has unsupported saved data.");
      previousOffer = previousParsed.offer;
      const nextOffer = previousOffer.status === "published" && parsed.data.status === "draft" && !explicitUnpublish
        ? { ...parsed.data, status: "published" }
        : parsed.data;
      expectedStatus = nextOffer.status as AdminOffer["status"];
      const firstPublication = previousOffer.status !== "published" && nextOffer.status === "published" && !previous.firstPublishedAt && !previous.legacyImported;
      tx.update(ref, { ...nextOffer, updatedAt: FieldValue.serverTimestamp(), ...(firstPublication ? { firstPublishedAt: FieldValue.serverTimestamp() } : {}) });
    });
    const saved = await readSavedOffer(id);
    if (expectedStatus && saved.status !== expectedStatus) throw new Error("Saved offer publication state did not match the submitted form.");
    invalidatePublicOffers(previousOffer, saved);
    return Response.json({ offer: saved });
  } catch (error) { return safeAdminError(error); }
}
