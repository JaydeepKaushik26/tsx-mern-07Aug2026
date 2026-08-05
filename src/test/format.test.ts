import { describe, it, expect } from 'vitest';
import { formatDateDDMMYYYY, heightInMeters, massInKg } from '../utils/format';

describe('formatDateDDMMYYYY', () => {
  it('formats an ISO date as dd-MM-yyyy', () => {
    expect(formatDateDDMMYYYY('2014-12-09T13:50:51.644000Z')).toBe('09-12-2014');
  });

  it('returns Unknown for an unparsable date', () => {
    expect(formatDateDDMMYYYY('not-a-date')).toBe('Unknown');
  });
});

describe('heightInMeters', () => {
  it('converts centimeters to meters', () => {
    expect(heightInMeters('172')).toBe('1.72 m');
  });

  it('handles unknown height', () => {
    expect(heightInMeters('unknown')).toBe('Unknown');
  });
});

describe('massInKg', () => {
  it('formats mass with a kg suffix', () => {
    expect(massInKg('77')).toBe('77 kg');
  });

  it('strips thousands separators before parsing', () => {
    expect(massInKg('1,358')).toBe('1,358 kg');
  });

  it('handles unknown mass', () => {
    expect(massInKg('unknown')).toBe('Unknown');
  });
});
