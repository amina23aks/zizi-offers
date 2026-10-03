import { coachingAssetIds, type ImageAssetId } from "./assets";

export type OfferCategory =
  | "tests"
  | "coaching"
  | "programs"
  | "courses"
  | "sessions"
  | "compass";

export type Availability =
  | "available"
  | "unavailable"
  | "completed"
  | "unknown";

export type PriceStatus = "known" | "unknown" | "variant" | "free";

export type OfferFormat =
  | "test"
  | "course"
  | "coaching"
  | "program"
  | "session"
  | "consultation"
  | "package";

export type OfferPrice = {
  amountUsd: number | null;
  status: PriceStatus;
  displayWhenUnknown?: "00";
  clarification?: string;
};

export type OfferVariant = {
  id: string;
  title: string;
  price: OfferPrice;
  availability?: Availability;
  note?: string;
};

export type Offer = {
  id: string;
  slug: string;
  title: string;
  category: OfferCategory;
  format: OfferFormat;
  price: OfferPrice;
  availability: Availability;
  summary?: string;
  bullets?: readonly string[];
  programDuration?: string;
  sessionDuration?: string;
  totalTrainingDuration?: string;
  capacity?: string;
  priceBasis?: string;
  assetId?: ImageAssetId | null;
  variants?: readonly OfferVariant[];
  source: string;
  internalNotes?: string;
  availableThroughoutYear?: boolean;
};

export const unknownPrice = {
  amountUsd: null,
  status: "unknown",
  displayWhenUnknown: "00",
  clarification: "السعر غير محدد",
} as const satisfies OfferPrice;

const usd = (amountUsd: number) =>
  ({
    amountUsd,
    status: "known",
  }) as const satisfies OfferPrice;

const freePrice = {
  amountUsd: 0,
  status: "free",
} as const satisfies OfferPrice;

export const testOrder = [
  "codes-abcd",
  "etho",
  "mindsets",
  "geometric-spectra",
  "triple-test",
] as const;

