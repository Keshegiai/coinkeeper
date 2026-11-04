import { periodFromSearch, periodToSearch, previousPeriod, resolvePeriod } from './period';

const NOW = new Date(2026, 10, 4); // Wed, 4 Nov 2026

describe('period', () => {
  it('resolves month with offset', () => {
    expect(resolvePeriod({ preset: 'month', offset: 0 }, NOW)).toMatchObject({ from: '2026-11-01', to: '2026-11-30' });
    expect(resolvePeriod({ preset: 'month', offset: -11 }, NOW)).toMatchObject({ from: '2025-12-01', to: '2025-12-31' });
  });

  it('resolves week (Mon–Sun)', () => {
    expect(resolvePeriod({ preset: 'week', offset: 0 }, NOW)).toMatchObject({ from: '2026-11-02', to: '2026-11-08' });
    expect(resolvePeriod({ preset: 'week', offset: -1 }, NOW)).toMatchObject({ from: '2026-10-26', to: '2026-11-01' });
  });

  it('resolves year and all-time', () => {
    expect(resolvePeriod({ preset: 'year', offset: -1 }, NOW)).toMatchObject({ from: '2025-01-01', to: '2025-12-31', label: '2025' });
    expect(resolvePeriod({ preset: 'all', offset: 3 }, NOW)).toMatchObject({ from: null, to: null, navigable: false });
  });

  it('normalises an inverted custom range and ignores garbage', () => {
    expect(resolvePeriod({ preset: 'custom', offset: 0, from: '2026-05-10', to: '2026-05-01' }, NOW)).toMatchObject({ from: '2026-05-01', to: '2026-05-10' });
    expect(resolvePeriod({ preset: 'custom', offset: 0, from: 'nope' }, NOW)).toMatchObject({ from: null, to: null });
  });

  it('computes previous period of equal length', () => {
    expect(previousPeriod(resolvePeriod({ preset: 'month', offset: 0 }, NOW))).toEqual({ from: '2026-10-01', to: '2026-10-31' });
    expect(previousPeriod(resolvePeriod({ preset: 'week', offset: 0 }, NOW))).toEqual({ from: '2026-10-26', to: '2026-11-01' });
    expect(previousPeriod(resolvePeriod({ preset: 'all', offset: 0 }, NOW))).toBeNull();
  });

  it('round-trips through URL params and keeps unrelated params', () => {
    const base = new URLSearchParams('q=coffee');
    const qs = periodToSearch({ preset: 'year', offset: -2 }, base);
    expect(qs.get('q')).toBe('coffee');
    expect(periodFromSearch(qs)).toMatchObject({ preset: 'year', offset: -2 });
    expect(periodToSearch({ preset: 'month', offset: 0 }, base).toString()).toBe('q=coffee');
  });

  it('falls back to defaults for unknown presets', () => {
    expect(periodFromSearch(new URLSearchParams('p=decade&o=x'))).toMatchObject({ preset: 'month', offset: 0 });
  });
});
