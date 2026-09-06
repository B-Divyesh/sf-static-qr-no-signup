import { expect, test } from '@playwright/test';

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
