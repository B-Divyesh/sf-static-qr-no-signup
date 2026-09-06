# Handoff — Static QR v1

## Review 1 status: FAIL

On **2026-09-06**, an independent review of live `https://static-qr-no-signup.sociobot.in` and a clean checkout found **6 findings and 15 untested public claims**. The product is **not accepted**. The highest-severity issue is that `/demo` is just the landing-page fallback, not the required sample-data sandbox. The claims manifest and claim tests, designed 404 page, plain-word first screen, and two earlier export-input findings also remain open. See [review 1](review-1.md) for evidence and required repairs.

Reviewed implementation candidate: `4b207d6a6cfd9dd976eb74b108f5cbb569da7f2d`. The review/report baseline was `ed7fa940b3961d75588d6eec3bee06b91136f0d9`; it contains documentation-only changes after the candidate.

## Independent verification status: PASS

On **2026-08-27**, an independent verifier rebuilt and tested commit `4b207d6a6cfd9dd976eb74b108f5cbb569da7f2d` from a fresh detached checkout and tested `https://static-qr-no-signup.sociobot.in/`.

**PASS:** all 13 repository tests, TypeScript production build, desktop/mobile axe scan, keyboard/focus/reduced-motion checks, representative generation/export/batch workflows, privacy/network inspection, live service-worker update/offline generation, security headers, caching, bundle budgets, and live deployment identity checks passed. The live files matched the rebuilt candidate byte-for-byte. See [.factory/verification.md](verification.md) for commands, exact measurements and the two low-severity follow-ups.

## What shipped

- A finished, static Vite + TypeScript QR generator at `/` with URL, Wi-Fi, vCard 3.0, iCalendar event and plain-text inputs.
- Direct static payloads with a verbatim inspector: no shortener, account, analytics, cookie, upload or runtime third-party request.
- Live QR preview, configurable L/M/Q/H error correction, 0–8 module quiet zone, foreground/background colours, and centre logo upload. Logo mode forces high error correction and is checked by the local decoder.
- Local `jsQR` verification reports whether the exact payload can be recovered from the rendered code.
- SVG, 2048 px PNG and 4 × 4 inch vector PDF export. PDF is intentionally disabled while a raster logo is present; SVG/PNG retain the logo.
- Quoted CSV parser, downloadable template, row-level validation and SVG/PNG batch ZIP generation for up to 500 valid rows. Duplicate filenames receive numeric suffixes.
- Explicit empty, validation, scan-failure, progress, offline and success states; keyboard-operable tabs and controls; responsive layout tested at 390 px.
- Offline service-worker shell, strict static-host security headers, `/privacy/` and `/terms/`, robots and sitemap files.
- Product-specific blueprint drafting-sheet design recorded in `.factory/design.md`. Original hero art was generated with the factory Azure image model; source, prompt sidecars and review are in `assets/src/`. Responsive AVIF/WebP variants ship locally (mobile AVIF: 11 KB).

## Run and verify

```sh
npm install
npm test
npm run build
npm run preview
```

Deploy command: `npm run build`. Deploy directory: `dist/` (`dist/index.html` is present).

Optional WCAG smoke test after installing Playwright Chromium and starting preview:

```sh
npx playwright install chromium
npm run test:a11y -- http://127.0.0.1:4173
```

## Verification completed on 2026-08-27

- `npm test`: 13/13 tests passed across payload construction, CSV parsing and SVG/PDF/matrix export.
- `npm run build`: passed from the checked-in lockfile; Vite output landed in `dist/`.
- Functional Playwright smoke: URL and escaped Wi-Fi payloads decoded exactly; SVG and two-file batch ZIP downloads completed; no page or console errors.
- Factory `verify-url.sh`: HTTP 200, title, `lang=en`, one `h1`, main landmark and image alt present; no console errors at desktop or 390 px.
- Axe Core WCAG 2 A/AA/2.1 AA: 0 violations at 1366 × 900 and 390 × 844.
- Lighthouse mobile: Performance **99**, Accessibility **100**, Best Practices **100**, SEO **100**. FCP 1.5 s, LCP 1.6 s, CLS 0, total blocking time 0 ms.
- Production assets: initial application JS 43.46 KB (16.60 KB gzip), CSS 18.11 KB (4.81 KB gzip). Decoder (130.83 KB raw) and ZIP engine (8.89 KB raw) are separate lazy chunks. No font payload.

## Known boundaries / next steps

- vCard and calendar import behavior varies among scanner and calendar apps. Payloads follow vCard 3.0 and RFC-style iCalendar formatting, but physical proofs should be tested on the target devices.
- The built-in check validates the digital canvas, not print conditions such as paper glare, dot gain, viewing distance or a damaged logo. The interface explicitly advises final physical testing.
- Vector PDF omits logo support and is disabled when a logo is selected; use SVG or PNG for logo-bearing codes.
- The application is intentionally free. No billing or product identifier was added.
