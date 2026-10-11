import { invalidatePublicOffers } from "@/lib/invalidate-public-offers";
import { FieldValue } from "firebase-admin/firestore";
import { requireAdmin, safeAdminError } from "@/lib/admin-auth";
import { adminOfferSchema, parseAdminOfferRecord } from "@/lib/admin-offer";
import { getFirebaseAdmin } from "@/lib/firebase/admin";

export const runtime = "nodejs";

async function readSavedOffer(id: string) {
  const snapshot = await getFirebaseAdmin().db.collection("offers").doc(id).get();
  if (!snapshot.exists) throw new Error("Saved offer was not found after write.");
  const parsed = parseAdminOfferRecord(snapshot.data() ?? {}, { id, displayOrder: snapshot.data()?.displayOrder as number | undefined });
  if (!parsed.offer) throw new Error("Saved offer could not be read after write.");
  return parsed.offer;
}

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    // orderBy excludes older documents that do not have displayOrder.
    const snapshot = await getFirebaseAdmin().db.collection("offers").get();
    const parsed = snapshot.docs.map((doc) => parseAdminOfferRecord(doc.data(), { id: doc.id, displayOrder: doc.data().displayOrder as number | undefined }));
    const diagnostics = parsed.flatMap((item) => item.diagnostics);
    const offers = parsed.flatMap((item) => item.offer ? [item.offer] : []);
    offers.sort((a, b) => a.displayOrder - b.displayOrder || a.id.localeCompare(b.id));
    return Response.json({ offers, diagnostics });
  } catch (error) { return safeAdminError(error); }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const parsed = adminOfferSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "راجعي الحقول المطلوبة والقيم المدخلة.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
    const ref = getFirebaseAdmin().db.collection("offers").doc(parsed.data.id);
    if ((await ref.get()).exists) return Response.json({ error: "معرّف العرض مستخدم بالفعل." }, { status: 409 });
    await ref.create({ ...parsed.data, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), ...(parsed.data.status === "published" ? { firstPublishedAt: FieldValue.serverTimestamp() } : {}) });
    const saved = await readSavedOffer(parsed.data.id);
    if (saved.status !== parsed.data.status) throw new Error("Saved offer publication state did not match the submitted form.");
    invalidatePublicOffers(saved);
    return Response.json({ offer: saved }, { status: 201 });
  } catch (error) { return safeAdminError(error); }
}
