import {
  codeCardAssetIds,
  testCoverAssetIds,
  imageAssetById,
  imageAssets,
  triadAssetId,
  type ImageAsset,
  type ImageAssetId,
} from "@/data/assets";
import { additionalTestOffers, offers, renderPriceValue, type Availability, type Offer, type OfferPrice } from "@/data/offers";

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
    label: price.status === "free" ? "مجاني" : value === null ? "حسب الخيار" : `${value}$`,
    clarification: price.status === "unknown" ? price.clarification ?? "السعر غير محدد" : null,
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
    note: "جلسات واستشارات زيزي",
    accent: "sessions",
  },
  {
    id: "fingerprints",
    href: "/fingerprints",
    label: "البصمات",
    note: "استكشاف بصمات زيزي",
    accent: "fingerprints",
  },
  {
    id: "compass",
    href: "/compass",
    label: "بوصلة المشاعر",
    note: "مسار الانطلاق والمشاعر",
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
    intro: "",
  },
  courses: {
    title: "الدورات",
    intro: "",
  },
  programs: {
    title: "البرمجات",
    intro: "",
  },
  sessions: {
    title: "الجلسات النفسية",
    intro: "",
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

const animalAliases: Record<string, readonly string[]> = {
  "ذيب": ["ذيب", "الذيب", "ذئب", "الذئب", "ديب", "الديب"],
};

export const ethoAnimals = imageAssets
  .filter((asset) => asset.section === "etho")
  .map((asset) => ({
    asset,
    name: animalDisplayNames[asset.stem] ?? asset.stem,
    aliases: [
      asset.stem,
      animalDisplayNames[asset.stem] ?? asset.stem,
      `ال${asset.stem}`,
      ...(animalAliases[asset.stem] ?? []),
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
    summary: "يميل هذا النمط إلى الاهتمام بأن يكون على صواب، وإلى تقدير اعتراف المحيط بذكائه وقدرته على الإنجاز.",
    positives: ["القدرة على الإنجاز.", "الاستمرار في تنفيذ المهام دون كثرة التذمّر."],
    details: "قد يعطي آراء المحيط وتوقعات الأسرة وزنًا كبيرًا، أو يفضّل استشارة أشخاص خارج دائرته القريبة.",
    attention: ["الموازنة بين رأي الآخرين وقناعته الداخلية.", "التمييز بين رغباته الشخصية وتوقعات المحيط."],
  },
  {
    id: "win",
    label: "عقلية الفوز",
    summary: "يميل هذا النمط إلى السعي للفوز، ويتميّز بالشجاعة والقدرة على التواصل والإقناع.",
    positives: ["الشجاعة والمبادرة.", "مهارات التواصل والإقناع."],
    attention: ["مراجعة توافق الأفعال مع المبادئ والضمير أثناء السعي للفوز.", "الانتباه إلى الاحتفاظ بأشياء لا يحتاج إليها."],
  },
  {
    id: "comfort",
    label: "عقلية المرتاح",
    summary: "يميل هذا النمط إلى البحث عن التوازن والتصالح مع الذات، واتخاذ القرارات التي يشعر بالاقتناع والارتياح تجاهها.",
    positives: ["التعامل بهدوء ومرونة مع المواقف الصعبة.", "الحرص على الانسجام الداخلي.", "التعامل الودود وتجنّب الصدام."],
    details: "بحسب هذا الوصف، قد لا يغيّر رأيه بسهولة، ويميل إلى الاقتناع بمن يراه متوازنًا ومتصالحًا مع نفسه. وقد يستمع إلى الآخرين، ثم يختار ما يرتاح إليه.",
    attention: ["قد يتأخر في إنجاز بعض الأولويات والقرارات المهمة."],
  },
  {
    id: "loved",
    label: "عقلية المحبوب",
    summary: "يميل هذا النمط إلى الاهتمام بالقبول والعلاقات، وقد يتأثر بدرجة كبيرة بالأشخاص الذين يثق بهم.",
    positives: ["الكرم.", "المسامحة."],
    details: "بحسب هذا الوصف، يؤثر اختيار الصحبة في اتجاهاته وقراراته. وقد يستفيد من التوجيه الجيد، بينما يحتاج إلى الانتباه للتوجيه المضلّل أو الاستغلال.",
    attention: ["اختيار الصحبة بعناية ووضع حدود واضحة.", "تقوية الاستقلال في اتخاذ القرار.", "الانتباه إلى التعلّق بالمشكلات والشعور المستمر بدور الضحية."],
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
  { title: "كل عنصر منفرد", price: "500$" },
  { title: "الباقة الكاملة", price: "2500$" },
] as const;

export const freeAdditionalTests = additionalTestOffers.map((item) => ({
  ...item,
  priceLabel: formatPrice(item.price).label,
  availabilityLabel: formatAvailability(item.availability),
}));

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
    .replace(/ـ/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

export const searchableArabicForms = (value: string) => {
  const normalized = normalizeArabic(value);
  return normalized.startsWith("ال") ? [normalized, normalized.slice(2)] : [normalized];
};

export const homeSections = [
  {
    id: "tests",
    title: "الاختبارات",
    intro: "اختبارات زيزي للاستكشاف الذاتي دون أسئلة أو نتائج آلية في هذه المرحلة.",
    href: "/tests",
    accent: "tests",
    cards: [
      {
        id: "codes-home",
        title: "اختبار الأكواد الدماغية ABCD",
        href: "/tests#codes",
        priceLabel: "12$",
        availabilityLabel: "متاح",
        summary: "اختبار يساعدك على فهم نشاط الأقسام الأربعة وفق نموذج الأكواد: A للمنطق والتحليل، وB للإنجاز والتنافس، وC للعاطفة ونشاطها المتغير، وD للتواصل والخيال.",
      },
      {
        id: "etho-home",
        title: "اختبار الإيثو",
        href: "/tests#etho",
        priceLabel: "12$",
        availabilityLabel: "متاح",
        summary: "اختبار يساعدك على اكتشاف ترتيب أنماط السلوك الغريزي الفردي والاجتماعي، باستخدام تشبيهات بسلوك الحيوانات. يشمل 51 حيوانًا تُرتّب بحسب نتيجة الاختبار.",
      },
      {
        id: "mindsets-home",
        title: "اختبار العقليات",
        href: "/tests#mindsets",
        priceLabel: "12$",
        availabilityLabel: "متاح",
        summary: "يقسّم هذا الاختبار استجاباتك في المواقف غير المتوقعة إلى أربع عقليات: الصواب، والفوز، والمرتاح، والمحبوب. وتُعرض النتيجة بنسب مئوية لفهم نشاط كل منها.",
      },
      {
        id: "spectra-home",
        title: "اختبار الطيف",
        href: "/tests#spectra",
        priceLabel: "12$",
        availabilityLabel: "متاح",
        summary: "اختبار يساعدك على فهم تناسق استجاباتك المختلفة خلال الأشهر الأخيرة.",
      },
      { id: "triad-home", title: "الاختبارات النفسية للميولات السلوكية", href: "/tests#behavioral-inclinations", priceLabel: "حسب الاختبار", availabilityLabel: "متاح", summary: "مثلث الدراما، الأدوار الأربعة، والسلوك النفسي." },
    ],
  },
  {
    id: "coaching",
    title: "الكوتشينغ",
    intro: categoryPageInfo.coaching.intro,
    href: "/coaching",
    accent: "coaching",
    offers: offersByCategory("coaching"),
  },
  {
    id: "courses",
    title: "الدورات",
    intro: categoryPageInfo.courses.intro,
    href: "/courses",
    accent: "courses",
    offers: offersByCategory("courses"),
  },
  {
    id: "programs",
    title: "البرمجات",
    intro: categoryPageInfo.programs.intro,
    href: "/programs",
    accent: "programs",
    offers: offersByCategory("programs"),
  },
  {
    id: "sessions",
    title: "الجلسات النفسية",
    intro: categoryPageInfo.sessions.intro,
    href: "/sessions",
    accent: "sessions",
    offers: offersByCategory("sessions"),
  },
  {
    id: "compass",
    title: "بوصلة المشاعر",
    intro: "",
    href: "/compass",
    accent: "compass",
    cards: [
      { id: "compass-launch", title: "مسار الانطلاق", href: "/compass", availabilityLabel: "متاح", asset: compassLaunchAsset },
      ...compassCards.map((card) => ({ id: `compass-${card.id}`, title: card.title, href: "/compass", availabilityLabel: "متاح", asset: card.asset })),
    ],
  },
  {
    id: "fingerprints",
    title: "البصمات",
    intro: "",
    href: "/fingerprints",
    accent: "fingerprints",
    cards: fingerprintNames.slice(0, 8).map((name) => ({ id: `fingerprint-${name}`, title: name, href: "/fingerprints" })),
  },
] as const;
