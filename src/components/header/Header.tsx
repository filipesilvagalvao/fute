"use client";

import styles from "./Header.module.css";
import { ShareButton, type ShareData } from "@/components/share-button/ShareButton";
import { RefreshButton } from "@/components/refresh-button/RefreshButton";

type HeaderProps = {
  todayLabel: string;
  shareData: ShareData;
  onRefresh: () => void;
  refreshThrottledUntil: number | null;
};

export function Header({
  todayLabel,
  shareData,
  onRefresh,
  refreshThrottledUntil,
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brandBlock}>
          <div className={styles.brand}>
            <span className={styles.logoDot} aria-hidden="true" />
            <span className={styles.brandName}>Futemax</span>
          </div>
          <p className={styles.subtitle}>
            Jogos de <strong>{todayLabel}</strong>
          </p>
        </div>

        <div className={styles.actions}>
          <RefreshButton
            onRefresh={onRefresh}
            throttledUntil={refreshThrottledUntil}
            size="sm"
          />
          <ShareButton shareData={shareData} size="sm" />
        </div>
      </div>
    </header>
  );
}
