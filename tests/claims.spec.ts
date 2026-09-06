import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { unzipSync } from 'fflate';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import type { Download } from '@playwright/test';

const SAMPLE_URL = 'https://north-pier-coffee.example/menu?location=market-square';

async function openDemo(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/demo', { waitUntil: 'networkidle' });
  await expect(page.locator('#demo-banner')).toBeVisible();
  await expect(page.locator('#url')).toHaveValue(SAMPLE_URL);
  await expect(page.locator('#payload-output')).toHaveText(SAMPLE_URL);
  await expect(page.locator('#verify-status')).toContainText('Verified');
}

function httpRequests(page: import('@playwright/test').Page): string[] {
  const requests: string[] = [];
  page.on('request', (request) => {
    if (request.url().startsWith('http://') || request.url().startsWith('https://')) requests.push(request.url());
  });
  return requests;
}

function decodePng(bytes: Uint8Array): string {
  const png = PNG.sync.read(Buffer.from(bytes));
  const decoded = jsQR(Uint8ClampedArray.from(png.data), png.width, png.height, { inversionAttempts: 'attemptBoth' });
  expect(decoded, 'the downloaded batch PNG should be a decodable QR').not.toBeNull();
  return decoded!.data;
}

async function readDownload(download: Download): Promise<Uint8Array> {
  const path = await download.path();
  expect(path, `download ${download.suggestedFilename()} should have a local path`).not.toBeNull();
  return new Uint8Array(await readFile(path!));
}

async function openBatch(page: import('@playwright/test').Page): Promise<void> {
  await openDemo(page);
  await page.getByRole('button', { name: 'Batch CSV' }).click();
  await expect(page.locator('#batch')).toBeVisible();
}

test('@claim:demo-sandbox loads, resets, and discards only sample data', async ({ page }) => {
  await openDemo(page);
  await expect(page.locator('body')).toHaveClass(/demo-mode/);
  expect(await page.evaluate(() => sessionStorage.getItem('demo:static-qr:active'))).toBe('1');

  await page.locator('#url').fill('https://changed.example/menu');
  await expect(page.locator('#payload-output')).toHaveText('https://changed.example/menu');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#payload-output')).toHaveText(SAMPLE_URL);

  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('#url')).toHaveValue('');
  expect(await page.evaluate(() => sessionStorage.getItem('demo:static-qr:active'))).toBeNull();
});

