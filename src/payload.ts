export type CodeType = 'url' | 'wifi' | 'vcard' | 'event' | 'text';

export interface PayloadValues {
  type: CodeType;
  url?: string;
  text?: string;
  ssid?: string;
  password?: string;
  encryption?: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
  firstName?: string;
  lastName?: string;
  organization?: string;
  jobTitle?: string;
  phone?: string;
  email?: string;
  website?: string;
  street?: string;
  city?: string;
  region?: string;
  postcode?: string;
  country?: string;
  eventTitle?: string;
  start?: string;
  end?: string;
  location?: string;
  description?: string;
}

export interface PayloadResult {
  payload: string;
  error?: string;
}

const escapeWifi = (value = '') => value.replace(/([\\;,:"])/g, '\\$1');
const escapeVcard = (value = '') => value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');
const escapeIcal = (value = '') => value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');

function normaliseUrl(raw = ''): string {
  const value = raw.trim();
  if (!value) return '';
  if (/^[a-z][a-z\d+.-]*:/i.test(value)) return value;
  return `https://${value}`;
}

function validateWebUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return ['http:', 'https:'].includes(parsed.protocol) && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

export function compactDate(value = ''): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

export function buildPayload(values: PayloadValues): PayloadResult {
  if (values.type === 'url') {
    const payload = normaliseUrl(values.url);
    if (!payload) return { payload: '', error: 'Enter a destination URL to draw the code.' };
    if (!validateWebUrl(payload)) return { payload: '', error: 'Enter a complete web address, such as example.com/menu.' };
    return { payload };
  }

  if (values.type === 'text') {
    const payload = (values.text ?? '').trim();
    if (!payload) return { payload: '', error: 'Enter the text you want the code to contain.' };
    return { payload };
  }

  if (values.type === 'wifi') {
    const ssid = (values.ssid ?? '').trim();
    if (!ssid) return { payload: '', error: 'Enter the Wi-Fi network name (SSID).' };
    const encryption = values.encryption ?? 'WPA';
    if (encryption !== 'nopass' && !(values.password ?? '')) {
      return { payload: '', error: 'Enter the Wi-Fi password, or choose “No password”.' };
    }
    return {
      payload: `WIFI:T:${encryption};S:${escapeWifi(ssid)};P:${escapeWifi(encryption === 'nopass' ? '' : values.password)};H:${values.hidden ? 'true' : 'false'};;`,
    };
  }

  if (values.type === 'vcard') {
    const first = (values.firstName ?? '').trim();
    const last = (values.lastName ?? '').trim();
    if (!first && !last && !(values.organization ?? '').trim()) {
      return { payload: '', error: 'Enter a name or organisation for the contact.' };
    }
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${escapeVcard(last)};${escapeVcard(first)};;;`,
      `FN:${escapeVcard([first, last].filter(Boolean).join(' ') || values.organization)}`,
    ];
    if (values.organization) lines.push(`ORG:${escapeVcard(values.organization)}`);
    if (values.jobTitle) lines.push(`TITLE:${escapeVcard(values.jobTitle)}`);
    if (values.phone) lines.push(`TEL;TYPE=CELL:${escapeVcard(values.phone)}`);
    if (values.email) lines.push(`EMAIL;TYPE=INTERNET:${escapeVcard(values.email)}`);
    if (values.website) lines.push(`URL:${escapeVcard(normaliseUrl(values.website))}`);
    if ([values.street, values.city, values.region, values.postcode, values.country].some(Boolean)) {
      lines.push(`ADR;TYPE=WORK:;;${escapeVcard(values.street)};${escapeVcard(values.city)};${escapeVcard(values.region)};${escapeVcard(values.postcode)};${escapeVcard(values.country)}`);
    }
    lines.push('END:VCARD');
    return { payload: lines.join('\r\n') };
  }

  const title = (values.eventTitle ?? '').trim();
  const start = compactDate(values.start);
  const end = compactDate(values.end);
  if (!title) return { payload: '', error: 'Enter an event title.' };
  if (!start || !end) return { payload: '', error: 'Choose a valid start and end time.' };
  if (new Date(values.end ?? '').getTime() <= new Date(values.start ?? '').getTime()) {
    return { payload: '', error: 'The event must end after it starts.' };
  }
  const uid = `static-${hashString(`${title}|${start}|${end}`)}@staticqr.local`;
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Static QR//Event//EN', 'BEGIN:VEVENT',
    `UID:${uid}`, `DTSTART:${start}`, `DTEND:${end}`, `SUMMARY:${escapeIcal(title)}`,
  ];
  if (values.location) lines.push(`LOCATION:${escapeIcal(values.location)}`);
  if (values.description) lines.push(`DESCRIPTION:${escapeIcal(values.description)}`);
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return { payload: lines.join('\r\n') };
}

export function hashString(input: string): string {
  let hash = 2166136261;
  for (const character of input) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}
