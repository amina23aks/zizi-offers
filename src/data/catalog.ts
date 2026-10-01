import {
  codeCardAssetIds,
  imageAssetById,
  imageAssets,
  triadAssetId,
  type ImageAsset,
} from "@/data/assets";
import { offers, renderPriceValue, type Availability, type Offer, type OfferPrice } from "@/data/offers";

export type DisplayOffer = Offer & {
  priceLabel: string;
  priceClarification: string | null;
  availabilityLabel: string | null;
};

export const getOffer = (id: string) => offers.find((offer) => offer.id === id);

export const formatAvailability = (availability: Availability) => {
  if (availability === "unknown") return null;
  if (availability === "available") return "متاح";
  if (availability === "unavailable") return "غير متاح";
  return "مكتمل";
};

export const formatPrice = (price: OfferPrice) => {
  const value = renderPriceValue(price);
  return {
    label: value === null ? "متعدد" : `${value} USD`,
    clarification: price.status === "unknown" ? "السعر غير محدد" : null,
  };
};

export const toDisplayOffer = (offer: Offer): DisplayOffer => {
  const price = formatPrice(offer.price);
  return {
    ...offer,
    priceLabel: price.label,
    priceClarification: price.clarification,
    availabilityLabel: formatAvailability(offer.availability),
  };
};

export const getAsset = (id: string | null | undefined) =>
  id ? imageAssetById[id as keyof typeof imageAssetById] : null;

export const selectedHomeOfferIds = [
  "emotional-communication",
  "etho",
  "handwriting-analysis",
  "arrow-program",
] as const;

export const homePreviewOffers = selectedHomeOfferIds
  .map((id) => getOffer(id))
  .filter((offer) => Boolean(offer))
  .map((offer) => toDisplayOffer(offer as Offer));

export const emotionalCommunicationOffer = toDisplayOffer(
  getOffer("emotional-communication")!,
);

export const emotionalCommunicationTopics = [
  "إدارة الضغوط",
  "إدارة النزاعات",
  "الحدود الصحية",
  "الحدود العاطفية",
] as const;

export const categoryLinks = [
  { href: "/tests", label: "الاختبارات", note: "أكواد وإيثو وأطياف" },
  { href: "/offers/emotional-communication", label: "الكوتشينغ", note: "نموذج تفاصيل أول" },
  { href: "#selected-offers", label: "البرمجات", note: "معاينات مختارة" },
  { href: "#selected-offers", label: "الدورات", note: "صور أصلية" },
  { href: "#booking", label: "الجلسات", note: "بانتظار رابط الحجز" },
] as const;

export const codeCards = [
  {
    code: "A",
    title: "الموضوعية والمنطق",
    summary: "نمط يركّز على التحليل وفهم الأسباب وتقييم المعلومات والنتائج.",
    study:
      "الدراسة بالفروع العقلية وتشكيل النظريات والتلخيص والأمثلة؛ العمل بالتحليل والتقييم والأرقام والحقائق والبيانات.",
    accent: "code-a",
    asset: imageAssetById[codeCardAssetIds.A],
  },
  {
    code: "B",
    title: "التنفيذ والإنجاز",
    summary: "نمط يميل إلى التنظيم والخطوات العملية والتخطيط والاهتمام بالتفاصيل.",
    study:
      "الحفظ والمراجعة بعد الدرس والمناقشة الجماعية؛ التنظيم والانضباط والتنفيذ والإجراءات والدقة.",
    accent: "code-b",
    asset: imageAssetById[codeCardAssetIds.B],
  },
  {
    code: "C",
    title: "المشاعر والأحاسيس",
    summary: "نمط يهتم بالعلاقات والمعاني الإنسانية والتفاعل مع الآخرين.",
    study:
      "المذاكرة بصوت عال والمناقشة وشرح الدرس لشخص آخر والارتباط العاطفي بالموضوع؛ الرعاية والتعليم والإرشاد.",
    accent: "code-c",
    asset: imageAssetById[codeCardAssetIds.C],
  },
  {
    code: "D",
    title: "الإبداع والابتكار",
    summary: "نمط يستكشف الأفكار والاحتمالات ويربطها برؤية واسعة للمستقبل.",
    study:
      "الأقلام والخطاطات الملونة والعروض والفيديوهات؛ التفكير الاستراتيجي والنظرة الكلية والتجارب والخيارات والتغيير.",
    accent: "code-d",
    asset: imageAssetById[codeCardAssetIds.D],
  },
] as const;

const animalDisplayNames: Record<string, string> = {
  اخطبوط: "أخطبوط",
  ارنب: "أرنب",
  اسد: "أسد",
  افعى: "أفعى",
  "بطة": "بطة",
  "بقره": "بقرة",
  "حمامه": "حمامة",
  "ذبابه": "ذبابة",
  "ذيب": "ذئب",
  "زرافه": "زرافة",
  "سلحفاه": "سلحفاة",
  "غزاله": "غزالة",
  "فراشه": "فراشة",
  "فقمه": "فقمة",
  "نحله": "نحلة",
  "نعامه": "نعامة",
  "نمله": "نملة",
};

export const ethoAnimals = imageAssets
  .filter((asset) => asset.section === "etho")
  .map((asset) => ({
    asset,
    name: animalDisplayNames[asset.stem] ?? asset.stem,
    aliases: [
      asset.stem,
      animalDisplayNames[asset.stem] ?? asset.stem,
      asset.stem.replaceAll("ه", "ة"),
      asset.stem === "ذيب" ? "ذئب" : "",
    ].filter(Boolean),
  }));

export const spectraAssets = imageAssets.filter(
  (asset) => asset.section === "spectra",
) as readonly ImageAsset[];

export const triadAsset = imageAssetById[triadAssetId];

export const mindsets = [
  {
    id: "right",
    label: "الصواب",
    text: "محور ضمن نموذج العقليات لدى زيزي. لا تُعرض نسب أو نتائج دون اختبار معتمد.",
  },
  {
    id: "win",
    label: "الفوز",
    text: "محور ضمن نموذج العقليات لدى زيزي. لا تُعرض نسب أو نتائج دون اختبار معتمد.",
  },
  {
    id: "comfort",
    label: "المرتاح",
    text: "محور ضمن نموذج العقليات لدى زيزي. لا تُعرض نسب أو نتائج دون اختبار معتمد.",
  },
  {
    id: "loved",
    label: "المحبوب",
    text: "محور ضمن نموذج العقليات لدى زيزي. لا تُعرض نسب أو نتائج دون اختبار معتمد.",
  },
] as const;

export const normalizeArabic = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ـ/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
