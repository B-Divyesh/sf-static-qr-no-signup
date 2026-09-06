import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const dist = new URL('../dist/', import.meta.url);
const root = new URL('../', import.meta.url);

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const file = join(directory, entry.name);
    return entry.isDirectory() ? listFiles(file) : [file];
  }));
  return files.flat();
}

const assetDirectory = new URL('assets/', dist);
const assetFiles = (await listFiles(assetDirectory.pathname))
  .filter((file) => !file.endsWith('.map'))
  .map((file) => `/${relative(dist.pathname, file).replaceAll('\\', '/')}`);
const shell = ['/', '/demo', '/privacy/', '/terms/', '/404.html', '/favicon.svg', '/apple-touch-icon.png', ...assetFiles];
const source = await readFile(new URL('sw.js', dist), 'utf8');
const replacement = `const SHELL = ${JSON.stringify(shell)};`;
if (!source.includes('const SHELL = __SHELL__;')) throw new Error('Service worker shell marker is missing.');
await writeFile(new URL('sw.js', dist), source.replace('const SHELL = __SHELL__;', replacement));
