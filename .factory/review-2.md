# Review: Create direct QR codes — FAIL

**Review date:** 2026-09-06  
**Live URL:** https://static-qr-no-signup.sociobot.in  
**Implementation candidate:** `eaea1152595a2ff7e4ae44be929e551f42165a1a`  
**Documentation candidate:** `6b242543d863468489f69aa05209ed4b2e683ca9`  
**Review-start commit:** `755d876778bd4afa009f10d329d19040241b163a` (reports only after the candidates above)

## Verdict

**FAIL — 2 findings and 5 public claims without dedicated declared claim tests.**

The main QR job works and all 18 declared claim commands pass. This is still not a product PASS because the phone interface misses the required 44 px touch-target baseline, and the batch UI and README make five additional promises outside the required claim harness.

## Job, audience, and first action before scrolling

The job is to create a direct QR code and download a print-ready file. The audience is shops, event organisers, and people who need a code without an account or redirect. The first action is **Try it with sample data**.

Fresh 1366 × 900 and 390 × 844 browser contexts showed all three before scrolling. The sample action ended at 629 px on desktop and 493 px on phone. The three Free, Local, and Offline facts also appeared inside both initial viewports.

## Findings

### Medium

1. **Several phone touch targets are smaller than the required 44 × 44 CSS px.** At 390 px, measured interactive boxes included the core demo exit **Start for real** at 110 × 15 px, **Reset demo** at 78 × 36 px, the error-correction help button at 24 × 24 px, and the quiet-zone range input at 325 × 32 px. The wordmark was 145 × 28 px; footer links were 44–52 × 24 px; and the privacy email link was 143 × 17 px. This fails the attached accessibility and design baseline even though axe reports no automated WCAG violations. The small **Start for real** target affects a required demo path.

2. **The claim manifest does not cover all public batch promises.** `.factory/claims.json` declares 18 claims, and every declared command passed. The following five public promises have no dedicated declared `@claim` command:

   - The **Download CSV template** action downloads a usable template.
   - The “or drop it on this sheet” path accepts a dropped CSV.
   - README says CSV quoting and escaped quotes are supported.
   - README says invalid rows are identified before ZIP creation and omitted from the download.
   - README says batch CSV supports URL, Wi-Fi, vCard, event, and text rows with the documented type-specific columns.

   Quoted fields have an untagged unit test, and invalid-row omission has an untagged browser test. Those tests do not meet the contract that every public claim be listed and exercised by exactly one declared tagged command. The template, drop path, and full five-type batch schema lack outcome coverage. `.factory/copy-audit.md` also lists only 13 selected lines rather than every landing-page sentence, so it did not expose these public promises during the required copy audit.

There are no critical, high, or low findings.

## Clean checkout and declared claims

A detached checkout of `eaea1152595a2ff7e4ae44be929e551f42165a1a` was used at `/tmp/static-qr-review-2.JEXSJb/repo` with Node 22.23.2.

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 0 vulnerabilities |
| `npm test` | PASS; 13/13 tests |
| `npm run build` | PASS; `dist/` produced |
| Every command in `.factory/claims.json`, run separately | PASS; 18/18 |
| `npm run test:claims` | PASS; 23/23 browser tests |

The 18 passing declared IDs were `demo-sandbox`, `free-download`, `no-account`, `local-processing`, `direct-payload`, `five-code-types`, `svg-download`, `png-2048-download`, `pdf-4in-download`, `logo-scan-check`, `csv-batch-500`, `batch-png-1024`, `offline-after-first-visit`, `no-cookies`, `no-analytics`, `no-third-party-runtime`, `no-payload-retention`, and `no-local-storage`. Each ID occurs once in the manifest and once as a test tag.

## Live browser evidence

Fresh desktop and phone contexts loaded with no console or page errors, no horizontal overflow, and no HTTP(S) request outside the product origin. On `/demo`, both showed the North Pier Coffee sample, exact direct URL, QR preview, local decoder result, and persistent **Demo — sample data, nothing is saved** banner. Reset restored an edited sample. Start for real returned to an empty real form and removed the `demo:static-qr:active` session marker. A non-demo local-storage sentinel remained unchanged throughout, which shows the demo did not alter that real-data stand-in.

The live sample downloaded valid SVG, 2048 × 2048 PNG, and PDF files. The PDF contains `/MediaBox [0 0 288 288]`, exactly 4 × 4 inches. Invalid `http://` input produced recovery guidance; `example.com/menu?x=1` recovered to the exact direct HTTPS payload. A 1,200-character text payload verified. An event ending before it starts was rejected and recovered after correction. Arrow keys changed type tabs and focused the first field. The visible focus outline was 3 px vermilion. Reduced-motion transition duration was `0.00001s`.

After service-worker activation and `registration.update()`, a fresh phone context reloaded `/demo` offline, generated a text QR, and verified it locally without errors.

## Accessibility, routes, privacy, and performance

- Live axe checks found 0 violations at 1366 px and 390 px on `/`, `/demo`, `/privacy/`, `/terms/`, and `/404.html`.
- The factory URL verifier passed title, `lang=en`, one h1, main landmark, image alt, labelled buttons, and console checks.
- Root, demo, privacy, terms, and 404 routes have distinct titles and one h1. `/does-not-exist` returns the styled page with HTTP 404 and a way back.
- All discovered product, legal, source, image, icon, robots, and sitemap URLs resolved. The privacy contact is an intentional `mailto:` link.
- Responses provide CSP, HSTS, `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, and a restrictive Permissions-Policy. No `Set-Cookie` header or third-party runtime request was observed.
- A clean, uncontended Lighthouse mobile run scored 100 Performance, 100 Accessibility, 100 Best Practices, and 100 SEO. FCP was 1.3 s, LCP 1.4 s, TBT 0 ms, and CLS 0.
- Built initial main JavaScript is 45,349 bytes raw and CSS is 20,100 bytes raw. Even main plus the 130,828-byte decoder chunk stays below the 200 KB JavaScript budget.

This is a static product. Backend tenant isolation, restart persistence, health, and 429/`Retry-After` checks do not apply. The brief does not gain an obvious useful AI step; QR construction, inspection, and export are deterministic local tasks.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| One-click sample sandbox missing | Fixed and verified live on desktop and phone. |
| Claim manifest and claim evidence missing | Partly fixed: all 18 declared claims pass, but finding 2 identifies five still-unlisted batch promises. |
| First screen used slogan copy and lacked the required action | Fixed; the job, audience, action, and facts are visible before scrolling. The copy-audit document remains incomplete as noted in finding 2. |
| Designed 404 missing | Fixed; an unknown live route returns the designed page with HTTP 404. |
| SVG logo chooser mismatch | Fixed; `image/svg+xml` is accepted and the tagged decoder test passes. |
| PDF size wording mismatched output | Fixed; both the tagged test and live file show a 288-point square page. |

## Required next steps

Increase every mobile interactive target to at least 44 × 44 CSS px, especially the demo controls. Add manifest entries and dedicated tagged outcome tests for the five batch promises, and expand the copy audit to include every landing-page sentence. Re-run this review after deployment.

No product code was changed during this review.
