# Handoff — Static QR review 2

## Strict review 2

**FAIL — 2 findings and 5 public claims without dedicated declared claim tests.** Review completed on 2026-09-06 against implementation `eaea1152595a2ff7e4ae44be929e551f42165a1a` and documentation `6b242543d863468489f69aa05209ed4b2e683ca9`. The review-start revision `755d876778bd4afa009f10d329d19040241b163a` changes reports only.

The main job works. A detached checkout passed `npm ci`, 13/13 unit tests, the production build, every one of the 18 declared claim commands run separately, and the complete 23/23 browser suite. Fresh live desktop and phone sessions passed the sample, reset, Start for real isolation, downloads, invalid and recovery paths, 1,200-character boundary, keyboard tabs, reduced motion, offline reload/update, privacy/network, route titles, legal pages, links, and styled HTTP 404 checks. Live axe found 0 violations on five routes at both sizes. A clean Lighthouse mobile run scored 100/100/100/100 with LCP 1.4 s and CLS 0. Live and rebuilt candidate artifacts match.

Two contract failures remain:

- Several phone controls are below the required 44 × 44 CSS px target. The required **Start for real** demo exit measured 110 × 15 px; Reset demo, the help button, range input, wordmark, footer links, and privacy email link were also undersized.
- Five public batch promises have no dedicated declared `@claim` command: template download, CSV drop, quoted/escaped CSV, invalid-row exclusion, and the full documented five-type batch schema. Two have incidental untagged tests, but the claim contract still requires manifest entries and dedicated tags. The copy audit is also incomplete.

Full evidence and exact dispositions are in [review-2.md](review-2.md). No product code was changed. The next repair should enlarge the measured targets, complete the claim manifest/tests and copy audit, deploy, and re-run review.

## Independent verification 2

**PASS — zero findings and zero untested public claims.** Independent verification completed on 2026-09-06 against runtime implementation `eaea1152595a2ff7e4ae44be929e551f42165a1a` and documentation evidence `6b242543d863468489f69aa05209ed4b2e683ca9`. The current `7cbee828cdd9a03010ad0ece1c1938a7205abf23` revision is report-only.

A fresh detached candidate checkout passed `npm ci`, `npm test` (13/13), `npm run build`, all 18 individual declared claim commands, and the complete browser suite (23/23). The live desktop and phone demo, offline reload, HTTPS/security headers, links, legal routes, styled HTTP 404, and axe accessibility smoke checks passed. The rebuilt candidate and live `index.html` and `sw.js` match byte-for-byte. Full evidence is in [verification-2.md](verification-2.md).

No product code changed during this verification. Run the commands in **Run and verify** below to reproduce the local checks.

## Status

All six review findings are fixed and deployed. The static QR generator now has a real one-click sample sandbox, an executable claim manifest, plain first-screen copy, a designed HTTP 404 page, an SVG-capable logo picker, and a true 4 × 4 inch PDF page.

- Runtime implementation SHA: `eaea1152595a2ff7e4ae44be929e551f42165a1a`
- Handoff documentation SHA: `6b242543d863468489f69aa05209ed4b2e683ca9`
- Documentation and verification evidence SHA: `6b242543d863468489f69aa05209ed4b2e683ca9`
- Live URL: https://static-qr-no-signup.sociobot.in
- Deployed artifact identity: live `index.html` and `sw.js` SHA-256 exactly match the build from the runtime implementation SHA. Exact hashes and checks are in [repair-evidence.md](repair-evidence.md).

## What changed

- `/demo` now opens a populated North Pier Coffee menu QR. Its banner says “Demo — sample data, nothing is saved,” has Reset demo and Start for real controls, and uses only the `demo:static-qr:active` session-storage marker. See [demo.md](demo.md).
- `.factory/claims.json` lists 18 public claims, each with one tagged browser outcome test. The 23-test Playwright suite also exercises recovery, boundary, keyboard, and reduced-motion paths.
- The first screen states the job, audience, and first action in plain language. [copy-audit.md](copy-audit.md) records the copy check.
- `404.html` and `staticwebapp.config.json` provide a styled, deliberate HTTP 404 with a way back.
- The logo picker accepts SVG normally. The PDF generator now makes a 288 × 288 point page. PNG export now produces exactly 2048 × 2048 pixels rather than rounding down to a module grid.
- The service worker precaches the built shell and asset manifest, including `/demo`, so the demonstrated offline reload has the code needed to generate and verify locally.
- The header/footer, titles, metadata, social image, Apple touch icon, sitemap, legal routes, and accessibility smoke coverage were completed.

## Run and verify

Requires Node.js 20+ and the checked-in lockfile.

```sh
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:claims
npm run preview
npm run test:a11y -- http://127.0.0.1:4173
```

`npm run build` writes the deployable static artifact to `dist/`. Azure Static Web Apps serves that directory. The production deployment was made with the product static deployment configuration and has no backend, volume, or replica changes.

## Verification summary

- Fresh clean checkout of the runtime candidate: `npm ci` (0 vulnerabilities), `npm test` (13/13), `npm run build`, and every one of the 18 declared claim commands passed.
- Final browser suite: 23/23 passed, including sample isolation, direct payload, downloads, SVG logo verification, 500-file batch ZIP, 1024 px batch PNG, offline reload, invalid/recovery, text boundary, keyboard, and reduced motion.
- Accessibility: 0 axe violations at 1366 × 900 and 390 × 844 for `/`, `/demo`, `/privacy/`, `/terms/`, and `/404.html`; no console errors in the same smoke test.
- Live: HTTPS root passed the factory verifier with title/lang/one h1/main/alt checks, 0 unlabeled buttons, and no console errors. Fresh phone and desktop contexts started at the first screen and completed the demo flow. `/does-not-exist` returns the designed HTTP 404.
- Lighthouse mobile: 98 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; FCP 1.6 s, LCP 1.6 s, TBT 110 ms, CLS 0. Lighthouse wrote the report but exited nonzero after Chrome crashed while taking its full-page screenshot; the metrics are retained with that caveat in [repair-evidence.md](repair-evidence.md).

## Known boundaries

- The local decoder proves the rendered digital QR, not physical print conditions. Test the final printed code with the target scanners, paper, distance, and lighting.
- Wi-Fi, vCard, and calendar support follow common payload formats, but receiving-device import behavior varies.
- This product is free and has no paid offer or billing dependency. There is no backend, tenant state, persistence service, or rate-limit surface.
