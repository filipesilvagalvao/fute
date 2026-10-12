import styles from "./EmptyState.module.css";

export function EmptyState() {
  return (
    <div className={styles.wrapper} role="status">
      <span className={styles.icon} aria-hidden="true">
        ⚽
      </span>
      <p className={styles.message}>Não há jogos programados para hoje.</p>
    </div>
  );
}
