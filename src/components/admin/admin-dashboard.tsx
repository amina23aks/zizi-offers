"use client";

import Link from "next/link";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { adminOfferSchema, type AdminOffer } from "@/lib/admin-offer";
import { blankOffer, categories } from "@/lib/offer-editor";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { authorizedFetch } from "@/lib/admin-fetch";
import { AdminSelect } from "./admin-select";
import { AdminConfirmDialog } from "./admin-confirm-dialog";
import { OfferForm } from "./offer-form";

type AuthState = "checking" | "authorized" | "signed-out" | "denied" | "error";
type Diagnostic = { id: string; fieldPath: string; expected: string; actual: string; message: string };

export function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [offers, setOffers] = useState<AdminOffer[]>([]);
  const [selected, setSelected] = useState<AdminOffer | null>(null);
  const [editorVersion, setEditorVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminOffer | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const saveLock = useRef(false);
  const dirty = useRef(false);
  const pendingLeave = useRef<(() => void | Promise<void>) | null>(null);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const clearAdminData = useCallback(() => {
    setUser(null);
    setOffers([]);
    setSelected(null);
    setSearch("");
    setFilter("");
    setDiagnostics([]);
    setDeleteTarget(null);
    dirty.current = false;
  }, []);

  const load = useCallback(async (currentUser: User) => {
    setLoading(true); setListError("");
    try {
      const response = await authorizedFetch(currentUser, "/api/admin/offers");
      if (response.status === 401) { clearAdminData(); await signOut(getFirebaseAuth()); setAuthState("signed-out"); router.replace("/admin/login"); return; }
      if (response.status === 403) { clearAdminData(); setAuthState("denied"); return; }
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "تعذر تحميل العروض.");
      const parsed = adminOfferSchema.array().safeParse(body.offers);
      if (!parsed.success) throw new Error("تعذر قراءة بعض العروض القديمة. راجعي بياناتها قبل المتابعة؛ لم تُحذف أي بيانات.");
      setOffers(parsed.data);
      setDiagnostics(Array.isArray(body.diagnostics) ? body.diagnostics : []);
    } catch (caught) { setOffers([]); setSelected(null); setListError(caught instanceof Error ? caught.message : "تعذر تحميل العروض."); }
    finally { setLoading(false); }
  }, [clearAdminData, router]);

  useEffect(() => {
    try {
      return onAuthStateChanged(getFirebaseAuth(), (current) => {
        setAuthState("checking");
        setLoading(true);
        setListError("");
        setMessage("");
        clearAdminData();
        if (!current) { setAuthState("signed-out"); setLoading(false); router.replace("/admin/login"); return; }
        void (async () => {
          try {
            const response = await authorizedFetch(current, "/api/admin/session");
            if (response.status === 401) { clearAdminData(); await signOut(getFirebaseAuth()); setAuthState("signed-out"); router.replace("/admin/login"); return; }
            if (response.status === 403) { clearAdminData(); setAuthState("denied"); setLoading(false); return; }
            if (!response.ok) {
              const body = await response.json().catch(() => ({}));
              throw new Error(body.error || "تعذر التحقق من صلاحية الإدارة.");
            }
            setUser(current);
            setAuthState("authorized");
            await load(current);
          } catch (caught) {
            clearAdminData();
            setAuthState("error");
            setListError(caught instanceof Error ? caught.message : "تعذر التحقق من صلاحية الإدارة.");
            setLoading(false);
          }
        })();
      });
    } catch { queueMicrotask(() => { clearAdminData(); setAuthState("error"); setListError("إعدادات Firebase غير مكتملة. يلزم ضبط إعدادات الدخول لفتح لوحة الإدارة."); setLoading(false); }); }
  }, [clearAdminData, load, router]);

  useEffect(() => {
    const editorHref = window.location.href;
    const editorHistoryState = window.history.state;
    const beforeUnload = (event: BeforeUnloadEvent) => { if (dirty.current || saveLock.current) event.preventDefault(); };
    const popState = (event: PopStateEvent) => {
      if (saveLock.current || dirty.current) {
        window.history.pushState(editorHistoryState, "", editorHref);
        event.stopImmediatePropagation();
        if (!saveLock.current) {
          pendingLeave.current = () => window.history.back();
          setLeaveDialogOpen(true);
        }
      }
    };
    const navigate = (event: MouseEvent) => {
      const link = (event.target as Element).closest("a[href]");
      if (link && new URL(link.getAttribute("href")!, window.location.href).pathname === window.location.pathname && new URL(link.getAttribute("href")!, window.location.href).search === window.location.search) return;
      if (link && dirty.current) {
        event.preventDefault();
        const href = link.getAttribute("href");
        if (href) {
          pendingLeave.current = () => { window.location.href = href; };
          setLeaveDialogOpen(true);
        }
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    window.addEventListener("popstate", popState, true);
    document.addEventListener("click", navigate, true);
    return () => { window.removeEventListener("beforeunload", beforeUnload); window.removeEventListener("popstate", popState, true); document.removeEventListener("click", navigate, true); };
  }, []);

  const visible = useMemo(() => offers.filter((offer) => (!filter || offer.category === filter) && (!search || offer.title.toLocaleLowerCase("ar").includes(search.toLocaleLowerCase("ar")))), [offers, filter, search]);
  const published = offers.filter((offer) => offer.status === "published").length;
  const requestLeave = (action: () => void | Promise<void>) => {
    if (saveLock.current) return;
    if (!dirty.current) { void action(); return; }
    pendingLeave.current = action;
    setLeaveDialogOpen(true);
  };
  const confirmLeave = () => {
    dirty.current = false;
    setLeaveDialogOpen(false);
    const action = pendingLeave.current;
    pendingLeave.current = null;
    if (action) void action();
  };
  function choose(offer: AdminOffer) {
    requestLeave(() => {
      dirty.current = false; setSelected(structuredClone(offer)); setEditorVersion((v) => v + 1); setMessage("");
    });
  }

  async function save(offer: AdminOffer, options: { unpublish?: boolean } = {}) {
    if (!user || saveLock.current) throw new Error("تعذر الحفظ الآن.");
    saveLock.current = true; setSaving(true); setMessage("");
    try {
      const exists = offers.some((item) => item.id === offer.id);
      const updateUrl = `/api/admin/offers/${encodeURIComponent(offer.id)}${options.unpublish ? "?unpublish=true" : ""}`;
      const response = await authorizedFetch(user, exists ? updateUrl : "/api/admin/offers", { method: exists ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(offer) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "فشل الحفظ. بقيت التعديلات في النموذج.");
      const saved = adminOfferSchema.parse(body.offer);
      setOffers((current) => [...current.filter((item) => item.id !== saved.id), saved].sort((a, b) => a.displayOrder - b.displayOrder));
      dirty.current = false; setSelected(saved); setEditorVersion((v) => v + 1);
      setMessage(saved.status === "published" ? "تم حفظ العرض المنشور بنجاح." : "تم حفظ المسودة بنجاح.");
    } finally { saveLock.current = false; setSaving(false); }
  }

  async function deleteOffer() {
    if (!user || !deleteTarget || saveLock.current) return;
    const id = deleteTarget.id;
    saveLock.current = true; setSaving(true); setDeleteError(""); setMessage("");
    try {
      const response = await authorizedFetch(user, `/api/admin/offers/${encodeURIComponent(id)}`, { method: "DELETE" });
      const body = await response.json();
      if (!response.ok || body.deletedId !== id) throw new Error(body.error || "تعذر تأكيد حذف العرض. أعيدي تحميل القائمة قبل المحاولة.");
      setOffers((current) => current.filter((offer) => offer.id !== id));
      setDiagnostics((current) => current.filter((entry) => entry.id !== id));
      dirty.current = false; setSelected(null); setDeleteTarget(null);
      setMessage("تم حذف العرض وبطاقته العامة. الصور والمحتوى المتخصص محفوظة.");
    } catch (caught) { setDeleteError(caught instanceof Error ? caught.message : "تعذر حذف العرض. حاولي مجددًا."); }
    finally { saveLock.current = false; setSaving(false); }
  }

  if (authState === "checking") {
    return <section className="admin-panel" aria-busy="true"><p role="status">جارٍ التحقق من صلاحية الإدارة…</p></section>;
  }
  if (authState === "denied") {
    return <section className="admin-login-card"><p className="admin-kicker">إدارة عروض زيزي</p><h1>لا تملكين صلاحية الإدارة</h1><p>الحساب مسجل الدخول، لكن لا يحمل صلاحية الإدارة المطلوبة.</p><button className="admin-secondary" onClick={async () => { clearAdminData(); await signOut(getFirebaseAuth()); router.replace("/admin/login"); }}>تسجيل الخروج</button></section>;
  }
  if (authState === "error") {
    return <section className="admin-login-card"><p className="admin-kicker">إدارة عروض زيزي</p><h1>تعذر فتح لوحة الإدارة</h1><p role="alert" className="admin-error">{listError}</p></section>;
  }
  if (authState !== "authorized" || !user) {
    return <section className="admin-panel" aria-busy="true"><p role="status">جارٍ فتح صفحة الدخول…</p></section>;
  }

  return <div className="admin-dashboard">
    <header className="admin-topbar"><div><p className="admin-kicker">لوحة إدارة عروض زيزي</p><h1>العروض</h1></div><nav aria-label="تنقل الإدارة"><a href="#offers-list">العروض</a><Link href="/">عرض الموقع</Link><button className="admin-secondary" disabled={saving} onClick={() => requestLeave(async () => { clearAdminData(); await signOut(getFirebaseAuth()); router.replace("/admin/login"); })}>تسجيل الخروج</button></nav></header>
    {listError && <div role="alert" className="admin-error"><p>{listError}</p>{user && <button type="button" className="admin-secondary" onClick={() => void load(user)}>إعادة المحاولة</button>}</div>}
    {diagnostics.length > 0 && <div role="status" className="admin-warning"><p>تمت قراءة العروض مع ملاحظات توافق تحتاج مراجعة:</p><ul>{diagnostics.map((item) => <li key={`${item.id}-${item.fieldPath}`}>{item.id}: {item.fieldPath} — المتوقع {item.expected}، المحفوظ {item.actual}. {item.message}</li>)}</ul></div>}
    {message && <p role="status" className="admin-success">{message}</p>}
    <section className="admin-stats" aria-label="ملخص المحتوى">{[[offers.length, "إجمالي العروض"], [published, "منشور"], [offers.length - published, "مسودة"]].map(([count, label]) => <article key={label}><strong>{loading || listError ? "—" : count}</strong><span>{label}</span></article>)}</section>
    <div className="admin-columns">
      <section className="admin-panel" id="offers-list"><div className="admin-panel-heading"><h2>قائمة العروض</h2><button className="admin-primary compact" disabled={!user || loading || Boolean(listError) || saving} onClick={() => requestLeave(() => { dirty.current = false; setSelected(blankOffer(Math.min(100000, Math.max(-1, ...offers.map((o) => o.displayOrder)) + 1))); setEditorVersion((v) => v + 1); setMessage(""); })}>إضافة عرض</button></div>
        <div className="admin-filters"><input aria-label="البحث" placeholder="ابحثي باسم العرض" value={search} onChange={(e) => setSearch(e.target.value)} /><AdminSelect aria-label="تصفية حسب القسم" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="">كل الأقسام</option>{Object.entries(categories).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</AdminSelect></div>
        {loading ? <p role="status">جارٍ تحميل العروض…</p> : listError ? <p>قائمة العروض غير متاحة حاليًا.</p> : visible.length ? <ul className="admin-offer-list">{visible.map((offer) => <li key={offer.id}><button disabled={saving} aria-current={selected?.id === offer.id ? "true" : undefined} onClick={() => choose(offer)}><span><strong>{offer.title}</strong><small>{categories[offer.category]}</small></span><em data-status={offer.status}>{offer.status === "published" ? "منشور" : "مسودة"}</em></button></li>)}</ul> : <p className="admin-empty">لا توجد عروض مطابقة.</p>}
      </section>
      <section className="admin-panel admin-editor"><h2>{selected ? (offers.some((offer) => offer.id === selected.id) ? "تعديل العرض" : "عرض جديد") : "اختاري عرضًا للتعديل"}</h2>
        {selected && offers.some((offer) => offer.id === selected.id) && <button type="button" className="admin-danger admin-delete-offer" disabled={saving} onClick={() => { setDeleteError(""); setDeleteTarget(selected); }}>حذف العرض</button>}
        {selected && user && <OfferForm key={`${selected.id}-${editorVersion}`} initial={selected} user={user} busy={saving} onSave={save} onDirty={(value) => { dirty.current = value; }} />}
      </section>
    </div>
    <AdminConfirmDialog open={Boolean(deleteTarget)} busy={saving} title="حذف العرض؟" confirmLabel="حذف العرض نهائيًا" cancelLabel="إلغاء" danger
      onCancel={() => { if (!saveLock.current) { setDeleteTarget(null); setDeleteError(""); } }} onConfirm={deleteOffer}>
      <p>سيُحذف سجل «{deleteTarget?.title}» وبطاقته من القوائم العامة. لا يمكن التراجع عن الحذف.</p>
      <p>لن تُحذف الصور المشتركة أو محتوى صفحة الاختبارات أو معارض البوصلة أو أسماء البصمات.</p>
      <p>أي تعديلات غير محفوظة في النموذج لن تُحفظ.</p>
      {deleteError && <p role="alert" className="admin-error">{deleteError}</p>}
    </AdminConfirmDialog>
    <AdminConfirmDialog
      open={leaveDialogOpen}
      busy={false}
      title="تجاهل التعديلات؟"
      confirmLabel="المتابعة"
      cancelLabel="إلغاء"
      onCancel={() => { pendingLeave.current = null; setLeaveDialogOpen(false); }}
      onConfirm={confirmLeave}
    >
      <p>لديكِ تعديلات غير محفوظة. المتابعة ستترك النموذج الحالي دون حفظ.</p>
    </AdminConfirmDialog>
  </div>;
}
