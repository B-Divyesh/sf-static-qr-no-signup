# Repair 2 evidence — 2026-09-06

## Candidate and deployment

- Runtime implementation SHA: `5046c607ef36aa628e432251c48904c25cd37632`.
- Copy-audit documentation SHA: `bf01fd1e05a6d39dfdc20b0e4fdc8fb60d67b297`.
- Product: `sf-static-qr-no-signup`, deployed only to its existing Azure Static Web App.
- Live URL: https://static-qr-no-signup.sociobot.in
- The live and built `index.html` SHA-256 values both equal `88ce485d0c0d210e5b02c7adb65b8106a958774aaebb5c91f19870168fdc98f3`.
- The live and built `sw.js` SHA-256 values both equal `fabdd52174621becd5ef31cd5ecf0858f22e890a93a82f8bba3c1100a96d113e`.

## Strict review 2 findings

### Phone touch targets

The wordmark, demo controls, help button, range input, checkbox, legal contact, footer links, and all navigation targets now render at least 44 × 44 CSS px. The real CSV file input fills its visible drop zone and shows a focus outline on the zone. Navigation remains available as a compact second row on phone and tablet widths, so Batch CSV is reachable without a hidden desktop control.

An outcome browser test measures every visible `a`, `button`, `input`, `select`, `textarea`, and `summary` across the demo, open drawing controls, URL, Wi-Fi, vCard with postal fields, event, text, batch, privacy, terms, and 404 states at 390 × 844. It fails with the target label and measured box if either dimension is below 44 px.

The same audit ran against the deployed product. Every state reported a minimum width and height of 44 CSS px. It covered 29 targets in the demo URL editor, 32 in Wi-Fi, 41 in expanded vCard, 33 in event, 29 in text, 35 in batch, and 8–10 on each legal or 404 route.

### Batch claim coverage

`.factory/claims.json` now contains 23 entries and `tests/claims.spec.ts` contains exactly 23 unique matching `@claim:` tags. The five added outcome tests prove that:

- the downloaded template imports without errors and builds the five expected QR files;
- a real dropped `File` follows the drop handler and produces the expected ZIP;
- quoted commas and escaped quotes survive import, ZIP generation, PNG rendering, and QR decoding;
- an invalid row is named before generation and excluded from the downloaded ZIP; and
- every documented URL, Wi-Fi, vCard, event, and text column reaches the decoded QR payload.

The tests inspect downloaded artifacts rather than source strings or control presence. PNG payload checks decode the actual batch files with `jsQR`.

`.factory/copy-audit.md` now covers the first screen, demo, all editor types, drawing and output controls, batch workspace, footer, validation errors, and runtime status messages. No authored line exceeds 22 words or uses a banned marketing word.

## Clean-checkout verification

A fresh clone at `/tmp/static-qr-clean.bUAlhQ/repo` used Node `v22.23.2`, npm `10.9.8`, and the pinned Playwright `1.58.2` browser.

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 0 vulnerabilities |
| `npx playwright install chromium` | PASS |
| `npm test` | PASS; 13/13 unit tests |
| `npm run build` | PASS; `dist/` produced |
| Every command in `.factory/claims.json`, separately | PASS; 23/23 |
| `npm run test:claims` | PASS; 29/29 browser tests |
| `npm run test:a11y -- http://127.0.0.1:4173` | PASS; 0 axe violations on five routes at desktop and phone widths |
| `git diff --check` | PASS |

The built initial main JavaScript is 45,349 bytes raw, the decoder chunk is 130,828 bytes raw, and CSS is 20,715 bytes raw. The JavaScript remains below the 200 KB static-product budget and CSS remains below 50 KB.

Lighthouse 12.8.2 mobile results from the clean built preview:

- Performance 99
- Accessibility 100
- Best Practices 100
- SEO 100
- FCP 1.65 s, LCP 1.65 s, TBT 0 ms, CLS 0

## Live HTTPS verification

- The factory URL verifier passed: HTTPS 200, title, `lang=en`, one h1, main landmark, image alt text, labelled buttons, and no console errors.
- Live axe checks reported 0 violations for `/`, `/demo`, `/privacy/`, `/terms/`, and `/404.html` at 1366 × 900 and 390 × 844.
- Fresh desktop and phone contexts loaded at `scrollY=0`. Both showed the job, audience, first action, and all three facts before scrolling. The sample action ended at 629 px on desktop and 618 px on phone; the facts ended at 767 px and 832 px respectively.
- In both contexts, one click opened the completed North Pier Coffee QR. The banner remained visible, the exact payload decoded locally, Reset demo restored an edited sample, and Start for real returned to an empty form.
- A non-demo `localStorage` sentinel remained unchanged, while `demo:static-qr:active` was removed on exit. No console error or request outside the product origin occurred.
- A fresh phone context updated the deployed service worker, reloaded `/demo` offline, generated an “Offline repair check” text QR, and received exact decoder verification.
- All discovered internal links, the product source link, robots, sitemap, favicon, touch icon, and social image resolved. The privacy address is an intentional `mailto:` link.
- An unknown URL returns the designed page with HTTP 404. Root and 404 responses include CSP, HSTS, `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, and the restrictive Permissions-Policy.

## Earlier finding disposition

| Finding | Current disposition |
| --- | --- |
| One-click sample sandbox missing | Fixed previously and rechecked live on desktop and phone. |
| Claim manifest missing | Fixed previously; expanded from 18 to 23 complete claim groups in this repair. |
| First screen and legal copy were not plain | Fixed previously; the complete landing copy audit is now recorded. |
| Designed HTTP 404 missing | Fixed previously and rechecked live with an actual 404 response. |
| SVG logo chooser mismatch | Fixed previously; its declared decoder test passes. |
| PDF page size mismatch | Fixed previously; its declared file inspection passes. |
| Phone touch targets below 44 × 44 px | Fixed and measured locally and live across all reachable states. |
| Five batch promises lacked declared tests | Fixed with five manifest entries and artifact-level outcome tests. |

## Boundaries

This is a free static browser product. It has no backend, tenant data store, health endpoint, paid offer, billing dependency, or rate-limit surface. Backend isolation, restart persistence, and 429 checks do not apply. The local decoder proves digital QR output; final paper, lighting, scanner, and receiving-device behavior still require testing in the intended setting.
