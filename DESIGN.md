# Zizi Offers - visual system

Status: initial design specification; refine through visual review. User decisions override this file.

## Direction
Quiet, thoughtful, warm and clear. A blue/green identity inspired by Zizi's original offer prototype, with soft section accents. Original colourful offer artwork supplies visual interest. Avoid noisy backgrounds, excessive glass effects and animations on every element.
Primary action: explore offers, then read details and book via the configured link.

## Language and typography
Arabic first: html lang=ar and dir=rtl. Use Cairo for interface and headings, with an Arabic system fallback. Use a small consistent weight set. Body 16-18px, comfortable line-height around 1.7; headings have tighter spacing. Hero size responds to viewport without clipping. Limit text line length. Mixed filenames, prices and Latin labels use explicit bidi isolation when needed.

## Colour tokens
| Token | Light | Dark |
|---|---|---|
| Background | #F6FAF8 | #0F172A |
| Surface | #FFFFFF | #172632 |
| Main text | #17343B | #F1F5F9 |
| Secondary text | #52666D | #B8C9D1 |
| Brand blue | #2563EB | #86B6FF |
| Brand green | #16A34A | #79D5A6 |

These are starting values; verify contrast in rendered controls. Do not use green body text on white without checking contrast. Primary buttons have dark readable labels or a tested blue/white combination. Gradients are decorative halos and short accents, not long text backgrounds.
Codes: A blue, B green, C coral, D yellow. Use light tints for card surfaces and dark foregrounds; labels and icons communicate meaning independently of colour.
Section accents: tests icy blue, coaching soft lavender, programs sage, courses turquoise, sessions blue-grey, compass turquoise with subtle lavender.

## Layout and components
Max content width approximately 1200px. Page padding 20px mobile, 32px tablet, 48px desktop; spacing scale 4/8/12/16/24/32/48/64/96. Offer cards consistent radius around 20px, thin borders and restrained shadows. Controls around 44px minimum touch target. Do not force desktop layouts onto mobile.
Header: home, explore offers, about, booking, theme control; sections within the explore menu. A clear mobile menu with close action and focus management.
Offer card: image, title, brief summary, known duration/format, price, known status, details action. Cover artwork displays uncropped when it contains text. Details page has a shareable URL and clear booking action.

## Home
Hero title عروض زيزي with supporting line مساحة للتأمل في ذاتك، وفهم أنماطك، واختيار خطوتك التالية and primary explore action. Desktop section links gently spread from centre once and settle; mobile displays an orderly grid. Keep title and actions readable without animation. Follow with about preview, exploration sections, service previews and booking footer. No invented quotation attributed to Zizi.

## Tests
Sticky in-page links in this exact order: codes, etho, mindsets, spectra, triple. Horizontal scroll on mobile; anchor scroll offset accounts for header height.
Codes: four cards, front icon/letter/name/summary, back original A/B/C/D image. Explicit reveal/back actions and zoom. Place long copy below cards. Hide inactive faces from interaction and assistive technology.
Etho: swipeable carousel, previous/next controls, search and view-all grid for 51 animals. Do not require traversing the whole carousel to find an animal. No automatic motion by default.
Mindsets: four tabs for الصواب، الفوز، المرتاح، المحبوب with readable text.
Spectra: carousel plus grid alternative for 12 geometric images.
Triple: title, full original image الميولات-السوكيه.jpg, available badge and optional image zoom. No added description.

## Fingerprints and compass
Fingerprint: real button with animated icon and text استكشفي البصمات. Click/tap toggles a panel of 14 names. Support keyboard and aria-expanded. No human silhouette background for this section.
Compass: compass icon, title, launch-path cover and five image cards: الفضول، السكينة، الرعاية، الاختيار، الذعر. Reference a gentle connected path on desktop and vertical sequence on mobile. No PDF. Preserve names and imagery; no invented feeling descriptions.

## Admin
Practical interface using the same typography and tokens. Navigation: offers, categories, tests, fingerprints, compass, assets and settings. Clear list, filters and edit form. Separate publication status from availability. Individual/group variants have separate prices and optional capacities. Draft preview is visible. Before integration, clearly identify prototype saves; never present them as durable.

## Motion and performance
Prefer CSS and SVG plus Motion for selected interactions. Entrance about 250-500ms, hover about 150-200ms, flips about 450-650ms; fine-tune visually. Fingerprint may animate its stroke once on interaction. No endless shaders or automatic carousel unless explicitly approved with pause controls.
Respect prefers-reduced-motion: static hero, simple crossfade instead of flip, no decorative continuous movement. Do not hide essential content behind animation.
Responsive images, dimension/aspect metadata, lazy loading below fold. Avoid loading all full-resolution animal assets at once.

## Review acceptance
Check narrow mobile (360-390px), tablet and desktop (1280-1440px). No unintended horizontal overflow. Arabic readable, images uncropped, theme consistent, controls accessible, missing prices/status handled as agreed. Visual review of hero, tests and one offer precedes rolling the system across every page.
