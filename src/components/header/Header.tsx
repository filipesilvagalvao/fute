"use client";

import styles from "./Header.module.css";
import { ShareButton, type ShareData } from "@/components/share-button/ShareButton";

type HeaderProps = {
  todayLabel: string;
  shareData: ShareData;
};

export function Header({ todayLabel, shareData }: HeaderProps) {
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
          <ShareButton shareData={shareData} size="sm" />
        </div>
      </div>
    </header>
  );
}
