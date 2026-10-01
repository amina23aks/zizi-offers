<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# عروض زيزي

## هدف المشروع

تجهيز تطبيق عربي RTL باسم "عروض زيزي" يعرض العروض العامة ويهيئ لاحقا لوحة إدارة. المرحلة الحالية هي تجهيز المشروع والوثائق والهيكل فقط، دون بناء كل الصفحات أو ربط خدمات خارجية.

## نطاق هذه المرحلة

- استخدام Next.js App Router مع TypeScript وTailwind CSS وESLint ومجلد `src`.
- الحفاظ على أي تعليمات أو ملفات يولدها الإطار، خصوصا كتلة Next.js أعلى هذا الملف.
- إضافة الحزم المطلوبة فقط: `motion` و`clsx` و`tailwind-merge` و`@phosphor-icons/react`.
- عدم إضافة مكتبة تقويم أو دفع أو حسابات عملاء الآن.
- عدم إنشاء أيام بدء، أو PDF للبوصلة، أو حسابات عملاء الآن.
- تشغيل الخادم والفحوص وإصلاح المشكلات المحلية ضمن نطاق العمل قبل التسليم.

## مصادر المحتوى

- اقرأ `DESIGN.md` قبل أي تعديل على الواجهة.
- اقرأ `docs/zizi-website-reference.md` قبل أي تعديل على العروض أو نصوصها أو أسعارها أو توفرها.
- قرارات مرجع المحتوى الأخيرة هي المرجع الأعلى للمحتوى عند توفر الملف الأصلي.
- لا تخترع أسعارا أو توفرا أو أوصافا أو مؤهلات.
- حافظ على صور زيزي الأصلية ولا تستبدلها بصور مولدة.
- سجل الأصول في `docs/assets-register.md`، وما لم يصل أصله يسجل "بانتظار الأصل" دون مسارات وهمية.

## قواعد العروض

- ترتيب الاختبارات: الأكواد، الإيثو، العقليات، الأطياف، الثلاثي.
- الثلاثي يعرض `الميولات-السوكيه.jpg` وشارة "متاح" فقط، دون شرح إضافي.
- السعر المجهول يظهر `00` مع توضيح أنه غير محدد؛ داخليا يكون `null` وليس سعرا مجانيا.
- التوفر المجهول بلا شارة.
- ابدأ لاحقا ببيانات محلية وخدمة بيانات قابلة للاستبدال بـ Firestore.
- لا تدع أن حفظ لوحة الإدارة دائم قبل ربطها بمصدر حفظ فعلي.

## التصميم والعمل

- اتبع `DESIGN.md` لهوية زيزي بالأزرق والأخضر، RTL، الخط العربي، الألوان، المسافات، البطاقات، الجوال، الحركة وتقليلها.
- خطط للواجهة العامة ولوحة الإدارة، لكن لا تبن تصميم الموقع الكامل قبل المراجعة.
- استخدم مهارة `design-taste-frontend` إن كانت مثبتة، مع أولوية قرارات المشروع و`DESIGN.md`. إن لم تكن مثبتة، اتبع `DESIGN.md` مباشرة.

## التحقق والأمان

- شغل `npm run lint` و`npm run build` وأي فحص أنواع مناسب للمشروع بعد التغييرات.
- شغل الخادم المحلي وتحقق من الصفحة الأولية.
- لا ترفع أسرارا، ولا تنشر خارجيا، ولا تضف خدمات مدفوعة أو ربطا خارجيا دون تعليمات محددة.
