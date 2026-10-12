import { Players } from "@/Players";

export type ChannelMatch = {
  apiChannel: string;
  matchedKey: string;
  players: string[];
};

function removeDiacritics(input: string): string {
  return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizeChannelName(name: string): string {
  return removeDiacritics(name)
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function findPlayerEntry(apiChannel: string): ChannelMatch | null {
  const normalizedApiChannel = normalizeChannelName(apiChannel);

  let exactMatch: { key: string; players: string[] } | null = null;
  for (const [key, players] of Object.entries(Players)) {
    if (normalizeChannelName(key) === normalizedApiChannel) {
      exactMatch = { key, players };
      break;
    }
  }

  if (!exactMatch) {
    return null;
  }

  const filteredPlayers = exactMatch.players.filter(
    (url): url is string => typeof url === "string" && url.trim().length > 0
  );

  if (filteredPlayers.length === 0) {
    return null;
  }

  return {
    apiChannel,
    matchedKey: exactMatch.key,
    players: filteredPlayers,
  };
}

export function matchChannelsWithPlayers(apiChannels: string[]): ChannelMatch[] {
  if (!Array.isArray(apiChannels)) {
    return [];
  }
  const result: ChannelMatch[] = [];
  for (const apiChannel of apiChannels) {
    if (typeof apiChannel !== "string") continue;
    const matched = findPlayerEntry(apiChannel);
    if (matched) {
      result.push(matched);
    }
  }
  return result;
}

export function hasAnyAvailablePlayers(apiChannels: string[]): boolean {
  return matchChannelsWithPlayers(apiChannels).length > 0;
}
