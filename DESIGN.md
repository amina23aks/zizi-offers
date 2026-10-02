# Zizi Offers - visual system

Status: initial design specification; refine through visual review. User decisions override this file.

## Direction
Quiet, thoughtful, warm and clear. A blue/green identity inspired by Zizi's original offer prototype, with soft section accents. Original colourful offer artwork supplies visual interest. Avoid noisy backgrounds, excessive glass effects and animations on every element.
Primary action: explore offers, then read approved details. Booking controls are not shown until an approved booking destination is configured.

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
Section accents: tests peach, coaching mint, courses pale rose, programs green, sessions pale blue, fingerprints pale gold, compass purple. Keep the palette varied; the site should not read as one flat blue theme.

## Layout and components
Max content width approximately 1200px. Page padding 20px mobile, 32px tablet, 48px desktop; spacing scale 4/8/12/16/24/32/48/64/96. Offer cards consistent radius around 20px, thin borders and restrained shadows. Controls around 44px minimum touch target. Do not force desktop layouts onto mobile.
Header: small home link, a few compact section links on desktop, and discreet theme control. Do not use the earlier large navbar or booking links.
Offer card: image when available, title, brief summary or bullets only when approved, known format, price, known status, and details action when a real details page exists. Cover artwork displays uncropped when it contains text. Category cards stay compact; text-heavy offer images should remain readable and can be zoomed when needed. Details pages do not show booking actions until an approved booking destination exists.

## Home
Hero title `عروض زيزي` is centered on one line without supporting copy. Section bubbles gently spread around the title once and settle on desktop and mobile using a centered coordinate system. The CTA is hidden on mobile; if shown on desktop it sits in its own space below the composition and scrolls to offer sections. Do not use a hero portrait unless a confirmed Zizi avatar is supplied; the group logo is not a portrait. Follow with the approved about text and vertically stacked offer sections, not generic category squares. No booking footer and no invented quotation attributed to Zizi.

## Tests
Sticky in-page links in this exact order: codes, etho, mindsets, spectra, triple. Horizontal scroll on mobile; anchor scroll offset accounts for header height.
Codes: four compact cards in a stable 2x2 arrangement: physical top-right A blue brain, top-left C red heart, bottom-left B green sprout, bottom-right D yellow sparkles. The card itself toggles the flip by click/tap/keyboard; no visible back/enlarge buttons on the cards.
Etho: fan carousel only, centered in its own viewport, with swipe/drag, icon-only previous/next controls, search, view-all grid, and gentle autoplay left-to-right. Pause during interaction, when hidden, and for reduced motion. Do not require traversing the whole carousel to find an animal. No separate enlarged-image panel next to the fan.
Mindsets: use the supplied `العقليات.jpg` as a general image beside the approved summaries, positive traits, attention points, and show more/less controls for الصواب، الفوز، المرتاح، المحبوب.
Spectra: animated accessible tabs for the 12 geometric images, using the original image and title only unless approved text exists.
Triple: final section title `الاختبارات النفسية للميولات السلوكية`, centered full original image الميولات-السوكيه.jpg, available badge, and confirmed individual prices only. No added description.

## Fingerprints and compass
Fingerprint: real button with animated icon and text استكشفي البصمات. Click/tap toggles a panel of 14 names. Support keyboard and aria-expanded. No human silhouette background for this section.
Compass: purple accent, compass icon, title, launch-path cover and five image cards: الفضول، السكينة، الرعاية، الاختيار، الذعر. Reference a gentle connected path on desktop and vertical sequence on mobile. No PDF, no installment text. Preserve names and imagery; no invented feeling descriptions.

## Admin
Practical interface using the same typography and tokens. Navigation: offers, categories, tests, fingerprints, compass, assets and settings. Clear list, filters and edit form. Separate publication status from availability. Individual/group variants have separate prices and optional capacities. Draft preview is visible. Before integration, clearly identify prototype saves; never present them as durable.

## Motion and performance
Prefer CSS and SVG plus Motion for selected interactions. Entrance about 250-500ms, hover about 150-200ms, flips about 450-650ms; fine-tune visually. Fingerprint may animate its stroke once on interaction. No endless shaders or automatic carousel unless explicitly approved with pause controls.
Respect prefers-reduced-motion: static hero, simple crossfade instead of flip, no decorative continuous movement. Do not hide essential content behind animation.
Responsive images, dimension/aspect metadata, lazy loading below fold. Avoid loading all full-resolution animal assets at once.

## Review acceptance
Check narrow mobile (360-390px), tablet and desktop (1280-1440px). No unintended horizontal overflow. Arabic readable, images uncropped, theme consistent, controls accessible, missing prices/status handled as agreed. Visual review of hero, tests and one offer precedes rolling the system across every page.
