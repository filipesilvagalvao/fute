"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ShareButton.module.css";

export type ShareData = {
  title?: string;
  text?: string;
  url?: string;
};

type ShareFeedback = "idle" | "copied" | "shared" | "error";

type ShareButtonProps = {
  shareData: ShareData;
  variant?: "icon" | "icon-label";
  className?: string;
  size?: "sm" | "md";
};

function ShareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={styles.icon}
    >
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={styles.icon}
    >
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  );
}

export function ShareButton({
  shareData,
  variant = "icon",
  className,
  size = "md",
}: ShareButtonProps) {
  const [feedback, setFeedback] = useState<ShareFeedback>("idle");
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const settle = (next: ShareFeedback) => {
    setFeedback(next);
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      setFeedback("idle");
      timerRef.current = null;
    }, 2200);
  };

  const handleClick = async () => {
    const url =
      shareData.url ??
      (typeof window !== "undefined" ? window.location.href : "");

    const fullData: ShareData = { ...shareData, url };

    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    ) {
      try {
        await navigator.share(fullData);
        settle("shared");
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
      }
    }

    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard?.writeText &&
        url
      ) {
        await navigator.clipboard.writeText(url);
        settle("copied");
        return;
      }
    } catch {
      // fallthrough
    }

    settle("error");
  };

  const isPositive = feedback === "copied" || feedback === "shared";
  const labelText =
    feedback === "copied"
      ? "Copiado!"
      : feedback === "shared"
      ? "Compartilhado!"
      : feedback === "error"
      ? "Falhou"
      : variant === "icon-label"
      ? "Compartilhar"
      : "Compartilhar";

  const sizeClass = size === "sm" ? styles.sizeSm : styles.sizeMd;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${styles.button} ${sizeClass} ${
        isPositive ? styles.buttonPositive : ""
      } ${className ?? ""}`}
      aria-label={
        feedback === "idle" ? "Compartilhar" : `Compartilhar (${labelText})`
      }
      title={labelText}
    >
      {isPositive ? <CheckIcon /> : <ShareIcon />}
      {variant === "icon-label" && (
        <span className={styles.label}>{labelText}</span>
      )}
    </button>
  );
}
