# Demo sandbox

Open [https://static-qr-no-signup.sociobot.in/demo](https://static-qr-no-signup.sociobot.in/demo), or use `/?demo=1` during local development.

The demo opens a completed QR for the realistic sample destination `https://north-pier-coffee.example/menu?location=market-square`. It includes the generated preview, exact payload, download controls, and local scan check.

The demo banner stays visible while the sample is active. **Reset demo** restores the North Pier Coffee sample. **Start for real** removes the `sessionStorage` marker `demo:static-qr:active`, returns to `/`, and starts with an empty URL form. Real QR input is held in memory only; the app does not read or write it while demo mode is active.

Every claim test starts from `/demo` in a new browser context. The offline test creates and closes its own context after the service worker controls the sample page.
