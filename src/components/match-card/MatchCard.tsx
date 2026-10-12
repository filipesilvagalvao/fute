"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./MatchCard.module.css";
import type { Match, MatchStatusInfo } from "@/types/match";

type MatchCardProps = {
  match: Match;
  status: MatchStatusInfo;
  onSelect: (match: Match) => void;
};

function TeamLogo({
  name,
  src,
  size = 36,
}: {
  name: string;
  src: string;
  size?: number;
}) {
  const [hasError, setHasError] = useState(false);
  const initials = name
    .split(" ")
    .map((word) => word.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (hasError) {
    return (
      <span
        className={styles.teamLogoFallback}
        style={{ width: size, height: size }}
        aria-label={`Escudo de ${name} indisponível`}
        role="img"
      >
        {initials}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={`Escudo de ${name}`}
      width={size}
      height={size}
      loading="lazy"
      unoptimized
      className={styles.teamLogo}
      onError={() => setHasError(true)}
    />
  );
}

function PlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={styles.playIconSvg}
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function MatchCard({ match, status, onSelect }: MatchCardProps) {
  const handleClick = () => {
    onSelect(match);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLElement>
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(match);
    }
  };

  const isLive = status.status === "live";

  return (
    <article
      role="button"
      tabIndex={0}
      className={`${styles.card} ${isLive ? styles.cardLive : ""}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`${match.time_casa.nome} versus ${match.time_visitante.nome}, ${
        match.campeonato
      }, ${status.label}`}
    >
      <header className={styles.statusRow}>
        <span
          className={`${styles.status} ${
            status.status === "live"
              ? styles.statusLive
              : status.status === "finished"
              ? styles.statusFinished
              : styles.statusScheduled
          }`}
        >
          {isLive && (
            <span
              className={styles.livePulse}
              aria-hidden="true"
            />
          )}
          {status.label}
        </span>
      </header>

      <div className={styles.teamsRow}>
        <div className={styles.teamSide}>
          <TeamLogo
            name={match.time_casa.nome}
            src={match.time_casa.img}
          />
          <span className={styles.teamName}>{match.time_casa.nome}</span>
        </div>
        <span className={styles.versus} aria-hidden="true">
          ×
        </span>
        <div className={styles.teamSide}>
          <TeamLogo
            name={match.time_visitante.nome}
            src={match.time_visitante.img}
          />
          <span className={styles.teamName}>{match.time_visitante.nome}</span>
        </div>
      </div>

      <footer className={styles.championshipRow}>
        <span className={styles.championship}>{match.campeonato}</span>
      </footer>

      <span
        className={styles.playOverlay}
        aria-hidden="true"
        title="Abrir partida"
      >
        <PlayIcon />
      </span>
    </article>
  );
}
