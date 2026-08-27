import { describe, expect, it } from 'vitest';
import { buildPayload, compactDate } from './payload';

describe('buildPayload', () => {
  it('normalises a direct URL without introducing a redirect', () => {
    expect(buildPayload({ type: 'url', url: 'example.com/menu' })).toEqual({ payload: 'https://example.com/menu' });
  });

  it('escapes Wi-Fi special characters', () => {
    expect(buildPayload({ type: 'wifi', ssid: 'Cafe;Guest', password: 'p:a,ss', encryption: 'WPA', hidden: true }).payload)
      .toBe('WIFI:T:WPA;S:Cafe\\;Guest;P:p\\:a\\,ss;H:true;;');
  });

  it('does not retain a password when the network is open', () => {
    expect(buildPayload({ type: 'wifi', ssid: 'Guest', password: 'old-secret', encryption: 'nopass' }).payload)
      .toBe('WIFI:T:nopass;S:Guest;P:;H:false;;');
  });

  it('creates a compatible vCard 3 payload', () => {
    const result = buildPayload({ type: 'vcard', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' });
    expect(result.payload).toContain('BEGIN:VCARD\r\nVERSION:3.0');
    expect(result.payload).toContain('N:Lovelace;Ada;;;');
    expect(result.payload).toContain('EMAIL;TYPE=INTERNET:ada@example.com');
  });

  it('rejects an event ending before it starts', () => {
    const result = buildPayload({ type: 'event', eventTitle: 'Opening', start: '2026-08-27T12:00', end: '2026-08-27T11:00' });
    expect(result.error).toMatch(/end after/i);
  });

  it('converts local date input into compact UTC format', () => {
    expect(compactDate('2026-08-27T12:00Z')).toBe('20260827T120000Z');
  });
});
