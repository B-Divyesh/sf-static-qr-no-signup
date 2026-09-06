import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { unzipSync } from 'fflate';

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
