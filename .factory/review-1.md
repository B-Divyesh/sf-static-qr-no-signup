# Static QR generator review — FAIL

**Review date:** 2026-09-06  
**Live URL:** https://static-qr-no-signup.sociobot.in  
**Implementation candidate reviewed:** `4b207d6a6cfd9dd976eb74b108f5cbb569da7f2d`  
**Documentation/report commit at review start:** `ed7fa940b3961d75588d6eec3bee06b91136f0d9`

## Verdict

**FAIL.** There are 6 findings, including 1 high-severity missing product path, and 15 untested public claims. The QR generation path works, but the required demo sandbox, claims evidence, and designed 404 page are absent. This is not a PASS.

## Job, audience, and first action

The job is to create a direct, permanent QR code and download it for print or sharing. The intended audience is small businesses, event organisers, and individuals who need a QR without signup, tracking, or a redirect. The required first action is **“Try it with sample data”** so a visitor can see a populated QR result without entering their own content.

On fresh desktop (1366×900) and phone (390×844) browsers, the actual first action is **“Draw a QR”** or **“Build a batch.”** There is no sample-data action before scrolling or anywhere else. The visible heading is “Your code. No middleman.” It does not name the job or audience in plain words.

## Evidence and checks

| Check | Result |
| --- | --- |
| Live deployment identity | PASS. SHA-256 for `index.html`, main JS, CSS, verifier, ZIP chunk, and `sw.js` matched a clean build of `4b207d6`. `ed7fa94` only adds the earlier report/handoff. |
| Clean setup | PASS. Fresh detached clone, `npm ci`; 0 vulnerabilities reported. Node 22.23.2. |
| Declared commands | PASS after the documented prerequisite `npx playwright install chromium`: `npm test` 13/13; `npm run build`; `npm run test:a11y -- http://127.0.0.1:4173`; and the live accessibility command. |
| Accessibility | PASS for the tested pages. Axe reported 0 WCAG 2 A/AA/2.1 AA violations at 1366×900 and 390×844, with `lang`, one h1, main landmark, image alt text, and a visible 3 px focus outline. Reduced-motion duration was `0.01ms`. |
| Fresh desktop and phone load | PASS. No console/page errors, no third-party HTTP(S) request, and no horizontal overflow (`390/390` on phone). |
| Normal, invalid, boundary, and recovery paths | PASS. `example.com/menu?x=1` became `https://example.com/menu?x=1` and local verification recovered it. An incomplete `http://` showed a useful error and recovered. A 1,200-character text QR verified. An event ending before it starts was rejected and recovered after correction. Escaped Wi-Fi payload verified. |
| Batch and offline path | PASS. A mixed CSV reported its invalid Wi-Fi row, built a ZIP containing the two valid SVGs, and showed completion. After the service worker controlled the page, an offline reload generated and verified `https://offline.example/path`. |
| Privacy and security | PASS for observed runtime. Generated QR flows made no outbound requests. Live HTTPS sends CSP, HSTS, `Referrer-Policy: no-referrer`, `X-Content-Type-Options`, and restrictive Permissions-Policy. Privacy and terms pages load with their own titles. |
| Lighthouse | Not a finding. A fresh Lighthouse 12 run was attempted with Chromium, but its root launcher could not connect to Chrome even with no-sandbox flags. The prior independent report recorded 99/100/100/100. This review did not treat that historical score as new measurement. |

## Findings

### High

1. **Required one-click demo sandbox is missing.** `/demo` returns the landing page through SPA fallback. It has no realistic populated sample, persistent “Demo — sample data, nothing is saved” label, Reset demo, Start for real action, demo storage namespace, or `.factory/demo.md`. Fresh browser evidence found zero elements matching “sample data”, “Demo”, “Reset demo”, or “Start for real”, and zero local-storage keys. The required sample path cannot be entered, inspected, reset, or proven isolated from real data.

### Medium

2. **There is no claims manifest or claim-level sandbox evidence.** `.factory/claims.json` is absent, so there are no declared claim commands to run and no observable claim tests from a demo entry point. Fifteen distinct published promise groups are therefore untested: local/no-upload processing; no account; no redirect; no expiry/permanent output; five code types; SVG export; 2048 px PNG export; 4×4-inch PDF export; local logo scan check; CSV batch up to 500; works offline after first load; no cookies; no analytics; no third-party runtime resources; and no payload retention. This is 15 untested claims, not zero.

3. **The first screen and legal headings do not meet the plain-words contract.** The product does not name its audience on the first screen and has no “Try it with sample data” action. “Your code. No middleman.”, “A QR should be boring infrastructure.”, “Nothing to hide. Nothing uploaded.”, and “A utility, not a dependency.” are slogan or mood headings rather than plain job headings. The source also lacks the required `.factory/copy-audit.md`.

4. **The site has no designed 404 route.** `404.html` is absent and the Static Web Apps configuration has no 404 response override. Live `/does-not-exist` responds 200 with the generator landing page and title, not a clear missing-page screen with a way back. A deliberate HTTP 404 would be acceptable; a disguised landing page is not.

### Low

5. **Earlier finding remains: SVG logos are advertised but cannot be selected normally.** The centre-logo label says “PNG, JPEG, WebP or SVG ≤ 1 MB,” while the chooser accepts only `image/png,image/jpeg,image/webp`. The mismatch is still present in the reviewed implementation.

6. **Earlier finding remains: the PDF size label is misleading.** The UI and README promise “PDF 4 × 4 in,” but `createPdf` emits `MediaBox [0 0 360 360]`, a 5×5-inch page, with a 288-point (4×4-inch) QR centered inside it. The label should disclose the page margin or make the page itself 4×4 inches.

## Earlier verification findings

The two low-severity findings in `.factory/verification.md` were both checked against the current implementation. Neither has been fixed; they are findings 5 and 6 above. The earlier verification otherwise remains consistent with this review’s working functional, privacy, offline, and accessibility checks.

## Scope notes

This is a static web product. Tenant isolation, backend restart persistence, health endpoints, and 429/Retry-After checks do not apply. No product code was changed during this review.

## Required disposition

Add the real demo sandbox and documentation, list and exercise every public claim from the demo entry point, replace the slogan copy with a job/audience/first-action first screen, add a designed 404, and resolve the two remaining export-input wording defects. Re-review after deployment.
