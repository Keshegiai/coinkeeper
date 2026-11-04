import type { ReactNode } from 'react';
import { Logo } from '@/layout/Logo';
import { ThemeToggle } from '@/layout/ThemeToggle';
import styles from './AuthLayout.module.css';

const COLS = 24;
const ROWS = 14;

/** Pseudo-random but stable dot field — a nod to the Glyph matrix. Computed once. */
const DOTS = (() => {
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: COLS * ROWS }, (_, i) => {
    const x = i % COLS;
    const y = Math.floor(i / COLS);
    // A rising "chart" silhouette.
    const h = Math.round(ROWS * (0.25 + 0.6 * (x / COLS) + 0.12 * Math.sin(x * 0.9)));
    const on = ROWS - y <= h;
    return { on, accent: on && x === COLS - 3 && ROWS - y === h, delay: Math.round(rnd() * 3000) };
  });
})();

export function AuthLayout({ index, title, subtitle, children }: { index: string; title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className={styles.page}>
      <aside className={`${styles.art} inverse`} aria-hidden>
        <Logo size="lg" />
        <div className={styles.field} style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
          {DOTS.map((d, i) => (
            <span key={i} className={d.accent ? styles.accentDot : d.on ? styles.on : styles.off} style={d.on ? { animationDelay: `${d.delay}ms` } : undefined} />
          ))}
        </div>
        <p className={styles.tagline}>
          Деньги
          <br />
          без шума.
        </p>
        <span className="label">Личные финансы · v2.0</span>
      </aside>

      <main className={styles.formSide}>
        <div className={styles.topbar}>
          <span className={styles.mobileLogo}>
            <Logo />
          </span>
          <ThemeToggle />
        </div>
        <div className={styles.formWrap}>
          <span className="label">
            <span className="accent">[{index}]</span> {subtitle}
          </span>
          <h1 className={styles.title}>
            <span className="dotted" aria-hidden>
              {title}
            </span>
            <span className="sr-only">{title}</span>
          </h1>
          {children}
        </div>
      </main>
    </div>
  );
}
