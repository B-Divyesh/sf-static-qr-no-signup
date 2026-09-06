import './styles.css';
import { buildPayload, type CodeType, type PayloadValues } from './payload';
import { CSV_TEMPLATE, csvToBatch, type BatchRow, safeFilename } from './csv';
import { DEFAULT_OPTIONS, canvasBlob, createMatrix, createPdf, createSvg, drawCanvas, verifyCanvas, type ErrorLevel, type QrOptions } from './qr';

const form = document.querySelector<HTMLFormElement>('#qr-form')!;
const fields = document.querySelector<HTMLDivElement>('#dynamic-fields')!;
const formError = document.querySelector<HTMLDivElement>('#form-error')!;
const formTitle = document.querySelector<HTMLElement>('#form-title')!;
const formKicker = document.querySelector<HTMLElement>('#form-kicker')!;
const canvas = document.querySelector<HTMLCanvasElement>('#qr-canvas')!;
const emptyPreview = document.querySelector<HTMLElement>('#empty-preview')!;
const payloadOutput = document.querySelector<HTMLElement>('#payload-output')!;
const verifyStatus = document.querySelector<HTMLElement>('#verify-status')!;
const moduleCount = document.querySelector<HTMLElement>('#module-count')!;
const quietOutput = document.querySelector<HTMLOutputElement>('#quiet-output')!;
const filenameInput = document.querySelector<HTMLInputElement>('#filename')!;
const buttons = {
  svg: document.querySelector<HTMLButtonElement>('#download-svg')!,
  png: document.querySelector<HTMLButtonElement>('#download-png')!,
  pdf: document.querySelector<HTMLButtonElement>('#download-pdf')!,
};