test('@claim:free-download downloads the sample SVG without payment', async ({ page }) => {
  await openDemo(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download SVG' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('north-pier-coffee-menu.svg');
});

test('@claim:no-account creates and downloads a QR without an account prompt', async ({ page }) => {
  await openDemo(page);
  await expect(page.getByRole('button', { name: /sign in|create account|log in/i })).toHaveCount(0);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download SVG' }).click();
  await expect(await downloadPromise).toBeTruthy();
});

test('@claim:local-processing makes no payload upload while generating and downloading', async ({ page }) => {
  const requests = httpRequests(page);
  await openDemo(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download SVG' }).click();
  await downloadPromise;
  const origin = new URL(page.url()).origin;
  expect(requests.every((url) => new URL(url).origin === origin)).toBe(true);
  expect(requests.some((url) => /north-pier-coffee|market-square/i.test(url))).toBe(false);
});

test('@claim:direct-payload shows and decodes the direct sample destination', async ({ page }) => {
  await openDemo(page);
  await expect(page.locator('#payload-output')).toHaveText(SAMPLE_URL);
  await expect(page.locator('#verify-status')).toHaveText('Verified — decoder recovered the exact payload');
});

test('@claim:five-code-types creates a payload for every listed type', async ({ page }) => {
  await openDemo(page);

  await page.getByRole('tab', { name: 'Wi-Fi' }).click();
  await page.locator('#ssid').fill('North Pier Guest');
  await page.locator('#password').fill('harbor-coffee');
  await expect(page.locator('#payload-output')).toContainText('WIFI:T:WPA;S:North Pier Guest;P:harbor-coffee');

  await page.getByRole('tab', { name: 'vCard' }).click();
  await page.locator('#firstName').fill('Rina');
  await page.locator('#lastName').fill('Ibrahim');
  await expect(page.locator('#payload-output')).toContainText('BEGIN:VCARD');

  await page.getByRole('tab', { name: 'Event' }).click();
  await page.locator('#eventTitle').fill('North Pier tasting');
  await page.locator('#start').fill('2026-09-12T18:00');
  await page.locator('#end').fill('2026-09-12T20:00');
  await expect(page.locator('#payload-output')).toContainText('BEGIN:VCALENDAR');

  await page.getByRole('tab', { name: 'Text' }).click();
  await page.locator('#text').fill('Ask for the market menu.');
  await expect(page.locator('#payload-output')).toHaveText('Ask for the market menu.');

  await page.getByRole('tab', { name: 'URL' }).click();
  await page.locator('#url').fill('north-pier-coffee.example/order');
  await expect(page.locator('#payload-output')).toHaveText('https://north-pier-coffee.example/order');
});

test('@claim:svg-download downloads a complete SVG QR file', async ({ page }) => {
  await openDemo(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download SVG' }).click();
  const path = await (await downloadPromise).path();
  const svg = await readFile(path!, 'utf8');
  expect(svg).toMatch(/^<svg/);
  expect(svg).toContain('<path');
  expect(svg).toContain('Static QR code');
});

test('@claim:png-2048-download downloads a 2048 px PNG', async ({ page }) => {
  await openDemo(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /PNG/ }).click();
  const path = await (await downloadPromise).path();
  const png = await readFile(path!);
  expect(png.subarray(1, 4).toString('ascii')).toBe('PNG');
  expect(png.readUInt32BE(16)).toBe(2048);
  expect(png.readUInt32BE(20)).toBe(2048);
});

test('@claim:pdf-4in-download downloads a vector PDF on a 4 by 4 inch page', async ({ page }) => {
  await openDemo(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /PDF/ }).click();
  const path = await (await downloadPromise).path();
  const pdf = await readFile(path!, 'utf8');
  expect(pdf).toMatch(/^%PDF-1.4/);
  expect(pdf).toContain('/MediaBox [0 0 288 288]');
});

test('@claim:logo-scan-check accepts an SVG logo, uses high correction, and verifies the QR', async ({ page }) => {
  await openDemo(page);
  await page.getByText('Drawing controls').click();
  await expect(page.locator('#logo')).toHaveAttribute('accept', /image\/svg\+xml/);
  await page.locator('#logo').setInputFiles({
    name: 'north-pier-mark.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="#174f78"/></svg>'),
  });
  await expect(page.locator('#error-level')).toHaveValue('H');
  await expect(page.locator('#verify-status')).toContainText('Verified');
});

test('@claim:csv-batch-500 builds and downloads a 500-file SVG ZIP', async ({ page }) => {
  test.setTimeout(120_000);
  await openDemo(page);
  await page.getByRole('button', { name: 'Batch CSV' }).click();
  const rows = Array.from({ length: 500 }, (_, index) => `north-pier-${index + 1},text,Table ${index + 1}`).join('\n');
  await page.locator('#csv-file').setInputFiles({
    name: 'north-pier-batch.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(`filename,type,text\n${rows}`),
  });
  await expect(page.locator('#batch-summary')).toContainText('500');
  await expect(page.getByRole('button', { name: 'Build ZIP' })).toBeEnabled();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Build ZIP' }).click();
  const path = await (await downloadPromise).path();
  const archive = unzipSync(new Uint8Array(await readFile(path!)));
  expect(Object.keys(archive)).toHaveLength(500);
  expect(Object.keys(archive)).toContain('north-pier-500.svg');
});

test('@claim:batch-png-1024 builds a PNG ZIP with 1024 px QR files', async ({ page }) => {
  await openDemo(page);
  await page.getByRole('button', { name: 'Batch CSV' }).click();
  await page.locator('#csv-file').setInputFiles({
    name: 'north-pier-png.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('filename,type,text\nmarket-menu,text,Today’s market menu'),
  });
  await page.locator('#batch-format').selectOption('png');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Build ZIP' }).click();
  const path = await (await downloadPromise).path();
  const archive = unzipSync(new Uint8Array(await readFile(path!)));
  const png = Buffer.from(archive['market-menu.png']!);
  expect(png.readUInt32BE(16)).toBe(1024);
  expect(png.readUInt32BE(20)).toBe(1024);
});

