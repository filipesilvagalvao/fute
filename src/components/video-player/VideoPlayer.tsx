"use client";

import { useState } from "react";
import styles from "./VideoPlayer.module.css";

type VideoPlayerProps = {
  src: string;
  title?: string;
};

export function VideoPlayer({ src, title = "Player" }: VideoPlayerProps) {
  const [hasError, setHasError] = useState(false);

  if (!src) {
    return null;
  }

  if (hasError) {
    return (
      <div className={styles.fallback} role="alert">
        <p className={styles.fallbackText}>
          Não foi possível carregar este player no navegador.
        </p>
        <a
          className={styles.fallbackLink}
          href={src}
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir transmissão em nova aba
        </a>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.frame}>
        <iframe
          key={src}
          src={src}
          title={title}
          className={styles.iframe}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          onError={() => setHasError(true)}
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}
