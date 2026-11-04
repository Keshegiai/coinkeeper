import { addDays, daysBetween, isValidISODate, parseISODate, relativeDayLabel, startOfWeek, toISODate, addMonths } from './date';

describe('date', () => {
  it('formats in the local calendar, not UTC', () => {
    // 00:30 local time on Jan 1 is still Dec 31 in UTC for UTC+ zones.
    expect(toISODate(new Date(2026, 0, 1, 0, 30))).toBe('2026-01-01');
  });

  it('round-trips ISO dates', () => {
    expect(toISODate(parseISODate('2024-02-29'))).toBe('2024-02-29');
  });

  it('adds days across month and year boundaries', () => {
    expect(addDays('2025-12-31', 1)).toBe('2026-01-01');
    expect(addDays('2024-03-01', -1)).toBe('2024-02-29');
  });

  it('clamps day when adding months', () => {
    expect(toISODate(addMonths(new Date(2025, 0, 31), 1))).toBe('2025-02-28');
  });

  it('counts days inclusively', () => {
    expect(daysBetween('2026-11-01', '2026-11-30')).toBe(30);
    expect(daysBetween('2026-11-04', '2026-11-04')).toBe(1);
  });

  it('uses Monday as week start', () => {
    expect(toISODate(startOfWeek(new Date(2026, 10, 8)))).toBe('2026-11-02'); // Sunday → Monday before
    expect(toISODate(startOfWeek(new Date(2026, 10, 2)))).toBe('2026-11-02');
  });

  it('validates ISO dates strictly', () => {
    expect(isValidISODate('2026-02-30')).toBe(false);
    expect(isValidISODate('2026-2-3')).toBe(false);
    expect(isValidISODate('2026-02-28')).toBe(true);
  });

  it('labels today and yesterday', () => {
    expect(relativeDayLabel('2026-11-04', '2026-11-04')).toBe('Сегодня');
    expect(relativeDayLabel('2026-11-03', '2026-11-04')).toBe('Вчера');
  });
});
