"use client";

import styles from "./MatchFilters.module.css";

export type MatchFilter = "all" | "live" | "upcoming" | "finished";

type FilterDefinition = {
  value: MatchFilter;
  label: string;
};

const FILTER_DEFINITIONS: FilterDefinition[] = [
  { value: "all", label: "Todos" },
  { value: "live", label: "Ao vivo" },
  { value: "upcoming", label: "Em breve" },
  { value: "finished", label: "Encerrados" },
];

export type MatchFilterCounts = Record<MatchFilter, number>;

type MatchFiltersProps = {
  active: MatchFilter;
  counts: MatchFilterCounts;
  onChange: (filter: MatchFilter) => void;
};

export function MatchFilters({ active, counts, onChange }: MatchFiltersProps) {
  return (
    <div
      className={styles.wrapper}
      role="tablist"
      aria-label="Filtros de jogos"
    >
      {FILTER_DEFINITIONS.map(({ value, label }) => {
        const isActive = active === value;
        const count = counts[value] ?? 0;
        return (
          <button
            type="button"
            role="tab"
            key={value}
            aria-selected={isActive}
            className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
            onClick={() => onChange(value)}
          >
            <span className={styles.tabLabel}>{label}</span>
            <span
              className={`${styles.tabCount} ${
                isActive ? styles.tabCountActive : ""
              }`}
              aria-hidden="true"
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