export const offers = [
  {
    id: "codes-abcd",
    slug: "codes-abcd",
    title: "الأكواد ABCD",
    category: "tests",
    format: "test",
    price: usd(12),
    availability: "available",
    summary:
      "اختبار يستكشف ميولك بين الموضوعية والمنطق، التنفيذ والإنجاز، المشاعر والأحاسيس، والإبداع والابتكار ضمن نموذج زيزي.",
    source: "docs/zizi-website-reference.md",
    internalNotes:
      "Approved tests order: codes first. Uses code card backs A/B/C/D from public/assets/codes.",
  },
  {
    id: "etho",
    slug: "etho",
    title: "الإيثو",
    category: "tests",
    format: "test",
    price: usd(12),
    availability: "available",
    source: "docs/zizi-website-reference.md",
    internalNotes:
      "51 animal images are patterns inside one test, not separate paid products.",
  },
  {
    id: "mindsets",
    slug: "mindsets",
    title: "العقليات",
    category: "tests",
    format: "test",
    price: usd(12),
    availability: "available",
    source: "docs/zizi-website-reference.md",
    internalNotes:
      "Individual images are optional; text tabs may be used for الصواب، الفوز، المرتاح، المحبوب.",
  },
  {
    id: "geometric-spectra",
    slug: "geometric-spectra",
    title: "اختبار الطيف",
    category: "tests",
    format: "test",
    price: usd(12),
    availability: "available",
    summary: "اختبار يساعدك على فهم تناسق استجاباتك المختلفة خلال الأشهر الأخيرة.",
    source: "docs/zizi-website-reference.md",
  },
  {
    id: "triple-test",
    slug: "triple-test",
    title: "الاختبار الثلاثي",
    category: "tests",
    format: "test",
    price: {
      amountUsd: null,
      status: "variant",
    },
    availability: "available",
    assetId: "triad:الميولات-السوكيه",
    variants: [
      { id: "drama-triangle", title: "مثلث الدراما", price: usd(30), note: "المضطهد، المنقذ، الضحية" },
      { id: "four-roles", title: "تشخيص الأدوار الأربعة", price: usd(30), note: "سلبي، عدواني، متلاعب، معتد بنفسه" },
      { id: "psychological-behavior", title: "السلوك النفسي", price: usd(60), note: "النفس الطفل، النفس المراهق، النفس الأبوية" },
    ],
    source: "docs/zizi-website-reference.md",
    internalNotes:
      "Current UI displays full image and available badge only; no added explanatory text.",
  },
  {
    id: "professional-communication-team-10",
    slug: "professional-communication-team-10",
    title: "التواصل الاحترافي",
    category: "coaching",
    format: "coaching",
    price: {
      amountUsd: null,
      status: "variant",
    },
    availability: "available",
    assetId: coachingAssetIds.communicationPlan,
    variants: [
      { id: "individual", title: "فردي", price: usd(1000), availability: "available" },
      { id: "group", title: "جماعي", price: usd(100), availability: "unavailable" },
    ],
    programDuration: "شهر واحد",
    sessionDuration: "ساعتان",
    capacity: "10 مشاركين",
    source: "docs/zizi-website-reference.md",
  },
  {
    id: "professional-communication-level-2",
    slug: "professional-communication-level-2",
    title: "التواصل الاحترافي - المستوى الثاني",
    category: "coaching",
    format: "coaching",
    price: {
      amountUsd: null,
      status: "variant",
    },
    availability: "unavailable",
    assetId: coachingAssetIds.communicationPlan,
    variants: [
      { id: "individual", title: "فردي", price: usd(1000), availability: "unavailable" },
      { id: "group", title: "جماعي", price: usd(100), availability: "unavailable" },
    ],
    programDuration: "شهر واحد",
    sessionDuration: "ساعتان",
    source: "docs/zizi-website-reference.md",
    internalNotes:
      "Reference says group price wording is ambiguous; do not publish a resolved per-seat price.",
  },
  {
    id: "values-coaching",
    slug: "values-coaching",
    title: "القيم",
    category: "coaching",
    format: "coaching",
    price: usd(100),
    availability: "unknown",
    assetId: coachingAssetIds.values,
    bullets: ["استكشاف القيم الأساسية", "ربط القيم بالقرارات والعلاقات"],
    source: "docs/zizi-website-reference.md",
    internalNotes: "Price still marked as needing confirmation in the reference.",
  },
  {
    id: "emotional-communication",
    slug: "emotional-communication",
    title: "التواصل العاطفي",
    category: "coaching",
    format: "coaching",
    price: usd(100),
    availability: "available",
    assetId: coachingAssetIds.emotionalCommunication,
    bullets: ["إدارة الضغوط", "إدارة النزاعات", "الحدود الصحية", "الحدود العاطفية"],
    capacity: "10 مشاركين",
    priceBasis: "لكل مقعد",
    source: "docs/zizi-website-reference.md",
  },
  {
    id: "body-language-basics-coaching",
    slug: "body-language-basics-coaching",
    title: "أساسيات لغة الجسد",
    category: "coaching",
    format: "coaching",
    price: {
      amountUsd: null,
      status: "variant",
    },
    availability: "unknown",
    assetId: coachingAssetIds.bodyPlan,
    variants: [
      { id: "individual", title: "فردي", price: usd(1000), availability: "available" },
      { id: "group", title: "جماعي", price: usd(100), availability: "unavailable" },
    ],
    totalTrainingDuration: "8 ساعات غير متواصلة",
    capacity: "10 مشاركين",
    source: "docs/zizi-website-reference.md",
  },
  {
    id: "release-coaching",
    slug: "release-coaching",
    title: "الكوتشينغ التفريغي",
    category: "coaching",
    format: "coaching",
    price: unknownPrice,
    availability: "unknown",
    assetId: coachingAssetIds.release,
    source: "docs/zizi-website-reference.md",
  },
  {
    id: "life-coaching",
    slug: "life-coaching",
    title: "لايف كوتشينغ",
    category: "coaching",
    format: "coaching",
    price: {
      amountUsd: null,
      status: "variant",
    },
    availability: "unknown",
    assetId: coachingAssetIds.lifePlan,
    variants: [
      { id: "two-months", title: "شهران", price: usd(4000) },
      { id: "four-months", title: "أربعة أشهر", price: usd(6000) },
      { id: "six-months", title: "ستة أشهر", price: usd(8000) },
    ],
    sessionDuration: "ساعتان",
    source: "latest owner corrections",
  },
  {
    id: "business-coaching",
    slug: "business-coaching",
    title: "كوتشينغ بزنس",
    category: "coaching",
    format: "coaching",
    price: {
      amountUsd: null,
      status: "variant",
    },
    availability: "unknown",
    assetId: coachingAssetIds.businessPlan,
    variants: [
      { id: "individual-one-month", title: "فردي - شهر", price: usd(1000), availability: "available" },
      { id: "individual-two-months", title: "فردي - شهران", price: usd(2000), availability: "available" },
      { id: "group-one-month", title: "جماعي - شهر", price: usd(100), availability: "unavailable" },
      { id: "group-two-months", title: "جماعي - شهران", price: usd(200), availability: "unavailable" },
    ],
    sessionDuration: "ساعتان",
    capacity: "10 مشاركين",
    source: "latest owner corrections",
  },
  {
    id: "work-field-entry",
    slug: "work-field-entry",
    title: "الولوج لميدان العمل",
    category: "coaching",
    format: "coaching",
    price: { ...unknownPrice, clarification: "السعر غير محدد بعد" },
    availability: "unknown",
    assetId: coachingAssetIds.workPlan,
    variants: [
      { id: "individual", title: "فردي", price: { ...unknownPrice, clarification: "السعر غير محدد بعد" } },
    ],
    programDuration: "شهر واحد",
    sessionDuration: "ساعتان",
    source: "latest owner corrections",
  },
  {
    id: "under-12-coaching",
    slug: "under-12-coaching",
    title: "كوتشينغ أقل من 12 سنة",
    category: "coaching",
    format: "coaching",
    price: usd(313),
    availability: "unknown",
    programDuration: "شهر واحد",
    sessionDuration: "ساعتان",
    source: "latest owner corrections",
  },
  {
    id: "arrow-program",
    slug: "arrow-program",
    title: "السهم",
    category: "programs",
    format: "program",
    price: usd(63),
    availability: "available",
    assetId: "programs:السهم",
    source: "docs/zizi-website-reference.md",
  },
  {
    id: "subconscious-program",
    slug: "subconscious-program",
    title: "اللاوعي",
    category: "programs",
    format: "program",
    price: usd(63),
    availability: "available",
    assetId: "programs:لاواعي",
    source: "docs/zizi-website-reference.md",
  },
  {
    id: "body-language-program-team-2",
    slug: "body-language-program-team-2",
    title: "لغة الجسد - تيم 2",
    category: "programs",
    format: "program",
    price: usd(63),
    availability: "available",
    assetId: "programs:برمجه-الجسد",
    source: "docs/zizi-website-reference.md",
  },
  {
    id: "inner-child-2",
    slug: "inner-child-2",
    title: "الطفل الداخلي 2",
    category: "programs",
    format: "program",
    price: usd(33),
    availability: "available",
    assetId: "programs:الطفل",
    source: "docs/zizi-website-reference.md",
  },
  {
    id: "nervousness-program",
    slug: "nervousness-program",
    title: "العصبية",
    category: "programs",
    format: "program",
    price: usd(40),
    availability: "unknown",
    assetId: "programs:العصبية",
    source: "docs/zizi-website-reference.md",
  },
  {
    id: "psychological-program",
    slug: "psychological-program",
    title: "النفسية",
    category: "programs",
    format: "program",
    price: usd(51),
    availability: "unknown",
    assetId: "programs:النفسيه",
    source: "docs/zizi-website-reference.md",
  },
  {
    id: "spy-2024",
    slug: "spy-2024",
    title: "اسباي 2024",
    category: "programs",
    format: "program",
    price: usd(63),
    availability: "unknown",
    assetId: "programs:spa",
    source: "docs/zizi-website-reference.md",
    internalNotes: "Name and relationship to SPA/SPi still need confirmation.",
  },
  {
    id: "body-language-program-team-1",
    slug: "body-language-program-team-1",
    title: "لغة الجسد - تيم 1",
    category: "programs",
    format: "program",
    price: usd(63),
    availability: "completed",
    assetId: "programs:برمجه-الجسد",
    source: "docs/zizi-website-reference.md",
  },
  {
    id: "spa-2",
    slug: "spa-2",
    title: "اسبا 2",
    category: "programs",
    format: "program",
    price: usd(63),
    availability: "unavailable",
    assetId: "programs:spa",
    source: "docs/zizi-website-reference.md",
  },
  {
    id: "inner-child-1",
    slug: "inner-child-1",
    title: "الطفل الداخلي 1",
    category: "programs",
    format: "program",
    price: usd(33),
    availability: "unavailable",
    assetId: "programs:الطفل",
    source: "docs/zizi-website-reference.md",
  },
  {
    id: "linguistic-program-team-1",
    slug: "linguistic-program-team-1",
    title: "اللغوية - تيم 1",
    category: "programs",
    format: "program",
    price: usd(63),
    availability: "unavailable",
    assetId: "programs:اللغويه",
    source: "docs/zizi-website-reference.md",
  },
  {
    id: "teen-psychology-team-1",
    slug: "teen-psychology-team-1",
    title: "سيكولوجية المراهق - تيم 1",
    category: "programs",
    format: "program",
    price: usd(50),
    availability: "available",
    assetId: "programs:المراهق",
    source: "docs/zizi-website-reference.md",
  },
  {
    id: "spi-1",
    slug: "spi-1",
    title: "SPi 1",
    category: "programs",
    format: "program",
    price: usd(63),
    availability: "unavailable",
    assetId: "programs:spi-avtar",
    source: "docs/zizi-website-reference.md",
  },
  {
    id: "religious-program",
    slug: "religious-program",
    title: "الدينية",
    category: "programs",
    format: "program",
    price: usd(29),
    availability: "unavailable",
    assetId: "programs:الدينيه",
    source: "docs/zizi-website-reference.md",
  },
  {
    id: "body-language-course",
    slug: "body-language-course",
    title: "دورة تعلم تحليل لغة الجسد مستوى 1",
    category: "courses",
    format: "course",
    price: usd(20),
    availability: "available",
    assetId: "courses:دورة-الجسد",
    source: "docs/zizi-website-reference.md",
  },
  {
    id: "handwriting-analysis",
    slug: "handwriting-analysis",
    title: "دورة تعلم تحليل الخط (علم الجرافولوجي)",
    category: "courses",
    format: "course",
    price: usd(20),
    availability: "available",
    assetId: "courses:الخط",
    source: "docs/zizi-website-reference.md",
  },
  {
    id: "marriage-intro",
    slug: "marriage-intro",
    title: "مقدمة عن الزواج",
    category: "courses",
    format: "course",
    price: usd(20),
    availability: "available",
    assetId: "courses:مقدمة-الزواج",
    source: "docs/zizi-website-reference.md",
  },
  {
    id: "major-selection",
    slug: "major-selection",
    title: "دورة اختيار التخصص",
    category: "courses",
    format: "course",
    price: usd(20),
    availability: "available",
    assetId: "courses:التخصص",
    source: "docs/zizi-website-reference.md",
  },
  {
    id: "right-question",
    slug: "right-question",
    title: "السؤال الصح في الوقت الصح",
    category: "courses",
    format: "course",
    price: usd(20),
    availability: "available",
    assetId: "courses:السؤال-الصح",
    source: "docs/zizi-website-reference.md",
  },
  {
    id: "psynutri",
    slug: "psynutri",
    title: "PsyNutri - التغذية النفسية",
    category: "courses",
    format: "course",
    price: usd(20),
    availability: "unknown",
    assetId: "courses:التغذية",
    source: "docs/zizi-website-reference.md",
  },
  {
    id: "getting-to-know",
    slug: "getting-to-know",
    title: "دورة تعرف كيف تتعارف 0",
    category: "courses",
    format: "course",
    price: usd(20),
    availability: "available",
    assetId: "courses:التعرف",
    source: "docs/zizi-website-reference.md",
  },
  {
    id: "compatibility-or-separation",
    slug: "compatibility-or-separation",
    title: "دورة التوافق أو التفارق -1",
    category: "courses",
    format: "course",
    price: usd(20),
    availability: "unknown",
    assetId: "courses:التوافق",
    source: "docs/zizi-website-reference.md",
  },
  {
    id: "diagnostic-session",
    slug: "diagnostic-session",
    title: "جلسة تشخيص",
    category: "sessions",
    format: "session",
    price: usd(95),
    availability: "available",
    availableThroughoutYear: true,
    source: "Stage 2 supplied sessions price list",
  },
  {
    id: "therapeutic-session",
    slug: "therapeutic-session",
    title: "جلسة علاجية",
    category: "sessions",
    format: "session",
    price: usd(95),
    availability: "available",
    availableThroughoutYear: true,
    source: "Stage 2 supplied sessions price list",
  },
  {
    id: "self-reconciliation-program",
    slug: "self-reconciliation-program",
    title: "برنامج التصالح مع الذات",
    category: "sessions",
    format: "program",
    price: usd(475),
    availability: "available",
    availableThroughoutYear: true,
    source: "Stage 2 supplied sessions price list",
    internalNotes: "Program-format offer inside the sessions/consultations catalogue.",
  },
  {
    id: "consultation-session",
    slug: "consultation-session",
    title: "جلسة استشارية",
    category: "sessions",
    format: "consultation",
    price: usd(40),
    availability: "unavailable",
    availableThroughoutYear: true,
    source: "Stage 2 supplied sessions price list",
  },
  {
    id: "negative-emotions-release-session",
    slug: "negative-emotions-release-session",
    title: "جلسة طرد المشاعر السلبية (تمرين تنظيفي)",
    category: "sessions",
    format: "session",
    price: usd(95),
    availability: "available",
    availableThroughoutYear: true,
    source: "Stage 2 supplied sessions price list",
    internalNotes: "Subtitle from source: تمرين تنظيفي.",
  },
  {
    id: "energy-renewal-session",
    slug: "energy-renewal-session",
    title: "جلسة تجديد طاقة (تنويم)",
    category: "sessions",
    format: "session",
    price: usd(150),
    availability: "available",
    availableThroughoutYear: true,
    source: "Stage 2 supplied sessions price list",
    internalNotes: "Subtitle from source: تنويم.",
  },
] as const satisfies readonly Offer[];

export const additionalTestOffers = [
  {
    id: "multiple-intelligences",
    title: "أنواع الذكاءات",
    price: freePrice,
    availability: "available" as const,
  },
  {
    id: "colors-test",
    title: "اختبار الألوان",
    price: freePrice,
    availability: "available" as const,
  },
  {
    id: "formative-geometry-test",
    title: "اختبار هندسات تشكيلية",
    price: freePrice,
    availability: "available" as const,
  },
] as const;

export const sessionPriceListSourceAssetId = null as ImageAssetId | null;

export const displayableAvailability = (availability: Availability) =>
  availability === "unknown" ? null : availability;

export const renderPriceValue = (price: OfferPrice) =>
  price.status === "unknown" ? "00" : price.amountUsd?.toString() ?? null;
