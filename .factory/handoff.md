# Handoff — Static QR verification 3

## Status

Independent verification 3 passed at https://static-qr-no-signup.sociobot.in. No product code was changed during this verification.

- Runtime implementation SHA: `5046c607ef36aa628e432251c48904c25cd37632`
- Documentation base SHA: `e1ac7123fac3adc9ca8aeaef3146e3f3330a7ad9`
- Branch: `main`
- Product resource changed: only `sf-static-qr-no-signup`
- Billing: not applicable; the product remains free and has no paid offer

Later handoff and evidence commits are documentation-only. The deployed `dist/` artifact comes from the runtime implementation above.

## Verification 3

- Fresh desktop and phone browsers showed the job, audience, and **Try it with sample data** before scrolling.
- The North Pier Coffee demo was populated, labelled, decoder-verified, resettable, and cleared on Start for real without retaining real input.
- All 23 declared claim commands passed separately from a clean checkout. The complete browser suite passed 29/29; unit tests passed 13/13.
- Local and live axe sweeps found zero violations across landing, demo, privacy, terms, and 404 at desktop and phone widths.
- Normal, invalid, boundary, recovery, keyboard, reduced-motion, offline, privacy, links, legal-route, and real HTTP 404 paths passed live.
- The clean-build and live `index.html` and `sw.js` hashes matched exactly. Details are in [verification-3.md](verification-3.md).

## Repair 2 changes

- Every visible phone control now measures at least 44 × 44 CSS px. This includes demo actions, wordmarks, help and range controls, the Wi-Fi checkbox, CSV picker, legal contact, and footer links.
- Phone and tablet navigation remains visible as a compact second row, which keeps Batch CSV reachable on smaller screens.
- The CSV input fills the displayed drop zone and gives the zone a visible keyboard focus ring.
- A browser regression measures rendered target boxes across every QR editor, drawing controls, batch, legal pages, and 404 at 390 × 844.
- Five claim entries and five dedicated browser tests cover the CSV template, file drop, quoted fields, invalid-row exclusion, and the complete five-type schema.
- Batch tests build real ZIPs and inspect their contents. Quoting and schema tests decode downloaded PNG QR files to verify the final payload.
- The copy audit now includes all landing, demo, editor, batch, footer, validation, and status copy.

## Run and verify

Requires Node.js 20 or later.

```sh
npm ci
npx playwright install chromium
npm test
npm run build
npm run test:claims
npm run preview
npm run test:a11y -- http://127.0.0.1:4173
```

Each of the 23 claim commands can also be run from `.factory/claims.json`. The clean-checkout verification ran every command separately.

## Verification summary

- Clean `npm ci`: 0 vulnerabilities.
- Unit tests: 13/13 passed.
- Declared claims: 23/23 commands passed separately; IDs and test tags are one-to-one.
- Complete browser suite: 29/29 passed.
- Accessibility: 0 axe violations on root, demo, privacy, terms, and 404 at desktop and phone widths, both locally and live.
- Touch targets: minimum 44 × 44 CSS px across every measured live phone state.
- Build: `dist/` produced; main JS 45,349 bytes raw, decoder 130,828 bytes raw, CSS 20,715 bytes raw.
- Lighthouse mobile: 99 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; LCP 1.65 s, TBT 0 ms, CLS 0.
- Deployment identity: built and live `index.html` and `sw.js` hashes match exactly. Full hashes are in [repair-evidence.md](repair-evidence.md).
- Cold live desktop and phone flows showed the job, audience, sample action, and facts before scrolling. Demo load, realistic output, persistent label, reset, isolated exit, offline reload, links, legal pages, headers, and designed HTTP 404 all passed.

## Earlier findings

All findings from `verification.md`, `review-1.md`, `verification-2.md`, and `review-2.md` are closed. The earlier demo, claims, copy, 404, SVG-logo, and PDF issues remain fixed. Repair 2 closes the mobile target sizes and five undeclared batch claim groups. Exact dispositions and evidence are in [repair-evidence.md](repair-evidence.md).

## Known boundaries

- The built-in decoder verifies the digital QR image, not a physical print under real lighting and distance.
- Wi-Fi, vCard, and calendar import behavior still varies by receiving device.
- This product has no backend or paid offer. Tenant, persistence, health, billing, and 429 checks do not apply.
