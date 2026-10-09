"use client";

import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { imageAssets } from "@/data/assets";
import type { AdminOffer } from "@/lib/admin-offer";
import { getFirebaseAuth } from "@/lib/firebase/client";

type EditableOffer = AdminOffer;
const categories = { tests: "الاختبارات", coaching: "الكوتشينغ", courses: "الدورات", programs: "البرمجات", sessions: "الجلسات", compass: "البوصلة" } as const;
const availabilityOptions = { unknown: "غير محدد", available: "متاح", unavailable: "غير متاح", completed: "مكتمل" } as const;
const blankOffer = (): EditableOffer => ({
  id: "", title: "", category: "coaching", description: "", topics: [], image: { kind: "none", alt: "" },
  variants: [
    { id: "individual", title: "فردي", price: { amountUsd: null, status: "unknown" }, availability: "unknown" },
    { id: "group", title: "جماعي", price: { amountUsd: null, status: "unknown" }, availability: "unknown" },
  ], duration: "", sessionDuration: "", capacity: "", displayOrder: 0, status: "draft",
});

async function authorizedFetch(user: User, input: string, init?: RequestInit) {
  const token = await user.getIdToken();
  return fetch(input, { ...init, headers: { ...init?.headers, Authorization: `Bearer ${token}` } });
}

