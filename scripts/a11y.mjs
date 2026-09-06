import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const url = process.argv[2] ?? 'http://127.0.0.1:4173';
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
});
let failed = false;
const routes = ['/', '/demo', '/privacy/', '/terms/', '/404.html'];

for (const route of routes) {
  for (const viewport of [{ width: 1366, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(new URL(route, url).toString(), { waitUntil: 'networkidle' });
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    const basics = await page.evaluate(() => ({
      title: document.title,
      lang: document.documentElement.lang,
      h1: document.querySelectorAll('h1').length,
      main: Boolean(document.querySelector('main')),
      missingAlt: [...document.images].filter((image) => !image.hasAttribute('alt')).length,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    }));
    console.log(`${route} at ${viewport.width}px: ${result.violations.length} accessibility violations`);
    for (const violation of result.violations) {
      console.error(`- ${violation.id} (${violation.impact}): ${violation.help}`);
    }
    if (!basics.title || !basics.lang || basics.h1 !== 1 || !basics.main || basics.missingAlt || basics.horizontalOverflow || errors.length) {
      console.error(`${route} at ${viewport.width}px failed basics: ${JSON.stringify({ basics, errors })}`);
    }
    failed ||= result.violations.length > 0 || !basics.title || !basics.lang || basics.h1 !== 1 || !basics.main || basics.missingAlt > 0 || basics.horizontalOverflow || errors.length > 0;
    await context.close();
  }
}

await browser.close();
process.exitCode = failed ? 1 : 0;
