import { requireAdmin, safeAdminError } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const token = await requireAdmin(request);
    return Response.json({ uid: token.uid, email: token.email ?? null });
  } catch (error) { return safeAdminError(error); }
}