export function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [offers, setOffers] = useState<EditableOffer[]>([]);
  const [selected, setSelected] = useState<EditableOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const load = useCallback(async (currentUser: User) => {
    try {
      const response = await authorizedFetch(currentUser, "/api/admin/offers");
      if (response.status === 401 || response.status === 403) { await signOut(getFirebaseAuth()); router.replace("/admin/login"); return; }
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setOffers(body.offers);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "تعذر تحميل العروض."); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => onAuthStateChanged(getFirebaseAuth(), (current) => {
    if (!current) { router.replace("/admin/login"); return; }
    setUser(current); void load(current);
  }), [load, router]);

  const visible = useMemo(() => offers.filter((offer) => (!filter || offer.category === filter) && (!search || `${offer.title} ${offer.id}`.toLocaleLowerCase("ar").includes(search.toLocaleLowerCase("ar")))), [offers, filter, search]);
  const published = offers.filter((offer) => offer.status === "published").length;

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!user || !selected) return;
    setSaving(true); setMessage(""); setError("");
    try {
      const exists = offers.some((offer) => offer.id === selected.id);
      const response = await authorizedFetch(user, exists ? `/api/admin/offers/${encodeURIComponent(selected.id)}` : "/api/admin/offers", { method: exists ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(selected) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      const saved = body.offer as EditableOffer;
      setOffers((current) => exists ? current.map((item) => item.id === saved.id ? saved : item) : [...current, saved]);
      setSelected(saved); setMessage("تم حفظ العرض في Firestore بنجاح.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "فشل الحفظ. بقيت التعديلات في النموذج."); }
    finally { setSaving(false); }
  }

  async function upload(file: File) {
    if (!user || !selected) return;
    setSaving(true); setMessage(""); setError("");
    try {
      const data = new FormData(); data.set("file", file); data.set("alt", selected.image.alt);
      const response = await authorizedFetch(user, "/api/admin/upload", { method: "POST", body: data });
      const body = await response.json(); if (!response.ok) throw new Error(body.error);
      setSelected({ ...selected, image: body.image }); setMessage("تم رفع الصورة. احفظي العرض لتثبيت مرجعها.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "فشل رفع الصورة، ولم يُحفظ العرض."); }
    finally { setSaving(false); }
  }

  if (loading) return <p className="admin-loading" role="status">جارٍ التحقق من الصلاحية وتحميل العروض…</p>;
  return <div className="admin-dashboard">
    <header className="admin-topbar"><div><p className="admin-kicker">لوحة إدارة عروض زيزي</p><h1>العروض</h1></div><button className="admin-secondary" onClick={async () => { await signOut(getFirebaseAuth()); router.replace("/admin/login"); }}>تسجيل الخروج</button></header>
    {error && <p role="alert" className="admin-error">{error}</p>}{message && <p role="status" className="admin-success">{message}</p>}
    <section className="admin-stats" aria-label="ملخص المحتوى"><article><strong>{offers.length}</strong><span>إجمالي العروض</span></article><article><strong>{published}</strong><span>منشور</span></article><article><strong>{offers.length - published}</strong><span>مسودة</span></article></section>
    <div className="admin-columns">
      <section className="admin-panel"><div className="admin-panel-heading"><h2>قائمة العروض</h2><button className="admin-primary compact" onClick={() => { setSelected(blankOffer()); setMessage(""); setError(""); }}>إضافة عرض</button></div>
        <div className="admin-filters"><input aria-label="البحث" placeholder="ابحثي بالعنوان أو المعرّف" value={search} onChange={(e) => setSearch(e.target.value)} /><select aria-label="تصفية حسب القسم" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="">كل الأقسام</option>{Object.entries(categories).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></div>
        {visible.length ? <ul className="admin-offer-list">{visible.map((offer) => <li key={offer.id}><button onClick={() => { setSelected(structuredClone(offer)); setMessage(""); setError(""); }}><span><strong>{offer.title}</strong><small>{categories[offer.category]}</small></span><em data-status={offer.status}>{offer.status === "published" ? "منشور" : "مسودة"}</em></button></li>)}</ul> : <p className="admin-empty">لا توجد عروض مطابقة.</p>}
      </section>
      <section className="admin-panel admin-editor"><h2>{selected ? (offers.some((offer) => offer.id === selected.id) ? "تعديل العرض" : "عرض جديد") : "اختاري عرضًا للتعديل"}</h2>
        {selected && <OfferForm offer={selected} lockedId={offers.some((offer) => offer.id === selected.id)} busy={saving} setOffer={setSelected} onSave={save} onUpload={upload} />}
      </section>
    </div>
  </div>;
}

function OfferForm({ offer, lockedId, busy, setOffer, onSave, onUpload }: { offer: EditableOffer; lockedId: boolean; busy: boolean; setOffer: (offer: EditableOffer) => void; onSave: (event: FormEvent<HTMLFormElement>) => void; onUpload: (file: File) => void }) {
  const patch = (value: Partial<EditableOffer>) => setOffer({ ...offer, ...value });
  return <form className="admin-edit-form" onSubmit={onSave}>
    <div className="admin-grid"><label>المعرّف الثابت<input value={offer.id} disabled={lockedId} pattern="[a-z0-9][a-z0-9-]+" required onChange={(e) => patch({ id: e.target.value })} /></label><label>العنوان<input value={offer.title} required onChange={(e) => patch({ title: e.target.value })} /></label><label>القسم<select value={offer.category} onChange={(e) => patch({ category: e.target.value as EditableOffer["category"] })}>{Object.entries(categories).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><label>ترتيب العرض<input type="number" min="0" value={offer.displayOrder} onChange={(e) => patch({ displayOrder: Number(e.target.value) })} /></label></div>
    <label>الوصف<textarea rows={4} value={offer.description} onChange={(e) => patch({ description: e.target.value })} /></label><label>الموضوعات (سطر لكل موضوع)<textarea rows={4} value={offer.topics.join("\n")} onChange={(e) => patch({ topics: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean) })} /></label>
    <div className="admin-grid"><label>المدة الإجمالية<input value={offer.duration} onChange={(e) => patch({ duration: e.target.value })} /></label><label>مدة الجلسة<input value={offer.sessionDuration} onChange={(e) => patch({ sessionDuration: e.target.value })} /></label><label>السعة (ليست المقاعد المتبقية)<input value={offer.capacity} onChange={(e) => patch({ capacity: e.target.value })} /></label><label>حالة النشر<select value={offer.status} onChange={(e) => patch({ status: e.target.value as EditableOffer["status"] })}><option value="draft">مسودة</option><option value="published">منشور</option></select></label></div>
    <fieldset><legend>الصورة</legend><label>الصورة الموجودة<select value={offer.image.kind === "local" ? offer.image.assetId : ""} onChange={(e) => patch({ image: e.target.value ? { kind: "local", assetId: e.target.value, alt: offer.image.alt } : { kind: "none", alt: offer.image.alt } })}><option value="">بدون صورة محلية</option>{imageAssets.map((asset) => <option key={asset.id} value={asset.id}>{asset.section} — {asset.fileName}</option>)}</select></label><label>النص البديل<input value={offer.image.alt} onChange={(e) => patch({ image: { ...offer.image, alt: e.target.value } })} /></label><label className="admin-upload">رفع JPG أو PNG أو WebP (حتى 10MB)<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(e) => { const file = e.target.files?.[0]; if (file) void onUpload(file); }} /></label>{offer.image.kind === "cloudinary" && <small>تم رفع الصورة بأبعاد {offer.image.width}×{offer.image.height}. يلزم حفظ العرض.</small>}</fieldset>
    <fieldset><legend>الخيارات والأسعار</legend>{offer.variants.map((variant, index) => <div className="admin-variant" key={variant.id}><strong>{variant.title}</strong><label>نوع السعر<select value={variant.price.status} onChange={(e) => { const status = e.target.value as "known" | "unknown" | "free"; const variants = [...offer.variants]; variants[index] = { ...variant, price: { status, amountUsd: status === "unknown" ? null : status === "free" ? 0 : variant.price.amountUsd ?? 0 } }; patch({ variants }); }}><option value="unknown">غير محدد</option><option value="free">مجاني</option><option value="known">مدفوع</option></select></label><label>السعر بالدولار<input type="number" min="0" disabled={variant.price.status !== "known"} value={variant.price.amountUsd ?? ""} onChange={(e) => { const variants = [...offer.variants]; variants[index] = { ...variant, price: { status: "known", amountUsd: Number(e.target.value) } }; patch({ variants }); }} /></label><label>التوفر<select value={variant.availability} onChange={(e) => { const variants = [...offer.variants]; variants[index] = { ...variant, availability: e.target.value as EditableOffer["variants"][number]["availability"] }; patch({ variants }); }}>{Object.entries(availabilityOptions).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label></div>)}</fieldset>
    <button className="admin-primary" disabled={busy}>{busy ? "جارٍ التنفيذ…" : "حفظ العرض"}</button>
  </form>;
}
