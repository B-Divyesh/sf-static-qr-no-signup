import { describe, expect, it } from 'vitest';
import { createMatrix, createPdf, createSvg, DEFAULT_OPTIONS } from './qr';

describe('QR exports', () => {
  it('creates a square QR matrix', () => {
    const matrix = createMatrix('https://example.com', 'M');
    expect(matrix.count).toBeGreaterThanOrEqual(21);
    expect(matrix.modules).toHaveLength(matrix.count);
    expect(matrix.modules.every((row) => row.length === matrix.count)).toBe(true);
  });

  it('creates self-contained SVG with a quiet zone', () => {
    const svg = createSvg('hello', DEFAULT_OPTIONS);
    expect(svg).toMatch(/^<svg/);
    expect(svg).toContain('<title>Static QR code</title>');
    expect(svg).toContain('<path');
    expect(svg).not.toContain('http://example');
  });

  it('creates a 4 by 4 inch vector PDF page', async () => {
    const blob = createPdf('hello', DEFAULT_OPTIONS);
    expect(blob.type).toBe('application/pdf');
    const pdf = await blob.text();
    expect(pdf).toMatch(/^%PDF-1.4/);
    expect(pdf).toContain('/MediaBox [0 0 288 288]');
  });
});
