import type { Match, MatchStatus } from "@/types/match";

export type FetchMatchesOptions = {
  apiUrl?: string;
  revalidateSeconds?: number;
  signal?: AbortSignal;
};

export type FetchMatchesResult = {
  matches: Match[];
  source: string;
};

const DEFAULT_REVALIDATE_SECONDS = 60;

function isTeam(value: unknown): value is Match["time_casa"] {
  if (typeof value !== "object" || value === null) return false;
  const team = value as Record<string, unknown>;
  return (
    typeof team.nome === "string" &&
    typeof team.img === "string" &&
    team.nome.length > 0 &&
    team.img.length > 0
  );
}

const KNOWN_STATUSES: MatchStatus[] = ["scheduled", "live", "finished"];

function parseStatus(value: unknown): MatchStatus | undefined {
  if (typeof value !== "string") return undefined;
  return KNOWN_STATUSES.find((status) => status === value);
}

function isMatch(value: unknown): value is Match {
  if (typeof value !== "object" || value === null) return false;
  const match = value as Record<string, unknown>;
  if (typeof match.id !== "string" || match.id.length === 0) return false;
  if (typeof match.campeonato !== "string") return false;
  if (typeof match.hora !== "string") return false;
  if (!isTeam(match.time_casa)) return false;
  if (!isTeam(match.time_visitante)) return false;
  if (!Array.isArray(match.canais)) return false;
  if (!match.canais.every((canal) => typeof canal === "string")) return false;

  return true;
}

function resolveApiUrl(override?: string): string {
  const fromOverride = override?.trim();
  if (fromOverride) return fromOverride;
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv;
  throw new Error(
    "API de jogos não configurada. Defina NEXT_PUBLIC_API_URL no arquivo .env.local."
  );
}

function normalizeList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.matches)) return obj.matches;
    if (Array.isArray(obj.data)) return obj.data;
    if (Array.isArray(obj.jogos)) return obj.jogos;
  }
  return [];
}

export async function fetchTodayMatches(
  options: FetchMatchesOptions = {}
): Promise<FetchMatchesResult> {
  const url = resolveApiUrl(options.apiUrl);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    signal: options.signal,
    next: {
      revalidate: options.revalidateSeconds ?? DEFAULT_REVALIDATE_SECONDS,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Falha ao consultar a API de jogos (status ${response.status}).`
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error("A API de jogos retornou uma resposta inválida (JSON).");
  }

  const list = normalizeList(payload);
  const matches: Match[] = [];

  for (const entry of list) {
    if (!isMatch(entry)) continue;
    const match: Match = {
      id: entry.id,
      campeonato: entry.campeonato,
      hora: entry.hora,
      time_casa: entry.time_casa,
      time_visitante: entry.time_visitante,
      canais: entry.canais,
    };
    const maybeStatus = (entry as Record<string, unknown>).status;
    const parsedStatus = parseStatus(maybeStatus);
    if (parsedStatus) {
      match.status = parsedStatus;
    }
    matches.push(match);
  }

  return {
    matches,
    source: url,
  };
}
