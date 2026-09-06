# Handoff — Static QR repair 1

## Status

All six review findings are fixed and deployed. The static QR generator now has a real one-click sample sandbox, an executable claim manifest, plain first-screen copy, a designed HTTP 404 page, an SVG-capable logo picker, and a true 4 × 4 inch PDF page.

- Runtime implementation SHA: `ba5173df3237a0a557ab81dec8ade6dd3c6d2896`
- Documentation and verification evidence SHA: `38f21e805e8c7c4a32d7d1b7fa94ad03755c7810`
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
