import {
  codeCardAssetIds,
  testCoverAssetIds,
  imageAssetById,
  imageAssets,
  triadAssetId,
  type ImageAsset,
  type ImageAssetId,
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

export const formatLabel = (format: Offer["format"]) => {
  if (format === "test") return "اختبار";
  if (format === "course") return "دورة";
  if (format === "coaching") return "كوتشينغ";
  if (format === "program") return "برنامج";
  if (format === "session") return "جلسة";
  if (format === "consultation") return "استشارة";
  return "باقة";
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

export const publicCategories = [
  {
    id: "tests",
    href: "/tests",
    label: "الاختبارات",
    note: "الأكواد، الإيثو، العقليات، الأطياف، والثلاثي",
    accent: "tests",
  },
  {
    id: "coaching",
    href: "/coaching",
    label: "الكوتشينغ",
    note: "مسارات جماعية وفردية",
    accent: "coaching",
  },
  {
    id: "courses",
    href: "/courses",
    label: "الدورات",
    note: "دورات قصيرة بصورها المعتمدة",
    accent: "courses",
  },
  {
    id: "programs",
    href: "/programs",
    label: "البرمجات",
    note: "برمجات زيزي",
    accent: "programs",
  },
  {
    id: "sessions",
    href: "/sessions",
    label: "الجلسات",
    note: "جلسات واستشارات متاحة طوال السنة",
    accent: "sessions",
  },
  {
    id: "fingerprints",
    href: "/fingerprints",
    label: "البصمات",
    note: "أسماء البصمات فقط الآن",
    accent: "fingerprints",
  },
  {
    id: "compass",
    href: "/compass",
    label: "بوصلة المشاعر",
    note: "مسار الانطلاق وخمس بطاقات",
    accent: "compass",
  },
] as const;

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

export const categoryLinks = publicCategories;

export const ziziAbout = {
  heading: "زيزي — أخصائية ومحلّلة نفسية",
  body:
    "تقدّم جلسات علاجية، وبرامج كوتشينغ، ودورات، وطوّرت اختبارات لاستكشاف الذات وأنماط التفكير والسلوك. تهتم بالتفاصيل التي قد تغيب عن الآخرين، وتفتح من خلالها مساحة أعمق لفهم النفس والمشاعر.",
} as const;

export const offersByCategory = (category: Offer["category"]) =>
  offers
    .filter((offer) => offer.category === category)
    .map((offer) => toDisplayOffer(offer));

export const categoryPageInfo = {
  coaching: {
    title: "الكوتشينغ",
    intro: "مسارات كوتشينغ جماعية وفردية حسب المعلومات المتاحة لكل عرض.",
  },
  courses: {
    title: "الدورات",
    intro: "دورات زيزي القصيرة بصورها المعتمدة وأسعارها المعروفة.",
  },
  programs: {
    title: "البرمجات",
    intro: "برمجات زيزي المتاحة للعرض هنا دون إضافة مواعيد أو وعود غير مؤكدة.",
  },
  sessions: {
    title: "الجلسات والاستشارات",
    intro: "جلسات واستشارات متاحة طوال السنة حسب القائمة المعتمدة.",
  },
} as const;

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

export const mindsetCoverAsset = getAsset(testCoverAssetIds.mindsets);

export const mindsets = [
  {
    id: "right",
    label: "عقلية الصواب",
    text: "",
  },
  {
    id: "win",
    label: "عقلية الفوز",
    text: "",
  },
  {
    id: "comfort",
    label: "عقلية المرتاح",
    text: "",
  },
  {
    id: "loved",
    label: "عقلية المحبوب",
    text: "",
  },
] as const;

export const compassLaunchAsset = getAsset("compass:الانطلاق");

export const compassCards = [
  { id: "curiosity", title: "الفضول", assetId: "compass:الفضول" },
  { id: "stillness", title: "السكينة", assetId: "compass:السكينة" },
  { id: "care", title: "الرعاية", assetId: "compass:الرعاية" },
  { id: "choice", title: "الاختيار", assetId: "compass:الاختيار" },
  { id: "panic", title: "الذعر", assetId: "compass:الذعر" },
].map((item) => ({
  ...item,
  asset: getAsset(item.assetId as ImageAssetId)!,
})) as readonly {
  id: string;
  title: string;
  assetId: ImageAssetId;
  asset: ImageAsset;
}[];

export const compassPricing = [
  { title: "كل عنصر منفرد", price: "500 USD" },
  { title: "الباقة الكاملة", price: "2500 USD" },
] as const;

export const fingerprintNames = [
  "الأذن",
  "الوجه",
  "الحرارية",
  "الكهربائية",
  "الاسم",
  "التجاعيد",
  "الساعد",
  "المودرا",
  "الأكل",
  "الأسنان",
  "الرجل",
  "الصوت",
  "الأظافر",
  "الدهون المخزنة",
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