const DEMO_STORAGE_KEY = 'demo:static-qr:active';
const SAMPLE_URL = 'https://north-pier-coffee.example/menu?location=market-square';
const landingHero = document.querySelector<HTMLElement>('#landing-hero')!;
const demoIntro = document.querySelector<HTMLElement>('#demo-intro')!;
const demoBanner = document.querySelector<HTMLElement>('#demo-banner')!;
const heroTitle = document.querySelector<HTMLElement>('#hero-title')!;
const demoTitleAnchor = document.querySelector<HTMLElement>('#demo-title-anchor')!;
function hasDemoMarker(): boolean {
  try {
    return sessionStorage.getItem(DEMO_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}
let demoMode = window.location.pathname.replace(/\/$/, '') === '/demo'
  || new URLSearchParams(window.location.search).get('demo') === '1'
  || (!navigator.onLine && hasDemoMarker());

let currentType: CodeType = 'url';
let currentPayload = '';
let logoData = '';
let renderSequence = 0;
let toastTimer = 0;

const fieldTemplates: Record<CodeType, { kicker: string; title: string; html: string }> = {
  url: {
    kicker: 'Destination', title: 'Where should it point?', html: `
      <label class="field" for="url"><span>Website address</span><input id="url" name="url" type="url" inputmode="url" autocomplete="url" placeholder="example.com/menu" aria-describedby="url-hint" /></label>
      <small class="field-hint" id="url-hint">We add https:// when you omit it. The final address is shown in the payload inspector.</small>`,
  },
  wifi: {
    kicker: 'Network access', title: 'Which network should join?', html: `
      <label class="field" for="ssid"><span>Network name (SSID)</span><input id="ssid" name="ssid" autocomplete="off" /></label>
      <div class="field-row"><label class="field" for="encryption"><span>Security</span><select id="encryption" name="encryption"><option value="WPA">WPA / WPA2 / WPA3</option><option value="WEP">WEP (legacy)</option><option value="nopass">No password</option></select></label><label class="field" for="password"><span>Password</span><input id="password" name="password" type="password" autocomplete="new-password" /></label></div>
      <label class="checkbox-field"><input name="hidden" type="checkbox" /> Hidden network</label>`,
  },
  vcard: {
    kicker: 'Contact card', title: 'Who should be saved?', html: `
      <div class="field-row"><label class="field" for="firstName"><span>First name</span><input id="firstName" name="firstName" autocomplete="given-name" /></label><label class="field" for="lastName"><span>Last name</span><input id="lastName" name="lastName" autocomplete="family-name" /></label></div>
      <div class="field-row"><label class="field" for="organization"><span>Organisation</span><input id="organization" name="organization" autocomplete="organization" /></label><label class="field" for="jobTitle"><span>Job title</span><input id="jobTitle" name="jobTitle" autocomplete="organization-title" /></label></div>
      <div class="field-row"><label class="field" for="phone"><span>Mobile phone</span><input id="phone" name="phone" type="tel" autocomplete="tel" /></label><label class="field" for="email"><span>Email</span><input id="email" name="email" type="email" autocomplete="email" /></label></div>
      <label class="field" for="website"><span>Website <small>optional</small></span><input id="website" name="website" type="url" inputmode="url" autocomplete="url" /></label>
      <details><summary>Postal address (optional)</summary><label class="field" for="street"><span>Street</span><input id="street" name="street" autocomplete="street-address" /></label><div class="field-row"><label class="field" for="city"><span>City</span><input id="city" name="city" autocomplete="address-level2" /></label><label class="field" for="region"><span>Region</span><input id="region" name="region" autocomplete="address-level1" /></label></div><div class="field-row"><label class="field" for="postcode"><span>Postcode</span><input id="postcode" name="postcode" autocomplete="postal-code" /></label><label class="field" for="country"><span>Country</span><input id="country" name="country" autocomplete="country-name" /></label></div></details>`,
  },
  event: {
    kicker: 'Calendar event', title: 'What goes on the calendar?', html: `
      <label class="field" for="eventTitle"><span>Event title</span><input id="eventTitle" name="eventTitle" /></label>
      <div class="field-row"><label class="field" for="start"><span>Starts</span><input id="start" name="start" type="datetime-local" /></label><label class="field" for="end"><span>Ends</span><input id="end" name="end" type="datetime-local" /></label></div>
      <label class="field" for="location"><span>Location <small>optional</small></span><input id="location" name="location" autocomplete="street-address" /></label>
      <label class="field" for="description"><span>Description <small>optional</small></span><textarea id="description" name="description"></textarea></label>
      <small class="field-hint">Times are encoded as UTC using this device’s current time zone.</small>`,
  },
  text: {
    kicker: 'Plain text', title: 'What should it say?', html: `
      <label class="field" for="text"><span>Text <output id="text-count">0 characters</output></span><textarea id="text" name="text" maxlength="1200" placeholder="A short note, reference number or instruction"></textarea></label>
      <small class="field-hint">Shorter content creates a simpler code that is easier to scan at small sizes.</small>`,
  },
};

function setType(type: CodeType, focusField = true): void {
  currentType = type;
  const template = fieldTemplates[type];
  formKicker.textContent = template.kicker;
  formTitle.textContent = template.title;
  fields.innerHTML = template.html;
  document.querySelectorAll<HTMLButtonElement>('[data-type]').forEach((button) => button.setAttribute('aria-selected', String(button.dataset.type === type)));
  const first = fields.querySelector<HTMLElement>('input, textarea, select');
  if (focusField) first?.focus({ preventScroll: true });
  update();
}

function collectValues(): PayloadValues {
  const data = new FormData(form);
  const values = Object.fromEntries(data.entries()) as Record<string, string>;
  return { ...values, type: currentType, hidden: data.has('hidden') } as PayloadValues;
}

function getOptions(): QrOptions {
  const errorLevel = (document.querySelector<HTMLSelectElement>('#error-level')!.value || 'M') as ErrorLevel;
  return {
    ...DEFAULT_OPTIONS,
    errorLevel: logoData ? 'H' : errorLevel,
    quietZone: Number(document.querySelector<HTMLInputElement>('#quiet-zone')!.value),
    foreground: document.querySelector<HTMLInputElement>('#foreground')!.value,
    background: document.querySelector<HTMLInputElement>('#background')!.value,
    logo: logoData || undefined,
  };
}

function update(): void {
  const sequence = ++renderSequence;
  const result = buildPayload(collectValues());
  currentPayload = result.payload;
  formError.textContent = result.error ?? '';
  payloadOutput.textContent = result.payload || 'No payload yet.';
  quietOutput.textContent = `${getOptions().quietZone} module${getOptions().quietZone === 1 ? '' : 's'}`;
  if (currentType === 'text') {
    const count = document.querySelector<HTMLOutputElement>('#text-count');
    if (count) count.textContent = `${(collectValues().text ?? '').length} characters`;
  }
  const enabled = Boolean(result.payload);
  Object.values(buttons).forEach((button) => { button.disabled = !enabled; });
  buttons.pdf.disabled = !enabled || Boolean(logoData);
  buttons.pdf.title = logoData ? 'Remove the logo to download a vector PDF.' : '';
  canvas.classList.toggle('is-empty', !enabled);
  emptyPreview.hidden = enabled;
  if (!enabled) {
    moduleCount.textContent = '— modules';
    setVerify('waiting', 'Scan check waiting');
    return;
  }
  try {
    const matrix = drawCanvas(canvas, result.payload, getOptions(), 756);
    moduleCount.textContent = `${matrix.count} × ${matrix.count} modules`;
    setVerify('checking', 'Checking with the built-in decoder…');
    window.setTimeout(async () => {
      if (sequence !== renderSequence) return;
      try {
        const verified = await verifyCanvas(canvas, result.payload);
        if (sequence !== renderSequence) return;
        setVerify(verified ? 'success' : 'failure', verified ? 'Verified — decoder recovered the exact payload' : 'Scan check failed — increase contrast, quiet zone, or remove the logo');
      } catch {
        setVerify('failure', 'Scan check unavailable in this browser; test the downloaded code before printing');
      }
    }, logoData ? 250 : 40);
  } catch (error) {
    currentPayload = '';
    formError.textContent = error instanceof Error && /code length/i.test(error.message)
      ? 'This content is too long for a QR code. Shorten it and try again.'
      : 'The code could not be drawn. Shorten the content and try again.';
    Object.values(buttons).forEach((button) => { button.disabled = true; });
    setVerify('failure', 'Drawing failed');
  }
}

function setVerify(state: 'waiting' | 'checking' | 'success' | 'failure', message: string): void {
  verifyStatus.className = `verify-row ${state}`;
  verifyStatus.querySelector('span:last-child')!.textContent = message;
}

function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportName(extension: string): string { return `${safeFilename(filenameInput.value)}.${extension}`; }

buttons.svg.addEventListener('click', () => {
  if (!currentPayload) return;
  download(new Blob([createSvg(currentPayload, getOptions())], { type: 'image/svg+xml' }), exportName('svg'));
  showToast('SVG downloaded — ready for print.');
});
buttons.png.addEventListener('click', async () => {
  if (!currentPayload) return;
  const exportCanvas = document.createElement('canvas');
  drawCanvas(exportCanvas, currentPayload, getOptions(), 2048);
  if (logoData) await new Promise((resolve) => window.setTimeout(resolve, 100));
  download(await canvasBlob(exportCanvas), exportName('png'));
  showToast('2048 px PNG downloaded.');
});
buttons.pdf.addEventListener('click', () => {
  if (!currentPayload || logoData) return;
  download(createPdf(currentPayload, getOptions()), exportName('pdf'));
  showToast('4 × 4 inch vector PDF downloaded.');
});

form.addEventListener('input', update);
form.addEventListener('change', update);
document.querySelectorAll<HTMLButtonElement>('[data-type]').forEach((button) => button.addEventListener('click', () => setType(button.dataset.type as CodeType)));
document.querySelector('.type-tabs')!.addEventListener('keydown', (event) => {
  if (!(event instanceof KeyboardEvent) || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  const tabs = [...document.querySelectorAll<HTMLButtonElement>('[data-type]')];
  const current = tabs.findIndex((tab) => tab.dataset.type === currentType);
  const next = (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
  event.preventDefault();
  tabs[next]!.click();
});

const logoInput = document.querySelector<HTMLInputElement>('#logo')!;
const removeLogo = document.querySelector<HTMLButtonElement>('#remove-logo')!;
logoInput.addEventListener('change', () => {
  const file = logoInput.files?.[0];
  if (!file) return;
  if (!['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'].includes(file.type)) {
    formError.textContent = 'Choose a PNG, JPEG, WebP, or SVG logo.';
    logoInput.value = '';
    return;
  }
  if (file.size > 1_000_000) {
    formError.textContent = 'The logo is over 1 MB. Choose a smaller image.';
    logoInput.value = '';
    return;
  }
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    logoData = String(reader.result);
    document.querySelector<HTMLSelectElement>('#error-level')!.value = 'H';
    removeLogo.hidden = false;
    showToast('Logo added. High error correction is on.');
    update();
  });
  reader.readAsDataURL(file);
});
removeLogo.addEventListener('click', () => {
  logoData = '';
  logoInput.value = '';
  removeLogo.hidden = true;
  update();
});

function showToast(message: string): void {
  const toast = document.querySelector<HTMLElement>('#toast')!;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2800);
}

// Batch CSV workspace
const batchSection = document.querySelector<HTMLElement>('#batch')!;
const csvInput = document.querySelector<HTMLInputElement>('#csv-file')!;
const dropZone = document.querySelector<HTMLElement>('#drop-zone')!;
const batchSummary = document.querySelector<HTMLElement>('#batch-summary')!;
const batchErrors = document.querySelector<HTMLElement>('#batch-errors')!;
const buildBatch = document.querySelector<HTMLButtonElement>('#build-batch')!;
const batchProgress = document.querySelector<HTMLElement>('#batch-progress')!;
let batchRows: BatchRow[] = [];

document.querySelectorAll<HTMLButtonElement>('[data-open-batch]').forEach((button) => button.addEventListener('click', () => {
  batchSection.hidden = false;
  batchSection.scrollIntoView({ behavior: 'smooth' });
  window.setTimeout(() => csvInput.focus(), 250);
}));
document.querySelector('#close-batch')!.addEventListener('click', () => {
  batchSection.hidden = true;
  document.querySelector<HTMLElement>('[data-open-batch]')?.focus();
});

async function loadCsv(file: File): Promise<void> {
  if (file.size > 2_000_000) {
    batchErrors.textContent = 'That CSV is over 2 MB. Split it into smaller sheets of up to 500 rows.';
    return;
  }
  const parsed = csvToBatch(await file.text());
  const validationErrors = [...parsed.errors];
  const validRows = parsed.rows.filter((row) => {
    const result = buildPayload(row.values);
    if (result.error) validationErrors.push(`Row ${row.rowNumber}: ${result.error}`);
    return !result.error;
  });
  if (parsed.rows.length > 500) validationErrors.push(`This file has ${parsed.rows.length} data rows. Keep each batch to 500.`);
  batchRows = parsed.rows.length <= 500 ? validRows : [];
  batchErrors.textContent = validationErrors.slice(0, 8).join('\n') + (validationErrors.length > 8 ? `\n…and ${validationErrors.length - 8} more errors.` : '');
  batchSummary.innerHTML = `<span class="large-number">${String(batchRows.length).padStart(2, '0')}</span><div><strong>Valid code${batchRows.length === 1 ? '' : 's'} on the sheet</strong><span>${validationErrors.length ? `${validationErrors.length} row${validationErrors.length === 1 ? '' : 's'} need attention.` : `${file.name} is ready.`}</span></div>`;
  buildBatch.disabled = batchRows.length === 0;
  batchProgress.textContent = '';
}

csvInput.addEventListener('change', () => { const file = csvInput.files?.[0]; if (file) void loadCsv(file); });
['dragenter', 'dragover'].forEach((name) => dropZone.addEventListener(name, (event) => { event.preventDefault(); dropZone.classList.add('dragging'); }));
['dragleave', 'drop'].forEach((name) => dropZone.addEventListener(name, (event) => { event.preventDefault(); dropZone.classList.remove('dragging'); }));
dropZone.addEventListener('drop', (event) => {
  const file = (event as DragEvent).dataTransfer?.files[0];
  if (file) void loadCsv(file);
});
document.querySelector('#download-template')!.addEventListener('click', () => download(new Blob([CSV_TEMPLATE], { type: 'text/csv' }), 'static-qr-template.csv'));

buildBatch.addEventListener('click', async () => {
  if (!batchRows.length) return;
  buildBatch.disabled = true;
  const format = document.querySelector<HTMLSelectElement>('#batch-format')!.value;
  batchProgress.textContent = `Preparing 0 of ${batchRows.length}…`;
  const files: Record<string, Uint8Array> = {};
  const seen = new Set<string>();
  for (let index = 0; index < batchRows.length; index += 1) {
    const row = batchRows[index]!;
    const payload = buildPayload(row.values).payload;
    let name = row.filename;
    let suffix = 2;
    while (seen.has(name)) name = `${row.filename}-${suffix++}`;
    seen.add(name);
    if (format === 'svg') {
      files[`${name}.svg`] = new TextEncoder().encode(createSvg(payload, DEFAULT_OPTIONS, name));
    } else {
      const batchCanvas = document.createElement('canvas');
      drawCanvas(batchCanvas, payload, DEFAULT_OPTIONS, 1024);
      files[`${name}.png`] = new Uint8Array(await (await canvasBlob(batchCanvas)).arrayBuffer());
    }
    if (index % 8 === 0) {
      batchProgress.textContent = `Preparing ${index + 1} of ${batchRows.length}…`;
      await new Promise((resolve) => window.setTimeout(resolve, 0));
    }
  }
  batchProgress.textContent = 'Compressing ZIP…';
  const { zipSync } = await import('fflate');
  const zipped = zipSync(files, { level: 6 });
  download(new Blob([zipped as BlobPart], { type: 'application/zip' }), `static-qr-batch-${format}.zip`);
  batchProgress.textContent = `Done — ${batchRows.length} ${format.toUpperCase()} files downloaded.`;
  buildBatch.disabled = false;
});

function updateNetworkState(): void {
  document.querySelector<HTMLElement>('#offline-notice')!.hidden = navigator.onLine;
}
window.addEventListener('online', updateNetworkState);
window.addEventListener('offline', updateNetworkState);
updateNetworkState();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));
}

