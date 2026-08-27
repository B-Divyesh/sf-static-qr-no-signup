import type { PayloadValues, CodeType } from './payload';

export function parseCsv(source: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quoted) {
      if (character === '"' && source[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') quoted = false;
      else field += character;
    } else if (character === '"') quoted = true;
    else if (character === ',') {
      row.push(field.trim());
      field = '';
    } else if (character === '\n') {
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = '';
    } else if (character !== '\r') field += character;
  }
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

const aliases: Record<string, keyof PayloadValues | 'filename'> = {
  type: 'type', filename: 'filename', name: 'filename', url: 'url', text: 'text', ssid: 'ssid',
  password: 'password', encryption: 'encryption', hidden: 'hidden', first_name: 'firstName',
  firstname: 'firstName', last_name: 'lastName', lastname: 'lastName', organization: 'organization',
  organisation: 'organization', job_title: 'jobTitle', title: 'jobTitle', phone: 'phone', email: 'email',
  website: 'website', street: 'street', city: 'city', region: 'region', postcode: 'postcode',
  country: 'country', event_title: 'eventTitle', start: 'start', end: 'end', location: 'location',
  description: 'description', value: 'text',
};

export interface BatchRow {
  filename: string;
  values: PayloadValues;
  rowNumber: number;
}

export function csvToBatch(source: string): { rows: BatchRow[]; errors: string[] } {
  const parsed = parseCsv(source);
  if (parsed.length < 2) return { rows: [], errors: ['Add a header row and at least one data row.'] };
  const headers = parsed[0]!.map((header) => aliases[header.toLowerCase().replace(/[ -]+/g, '_')]);
  if (!headers.includes('type')) return { rows: [], errors: ['The CSV needs a “type” column.'] };
  const rows: BatchRow[] = [];
  const errors: string[] = [];
  parsed.slice(1).forEach((cells, offset) => {
    const rowNumber = offset + 2;
    const values: Record<string, unknown> = {};
    let filename = `qr-${rowNumber - 1}`;
    cells.forEach((cell, index) => {
      const key = headers[index];
      if (!key) return;
      if (key === 'filename') filename = cell || filename;
      else if (key === 'hidden') values[key] = ['true', 'yes', '1'].includes(cell.toLowerCase());
      else values[key] = cell;
    });
    const type = String(values.type ?? '').toLowerCase() as CodeType;
    if (!['url', 'wifi', 'vcard', 'event', 'text'].includes(type)) {
      errors.push(`Row ${rowNumber}: type must be url, wifi, vcard, event, or text.`);
      return;
    }
    if (type === 'url' && !values.url && values.text) values.url = values.text;
    rows.push({ filename: safeFilename(filename), values: { ...values, type } as PayloadValues, rowNumber });
  });
  return { rows, errors };
}

export function safeFilename(value: string): string {
  return value.trim().replace(/\.[^.]+$/, '').replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'qr-code';
}

export const CSV_TEMPLATE = `filename,type,url,text,ssid,password,encryption,hidden,first_name,last_name,phone,email,organization,event_title,start,end,location,description
menu,url,https://example.com/menu,,,,,,,,,,,,,,,
guest-wifi,wifi,,,Cafe Guest,good-coffee,WPA,false,,,,,,,,,,
welcome,text,,Welcome to our event!,,,,,,,,,,,,,,
ada-contact,vcard,,,,,,,Ada,Lovelace,+44 20 0000 0000,ada@example.com,Analytical Engines,,,,,
opening-night,event,,,,,,,,,,,,Opening night,2026-09-12T18:00,2026-09-12T21:00,Main Hall,Doors open at 17:30`;
