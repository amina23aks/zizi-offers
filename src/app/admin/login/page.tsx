"use client";

import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const credential = await signInWithEmailAndPassword(getFirebaseAuth(), String(form.get("email")), String(form.get("password")));
      const token = await credential.user.getIdToken(true);
      const response = await fetch("/api/admin/session", { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) { await getFirebaseAuth().signOut(); throw new Error(response.status === 403 ? "هذا الحساب لا يملك صلاحية الإدارة." : "تعذر التحقق من صلاحية الحساب."); }
      router.replace("/admin");
    } catch (caught) {
      setError(caught instanceof FirebaseError ? "البريد الإلكتروني أو كلمة المرور غير صحيحة، أو تعذر الاتصال بخدمة الدخول." : caught instanceof Error ? caught.message : "تعذر تسجيل الدخول.");
    } finally { setBusy(false); }
  }
  return <section className="admin-login-card">
    <p className="admin-kicker">إدارة عروض زيزي</p><h1>تسجيل دخول الإدارة</h1>
    <form onSubmit={submit} className="admin-form-stack">
      <label>البريد الإلكتروني<input name="email" type="email" autoComplete="username" required /></label>
      <label>كلمة المرور<input name="password" type="password" autoComplete="current-password" required /></label>
      {error && <p role="alert" className="admin-error">{error}</p>}
      <button className="admin-primary" disabled={busy}>{busy ? "جارٍ التحقق…" : "تسجيل الدخول"}</button>
    </form>
  </section>;
}