function storeDemoMarker(): void {
  try {
    sessionStorage.setItem(DEMO_STORAGE_KEY, '1');
  } catch {
    // Demo data remains in memory if browser storage is unavailable.
  }
}

function discardDemoMarker(): void {
  try {
    sessionStorage.removeItem(DEMO_STORAGE_KEY);
  } catch {
    // There is no persisted demo data to remove when storage is unavailable.
  }
}

function resetDemo(): void {
  logoData = '';
  logoInput.value = '';
  removeLogo.hidden = true;
  document.querySelector<HTMLSelectElement>('#error-level')!.value = 'M';
  document.querySelector<HTMLInputElement>('#quiet-zone')!.value = '4';
  document.querySelector<HTMLInputElement>('#foreground')!.value = '#10283f';
  document.querySelector<HTMLInputElement>('#background')!.value = '#ffffff';
  filenameInput.value = 'north-pier-coffee-menu';
  batchRows = [];
  batchSection.hidden = true;
  batchErrors.textContent = '';
  batchProgress.textContent = '';
  buildBatch.disabled = true;
  batchSummary.innerHTML = '<span class="large-number">00</span><div><strong>Codes on the sheet</strong><span>Upload a CSV to inspect it.</span></div>';
  setType('url', false);
  const url = fields.querySelector<HTMLInputElement>('#url')!;
  url.value = SAMPLE_URL;
  update();
}

function setDemoMode(): void {
  document.body.classList.toggle('demo-mode', demoMode);
  landingHero.hidden = demoMode;
  demoIntro.hidden = !demoMode;
  demoBanner.hidden = !demoMode;
  if (demoMode) {
    document.title = 'Demo — Static QR';
    heroTitle.id = 'demo-title';
    heroTitle.textContent = 'Create a QR with sample data';
    demoTitleAnchor.replaceWith(heroTitle);
    storeDemoMarker();
    resetDemo();
  } else {
    discardDemoMarker();
    setType('url', false);
  }
}

document.querySelector<HTMLButtonElement>('#reset-demo')!.addEventListener('click', () => {
  resetDemo();
  showToast('Sample data restored.');
});
document.querySelector<HTMLAnchorElement>('#start-real')!.addEventListener('click', discardDemoMarker);

setDemoMode();
