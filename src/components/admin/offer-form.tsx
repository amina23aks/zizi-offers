"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { User } from "firebase/auth";
import { OfferCard } from "@/components/offer-card";
import { getAsset } from "@/data/catalog";
import { adminOfferSchema, type AdminOffer } from "@/lib/admin-offer";
import { activeVariants, categories, deliveryLabels, editorPreview, inferDelivery, standardIds, type Delivery, type Variant } from "@/lib/offer-editor";
import { authorizedFetch } from "@/lib/admin-fetch";

type Errors = Record<string, string>;
const availabilityOptions = { unknown: "غير محدد", available: "متاح", unavailable: "غير متاح", completed: "مكتمل" } as const;

export function OfferForm({ initial, user, busy, onSave, onDirty }: { initial: AdminOffer; user: User; busy: boolean; onSave: (offer: AdminOffer) => Promise<void>; onDirty: (value: boolean) => void }) {
  const [offer, setOffer] = useState(initial);
  const [delivery, setDelivery] = useState<Delivery>(() => inferDelivery(initial));
  const [bank, setBank] = useState<Variant[]>(() => activeVariants(initial.variants, inferDelivery(initial)));
  const [errors, setErrors] = useState<Errors>({});
  const [extraErrors, setExtraErrors] = useState<Errors>({});
  const validateExtra = (key: string, error: string) => setExtraErrors((current) => ({ ...current, [key]: error }));
  const [saveError, setSaveError] = useState("");
  const [uploading, setUploading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const saving = useRef(false);
  const active = activeVariants(bank, delivery);
  const groupActive = delivery === "group" || delivery === "both" || active.some((v) => v.id.startsWith("group-"));
  const value: AdminOffer = { ...offer, delivery, variants: active, topics: offer.topics.filter((t) => t.trim()), capacity: groupActive ? offer.capacity : "", image: { ...offer.image, alt: offer.image.alt || offer.title } };
  const removed = initial.variants.filter((v) => standardIds.includes(v.id) && !active.some((a) => a.id === v.id));
  const disabled = busy || uploading;
  const markDirty = () => onDirty(true);
  const patch = (partial: Partial<AdminOffer>) => { setOffer((current) => ({ ...current, ...partial })); markDirty(); };
  const updateVariant = (variant: Variant) => { setBank((current) => [...current.filter((v) => v.id !== variant.id), variant]); markDirty(); };
  const errorFor = (path: string) => errors[path] ? <small className="admin-field-error" role="alert" id={`error-${path}`}>{errors[path]}</small> : null;
  const invalid = (path: string) => ({ "aria-invalid": Boolean(errors[path]), "aria-describedby": errors[path] ? `error-${path}` : undefined });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (disabled || saving.current) return;
    const button = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const status = button?.value === "published" ? "published" : "draft";
    if (Object.entries(extraErrors).some(([key, error]) => Boolean(error) && (key !== "capacity" || groupActive))) { setSaveError("راجعي المدة أو عدد المشاركين قبل الحفظ."); return; }
    const parsed = adminOfferSchema.safeParse({ ...value, status });
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) next[issue.path.join(".")] = issue.path.includes("price") ? "أدخلي سعرًا صالحًا بالدولار (صفر أو أكثر)." : issue.message;
      setErrors(next); setSaveError("راجعي الحقول المحددة قبل الحفظ.");
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()); return;
    }
    saving.current = true; setErrors({}); setSaveError("");
    try { await onSave(parsed.data); } catch (caught) { setSaveError(caught instanceof Error ? caught.message : "فشل الحفظ. بقيت التعديلات في النموذج."); }
    finally { saving.current = false; }
  }

  return <div className="admin-editor-with-preview">
    <form ref={formRef} className="admin-edit-form" onSubmit={submit} noValidate>
      <fieldset disabled={disabled}><legend>معلومات العرض</legend>
        <label>اسم العرض<input required maxLength={160} value={offer.title} {...invalid("title")} onChange={(e) => patch({ title: e.target.value })} />{errorFor("title")}</label>
        <label>القسم<select required value={offer.category} onChange={(e) => patch({ category: e.target.value as AdminOffer["category"], catalogDetails: { ...offer.catalogDetails, format: undefined } })}>{Object.entries(categories).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
        <label>وصف مختصر<textarea rows={3} maxLength={5000} value={offer.description} {...invalid("description")} onChange={(e) => patch({ description: e.target.value })} />{errorFor("description")}</label>
        <div><p className="admin-field-label">محاور العرض <small>(اختياري)</small></p>{offer.topics.map((topic, index) => <div className="admin-topic-row" key={index}><input aria-label={`محور العرض ${index + 1}`} maxLength={300} value={topic} onChange={(e) => patch({ topics: offer.topics.map((item, i) => i === index ? e.target.value : item) })} /><button type="button" className="admin-secondary" aria-label={`إزالة المحور ${index + 1}`} onClick={() => patch({ topics: offer.topics.filter((_, i) => i !== index) })}>إزالة</button></div>)}<button type="button" className="admin-secondary" disabled={offer.topics.length >= 30} onClick={() => patch({ topics: [...offer.topics, ""] })}>إضافة محور</button>{errorFor("topics")}</div>
      </fieldset>
      <fieldset disabled={busy}><legend>صورة العرض</legend>
        <ImageUpload image={offer.image} title={offer.title} user={user} disabled={busy} onChange={(image) => patch({ image })} onBusy={setUploading} onPending={markDirty} />
        <label>وصف الصورة <small>(اختياري؛ اسم العرض هو الافتراضي)</small><input disabled={uploading} maxLength={300} value={offer.image.alt} placeholder={offer.title} onChange={(e) => patch({ image: { ...offer.image, alt: e.target.value } })} /></label>
        <small>الصورة اختيارية. رفع الصورة لا يحفظ العرض.</small>{errorFor("image")}
      </fieldset>
      <fieldset disabled={disabled}><legend>طريقة التقديم والأسعار</legend>
        <label>طريقة التقديم<select value={delivery} onChange={(e) => { const next = e.target.value as Delivery; setBank((current) => { const additions = activeVariants(current, next).filter((v) => !current.some((old) => old.id === v.id)); return [...current, ...additions]; }); setDelivery(next); markDirty(); }}>{Object.entries(deliveryLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
        {removed.length > 0 && <p className="admin-warning" role="status">عند الحفظ ستُزال الخيارات: {removed.map((v) => v.title).join("، ")}. يمكنكِ العودة لطريقة التقديم السابقة لاستعادة قيمها قبل الحفظ.</p>}
        {active.map((variant, index) => <PricingFields key={variant.id} variant={variant} custom={!standardIds.includes(variant.id)} onChange={updateVariant} errors={errors} path={`variants.${index}`} />)}
        {active.some((v) => !standardIds.includes(v.id)) && <small>الباقات والمدد الموجودة محفوظة. يمكنكِ تعديل اسم كل باقة وسعرها وتوفرها دون تغيير معرّفها.</small>}
        {errorFor("variants")}
        {groupActive && <CapacityField onValidity={(error) => validateExtra("capacity", error)} value={offer.capacity} onChange={(capacity) => patch({ capacity })} />}
      </fieldset>
      <fieldset disabled={disabled}><legend>معلومات إضافية</legend>
        <DurationField onValidity={(error) => validateExtra("duration", error)} label="مدة العرض / البرمجة" value={offer.duration} onChange={(duration) => patch({ duration })} />
        <DurationField onValidity={(error) => validateExtra("sessionDuration", error)} label="مدة الجلسة" value={offer.sessionDuration} onChange={(sessionDuration) => patch({ sessionDuration })} />
        <BadgeField value={offer.badge ?? ""} onChange={(badge) => patch({ badge })} />

      </fieldset>
      <div className="admin-save-actions"><p>حالة النشر الحالية: <strong>{initial.status === "published" ? "منشور" : "مسودة"}</strong></p><small>حالة النشر مستقلة عن توفر العرض.</small>
        {saveError && <p className="admin-error" role="alert">{saveError}</p>}
        <div><button type="submit" value="draft" className="admin-secondary" disabled={disabled}>حفظ مسودة</button><button type="submit" value="published" className="admin-primary" disabled={disabled}>{busy ? "جارٍ الحفظ…" : initial.status === "published" ? "حفظ التغييرات" : "نشر العرض"}</button></div>
      </div>
    </form>
    <aside className="admin-card-preview" aria-label="معاينة البطاقة"><h3>معاينة البطاقة</h3><OfferCard offer={editorPreview(value)} image={offer.image.kind === "cloudinary" ? { src: offer.image.secureUrl, width: offer.image.width, height: offer.image.height, alt: offer.image.alt || offer.title } : offer.image.kind === "local" && getAsset(offer.image.assetId) ? { src: getAsset(offer.image.assetId)!.publicPath, width: getAsset(offer.image.assetId)!.width, height: getAsset(offer.image.assetId)!.height, alt: offer.image.alt || offer.title } : undefined} /></aside>
  </div>;
}

function PricingFields({ variant, custom, onChange, errors, path }: { variant: Variant; custom: boolean; onChange: (variant: Variant) => void; errors: Errors; path: string }) {
  const cachedAmount = useRef<number | null>(variant.price.amountUsd);
  const issue = Object.entries(errors).find(([key]) => key.startsWith(path));
  return <div className="admin-pricing-group">
    {custom ? <label>اسم الباقة / المدة<input value={variant.title} maxLength={160} onChange={(e) => onChange({ ...variant, title: e.target.value })} /></label> : <h3>{variant.title}</h3>}
    <div className="admin-grid"><label>نوع السعر<select value={variant.price.status} onChange={(e) => { const status = e.target.value as Variant["price"]["status"]; if (variant.price.status === "known") cachedAmount.current = variant.price.amountUsd; onChange({ ...variant, price: { status, amountUsd: status === "free" ? 0 : status === "unknown" ? null : cachedAmount.current } }); }}><option value="known">محدد</option><option value="free">مجاني</option><option value="unknown">غير محدد</option></select></label>
    <label>التوفر<select value={variant.availability} onChange={(e) => onChange({ ...variant, availability: e.target.value as Variant["availability"] })}>{Object.entries(availabilityOptions).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label></div>
    {variant.price.status === "known" && <label>السعر بالدولار<input type="number" dir="ltr" min={0} step="any" value={variant.price.amountUsd ?? ""} aria-invalid={Boolean(issue)} onChange={(e) => onChange({ ...variant, price: { status: "known", amountUsd: e.target.value === "" ? null : Number(e.target.value) } })} /></label>}
    {custom && <label>ملاحظة الباقة <small>(اختياري)</small><input maxLength={300} value={variant.note ?? ""} onChange={(e) => onChange({ ...variant, note: e.target.value })} /></label>}
    {issue && <small className="admin-field-error" role="alert">{issue[1]}</small>}
  </div>;
}

function DurationField({ label, value, onChange, onValidity }: { label: string; value: string; onChange: (value: string) => void; onValidity: (error: string) => void }) {
  const units = ["ساعة", "يوم", "أسبوع", "شهر"];
  const match = /^(\d+(?:\.\d+)?) (ساعة|يوم|أسبوع|شهر)$/.exec(value);
  const [mode, setMode] = useState(match ? "number" : "note");
  const [amount, setAmount] = useState(match?.[1] ?? "");
  const [unit, setUnit] = useState(match?.[2] ?? "ساعة");
  const [note, setNote] = useState(match ? "" : value);
  return <div className="admin-duration"><label>{label} <small>(اختياري)</small><select aria-label={`${label}: طريقة الإدخال`} value={mode} onChange={(e) => { setMode(e.target.value); onValidity(e.target.value === "number" && amount && Number(amount) <= 0 ? "المدة يجب أن تكون موجبة." : ""); onChange(e.target.value === "note" ? note : amount ? `${amount} ${unit}` : ""); }}><option value="note">وصف المدة</option><option value="number">رقم ووحدة</option></select></label>
    {mode === "note" ? <input aria-label={label} placeholder="مثل: 8 ساعات غير متواصلة" maxLength={160} value={note} onChange={(e) => { setNote(e.target.value); onChange(e.target.value); }} /> : <div className="admin-grid"><input aria-label={`${label}: العدد`} type="number" dir="ltr" min={0.01} step="any" value={amount} onChange={(e) => { setAmount(e.target.value); onValidity(e.target.value && Number(e.target.value) <= 0 ? "المدة يجب أن تكون موجبة." : ""); onChange(e.target.value ? `${e.target.value} ${unit}` : ""); }} /><select aria-label={`${label}: الوحدة`} value={unit} onChange={(e) => { setUnit(e.target.value); onChange(amount ? `${amount} ${e.target.value}` : ""); }}>{units.map((item) => <option key={item}>{item}</option>)}</select></div>}
    {mode === "number" && amount && Number(amount) <= 0 && <small className="admin-field-error">المدة يجب أن تكون موجبة.</small>}
  </div>;
}

function CapacityField({ value, onChange, onValidity }: { value: string; onChange: (value: string) => void; onValidity: (error: string) => void }) {
  const known = /^\d+$/.test(value);
  const legacy = Boolean(value && !known);
  const [mode, setMode] = useState(value ? (known ? "known" : "legacy") : "unknown");
  const [number, setNumber] = useState(known ? value : "");
  const [original] = useState(value);
  return <div><label>عدد المشاركين<select value={mode} onChange={(e) => { setMode(e.target.value); onValidity(e.target.value === "known" && (!number || !/^\d+$/.test(number) || Number(number) < 1) ? "أدخلي عددًا صحيحًا موجبًا." : ""); onChange(e.target.value === "known" ? number : e.target.value === "legacy" ? original : ""); }}><option value="unknown">غير محدد</option><option value="known">محدد</option>{legacy && <option value="legacy">الوصف المحفوظ</option>}</select></label>
    {mode === "known" && <label>عدد المشاركين<input required type="number" dir="ltr" min={1} step={1} value={number} aria-invalid={Boolean(!number || !/^\d+$/.test(number) || Number(number) < 1)} onChange={(e) => { setNumber(e.target.value); onValidity(!e.target.value || !/^\d+$/.test(e.target.value) || Number(e.target.value) < 1 ? "أدخلي عددًا صحيحًا موجبًا." : ""); onChange(e.target.value); }} />{(!number || !/^\d+$/.test(number) || Number(number) < 1) && <small className="admin-field-error">أدخلي عددًا صحيحًا موجبًا.</small>}</label>}
    {mode === "legacy" && <p>الوصف المحفوظ: {value}</p>}<small>السعة هي عدد المشاركين، وليست المقاعد المتبقية.</small>
  </div>;
}

function ImageUpload({ image, title, user, disabled, onChange, onBusy, onPending }: { image: AdminOffer["image"]; title: string; user: User; disabled: boolean; onChange: (image: AdminOffer["image"]) => void; onBusy: (busy: boolean) => void; onPending: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  const lock = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [uploaded, setUploaded] = useState(false);
  const latest = useRef(image);
  useEffect(() => { latest.current = image; }, [image]);
  const previewUrl = useRef("");
  useEffect(() => () => { controller.current?.abort(); if (previewUrl.current) URL.revokeObjectURL(previewUrl.current); }, []);
  function clearPreview() { if (previewUrl.current) URL.revokeObjectURL(previewUrl.current); previewUrl.current = ""; setPreview(""); }
  const src = preview || (image.kind === "cloudinary" ? image.secureUrl : image.kind === "local" ? getAsset(image.assetId)?.publicPath : "");
  async function upload(next: File) {
    if (disabled || lock.current) return;
    setError(""); setUploaded(false);
    if (!["image/jpeg", "image/png", "image/webp"].includes(next.type) || next.size > 10 * 1024 * 1024 || next.size === 0) { setError("اختاري JPG أو PNG أو WebP بحجم لا يتجاوز 10 ميغابايت."); return; }
    lock.current = true; clearPreview(); previewUrl.current = URL.createObjectURL(next); setPreview(previewUrl.current); setFile(next); setBusy(true); onBusy(true); onPending();
    controller.current = new AbortController();
    try {
      const data = new FormData(); data.set("file", next); data.set("alt", latest.current.alt || title);
      const response = await authorizedFetch(user, "/api/admin/upload", { method: "POST", body: data, signal: controller.current.signal });
      const body = await response.json(); if (!response.ok) throw new Error(body.error || "فشل رفع الصورة.");
      if (controller.current.signal.aborted) return;
      const result = adminOfferSchema.shape.image.parse(body.image);
      onChange({ ...result, alt: latest.current.alt || title }); setFile(null); clearPreview(); setUploaded(true); onBusy(false);
    } catch (caught) { if (!controller.current?.signal.aborted) setError(caught instanceof Error ? caught.message : "فشل رفع الصورة."); }
    finally { lock.current = false; setBusy(false); }
  }
  return <div className="admin-image-upload" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const next = e.dataTransfer.files[0]; if (next) void upload(next); }}>
    {src ? <Image src={src} alt={image.alt || title || "معاينة صورة العرض"} width={image.kind === "cloudinary" ? image.width : 640} height={image.kind === "cloudinary" ? image.height : 640} unoptimized className="admin-image-preview" /> : <p>اختاري صورة أو اسحبيها هنا</p>}
    <p>JPG، PNG، WebP · حتى 10 ميغابايت</p>
    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="صورة العرض" disabled={disabled || busy} onChange={(e) => { const next = e.target.files?.[0]; e.target.value = ""; if (next) void upload(next); }} />
    <div className="admin-upload-actions"><button type="button" className="admin-secondary" disabled={disabled || busy} onClick={() => input.current?.click()}>{src ? "تغيير الصورة" : "رفع صورة"}</button>{src && <button type="button" className="admin-secondary" disabled={disabled || busy} onClick={() => { setFile(null); clearPreview(); onBusy(false); setError(""); setUploaded(false); onChange({ kind: "none", alt: image.alt }); }}>إزالة الصورة</button>}</div>
    {busy && <div role="status"><progress aria-label="تقدم رفع الصورة" /><p>جارٍ رفع الصورة…</p></div>}
    {error && <div role="alert" className="admin-error"><p>{error}</p>{file && <button type="button" disabled={busy || disabled} className="admin-secondary" onClick={() => void upload(file)}>إعادة المحاولة</button>}<p>لم تُستبدل الصورة المحفوظة. أزيلي الاختيار أو أعيدي المحاولة.</p></div>}
    {uploaded && <p role="status">تم رفع الصورة. احفظي العرض لتثبيت التغيير.</p>}
  </div>;
}

function BadgeField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [kind, setKind] = useState(value === "جديد" ? "new" : value === "مميز" ? "featured" : value ? "custom" : "none");
  const [custom, setCustom] = useState(value && !["جديد", "مميز"].includes(value) ? value : "");
  return <div><label>شارة البطاقة<select value={kind} onChange={(e) => { setKind(e.target.value); onChange(e.target.value === "new" ? "جديد" : e.target.value === "featured" ? "مميز" : e.target.value === "custom" ? custom : ""); }}><option value="none">بدون شارة</option><option value="new">جديد</option><option value="featured">مميز</option><option value="custom">نص مخصص</option></select></label>{kind === "custom" && <label>نص الشارة<input maxLength={20} value={custom} onChange={(e) => { setCustom(e.target.value); onChange(e.target.value); }} /></label>}</div>;
}
