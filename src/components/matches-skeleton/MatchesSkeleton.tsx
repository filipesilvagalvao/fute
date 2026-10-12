import styles from "./MatchesSkeleton.module.css";

type MatchesSkeletonProps = {
  count?: number;
};

function CardSkeleton() {
  return (
    <article className={styles.card} aria-hidden="true">
      <header className={styles.statusRow}>
        <span className={`${styles.shimmer} ${styles.statusBadge}`} />
      </header>

      <div className={styles.teamsRow}>
        <div className={styles.teamSide}>
          <span
            className={`${styles.shimmer} ${styles.crest}`}
            style={{ width: 42, height: 42 }}
          />
          <span
            className={`${styles.shimmer} ${styles.teamName}`}
            style={{ width: "70%" }}
          />
        </div>
        <span className={styles.versus} aria-hidden="true">
          ×
        </span>
        <div className={styles.teamSide}>
          <span
            className={`${styles.shimmer} ${styles.crest}`}
            style={{ width: 42, height: 42 }}
          />
          <span
            className={`${styles.shimmer} ${styles.teamName}`}
            style={{ width: "70%" }}
          />
        </div>
      </div>

      <footer className={styles.championshipRow}>
        <span
          className={`${styles.shimmer} ${styles.championship}`}
          style={{ width: "55%" }}
        />
      </footer>
    </article>
  );
}

export function MatchesSkeleton({ count = 8 }: MatchesSkeletonProps) {
  return (
    <div
      className={styles.wrapper}
      role="status"
      aria-label="Carregando jogos do dia"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}
