# Independent verification — PASS

**Verified 2026-08-27** against candidate commit `4b207d6a6cfd9dd976eb74b108f5cbb569da7f2d` and deployed URL `https://static-qr-no-signup.sociobot.in/`.

## Verdict

**PASS.** The deployed static product is the exact rebuilt candidate and the researched job-to-be-done works: it makes direct, locally generated static QR codes for URL, Wi-Fi, vCard, event and text payloads; exports SVG/PNG/PDF; produces local CSV batch ZIPs; and verifies scanability. No critical, high, or medium defects were found.

## Reproduction

A fresh detached clone was created from the requested SHA in `/tmp/static-qr-verify.S0etg3`; `npm ci` completed with **0 vulnerabilities**. The candidate worktree itself was not changed.

| Check | Result / evidence |
| --- | --- |
| Unit and integration tests | `npm test` passed: 3 files, **13/13** tests. |
| Type/build | `npm run build` passed (`tsc --noEmit` + Vite); `dist/` produced. No separate lint script exists. |
| Accessibility | `npm run test:a11y -- http://127.0.0.1:4173` reported **0** axe WCAG 2 A/AA/2.1 AA violations at 1366×900 and 390×844. One `h1`, `lang=en`, title, main landmark, skip link and image alt were present. |
| Keyboard and motion | Arrow-key type tabs changed the selection and moved focus into the new form; focus computed as vermilion `solid 3px`; reduced-motion transition/animation computed to `0.01ms`. |
| Mobile | At 390×844 the document measured `scrollWidth=390`, `clientWidth=390`; no page/console errors. |
| Browser functional path | URL rejection and recovery, direct URL payload, escaped Wi-Fi, vCard, invalid-event recovery, 1,200-character text boundary, SVG export, logo scan check, and three-file SVG batch ZIP all passed. The batch contained exactly `guest.svg`, `menu.svg`, `welcome.svg`. |
| QR verification | Normal payloads and a PNG-logo payload displayed “Verified — decoder recovered the exact payload.” Logo mode forced high correction and disabled PDF as designed. |
| Privacy/network | Chromium captured **zero outbound HTTP(S) requests** while loading and generating locally (aside from the tested first-party origin); no console or page errors. Source inspection found no analytics, payload upload, remote fonts, CDN scripts, redirect generation, cookies, or storage of payloads. |
| Public deployment identity | SHA-256 matched rebuilt `index.html`, `main-BmU5yl4E.js`, `styles-6hO-uEyG.css`, `verify-DT74n7Bp.js`, `zip-DMN3_0Vc.js`, and `sw.js` byte-for-byte. |
| PWA/offline | On the live origin the service worker activated and controlled the page. `registration.update()` completed with an activated worker; after an offline reload, entering `offline.example/path` generated and decoder-verified `https://offline.example/path` with no errors. |
| Security/caching | Live HTTP redirects to HTTPS. HTTPS returned CSP, HSTS, `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, restrictive Permissions-Policy, and `frame-ancestors 'none'`. Hashed assets use `public, max-age=31536000, immutable`; `sw.js` uses `no-cache`; HTML has a short 30-second cache. |
| Bundles | Initial main JS: 43,462 B raw / 16,600 B gzip; preloaded decoder: 130,828 B raw / 47,500 B gzip; total initial JS remains under the 200 KB raw budget. CSS: 18,105 B raw / 4,810 B gzip. No font bytes. Mobile AVIF hero: 11,209 B. |
| Lighthouse, live mobile | Performance **99**, Accessibility **100**, Best Practices **100**, SEO **100**. FCP 1.2 s; LCP 1.4 s; TBT 120 ms; CLS 0. Lighthouse wrote a valid report before its browser process crashed during screenshot teardown; the completed scores/metrics above are from that report. |

## Representative inputs exercised

- Normal URL: `example.com/menu?x=1` became the direct payload `https://example.com/menu?x=1`; the SVG download was valid.
- Malformed and recovery: `http://` showed the complete-address error, then valid URL generation recovered immediately.
- Wi-Fi: SSID `Cafe;Guest`, password `p:a,ss`, hidden WPA produced the correctly escaped `WIFI:` payload.
- vCard: Ada Lovelace plus email produced vCard 3.0 with `EMAIL;TYPE=INTERNET`.
- Event: an end before start was rejected; correcting the end generated iCalendar.
- Boundary: the full UI text limit of 1,200 characters generated and decoded exactly.
- Batch: a CSV containing URL, Wi-Fi and text rows created a ZIP with all expected SVGs.

## Defects by severity

### Critical / high / medium

None found.

### Low

1. **SVG-logo chooser mismatch.** The centre-logo label advertises “PNG, JPEG, WebP or SVG ≤ 1 MB,” but its file input `accept` filter lists only PNG, JPEG and WebP. SVG data still works if supplied programmatically, but the normal chooser discourages that advertised format. A small copy/filter correction would remove ambiguity.
2. **PDF page-size wording is imprecise.** The PDF QR drawing is 4×4 inches, but the generated PDF page `MediaBox [0 0 360 360]` is 5×5 inches with a centred 4-inch QR. The “PDF 4 × 4 in” label can reasonably be read as a 4×4-inch page. Document the margin or make the page 288×288 points for exactness.

## Scope notes

- This is a static web app, not a package, CLI or backend; consumer-install, concurrency, persistence and health checks do not apply.
- The site does include an offline service worker, so live service-worker update and offline generation were exercised.
- Device-specific import behavior for vCard/Wi-Fi/calendar and physical print/scan conditions remain real-world validation boundaries; the built-in digital decoder passed the tested payloads.
