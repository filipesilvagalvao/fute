"use client";

import styles from "./PlayerSelector.module.css";

export type PlayerSelectorGroup = {
  apiChannel: string;
  matchedKey: string;
  players: string[];
};

type PlayerSelectorProps = {
  groups: PlayerSelectorGroup[];
  selected: { channel: string; url: string } | null;
  onSelect: (channel: string, url: string) => void;
};

export function PlayerSelector({
  groups,
  selected,
  onSelect,
}: PlayerSelectorProps) {
  if (groups.length === 0) {
    return (
      <p className={styles.empty}>
        Não há canal disponível para esta partida no momento.
      </p>
    );
  }

  return (
    <div className={styles.wrapper}>
      {groups.map((group) => (
        <div key={group.matchedKey} className={styles.group}>
          <p className={styles.groupTitle}>{group.apiChannel}</p>
          <div className={styles.buttons}>
            {group.players.map((url, index) => {
              const isActive =
                selected?.channel === group.matchedKey &&
                selected?.url === url;
              return (
                <button
                  key={`${group.matchedKey}-${index}`}
                  type="button"
                  className={`${styles.button} ${
                    isActive ? styles.buttonActive : ""
                  }`}
                  onClick={() => onSelect(group.matchedKey, url)}
                  aria-pressed={isActive}
                  aria-label={`Player ${index + 1} de ${group.apiChannel}`}
                >
                  Player {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
