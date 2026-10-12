"use client";

import { useId } from "react";
import styles from "./SearchBar.module.css";

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={styles.iconSvg}
    >
      <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19zM9.5 14a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={styles.iconSvg}
    >
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );
}

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SearchBar({
  value,
  onChange,
  placeholder = "buscar jogos",
}: SearchBarProps) {
  const inputId = useId();

  return (
    <div className={styles.wrapper} role="search">
      <label htmlFor={inputId} className={styles.srOnly}>
        Buscar jogos
      </label>
      <span className={styles.iconLeft} aria-hidden="true">
        <SearchIcon />
      </span>
      <input
        id={inputId}
        type="search"
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {value && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={() => onChange("")}
          aria-label="Limpar busca"
          title="Limpar busca"
        >
          <ClearIcon />
        </button>
      )}
    </div>
  );
}
