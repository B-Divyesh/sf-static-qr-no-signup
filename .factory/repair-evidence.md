# Repair evidence — 2026-09-06

## Candidate and deployment

- Runtime implementation candidate: `ba5173df3237a0a557ab81dec8ade6dd3c6d2896`.
- The candidate was built to `dist/`, deployed to `https://static-qr-no-signup.sociobot.in`, and checked cold over HTTPS.
- The deployed `index.html` SHA-256 was `50feb770564018bc9b45f058a4a071dd196b491ac008c52563a650a9c2c1609b`; it exactly matched the built file. The deployed `sw.js` SHA-256 was `8c7dcfde6484a858f9647e3a173dfe7322d445a46e9ab1a75f87950b46146f0e`; it also exactly matched the built file.

## Review disposition

| Earlier finding | Current disposition |
| --- | --- |
| One-click sample sandbox absent | Fixed. `/demo` seeds the completed North Pier Coffee menu QR, stores only `demo:static-qr:active` in session storage, has a persistent banner, Reset demo, and Start for real. `demo.md` documents the boundary. |
| Claims manifest and evidence absent | Fixed. `.factory/claims.json` has 18 public claims. Every entry has one tagged Playwright outcome test and a runnable command. |
| Slogan first screen and missing copy audit | Fixed. The root h1 is “Create a direct QR code”; it names the audience and leads with “Try it with sample data.” Legal h1s are plain. `copy-audit.md` records sentence counts. |
| Designed 404 absent | Fixed. `404.html` is built in the blueprint system; Static Web Apps returns it with HTTP 404. |
| SVG logo picker mismatch | Fixed. The chooser advertises and accepts `image/svg+xml`; an SVG logo test produces a high-correction, decoder-verified QR. |
| PDF size label mismatched output | Fixed. The generated PDF now has `/MediaBox [0 0 288 288]`, exactly 4 × 4 inches. |

## Verification

- Final clean checkout: cloned candidate `ba5173d` into `/tmp/static-qr-clean-ba5173d`; `npm ci` completed with 0 vulnerabilities, `npm test` passed 13/13, and `npm run build` passed.
- Every one of the 18 `test` commands in `claims.json` ran from that clean checkout and passed. They cover the demo, free/account flow, local/no-upload processing, direct payload, five types, SVG/PNG/PDF exports, logo verification, 500-file SVG batch, 1024 px batch PNG, offline reload, cookies, analytics, third-party runtime requests, retention, and local storage.
- The final workspace browser suite passed 23/23. It additionally covers invalid URL and event recovery, the 1,200-character text boundary, mixed valid/invalid CSV recovery, arrow-key tabs, and reduced motion.
- `npm run test:a11y -- http://127.0.0.1:4173` passed with 0 axe violations at desktop and phone widths for `/`, `/demo`, `/privacy/`, `/terms/`, and `/404.html`. It also checked one h1, title, lang, main, image alt, overflow, and console errors.
- `/opt/fleet/lib/verify-url.sh` on the live origin found HTTP 200, title, `lang=en`, one h1, main, image alt, 0 unlabeled buttons, and no console errors. A live `/does-not-exist` request returned HTTP 404 with “Page not found — Static QR.”
- Fresh live desktop (1366 × 900) and phone (390 × 844) contexts loaded at `scrollY=0`. Before scrolling they showed the job, audience, and “Try it with sample data.” The one-click demo showed the completed payload, banner, reset/exit controls, and no external request or console error; Start for real returned to an empty real URL field.
- Lighthouse mobile report: Performance 98, Accessibility 100, Best Practices 100, SEO 100; FCP 1.6 s, LCP 1.6 s, TBT 110 ms, CLS 0. The report JSON was written, but the Lighthouse process exited nonzero after a Chrome full-page-screenshot tab crash; treat the metrics as captured evidence, not a clean tool exit.

## Scope boundaries

This is a static browser application with no backend, tenant model, persistence service, health endpoint, or paid offer. Backend-only isolation, restart, and rate-limit checks do not apply. Device-specific Wi-Fi/vCard/calendar handling and physical print conditions still need testing on the intended scanners and stock.
