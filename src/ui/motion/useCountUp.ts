import { useEffect, useRef, useState } from 'react';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const canAnimate = () => typeof requestAnimationFrame === 'function' && !prefersReducedMotion();

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t));

/**
 * Animates a number from its previous value to `target` — like a counter
 * settling. First render starts from zero; reduced-motion users get the final
 * value immediately.
 */
export function useCountUp(target: number, { duration = 900, enabled = true } = {}): number {
  const animatable = enabled && canAnimate();
  const [shown, setShown] = useState(() => (animatable ? 0 : target));
  const shownRef = useRef(shown);

  useEffect(() => {
    if (!animatable) return;
    const from = shownRef.current;
    if (from === target) return;
    const decimals = Number.isInteger(target) && Number.isInteger(from) ? 0 : 2;
    const k = 10 ** decimals;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = easeOutExpo(Math.min(1, (now - start) / duration));
      const v = p >= 1 ? target : Math.round((from + (target - from) * p) * k) / k;
      shownRef.current = v;
      setShown(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, animatable]);

  return animatable ? shown : target;
}
