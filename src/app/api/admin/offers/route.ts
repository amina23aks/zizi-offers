import { invalidatePublicOffers } from "@/lib/invalidate-public-offers";
import { FieldValue } from "firebase-admin/firestore";
import { requireAdmin, safeAdminError } from "@/lib/admin-auth";
import { adminOfferSchema } from "@/lib/admin-offer";
import { getFirebaseAdmin } from "@/lib/firebase/admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    // orderBy excludes older documents that do not have displayOrder.
    const snapshot = await getFirebaseAdmin().db.collection("offers").get();
    const offers = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id, displayOrder: doc.data().displayOrder ?? 0 }));
    offers.sort((a, b) => a.displayOrder - b.displayOrder || a.id.localeCompare(b.id));
    return Response.json({ offers });
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
    invalidatePublicOffers();
    return Response.json({ offer: (await ref.get()).data() }, { status: 201 });
  } catch (error) { return safeAdminError(error); }
}