test('@claim:csv-template-download downloads a template that builds all five sample QR files', async ({ page }) => {
  await openBatch(page);
  const templatePromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download CSV template' }).click();
  const template = await templatePromise;
  expect(template.suggestedFilename()).toBe('static-qr-template.csv');
  const templatePath = await template.path();

  await page.locator('#csv-file').setInputFiles(templatePath!);
  await expect(page.locator('#batch-summary')).toContainText('05');
  await expect(page.locator('#batch-errors')).toHaveText('');

  const zipPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Build ZIP' }).click();
  const archive = unzipSync(await readDownload(await zipPromise));
  expect(Object.keys(archive).sort()).toEqual([
    'ada-contact.svg',
    'guest-wifi.svg',
    'menu.svg',
    'opening-night.svg',
    'welcome.svg',
  ]);
});

test('@claim:csv-drop accepts a dropped CSV and builds its QR ZIP', async ({ page }) => {
  await openBatch(page);
  await page.locator('#drop-zone').evaluate((zone) => {
    const transfer = new DataTransfer();
    transfer.items.add(new File(
      ['filename,type,text\nmarket-welcome,text,Welcome to Market Square'],
      'dropped-market.csv',
      { type: 'text/csv' },
    ));
    zone.dispatchEvent(new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer: transfer }));
    zone.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer }));
  });
  await expect(page.locator('#batch-summary')).toContainText('01');
  await expect(page.locator('#batch-summary')).toContainText('dropped-market.csv is ready');

  const zipPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Build ZIP' }).click();
  const archive = unzipSync(await readDownload(await zipPromise));
  expect(Object.keys(archive)).toEqual(['market-welcome.svg']);
});

test('@claim:csv-quoted-fields preserves quoted commas and escaped quotes in a batch QR', async ({ page }) => {
  await openBatch(page);
  await page.locator('#csv-file').setInputFiles({
    name: 'quoted-market.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('filename,type,text\nmarket-note,text,"Welcome, ""traders"""'),
  });
  await page.locator('#batch-format').selectOption('png');
  const zipPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Build ZIP' }).click();
  const archive = unzipSync(await readDownload(await zipPromise));
  expect(decodePng(archive['market-note.png']!)).toBe('Welcome, "traders"');
});

test('@claim:batch-invalid-row-exclusion reports invalid rows and omits them from the ZIP', async ({ page }) => {
  await openBatch(page);
  await page.locator('#csv-file').setInputFiles({
    name: 'mixed-market.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from([
      'filename,type,text,ssid,password,encryption',
      'menu,text,Market menu,,,',
      'guest,wifi,,Market Guest,,WPA',
      'welcome,text,Welcome to the market,,,',
    ].join('\n')),
  });
  await expect(page.locator('#batch-errors')).toContainText('Row 3');
  await expect(page.locator('#batch-summary')).toContainText('02');

  const zipPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Build ZIP' }).click();
  const archive = unzipSync(await readDownload(await zipPromise));
  expect(Object.keys(archive).sort()).toEqual(['menu.svg', 'welcome.svg']);
  expect(archive['guest.svg']).toBeUndefined();
});

