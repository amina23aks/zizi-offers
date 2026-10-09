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
    if (!parsed.success || parsed.data.id !== id) return Response.json({ error: "بيانات العرض أو المعرّف غير صالحة." }, { status: 400 });
    const ref = getFirebaseAdmin().db.collection("offers").doc(id);
    if (!(await ref.get()).exists) return Response.json({ error: "العرض غير موجود." }, { status: 404 });
    await ref.set({ ...parsed.data, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return Response.json({ offer: (await ref.get()).data() });
  } catch (error) { return safeAdminError(error); }
}
