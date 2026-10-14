# Telegram compatibility audit - 14 October 2026

## Scope and release

The owner reports that the bot menu already opens the website. The final instruction authorizes production after review and checks, superseding the earlier Preview-only wording. No bot credentials, customer authentication, messaging backend, payments, Firebase authorization changes, or live catalogue writes are included.

## Findings and fixes

- Existing feature commit `0af16b8` adds a circular top-right zoom affordance and an image-only accessible button to homepage test cards, reusing the shared viewer and the current published dashboard image. Details remain separate links; cards without images have no zoom button.
- Fixed the later-loaded `focused-refinements.css` overriding the requested mobile bubble adjustment. Sessions and fingerprints now move 10px inward and 10px downward from the prior effective coordinates. The existing title adjustment is 10.4px downward; desktop rules and other bubbles are unchanged.
- Fixed the mobile viewer toolbar's RTL translation: it previously extended off the left edge. It is now centered and its controls remain visible. Close and zoom controls respect CSS device safe-area insets.
- Cleared pointer tracking on release/cancel, prevented native image dragging, and allowed keyboard activation after a cancelled swipe without weakening pointer drag suppression.
- Removed the requested homepage tests introduction without replacement copy.

## Browser and data verification

Local browser used the actual published Firestore reader in read-only mode. Five test-card image triggers were rendered. The viewer URL matched the selected saved image URL. Chromium checks passed at 320, 360, 390 and 1440px: no document overflow or settled hero overlap. Tested image-body and icon activation, zoom in/out, close/Escape, focus return, keyboard activation after a cancelled pointer gesture, carousel scrolling without opening, details anchor navigation, site Back, and signed-out admin redirect. No page errors were observed. Screenshots and browser scripts are in ignored `.verification/`.

The first browser run exposed the RTL toolbar problem; its offscreen controls were also intercepted by the Next.js development indicator. The corrected run succeeded. Hero geometry is measured after its entrance animation settles.

Public catalogue fixture tests passed (26), including saved homepage data and specialized test isolation. `/tests` source and its approved content were not changed; its shared image viewer receives only the toolbar fix.

## Telegram-specific limits

The existing four assistant links retain their approved HTTPS `t.me` destinations and normal anchor fallback. A browser stub exercises the optional `Telegram.WebApp.openTelegramLink` branch only. The site does not load the Telegram SDK, so this optional branch is not evidence that a real Telegram bridge is initialized. There is no newly added native Telegram BackButton integration; existing site navigation is preserved.

Actual iOS/Android Telegram tests remain required for bot-menu launch, collapsed/expanded viewport, notch/home-indicator and Telegram chrome spacing, native Back/close behavior, touch carousel swipes, pinch/pan, and opening each assistant chat. CSS device insets are not proof of Telegram content-safe-area support in native fullscreen. No native fullscreen expansion was added. No real Telegram-device verification is claimed.

Reference: https://core.telegram.org/bots/webapps (viewport, safe-area, BackButton and openTelegramLink API).

Final checks: lint, standalone TypeScript check and final production build passed. The three Playwright compatibility checks passed after correcting the drag test to travel 50px (the old fixed endpoint moved only about 6px, below the intentional 8px threshold). Chromium touch emulation confirmed drag suppression; a fresh page confirmed touch tap/zoom/close and dark mode. This does not validate Telegram gestures or a real device. No Firebase writes were performed.
