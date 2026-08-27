import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const url = process.argv[2] ?? 'http://127.0.0.1:4173';
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
});
let failed = false;

for (const viewport of [{ width: 1366, height: 900 }, { width: 390, height: 844 }]) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  console.log(`${viewport.width}px: ${result.violations.length} accessibility violations`);
  for (const violation of result.violations) {
    console.error(`- ${violation.id} (${violation.impact}): ${violation.help}`);
  }
  failed ||= result.violations.length > 0;
  await context.close();
}

await browser.close();
process.exitCode = failed ? 1 : 0;
