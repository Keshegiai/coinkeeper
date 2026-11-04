import styles from './Logo.module.css';

export function Logo({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <span className={`${styles.logo} ${styles[size]}`}>
      <span className={styles.mark} aria-hidden>
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className={styles.word}>COINKEEPER</span>
    </span>
  );
}
