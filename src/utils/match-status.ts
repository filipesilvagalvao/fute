import { useEffect, useState } from "react";
import type {
  Match,
  MatchStatus,
  MatchStatusInfo,
} from "@/types/match";

export const SAO_PAULO_TIMEZONE = "America/Sao_Paulo";

export const STATUS_DURATION_MINUTES = 120;

export const STATUS_UPDATE_INTERVAL_MS = 30_000;

export type { MatchStatusInfo };

const KNOWN_STATUS_LABELS: Record<MatchStatus, string> = {
  scheduled: "",
  live: "AO VIVO",
  finished: "ENCERRADO",
};

function parseHora(hora: string): { hours: number; minutes: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hora.trim());
  if (!match) return null;

  const hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return { hours, minutes };
}

function getSaoPauloYearMonthDay(reference: Date): {
  year: number;
  month: number;
  day: number;
} {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: SAO_PAULO_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(reference);
  const lookup: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      lookup[part.type] = part.value;
    }
  }
  return {
    year: Number.parseInt(lookup.year, 10),
    month: Number.parseInt(lookup.month, 10),
    day: Number.parseInt(lookup.day, 10),
  };
}

export function getMatchStartDate(hora: string, reference: Date = new Date()): Date | null {
  const parsed = parseHora(hora);
  if (!parsed) return null;

  const { year, month, day } = getSaoPauloYearMonthDay(reference);
  const offsetMs = getSaoPauloOffsetMs(year, month, day);
  if (offsetMs === null) return null;

  const naiveUtc = Date.UTC(
    year,
    month - 1,
    day,
    parsed.hours,
    parsed.minutes,
    0,
    0
  );
  const result = new Date(naiveUtc + offsetMs);
  return Number.isNaN(result.getTime()) ? null : result;
}

function getSaoPauloOffsetMs(
  year: number,
  month: number,
  day: number
): number | null {
  const utcRef = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  const spFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: SAO_PAULO_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts: Record<string, string> = {};
  for (const part of spFormatter.formatToParts(utcRef)) {
    if (part.type !== "literal") parts[part.type] = part.value;
  }
  const required = ["year", "month", "day", "hour", "minute", "second"];
  for (const key of required) {
    if (!parts[key]) return null;
  }

  const spAsUtcMs = Date.UTC(
    Number.parseInt(parts.year, 10),
    Number.parseInt(parts.month, 10) - 1,
    Number.parseInt(parts.day, 10),
    Number.parseInt(parts.hour, 10),
    Number.parseInt(parts.minute, 10),
    Number.parseInt(parts.second, 10)
  );

  if (!Number.isFinite(spAsUtcMs)) return null;

  return utcRef.getTime() - spAsUtcMs;
}

export function getMatchStatus(
  match: Pick<Match, "hora" | "status">,
  options?: { now?: Date; durationMinutes?: number }
): MatchStatusInfo {
  const providedStatus = match.status;
  if (providedStatus && KNOWN_STATUS_LABELS[providedStatus] !== "") {
    return {
      status: providedStatus,
      label: KNOWN_STATUS_LABELS[providedStatus],
    };
  }

  const now = options?.now ?? new Date();
  const duration = options?.durationMinutes ?? STATUS_DURATION_MINUTES;
  const start = getMatchStartDate(match.hora, now);

  if (!start) {
    return { status: "scheduled", label: match.hora };
  }

  const end = new Date(start.getTime() + duration * 60_000);

  if (now < start) {
    return { status: "scheduled", label: match.hora };
  }
  if (now >= start && now < end) {
    return { status: "live", label: KNOWN_STATUS_LABELS.live };
  }
  return { status: "finished", label: KNOWN_STATUS_LABELS.finished };
}

export function isLiveStatus(status: MatchStatus): boolean {
  return status === "live";
}

export function useMatchStatusTick(intervalMs: number = STATUS_UPDATE_INTERVAL_MS): number {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTick((value) => value + 1);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return tick;
}

export function getMatchesStatusMap(matches: Pick<Match, "id" | "hora" | "status">[]): Map<string, MatchStatusInfo> {
  const map = new Map<string, MatchStatusInfo>();
  for (const match of matches) {
    map.set(match.id, getMatchStatus(match));
  }
  return map;
}
