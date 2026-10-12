"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./ActivityIndicator.module.css";

const SAO_PAULO_TIMEZONE = "America/Sao_Paulo";
const UPDATE_INTERVAL_MS = 60_000;

type Period = "madrugada" | "manha" | "tarde" | "noite";

type PeriodRange = {
  min: number;
  max: number;
  label: string;
};

const PERIOD_RANGES: Record<Period, PeriodRange> = {
  madrugada: { min: 1000, max: 2000, label: "madrugada" },
  manha: { min: 2000, max: 4000, label: "manhã" },
  tarde: { min: 4000, max: 8000, label: "tarde" },
  noite: { min: 8000, max: 16000, label: "noite" },
};

function getSaoPauloHour(now: Date): number {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: SAO_PAULO_TIMEZONE,
    hour: "2-digit",
    hourCycle: "h23",
  });
  const hourPart = formatter
    .formatToParts(now)
    .find((part) => part.type === "hour");
  if (!hourPart) return 0;
  const value = Number.parseInt(hourPart.value, 10);
  return Number.isFinite(value) ? value : 0;
}

function getPeriodForHour(hour: number): Period {
  if (hour >= 0 && hour < 6) return "madrugada";
  if (hour >= 6 && hour < 12) return "manha";
  if (hour >= 12 && hour < 18) return "tarde";
  return "noite";
}

function generateInitial(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDrift(prev: number, min: number, max: number): number {
  const range = max - min;
  const maxStep = Math.max(40, Math.floor(range * 0.08));
  const delta = Math.floor(Math.random() * (maxStep * 2 + 1)) - maxStep;
  const next = prev + delta;
  return Math.max(min, Math.min(max, next));
}

function PeopleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={styles.icon}
    >
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  );
}

export function ActivityIndicator() {
  const [count, setCount] = useState<number | null>(null);
  const tooltipId = useId();
  const prevCountRef = useRef<number | null>(null);
  const prevPeriodRef = useRef<Period | null>(null);

  useEffect(() => {
    const tick = () => {
      const currentPeriod = getPeriodForHour(getSaoPauloHour(new Date()));
      const range = PERIOD_RANGES[currentPeriod];

      const prevCount = prevCountRef.current;
      const prevPeriod = prevPeriodRef.current;

      let nextCount: number;
      if (prevCount === null || prevPeriod !== currentPeriod) {
        nextCount = generateInitial(range.min, range.max);
      } else {
        nextCount = generateDrift(prevCount, range.min, range.max);
      }

      prevCountRef.current = nextCount;
      prevPeriodRef.current = currentPeriod;
      setCount(nextCount);
    };

    tick();
    const interval = window.setInterval(tick, UPDATE_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, []);

  const formatted =
    count === null ? "—" : count.toLocaleString("pt-BR");

  return (
    <div
      className={styles.wrapper}
      aria-describedby={tooltipId}
    >
      <span className={styles.iconWrap} aria-hidden="true">
        <PeopleIcon />
      </span>
      <span
        className={styles.count}
        key={count ?? "placeholder"}
        aria-label={`Atividade estimada de ${formatted} usuários.`}
      >
        {formatted}
      </span>
      <span className={styles.label}>Usuários agora</span>
    </div>
  );
}
