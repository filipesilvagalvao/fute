import type { Match } from "@/types/match";

const CACHE_KEY = "futemax:matches:v1";
const LAST_FETCH_KEY = "futemax:lastFetch:v1";

export const MATCHES_CACHE_TTL_MS = 60_000;
export const MATCHES_MIN_FETCH_INTERVAL_MS = 30_000;

export type CachedMatches = {
  matches: Match[];
  fetchedAt: number;
  source?: string;
};

function safeStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getCachedMatches(): CachedMatches | null {
  const storage = safeStorage();
  if (!storage) return null;

  const raw = storage.getItem(CACHE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const candidate = parsed as Partial<CachedMatches>;
    if (!Array.isArray(candidate.matches)) return null;
    if (typeof candidate.fetchedAt !== "number") return null;
    if (!Number.isFinite(candidate.fetchedAt)) return null;
    return {
      matches: candidate.matches as Match[],
      fetchedAt: candidate.fetchedAt,
      source:
        typeof candidate.source === "string" ? candidate.source : undefined,
    };
  } catch {
    return null;
  }
}

export function setCachedMatches(
  matches: Match[],
  source: string | undefined,
  timestamp: number = Date.now()
): void {
  const storage = safeStorage();
  if (!storage) return;
  try {
    const entry: CachedMatches = {
      matches,
      fetchedAt: timestamp,
      source,
    };
    storage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // localStorage may be disabled or full; silently ignore.
  }
}

export function clearCachedMatches(): void {
  const storage = safeStorage();
  if (!storage) return;
  try {
    storage.removeItem(CACHE_KEY);
    storage.removeItem(LAST_FETCH_KEY);
  } catch {
    // ignored
  }
}

export function getLastFetchAt(): number | null {
  const storage = safeStorage();
  if (!storage) return null;
  const raw = storage.getItem(LAST_FETCH_KEY);
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function setLastFetchAt(timestamp: number): void {
  const storage = safeStorage();
  if (!storage) return;
  try {
    storage.setItem(LAST_FETCH_KEY, String(timestamp));
  } catch {
    // ignored
  }
}

export function isCacheFresh(
  cached: CachedMatches,
  now: number = Date.now(),
  ttl: number = MATCHES_CACHE_TTL_MS
): boolean {
  return now - cached.fetchedAt < ttl;
}

export function canFetchAgain(
  lastFetchAt: number | null,
  now: number = Date.now(),
  minInterval: number = MATCHES_MIN_FETCH_INTERVAL_MS
): boolean {
  if (lastFetchAt === null) return true;
  return now - lastFetchAt >= minInterval;
}

export function msUntilNextFetch(
  lastFetchAt: number | null,
  now: number = Date.now(),
  minInterval: number = MATCHES_MIN_FETCH_INTERVAL_MS
): number {
  if (lastFetchAt === null) return 0;
  return Math.max(0, minInterval - (now - lastFetchAt));
}
