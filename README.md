# Static QR

Create direct QR codes for shops, events, and people who need a print-ready code without an account or redirect. It creates URL, Wi-Fi, contact, event, and text QR codes, plus batches from CSV.

Live: https://static-qr-no-signup.sociobot.in

## What it does

- Starts with a one-click sample at [`/demo`](https://static-qr-no-signup.sociobot.in/demo). The sample is marked as demo data and is discarded when you start for real.
- Processes QR data in the browser without payload uploads. It uses no account, cookies, analytics, advertising pixels, or third-party runtime resources.
- Shows the exact direct payload. It does not add an application redirect.
- Downloads SVG, 2048 px PNG, and vector PDF files on a 4 × 4 inch page.
- Lets you add a PNG, JPEG, WebP, or SVG centre logo. Logo QR codes use high error correction and a local decoder check.
- Builds SVG or 1024 px PNG ZIP files from CSV batches of up to 500 rows.
- Works offline after the first visit. Real QR input is not retained after reload.

Check the exact payload and scan the final printed proof with the devices your audience uses.

## Develop and verify

Requires Node.js 20 or later.

```sh
npm ci
npm run dev
npm test
npm run build       # production output -> dist/
npm run preview
```

For browser claim tests, install the pinned Playwright Chromium once and run:

```sh
npx playwright install chromium
npm run test:claims
```

For the accessibility smoke test, run the preview server, then:

```sh
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

Vite builds a vanilla TypeScript application. `qrcode-generator` constructs matrices, `jsQR` checks QR previews locally, and `fflate` creates ZIP files. There is no backend. See [the demo notes](.factory/demo.md), [the claim manifest](.factory/claims.json), [the visual thesis](.factory/design.md), [privacy policy](privacy/index.html), and [terms](terms/index.html).

## License

MIT. See [LICENSE](LICENSE).
