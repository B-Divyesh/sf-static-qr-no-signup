# Verify direct QR generation and downloads

**Verified:** 2026-09-06  
**Live URL:** https://static-qr-no-signup.sociobot.in  
**Implementation candidate:** `5046c607ef36aa628e432251c48904c25cd37632`  
**Documentation candidate:** `e1ac7123fac3adc9ca8aeaef3146e3f3330a7ad9`

## Verdict

**PASS.** There are **zero findings** at every severity and **zero untested public claims**.

The built candidate and live deployment match exactly: `index.html` SHA-256 is `88ce485d0c0d210e5b02c7adb65b8106a958774aaebb5c91f19870168fdc98f3`, and `sw.js` SHA-256 is `fabdd52174621becd5ef31cd5ecf0858f22e890a93a82f8bba3c1100a96d113e` in both places. `e1ac712` is the documentation/report revision; `5046c60` is the implementation reviewed.

## Job, audience, and first action

The job is to create a direct QR code for print or sharing. The audience is shops, events, and people who need a print-ready code without an account or redirect. Before scrolling, fresh desktop (1366 x 900) and phone (390 x 844) browsers both show **Create a direct QR code**, that audience sentence, and **Try it with sample data**. The action loads a cafe menu QR that can be inspected and downloaded.

Both initial pages were at `scrollY=0`, had no console or page errors, and had no horizontal overflow (1366/1366 and 390/390). The three visible first-screen facts are Free/no account, Local/no upload, and Offline/after first visit.

## Clean checkout and quality checks

A fresh clone at `/tmp/static-qr-verify-3.tJDN0X/repo` was tested at documentation revision `e1ac712`, with Node `v22.23.2` and npm `10.9.8`.

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 0 vulnerabilities. |
| `npx playwright install chromium` | PASS. |
| `npm test` | PASS; 13/13 unit tests. |
| `npm run build` | PASS; `dist/` produced. |
| `npm run test:claims` | PASS; 29/29 browser tests. |
| `npm run test:a11y -- http://127.0.0.1:4173` | PASS; 0 axe violations on five routes at desktop and phone widths. |
| `npm run test:a11y -- https://static-qr-no-signup.sociobot.in` | PASS; 0 axe violations on the same routes and widths. |
| `git diff --check` | PASS. |

The production build reports 45.35 kB raw main JavaScript, 130.83 kB raw decoder JavaScript, and 20.72 kB raw CSS. These are within the product budgets. The live accessibility sweep also found the expected `lang`, one `h1`, main landmark, image alternative text, no horizontal overflow, and no console errors on `/`, `/demo`, `/privacy/`, `/terms/`, and `/404.html` at both widths.

## Declared claims

Every command declared in `.factory/claims.json` was run separately from the clean checkout. Each passed its dedicated `@claim:` browser test; no manifest claim was missing or failed.

| Claim ID | Result and observable evidence |
| --- | --- |
| `demo-sandbox` | PASS — `/demo` loads the North Pier Coffee result, Reset demo restores it, and Start for real clears the marker and form. |
| `free-download` | PASS — sample SVG downloads without payment. |
| `no-account` | PASS — sample QR downloads without an account prompt. |
| `local-processing` | PASS — generation and download make no payload request. |
| `direct-payload` | PASS — inspector and local decoder recover the sample destination exactly. |
| `five-code-types` | PASS — URL, Wi-Fi, vCard, event, and text payloads generate. |
| `svg-download` | PASS — downloaded self-contained SVG includes QR paths. |
| `png-2048-download` | PASS — downloaded PNG measures 2048 x 2048 px. |
| `pdf-4in-download` | PASS — downloaded vector PDF has MediaBox 288 x 288 points. |
| `logo-scan-check` | PASS — SVG logo forces high correction and the decoder verifies the result. |
| `csv-batch-500` | PASS — 500-row SVG ZIP contains 500 QR files. |
| `batch-png-1024` | PASS — batch PNG is 1024 x 1024 px. |
| `csv-template-download` | PASS — template imports and produces all five expected type files. |
| `csv-drop` | PASS — a dropped CSV follows the drop path and produces its ZIP. |
| `csv-quoted-fields` | PASS — quoted commas and escaped quotes survive PNG generation and decoding. |
| `batch-invalid-row-exclusion` | PASS — invalid row is reported and omitted from the ZIP. |
| `batch-five-type-schema` | PASS — documented columns for all five types reach decoded payloads. |
| `offline-after-first-visit` | PASS — a new controlled context reloads `/demo` offline and verifies a generated text QR. |
| `no-cookies` | PASS — no cookies are set during the sample flow. |
| `no-analytics` | PASS — no analytics or advertising request occurs. |
| `no-third-party-runtime` | PASS — runtime HTTP(S) requests use only the product origin. |
| `no-payload-retention` | PASS — real input is absent after reload. |
| `no-local-storage` | PASS — real QR payload is not stored in local storage. |

## Live behavior

Fresh desktop and phone contexts entered `/demo` directly. Each showed the persistent **Demo — sample data, nothing is saved** label, the populated `https://north-pier-coffee.example/menu?location=market-square` payload, and **Verified — decoder recovered the exact payload**. Editing it then choosing Reset demo restored the exact sample. Start for real returned to an empty URL field. The only observed HTTP(S) origin was the product origin and neither context produced a console or page error.

The live normal, invalid, boundary, and recovery paths passed. `http://` says “Enter a complete web address, such as example.com/menu.”; `example.com/menu?x=1` recovers as `https://example.com/menu?x=1`; 1,200 text characters verify; an event ending before it begins reports the specific error and recovers after correction. Arrow-right from the URL tab selects Wi-Fi and focuses the SSID field. With reduced motion, the editor transition duration is `0.00001s`.

A fresh phone context waited for service-worker control, was placed offline, reloaded `/demo`, and generated and decoder-verified “Offline verification 3” with no errors. A live real-input privacy check found empty local and session storage, no cookies, no payload URL in requests, and an empty URL field after reload.

All discovered landing links resolved: internal navigation and legal links returned 200, the source link returned 200, and the privacy contact is an intentional `mailto:` link. Privacy and terms have their own titles and headings. `/qa-verify-3-missing` returns HTTP 404 with title `Page not found — Static QR`, the styled `This page was not found` heading, and a way back; `/404.html` is its deliberate static 200 route. HTTPS responses include CSP with `frame-ancestors 'none'`, HSTS, `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, and restrictive Permissions-Policy.

## Earlier findings

| Earlier finding | Current disposition |
| --- | --- |
| One-click sample sandbox missing | Fixed; fresh desktop and phone demo flows passed. |
| Claim manifest and claim evidence missing | Fixed; 23/23 separate declared claim commands passed. |
| First-screen and legal copy were not plain | Fixed; the first screen names job, audience, and first action. |
| Designed HTTP 404 missing | Fixed; a real unknown URL returns the styled HTTP 404. |
| SVG logo chooser mismatch | Fixed; SVG logo acceptance and decoder verification pass. |
| PDF page-size wording was misleading | Fixed; claim test verifies the exact 4 x 4 inch PDF page. |
| Phone touch targets below 44 x 44 px | Fixed; the complete browser suite includes its phone target audit and passes. |
| Five batch promises lacked declared tests | Fixed; five dedicated manifest entries and artifact-level tests pass. |

## Scope boundary

This is a free static browser product. It has no backend, tenant data store, health endpoint, restart-persistence surface, billing, or rate-limit surface. Tenant isolation, restart, health, and 429/`Retry-After` checks therefore do not apply. The built-in decoder verifies digital output; final physical-print and receiving-device behavior remain user-side checks as stated by the product.
