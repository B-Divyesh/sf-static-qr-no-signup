import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { unzipSync } from 'fflate';

test('recovers from invalid URL and event input in the visible form', async ({ page }) => {
  await page.goto('/demo', { waitUntil: 'networkidle' });

  await page.locator('#url').fill('http://');
  await expect(page.locator('#form-error')).toContainText('complete web address');
  await page.locator('#url').fill('north-pier-coffee.example/menu');
  await expect(page.locator('#payload-output')).toHaveText('https://north-pier-coffee.example/menu');
  await expect(page.locator('#form-error')).toHaveText('');

  await page.getByRole('tab', { name: 'Event' }).click();
  await page.locator('#eventTitle').fill('Market tasting');
  await page.locator('#start').fill('2026-09-12T18:00');
  await page.locator('#end').fill('2026-09-12T17:00');
  await expect(page.locator('#form-error')).toContainText('must end after');
  await page.locator('#end').fill('2026-09-12T20:00');
  await expect(page.locator('#payload-output')).toContainText('BEGIN:VCALENDAR');
  await expect(page.locator('#form-error')).toHaveText('');
});

test('handles the text boundary and a mixed valid-invalid CSV batch', async ({ page }) => {
  await page.goto('/demo', { waitUntil: 'networkidle' });
  await page.getByRole('tab', { name: 'Text' }).click();
  const boundaryText = 'x'.repeat(1200);
  await page.locator('#text').fill(boundaryText);
  await expect(page.locator('#payload-output')).toHaveText(boundaryText);
  await expect(page.locator('#verify-status')).toContainText('Verified');

  await page.getByRole('button', { name: 'Batch CSV' }).click();
  await page.locator('#csv-file').setInputFiles({
    name: 'mixed-batch.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('filename,type,text,ssid,password,encryption\nmenu,text,Market menu,,,,\nguest,wifi,,North Pier Guest,,WPA\nwelcome,text,Welcome to the pier,,,,\n'),
  });
  await expect(page.locator('#batch-summary')).toContainText('2');
  await expect(page.locator('#batch-errors')).toContainText('Row 3');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Build ZIP' }).click();
  const path = await (await downloadPromise).path();
  const archive = unzipSync(new Uint8Array(await readFile(path!)));
  expect(Object.keys(archive).sort()).toEqual(['menu.svg', 'welcome.svg']);
});

test('supports arrow-key type tabs and reduced motion', async ({ page, browser }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.getByRole('tab', { name: 'URL' }).focus();
  await page.getByRole('tab', { name: 'URL' }).press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Wi-Fi' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#ssid')).toBeFocused();

  const reducedContext = await browser.newContext({ reducedMotion: 'reduce' });
  const reducedPage = await reducedContext.newPage();
  try {
    await reducedPage.goto('/', { waitUntil: 'networkidle' });
    const duration = await reducedPage.locator('.button').first().evaluate((element) => getComputedStyle(element).transitionDuration);
    expect(Number.parseFloat(duration)).toBeLessThanOrEqual(0.01);
  } finally {
    await reducedContext.close();
  }
});
