"use client";

import { useEffect, useState } from "react";
import styles from "./RefreshButton.module.css";

function RefreshIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={styles.icon}
    >
      <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4a8 8 0 1 0 7.45 11h-2.1A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z" />
    </svg>
  );
}

type RefreshButtonProps = {
  onRefresh: () => void | Promise<void>;
  throttledUntil: number | null;
  label?: string;
};

export function RefreshButton({
  onRefresh,
  throttledUntil,
  label = "Atualizar",
}: RefreshButtonProps) {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (throttledUntil === null) return;
    if (Date.now() >= throttledUntil) return;

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [throttledUntil]);

  const remainingMs =
    throttledUntil === null ? 0 : Math.max(0, throttledUntil - now);
  const isThrottled = remainingMs > 0;
  const remainingSec = Math.ceil(remainingMs / 1000);

  const handleClick = () => {
    if (isThrottled) return;
    void onRefresh();
  };

  const ariaLabel = isThrottled
    ? `Atualização bloqueada. Aguarde ${remainingSec} segundos para buscar novamente.`
    : "Atualizar lista de jogos";

  return (
    <button
      type="button"
      className={`${styles.button} ${isThrottled ? styles.buttonThrottled : ""}`}
      onClick={handleClick}
      disabled={isThrottled}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <RefreshIcon />
      <span className={styles.label}>
        {isThrottled ? `Aguarde ${remainingSec}s` : label}
      </span>
    </button>
  );
}