test('@claim:batch-five-type-schema maps every documented type-specific column into its QR payload', async ({ page }) => {
  test.setTimeout(90_000);
  await openBatch(page);
  await page.locator('#csv-file').setInputFiles({
    name: 'five-types.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from([
      'filename,type,url,ssid,password,encryption,hidden,first_name,last_name,phone,email,organization,event_title,start,end,location,description,text',
      'menu,url,example.com/menu?service=dinner,,,,,,,,,,,,,,,',
      'guest,wifi,,Market Guest,coffee-pass,WPA,true,,,,,,,,,,,',
      'ada,vcard,,,,,,Ada,Lovelace,+44 20 0000 0000,ada@example.com,Analytical Engines,,,,,',
      'opening,event,,,,,,,,,,,Opening night,2026-09-12T18:00,2026-09-12T21:00,Main Hall,Doors open,',
      'welcome,text,,,,,,,,,,,,,,,,Welcome to Market Square',
    ].join('\n')),
  });
  await expect(page.locator('#batch-summary')).toContainText('05');
  await expect(page.locator('#batch-errors')).toHaveText('');
  await page.locator('#batch-format').selectOption('png');

  const zipPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Build ZIP' }).click();
  const archive = unzipSync(await readDownload(await zipPromise));
  const payloads = Object.fromEntries(Object.entries(archive).map(([name, bytes]) => [name, decodePng(bytes)]));

  expect(payloads['menu.png']).toBe('https://example.com/menu?service=dinner');
  expect(payloads['guest.png']).toBe('WIFI:T:WPA;S:Market Guest;P:coffee-pass;H:true;;');
  expect(payloads['ada.png']).toContain('N:Lovelace;Ada;;;');
  expect(payloads['ada.png']).toContain('TEL;TYPE=CELL:+44 20 0000 0000');
  expect(payloads['ada.png']).toContain('EMAIL;TYPE=INTERNET:ada@example.com');
  expect(payloads['ada.png']).toContain('ORG:Analytical Engines');
  expect(payloads['opening.png']).toContain('SUMMARY:Opening night');
  expect(payloads['opening.png']).toContain('DTSTART:20260912T180000Z');
  expect(payloads['opening.png']).toContain('DTEND:20260912T210000Z');
  expect(payloads['opening.png']).toContain('LOCATION:Main Hall');
  expect(payloads['opening.png']).toContain('DESCRIPTION:Doors open');
  expect(payloads['welcome.png']).toBe('Welcome to Market Square');
});

test('@claim:offline-after-first-visit reloads the sample and generates while offline', async ({ browser }) => {
  const offlineContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await offlineContext.newPage();
  try {
    await page.goto('/demo', { waitUntil: 'networkidle' });
    await page.waitForFunction(async () => {
      await navigator.serviceWorker.ready;
      return Boolean(navigator.serviceWorker.controller);
    });
    await offlineContext.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('#demo-banner')).toBeVisible();
    await expect(page.locator('#url')).toHaveValue(SAMPLE_URL);
    await page.getByRole('tab', { name: 'Text' }).click();
    await page.locator('#text').fill('Offline market menu');
    await expect(page.locator('#payload-output')).toHaveText('Offline market menu');
  } finally {
    await offlineContext.close();
  }
});

test('@claim:no-cookies sets no cookies during a sample QR flow', async ({ page, context }) => {
  const cookies: string[] = [];
  page.on('response', (response) => {
    const header = response.headers()['set-cookie'];
    if (header) cookies.push(header);
  });
  await openDemo(page);
  expect(cookies).toEqual([]);
  expect(await context.cookies()).toEqual([]);
  expect(await page.evaluate(() => document.cookie)).toBe('');
});

test('@claim:no-analytics makes no tracking request during a sample QR flow', async ({ page }) => {
  const requests = httpRequests(page);
  await openDemo(page);
  await page.waitForTimeout(250);
  const paths = requests.map((url) => new URL(url).pathname);
  expect(paths.some((path) => /analytics|collect|pixel|beacon|track/i.test(path))).toBe(false);
  expect(requests.every((url) => new URL(url).origin === new URL(page.url()).origin)).toBe(true);
});

test('@claim:no-third-party-runtime loads every runtime request from the product origin', async ({ page }) => {
  const requests = httpRequests(page);
  await openDemo(page);
  await page.getByRole('tab', { name: 'Text' }).click();
  await page.locator('#text').fill('No remote generator needed');
  await expect(page.locator('#verify-status')).toContainText('Verified');
  const origin = new URL(page.url()).origin;
  expect(requests).not.toHaveLength(0);
  expect(requests.every((url) => new URL(url).origin === origin)).toBe(true);
});

test('@claim:no-payload-retention clears real QR input after reload', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.locator('#url').fill('https://private.example/invite/bluebird');
  await expect(page.locator('#payload-output')).toHaveText('https://private.example/invite/bluebird');
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.locator('#url')).toHaveValue('');
  await expect(page.locator('#payload-output')).toHaveText('No payload yet.');
});

test('@claim:no-local-storage does not store real QR payloads in local storage', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.locator('#url').fill('https://private.example/invite/bluebird');
  await expect(page.locator('#payload-output')).toHaveText('https://private.example/invite/bluebird');
  expect(await page.evaluate(() => ({ ...localStorage }))).toEqual({});
});
