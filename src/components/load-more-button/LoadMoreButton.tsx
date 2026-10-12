"use client";

import styles from "./LoadMoreButton.module.css";

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={styles.icon}
    >
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}

type LoadMoreButtonProps = {
  remaining: number;
  chunkSize: number;
  onLoadMore: () => void;
};

export function LoadMoreButton({
  remaining,
  chunkSize,
  onLoadMore,
}: LoadMoreButtonProps) {
  const safeRemaining = Math.max(0, remaining);
  if (safeRemaining === 0) return null;

  const next = Math.min(safeRemaining, chunkSize);
  const label = next === 1 ? "Carregar mais 1 jogo" : `Carregar mais ${next} jogos`;

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.button}
        onClick={onLoadMore}
        aria-label={label}
      >
        <PlusIcon />
        <span>{label}</span>
      </button>
    </div>
  );
}
