import { expect, test } from '@playwright/test';

async function expectPhoneTouchTargets(page: import('@playwright/test').Page, state: string): Promise<void> {
  const undersized = await page.locator('a[href], button, input, select, textarea, summary').evaluateAll((elements) => elements
    .filter((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    })
    .map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        element: element.tagName.toLowerCase(),
        label: element.getAttribute('aria-label') || element.textContent?.trim() || element.getAttribute('name') || element.id,
        width: Math.round(rect.width * 10) / 10,
        height: Math.round(rect.height * 10) / 10,
      };
    })
    .filter(({ width, height }) => width < 44 || height < 44));

  expect(undersized, `${state} should have no visible interactive target below 44 × 44 CSS px`).toEqual([]);
}

test('the designed 404 page gives visitors a way back', async ({ page }) => {
  await page.goto('/404.html', { waitUntil: 'networkidle' });
  await expect(page).toHaveTitle('Page not found — Static QR');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page was not found');
  await expect(page.getByRole('link', { name: 'Open generator' })).toHaveAttribute('href', '/');
});

test('demo and legal pages have their own route titles and one main heading', async ({ page }) => {
  await page.goto('/demo', { waitUntil: 'networkidle' });
  await expect(page).toHaveTitle('Demo — Static QR');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await page.goto('/privacy/', { waitUntil: 'networkidle' });
  await expect(page).toHaveTitle('Privacy — Static QR');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await page.goto('/terms/', { waitUntil: 'networkidle' });
  await expect(page).toHaveTitle('Terms — Static QR');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
});

test('phone routes and every generator workspace keep touch targets at least 44 by 44 pixels', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo', { waitUntil: 'networkidle' });
  await expectPhoneTouchTargets(page, 'demo URL editor');

  await page.getByText('Drawing controls').click();
  await expectPhoneTouchTargets(page, 'open drawing controls');

  for (const tab of ['Wi-Fi', 'vCard', 'Event', 'Text', 'URL']) {
    await page.getByRole('tab', { name: tab }).click();
    if (tab === 'vCard') await page.getByText('Postal address (optional)').click();
    await expectPhoneTouchTargets(page, `${tab} editor`);
  }

  await page.getByRole('button', { name: 'Batch CSV' }).click();
  await expect(page.locator('#batch')).toBeVisible();
  await expectPhoneTouchTargets(page, 'batch workspace');

  for (const route of ['/privacy/', '/terms/', '/404.html']) {
    await page.goto(route, { waitUntil: 'networkidle' });
    await expectPhoneTouchTargets(page, route);
  }
});
