import { flushSync } from 'react-dom';

const reducedMotion = () => typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Switch the colour theme with a "screen waking up" reveal: the new theme
 * appears as a dot in the centre, stretches into a vertical line and then
 * opens sideways like curtains (see `vt-curtain` in global.css).
 *
 * Falls back to an instant switch when the View Transitions API is missing,
 * the user prefers reduced motion, or the resolved theme doesn't change.
 */
export function switchTheme(next: 'light' | 'dark', update: () => void) {
  const root = document.documentElement;
  if (root.dataset.theme === next || typeof document.startViewTransition !== 'function' || reducedMotion()) {
    update();
    return;
  }
  root.classList.add('theme-vt');
  const vt = document.startViewTransition(() => {
    // The snapshot is taken right after this callback — React must have re-rendered by then.
    flushSync(update);
    root.dataset.theme = next;
  });
  void vt.finished.finally(() => root.classList.remove('theme-vt'));
}
