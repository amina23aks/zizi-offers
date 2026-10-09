import "server-only";

import type { DecodedIdToken } from "firebase-admin/auth";
import { getFirebaseAdmin } from "@/lib/firebase/admin";

export class AdminAuthError extends Error {
  constructor(public status: 401 | 403, message: string) { super(message); }
}

export async function requireAdmin(request: Request): Promise<DecodedIdToken> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new AdminAuthError(401, "يلزم تسجيل الدخول.");
  try {
    const token = await getFirebaseAdmin().auth.verifyIdToken(header.slice(7), true);
    if (token.admin !== true) throw new AdminAuthError(403, "لا تملكين صلاحية الإدارة.");
    return token;
  } catch (error) {
    if (error instanceof AdminAuthError) throw error;
    throw new AdminAuthError(401, "انتهت الجلسة أو تعذر التحقق منها. سجّلي الدخول مجددًا.");
  }
}

export function safeAdminError(error: unknown) {
  if (error instanceof AdminAuthError) return Response.json({ error: error.message }, { status: error.status });
  console.error("Privileged operation failed", error instanceof Error ? error.name : "UnknownError");
  return Response.json({ error: "تعذر إكمال العملية. تحققي من إعدادات الخادم وحاولي مجددًا." }, { status: 500 });
}
