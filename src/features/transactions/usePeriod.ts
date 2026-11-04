import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { periodFromSearch, periodToSearch, resolvePeriod, type PeriodSpec } from '@/lib/period';

/** Period state lives in the URL so every view is linkable and survives reloads. */
export function usePeriod() {
  const [params, setParams] = useSearchParams();
  const spec = useMemo(() => periodFromSearch(params), [params]);
  const period = useMemo(() => resolvePeriod(spec), [spec]);
  const setSpec = useCallback(
    (next: PeriodSpec) => setParams((prev) => periodToSearch(next, prev), { replace: true }),
    [setParams],
  );
  return { spec, period, setSpec };
}
