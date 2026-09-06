# Review 3: Create direct QR codes — PASS

**Review date:** 2026-09-06  
**Live URL:** https://static-qr-no-signup.sociobot.in  
**Implementation candidate:** `5046c607ef36aa628e432251c48904c25cd37632`  
**Documentation base:** `e1ac7123fac3adc9ca8aeaef3146e3f3330a7ad9`  
**Review-start report commit:** `7dcc5bd02c260733c8ce4f5468412e01fedc3dfa`

## Job, audience, and first action

The job is to create a direct QR code and download a print-ready file. The audience is shops, event organisers, and people who need a code without an account or redirect. The first action is **Try it with sample data**.

Fresh live desktop (1366 × 900) and phone (390 × 844) contexts showed the headline, audience sentence, sample action, and Free, Local, and Offline facts before scrolling. The action ended at 629 px on desktop and 618 px on phone. The facts ended at 767 px and 832 px respectively.

## Verdict

**PASS — 0 findings and 0 untested public claims.**

The clean rebuild matches the live shell, all declared claim commands pass separately, and the live product completes the real QR creation, verification, download, demo, recovery, offline, privacy, accessibility, legal, and 404 paths.

## Clean checkout and declared claims

A fresh detached checkout of the documentation base was created at `/tmp/static-qr-review-3.pZEm3W/repo`. It uses the implementation from `5046c60`; the later base contains documentation only. Node was `v22.23.2`, npm was `10.9.8`, and Playwright Chromium was the pinned `1.58.2` version.

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 0 vulnerabilities |
| `npm test` | PASS; 13/13 tests |
| `npm run build` | PASS; produced `dist/index.html` |
| `git diff --check` | PASS |
| Every command in `.factory/claims.json`, separately | PASS; 23/23 |
| `npm run test:claims` | PASS; Playwright recorded a passed run; the suite lists 29 tests |
| `npm run test:a11y -- http://127.0.0.1:4173` | PASS; 0 axe violations on five routes at desktop and phone widths |
| `npm run test:a11y -- https://static-qr-no-signup.sociobot.in` | PASS; 0 axe violations on the same live routes and widths |

The manifest has 23 unique IDs and the browser test file has exactly 23 matching unique `@claim:` tags. No tag is undeclared and no manifest entry lacks a test. Each command below was run independently from the clean checkout.

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
| `csv-template-download` | PASS |
| `csv-drop` | PASS |
| `csv-quoted-fields` | PASS |
| `batch-invalid-row-exclusion` | PASS |
| `batch-five-type-schema` | PASS |
| `offline-after-first-visit` | PASS |
| `no-cookies` | PASS |
| `no-analytics` | PASS |
| `no-third-party-runtime` | PASS |
| `no-payload-retention` | PASS |
| `no-local-storage` | PASS |

## Live browser review

Fresh phone and desktop contexts opened the landing page at scroll position zero with no console or page errors. The visible one-click sample loaded the realistic North Pier Coffee menu payload, exact payload inspector, and local decoder result. The persistent banner read **“Demo — sample data, nothing is saved.”** Editing the sample then choosing **Reset demo** restored the original payload. Choosing **Start for real** returned to an empty URL form and removed `demo:static-qr:active`.

For isolation, each context first stored unrelated `sessionStorage` and `localStorage` sentinels. Both remained unchanged throughout demo entry, reset, and exit. The demo marker was removed only on exit. The first-party-only request check observed no request to another origin and no payload value in a request URL.

The live normal, invalid, boundary, and recovery checks passed:

- `http://` showed “Enter a complete web address” guidance; `north-pier-coffee.example/menu` immediately recovered to the exact direct HTTPS payload.
- An event ending before it starts was rejected; correcting the end time produced an iCalendar payload.
- A 1,200-character text payload rendered and decoded exactly.
- Arrow Right moved the selected type tab from URL to Wi-Fi and placed focus in the SSID field. The focused control had a vermilion 3 px outline.
- In reduced-motion mode, both transition and animation duration computed to `0.00001s`.
- After service-worker control and an update check, a fresh phone context reloaded `/demo` offline, generated `Offline review check`, and got exact local decoder verification without errors.

The live root, demo, privacy, terms, and 404 pages have their own correct titles and one main heading. The unknown `/does-not-exist` URL responds with HTTP 404 and the styled “This page was not found” screen with ways back. Internal links, sitemap routes, assets, and the public source link resolved; the privacy contact is an intentional `mailto:` link.

## Privacy, accessibility, and delivery checks

- The root sends CSP with `frame-ancestors 'none'`, HSTS, `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, and a restrictive Permissions-Policy.
- No cookies, analytics, advertising pixels, third-party scripts, third-party fonts, or payload uploads were observed in the tested generation flow. The declared privacy claim tests also passed separately.
- Local and live axe sweeps found 0 WCAG 2 A, AA, or 2.1 AA violations across root, demo, privacy, terms, and 404 at 1366 px and 390 px. The checks also passed title, language, one-h1, main landmark, image-alt, console, and horizontal-overflow basics.
- The rebuilt and live `index.html` SHA-256 values both equal `88ce485d0c0d210e5b02c7adb65b8106a958774aaebb5c91f19870168fdc98f3`. The rebuilt and live `sw.js` SHA-256 values both equal `fabdd52174621becd5ef31cd5ecf0858f22e890a93a82f8bba3c1100a96d113e`.
- The built main JavaScript is 45,349 bytes raw, decoder chunk 130,828 bytes raw, and CSS 20,715 bytes raw. These remain within the static-product budgets.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| One-click sample sandbox missing | Fixed. Fresh live phone and desktop checks proved populated sample, persistent label, reset, isolated storage, and exit. |
| Claim manifest and claim evidence missing | Fixed. The manifest has 23 one-to-one claim tests; every command passed separately. |
| First screen did not state the job, audience, and sample action | Fixed. All required content appeared before scrolling in fresh phone and desktop contexts. |
| Designed HTTP 404 missing | Fixed. The live unknown route returns the designed page with HTTP 404. |
| SVG-logo chooser did not accept advertised SVG files | Fixed. The declared logo decoder claim passed. |
| PDF label did not match the page size | Fixed. The declared PDF claim passed with a 288 × 288 point MediaBox. |
| Phone targets below 44 × 44 px | Fixed. The complete browser suite includes the phone target audit and passed. |
| Five batch promises lacked declared outcome tests | Fixed. Template, drop, quoted fields, invalid-row exclusion, and five-type schema each have a declared passing artifact-level claim test. |
| Copy audit did not cover all visitor-facing text | Fixed. `.factory/copy-audit.md` records the full landing, demo, editor, batch, footer, validation, and status copy. |

## Scope

This is a static browser product with no backend, tenant data store, health endpoint, paid offer, billing dependency, or rate-limit surface. Tenant isolation, restart persistence, health checks, and 429/`Retry-After` checks do not apply. No product code was changed during this review.
