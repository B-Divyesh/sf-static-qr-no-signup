# Static QR

A private, no-signup static QR generator for small businesses, event organisers and anyone who wants a permanent code without a tracking redirect. It creates URL, Wi-Fi, vCard 3.0, calendar event and plain-text codes, plus batches from CSV.

Live: https://static-qr-no-signup.sociobot.in

## What it does

- Draws the exact payload in the browser; no generation request or payload upload.
- Exports print-ready SVG, 2048 px PNG and 4 × 4 inch vector PDF.
- Adds an optional centre logo, switches to high error correction, and scan-checks the result with a local decoder.
- Turns up to 500 CSV rows into an SVG or PNG ZIP.
- Works after first load when offline through a small service-worker cache.
- Uses no accounts, cookies, analytics, third-party scripts, fonts or runtime CDNs.

The payload inspector is the source of truth for what the QR contains. Static codes cannot be edited after printing, so always scan-test the final physical proof.

## Develop and verify

Requires Node.js 20 or later.

```sh
npm install
npm run dev
npm test
npm run build       # production output -> dist/
npm run preview
```

For the optional accessibility smoke test, install Playwright Chromium once, run the preview server, then test it:

```sh
npx playwright install chromium
npm run test:a11y -- http://127.0.0.1:4173
```

The exact deploy build command is `npm run build`; Azure Static Web Apps serves `dist/`, whose root contains `index.html`.

## Batch CSV

Start from the template inside the Batch CSV workspace. Every file needs `filename` and `type`; supported types are `url`, `wifi`, `vcard`, `event`, and `text`. Type-specific columns are:

- URL: `url`
- Wi-Fi: `ssid`, `password`, `encryption` (`WPA`, `WEP`, or `nopass`), `hidden`
- vCard: `first_name`, `last_name`, `phone`, `email`, `organization`
- Event: `event_title`, `start`, `end`, `location`, `description`
- Text: `text`

CSV quoting and escaped quotes are supported. Invalid rows are identified before ZIP creation and omitted from the download.

## Architecture and privacy

Vite builds a vanilla TypeScript application. `qrcode-generator` constructs matrices, `jsQR` is lazy-loaded for local scan verification, and `fflate` is lazy-loaded for ZIP creation. There is no backend. See [the visual thesis](.factory/design.md), [privacy policy](privacy/index.html), and [terms](terms/index.html).

## License

MIT. See [LICENSE](LICENSE).
