"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import styles from "./MatchModal.module.css";
import {
  PlayerSelector,
  type PlayerSelectorGroup,
} from "@/components/player-selector/PlayerSelector";
import { VideoPlayer } from "@/components/video-player/VideoPlayer";
import { ShareButton, type ShareData } from "@/components/share-button/ShareButton";
import { matchChannelsWithPlayers } from "@/utils/channel-matcher";
import { getMatchStatus, STATUS_UPDATE_INTERVAL_MS } from "@/utils/match-status";
import type { Match } from "@/types/match";

type MatchModalProps = {
  match: Match | null;
  onClose: () => void;
};

function getInitialSelection(groups: PlayerSelectorGroup[]) {
  for (const group of groups) {
    if (group.players.length > 0) {
      return { channel: group.matchedKey, url: group.players[0] };
    }
  }
  return null;
}

export function MatchModal({ match, onClose }: MatchModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const [statusTick, setStatusTick] = useState(0);

  const groups = useMemo<PlayerSelectorGroup[]>(() => {
    if (!match) return [];
    return matchChannelsWithPlayers(match.canais);
  }, [match]);

  const [selected, setSelected] = useState<{
    channel: string;
    url: string;
  } | null>(() => getInitialSelection(groups));

  useEffect(() => {
    if (!match) return;
    const interval = setInterval(() => {
      setStatusTick((tick) => tick + 1);
    }, STATUS_UPDATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [match]);

  useEffect(() => {
    if (!match) return;

    lastFocusedElementRef.current =
      (document.activeElement as HTMLElement | null) ?? null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
      const last = lastFocusedElementRef.current;
      if (last && typeof last.focus === "function") {
        last.focus();
      }
    };
  }, [match, onClose]);

  const status = useMemo(() => {
    if (!match) return null;
    // statusTick is included so the status recomputes when the ticker fires
    void statusTick;
    return getMatchStatus(match);
  }, [match, statusTick]);

  if (!match) return null;

  const isLive = status?.status === "live";

  const handleBackdropMouseDown = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handlePlayerSelect = (channel: string, url: string) => {
    setSelected({ channel, url });
  };

  const shareData: ShareData = {
    title: match.campeonato,
    text: `${match.time_casa.nome} × ${match.time_visitante.nome} — ${match.campeonato}`,
    url:
      typeof window !== "undefined"
        ? `${window.location.origin}${window.location.pathname}#partida-${match.id}`
        : undefined,
  };

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-modal-title"
        className={styles.dialog}
      >
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <p className={styles.championship}>{match.campeonato}</p>
            <h2 id="match-modal-title" className={styles.title}>
              {match.time_casa.nome} <span className={styles.titleVs}>×</span>{" "}
              {match.time_visitante.nome}
            </h2>
            <span
              className={`${styles.status} ${
                isLive ? styles.statusLive : styles.statusOther
              }`}
            >
              {status?.label ?? match.hora}
            </span>
          </div>
          <div className={styles.headerActions}>
            <ShareButton shareData={shareData} size="sm" />
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className={styles.closeButton}
              aria-label="Fechar modal"
            >
              ×
            </button>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.teams}>
            <div className={styles.team}>
              <Image
                src={match.time_casa.img}
                alt={`Escudo de ${match.time_casa.nome}`}
                width={56}
                height={56}
                unoptimized
                className={styles.crest}
                loading="lazy"
              />
              <p className={styles.teamName}>{match.time_casa.nome}</p>
            </div>
            <span className={styles.separator} aria-hidden="true">
              ×
            </span>
            <div className={styles.team}>
              <Image
                src={match.time_visitante.img}
                alt={`Escudo de ${match.time_visitante.nome}`}
                width={56}
                height={56}
                unoptimized
                className={styles.crest}
                loading="lazy"
              />
              <p className={styles.teamName}>{match.time_visitante.nome}</p>
            </div>
          </div>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Canais</h3>
            <PlayerSelector
              groups={groups}
              selected={selected}
              onSelect={handlePlayerSelect}
            />
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Transmissão</h3>
            {selected ? (
              <VideoPlayer
                key={selected.url}
                src={selected.url}
                title={`${selected.channel} player`}
              />
            ) : (
              <p className={styles.noPlayer}>
                Selecione um player acima para iniciar a transmissão.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
