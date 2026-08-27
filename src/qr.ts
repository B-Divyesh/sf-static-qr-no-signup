import qrFactory from 'qrcode-generator';

export type ErrorLevel = 'L' | 'M' | 'Q' | 'H';

export interface QrOptions {
  errorLevel: ErrorLevel;
  quietZone: number;
  foreground: string;
  background: string;
  logo?: string;
  logoScale?: number;
}

export interface QrMatrix {
  modules: boolean[][];
  count: number;
}

export const DEFAULT_OPTIONS: QrOptions = {
  errorLevel: 'M', quietZone: 4, foreground: '#10283f', background: '#ffffff', logoScale: 0.18,
};

export function createMatrix(payload: string, level: ErrorLevel): QrMatrix {
  const qr = qrFactory(0, level);
  qr.addData(payload, 'Byte');
  qr.make();
  const count = qr.getModuleCount();
  const modules = Array.from({ length: count }, (_, row) =>
    Array.from({ length: count }, (_, column) => qr.isDark(row, column)),
  );
  return { modules, count };
}

const xmlEscape = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function matrixPath(matrix: QrMatrix, quietZone: number): string {
  const parts: string[] = [];
  matrix.modules.forEach((row, y) => {
    let start = -1;
    for (let x = 0; x <= matrix.count; x += 1) {
      const dark = x < matrix.count && row[x];
      if (dark && start < 0) start = x;
      if (!dark && start >= 0) {
        parts.push(`M${start + quietZone} ${y + quietZone}h${x - start}v1H${start + quietZone}z`);
        start = -1;
      }
    }
  });
  return parts.join('');
}

export function createSvg(payload: string, options: QrOptions, title = 'Static QR code'): string {
  const matrix = createMatrix(payload, options.errorLevel);
  const size = matrix.count + options.quietZone * 2;
  const logoSize = matrix.count * (options.logoScale ?? 0.18);
  const logoPosition = (size - logoSize) / 2;
  const logo = options.logo
    ? `<rect x="${logoPosition - 0.7}" y="${logoPosition - 0.7}" width="${logoSize + 1.4}" height="${logoSize + 1.4}" rx="1" fill="${options.background}"/><image href="${xmlEscape(options.logo)}" x="${logoPosition}" y="${logoPosition}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet"/>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges" role="img"><title>${xmlEscape(title)}</title><rect width="${size}" height="${size}" fill="${options.background}"/><path d="${matrixPath(matrix, options.quietZone)}" fill="${options.foreground}"/>${logo}</svg>`;
}

export function drawCanvas(canvas: HTMLCanvasElement, payload: string, options: QrOptions, pixels = 1024): QrMatrix {
  const matrix = createMatrix(payload, options.errorLevel);
  const units = matrix.count + options.quietZone * 2;
  const scale = Math.max(1, Math.floor(pixels / units));
  const size = units * scale;
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Canvas is unavailable in this browser.');
  context.imageSmoothingEnabled = false;
  context.fillStyle = options.background;
  context.fillRect(0, 0, size, size);
  context.fillStyle = options.foreground;
  matrix.modules.forEach((row, y) => row.forEach((dark, x) => {
    if (dark) context.fillRect((x + options.quietZone) * scale, (y + options.quietZone) * scale, scale, scale);
  }));
  if (options.logo) {
    const image = new Image();
    image.src = options.logo;
    if (image.complete) drawLogo(context, image, size, options);
    else image.addEventListener('load', () => drawLogo(context, image, size, options), { once: true });
  }
  return matrix;
}

function drawLogo(context: CanvasRenderingContext2D, image: HTMLImageElement, size: number, options: QrOptions): void {
  const logoSize = size * (options.logoScale ?? 0.18);
  const padding = size * 0.012;
  const x = (size - logoSize) / 2;
  context.fillStyle = options.background;
  context.fillRect(x - padding, x - padding, logoSize + padding * 2, logoSize + padding * 2);
  context.drawImage(image, x, x, logoSize, logoSize);
}

export async function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('PNG export failed.')), 'image/png'));
}

export function createPdf(payload: string, options: QrOptions): Blob {
  const matrix = createMatrix(payload, options.errorLevel);
  const page = 360;
  const qrSize = 288;
  const units = matrix.count + options.quietZone * 2;
  const unit = qrSize / units;
  const offset = (page - qrSize) / 2;
  const rgb = hexRgb(options.foreground);
  const background = hexRgb(options.background);
  const commands = [`${background.join(' ')} rg`, `0 0 ${page} ${page} re f`, `${rgb.join(' ')} rg`];
  matrix.modules.forEach((row, y) => row.forEach((dark, x) => {
    if (dark) commands.push(`${round(offset + (x + options.quietZone) * unit)} ${round(offset + (matrix.count - y - 1 + options.quietZone) * unit)} ${round(unit + 0.01)} ${round(unit + 0.01)} re f`);
  }));
  const stream = commands.join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${page} ${page}] /Resources << >> /Contents 4 0 R >>`,
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((value) => { pdf += `${String(value).padStart(10, '0')} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type: 'application/pdf' });
}

function round(value: number): string { return value.toFixed(3).replace(/\.?0+$/, ''); }
function hexRgb(hex: string): string[] {
  const value = hex.replace('#', '');
  return [0, 2, 4].map((index) => (parseInt(value.slice(index, index + 2), 16) / 255).toFixed(3));
}

export async function verifyCanvas(canvas: HTMLCanvasElement, expected: string): Promise<boolean> {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return false;
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const { default: jsQR } = await import('jsqr');
  const result = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
  return result?.data === expected;
}
