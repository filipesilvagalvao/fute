"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./MatchList.module.css";
import type { Match, MatchStatusInfo } from "@/types/match";
import { getMatchStatus, STATUS_UPDATE_INTERVAL_MS } from "@/utils/match-status";
import { MatchCard } from "@/components/match-card/MatchCard";

type MatchListProps = {
  matches: Match[];
  onSelect: (match: Match) => void;
};

function useStatusTicker(matches: Match[]): Map<string, MatchStatusInfo> {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((value) => value + 1);
    }, STATUS_UPDATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return useMemo(() => {
    const map = new Map<string, MatchStatusInfo>();
    for (const match of matches) {
      map.set(match.id, getMatchStatus(match));
    }
    return map;
    // tick is included so the map recomputes when the interval fires
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches, tick]);
}

export function MatchList({ matches, onSelect }: MatchListProps) {
  const statusMap = useStatusTicker(matches);

  return (
    <div className={styles.wrapper}>
      {matches.map((match) => {
        const status = statusMap.get(match.id) ?? {
          status: "scheduled" as const,
          label: match.hora,
        };
        return (
          <MatchCard
            key={match.id}
            match={match}
            status={status}
            onSelect={onSelect}
          />
        );
      })}
    </div>
  );
}
