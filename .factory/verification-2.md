# Verify direct QR generation and downloads

**Verified:** 2026-09-06  
**Live URL:** https://static-qr-no-signup.sociobot.in  
**Implementation candidate:** `eaea1152595a2ff7e4ae44be929e551f42165a1a`  
**Documentation evidence candidate:** `6b242543d863468489f69aa05209ed4b2e683ca9`

## Verdict

**PASS.** There are **zero findings** at every severity and **zero untested public claims**.

The current branch also includes `7cbee828cdd9a03010ad0ece1c1938a7205abf23`, which changes only the previous handoff and repair-evidence documents. The live `index.html` and `sw.js` SHA-256 values exactly match a fresh production build of the implementation candidate, so that later report-only revision does not require a different product image review.

## Job, audience, and first action

The job is to create a direct QR code for print or sharing. The audience is shops, events, and people who need a print-ready code without an account or redirect. Before scrolling, fresh desktop and phone browsers show the action **Try it with sample data**; it loads the completed North Pier Coffee menu QR for inspection and download.

## Clean candidate checks

A new detached clone of `eaea115` was used at `/tmp/static-qr-verify-2.V92l5e/repo`, with Node `v22.23.2` and npm `10.9.8`.

| Check | Result |
| --- | --- |
| `npm ci` | Passed; 0 vulnerabilities. |
| `npm test` | Passed: 13/13 tests. |
| `npm run build` | Passed; `dist/` produced. |
| `npx playwright install chromium` | Completed as the documented browser prerequisite. |
| `npm run test:claims` | Passed: 23/23 browser tests. This includes invalid/recovery, 1,200-character text boundary, mixed CSV recovery, keyboard tabs, and reduced motion. |
| Live axe smoke: `npm run test:a11y -- https://static-qr-no-signup.sociobot.in` | Passed: 0 violations at 1366 px and 390 px for `/`, `/demo`, `/privacy/`, `/terms/`, and `/404.html`. |
| Factory live URL verifier | Passed: HTTP 200, title, `lang=en`, one h1, main landmark, image alt text, no unlabeled buttons, and no console errors. |

The rebuilt initial main JavaScript is 45,349 bytes raw and CSS is 20,100 bytes raw. Both are below the stated static-product budgets.

## Public claims

All 18 commands declared in `.factory/claims.json` were run separately from the clean candidate checkout. Every command passed with one matching tagged test. The full browser suite was then run separately and passed 23/23.

| Claim ID | Result |
| --- | --- |
| `demo-sandbox` | PASS |
| `free-download` | PASS |
| `no-account` | PASS |
| `local-processing` | PASS |
| `direct-payload` | PASS |
| `five-code-types` | PASS |
| `svg-download` | PASS |
| `png-2048-download` | PASS |
| `pdf-4in-download` | PASS |
| `logo-scan-check` | PASS |
| `csv-batch-500` | PASS |
| `batch-png-1024` | PASS |
| `offline-after-first-visit` | PASS |
| `no-cookies` | PASS |
| `no-analytics` | PASS |
| `no-third-party-runtime` | PASS |
| `no-payload-retention` | PASS |
| `no-local-storage` | PASS |

The landing page, demo, privacy policy, terms, README, and output labels were cross-checked against the manifest. Their public product claims are represented by these tests. Guidance to test a final printed QR and terms wording are not claims that the browser can prove. No claim was missing, false, incomplete, or untested.

## Live browser checks

Fresh 1366 × 900 and 390 × 844 contexts started at `scrollY=0`. Both had no horizontal overflow, no page or console errors, and no HTTP(S) request outside the product origin.

On `/demo`, both contexts showed the completed QR, the North Pier Coffee sample URL, local decoder verification, and the persistent **Demo — sample data, nothing is saved** banner. Editing the sample then using **Reset demo** restored it. **Start for real** returned to an empty real URL field and left both local and session storage empty. The demo marker was only `demo:static-qr:active` while demo mode was active.

The live normal, invalid, recovery, keyboard, and motion paths passed: an incomplete `http://` reported a complete-address error; `example.com/menu?x=1` recovered to its direct `https://` payload; right-arrow from the URL tab selected Wi-Fi and focused its SSID field; and reduced-motion transition duration was `0.00001s`.

After service-worker control, a fresh phone context was taken offline, reloaded `/demo`, changed to a text QR, and received the expected local decoder verification with no errors. This verifies the promised offline-after-first-visit path and current service-worker artifact.

All discovered navigation, legal, sample, footer, source, and mail links resolved successfully, except the mail link which is an intentional `mailto:` target. `/does-not-exist` returned the styled page with HTTP 404, title `Page not found — Static QR`, and a link back to the generator.

## Deployment and privacy checks

The rebuilt and live hashes are identical:

| File | SHA-256 |
| --- | --- |
| `index.html` | `50feb770564018bc9b45f058a4a071dd196b491ac008c52563a650a9c2c1609b` |
| `sw.js` | `8c7dcfde6484a858f9647e3a173dfe7322d445a46e9ab1a75f87950b46146f0e` |

Live `/` and `/demo` returned HTTP 200. The unknown route returned HTTP 404. HTTPS responses provide CSP with `frame-ancestors 'none'`, HSTS, `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, and a restrictive Permissions-Policy. No `Set-Cookie` header was observed. Browser checks found no cookies, no real-input storage, no payload upload, analytics request, advertising request, or third-party runtime request.

## Earlier findings

| Earlier finding | Current disposition |
| --- | --- |
| One-click sample sandbox missing | Fixed and independently passed. `/demo` is populated, labelled, resettable, and isolated. |
| Claim manifest and claim evidence missing | Fixed. There are 18 declared claims and all 18 separate commands passed. |
| First screen was slogan copy and lacked a copy audit | Fixed. The first screen names the job, audience, and sample action; `.factory/copy-audit.md` is present. |
| Designed 404 missing | Fixed. The unknown live route returns the styled 404 with HTTP 404 and a way back. |
| SVG logo chooser mismatch | Fixed. The clean claim test selected an `image/svg+xml` logo, enforced high correction, and verified decoding. |
| PDF size label was misleading | Fixed. The clean claim test inspected `/MediaBox [0 0 288 288]`, exactly 4 × 4 inches. |

## Scope boundaries

This is a static browser product with no backend, tenant data store, health endpoint, restart persistence surface, or rate limiter. Tenant isolation, restart, health, and 429/`Retry-After` checks do not apply. The local decoder proves the generated digital QR; final physical print and receiving-device behavior for Wi-Fi, vCard, and calendar payloads remain user-side checks, as the product states.
