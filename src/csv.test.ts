import { describe, expect, it } from 'vitest';
import { csvToBatch, parseCsv, safeFilename } from './csv';

describe('CSV batch parsing', () => {
  it('supports quoted commas and escaped quotes', () => {
    expect(parseCsv('name,type,text\nwelcome,text,"Hello, ""world"""')).toEqual([
      ['name', 'type', 'text'], ['welcome', 'text', 'Hello, "world"'],
    ]);
  });

  it('maps supported headers into payload values', () => {
    const parsed = csvToBatch('filename,type,url\nmenu,url,example.com/menu');
    expect(parsed.errors).toEqual([]);
    expect(parsed.rows[0]).toMatchObject({ filename: 'menu', values: { type: 'url', url: 'example.com/menu' } });
  });

  it('reports invalid types with the row number', () => {
    expect(csvToBatch('filename,type,text\nx,video,hello').errors[0]).toMatch(/Row 2/);
  });

  it('creates safe, extension-free filenames', () => {
    expect(safeFilename(' Café Menu.svg ')).toBe('Caf-Menu');
  });
});
