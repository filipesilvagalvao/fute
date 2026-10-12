"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";
import { Header } from "@/components/header/Header";
import { MatchList } from "@/components/match-list/MatchList";
import { MatchModal } from "@/components/match-modal/MatchModal";
import { EmptyState } from "@/components/empty-state/EmptyState";
import { ErrorState } from "@/components/error-state/ErrorState";
import { MatchesSkeleton } from "@/components/matches-skeleton/MatchesSkeleton";
import { SearchBar } from "@/components/search-bar/SearchBar";
import { ActivityIndicator } from "@/components/activity-indicator/ActivityIndicator";
import { RefreshButton } from "@/components/refresh-button/RefreshButton";
import { SiteFooter } from "@/components/site-footer/SiteFooter";
import {
  MatchFilters,
  type MatchFilter,
  type MatchFilterCounts,
} from "@/components/match-filters/MatchFilters";
import { fetchTodayMatches } from "@/services/matches";
import {
  getMatchesStatusMap,
  useMatchStatusTick,
} from "@/utils/match-status";
import {
  canFetchAgain,
  getCachedMatches,
  getLastFetchAt,
  isCacheFresh,
  MATCHES_MIN_FETCH_INTERVAL_MS,
  msUntilNextFetch,
  setCachedMatches,
  setLastFetchAt,
} from "@/utils/matches-cache";
import type { ShareData } from "@/components/share-button/ShareButton";
import type { Match, MatchStatus } from "@/types/match";

type LoadState =
  | { kind: "loading" }
  | { kind: "success"; matches: Match[] }
  | { kind: "error"; message: string };

function formatTodayLabel(): string {
  try {
    const formatter = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      weekday: "long",
      day: "2-digit",
      month: "long",
    });
    return formatter.format(new Date());
  } catch {
    return "hoje";
  }
}

function statusToFilter(status: MatchStatus): MatchFilter {
  if (status === "live") return "live";
  if (status === "finished") return "finished";
  return "upcoming";
}

function isApiNotConfigured(message: string): boolean {
  return message.includes("API de jogos não configurada");
}

function friendlyErrorMessage(raw: string): string {
  if (isApiNotConfigured(raw)) {
    return "A API de jogos ainda não foi configurada. Defina NEXT_PUBLIC_API_URL no arquivo .env.local.";
  }
  return raw;
}

export default function Home() {
  const [todayLabel, setTodayLabel] = useState<string>("hoje");
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<MatchFilter>("all");
  const [throttledUntil, setThrottledUntil] = useState<number | null>(null);

  const statusTick = useMatchStatusTick();

  useEffect(() => {
    const id = window.setTimeout(() => {
      setTodayLabel(formatTodayLabel());
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    Promise.resolve().then(() => {
      const cached = getCachedMatches();
      const lastFetch = getLastFetchAt();

      setThrottledUntil(
        lastFetch !== null
          ? lastFetch + MATCHES_MIN_FETCH_INTERVAL_MS
          : null
      );

      if (cached && isCacheFresh(cached)) {
        setState({ kind: "success", matches: cached.matches });
        if (canFetchAgain(lastFetch)) {
          void fetchAndStore(controller.signal, setState);
        }
        return;
      }

      if (cached) {
        setState({ kind: "success", matches: cached.matches });
        if (canFetchAgain(lastFetch)) {
          void fetchAndStore(controller.signal, setState);
        }
        return;
      }

      setState({ kind: "loading" });

      if (!canFetchAgain(lastFetch)) {
        setState({
          kind: "error",
          message:
            "Aguarde alguns instantes antes de buscar os jogos novamente.",
        });
        return;
      }

      void fetchAndStore(controller.signal, setState);
    });

    return () => controller.abort();
  }, []);

  const matches = useMemo<Match[]>(
    () => (state.kind === "success" ? state.matches : []),
    [state]
  );

  const statusMap = useMemo(() => {
    void statusTick;
    return getMatchesStatusMap(matches);
  }, [matches, statusTick]);

  const counts = useMemo<MatchFilterCounts>(() => {
    const result: MatchFilterCounts = {
      all: matches.length,
      live: 0,
      upcoming: 0,
      finished: 0,
    };
    for (const match of matches) {
      const status = statusMap.get(match.id)?.status ?? "scheduled";
      if (status === "live") result.live += 1;
      else if (status === "finished") result.finished += 1;
      else result.upcoming += 1;
    }
    return result;
  }, [matches, statusMap]);

  const filteredMatches = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return matches.filter((match) => {
      const status = statusMap.get(match.id)?.status ?? "scheduled";
      if (
        activeFilter !== "all" &&
        statusToFilter(status) !== activeFilter
      ) {
        return false;
      }
      if (query.length > 0) {
        const haystack =
          `${match.time_casa.nome} ${match.time_visitante.nome} ${match.campeonato}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [matches, activeFilter, searchQuery, statusMap]);

  const handleSelectMatch = useCallback((match: Match) => {
    setSelectedMatch(match);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedMatch(null);
  }, []);

  const headerShareData = useMemo<ShareData>(
    () => ({
      title: "Futemax — Jogos de futebol ao vivo",
      text: "Acompanhe os jogos do dia com canais disponíveis para assistir.",
    }),
    []
  );

  const handleRetry = useCallback(() => {
    const lastFetch = getLastFetchAt();
    if (!canFetchAgain(lastFetch)) {
      setThrottledUntil(
        Date.now() + msUntilNextFetch(lastFetch)
      );
      return;
    }
    setState({ kind: "loading" });
    const controller = new AbortController();
    void fetchAndStore(controller.signal, setState).then(() => {
      setThrottledUntil(Date.now() + MATCHES_MIN_FETCH_INTERVAL_MS);
    });
  }, []);

  const handleRefresh = useCallback(() => {
    const lastFetch = getLastFetchAt();
    if (!canFetchAgain(lastFetch)) {
      setThrottledUntil(
        (lastFetch ?? Date.now()) + MATCHES_MIN_FETCH_INTERVAL_MS
      );
      return;
    }
    setState((prev) =>
      prev.kind === "success" ? prev : { kind: "loading" }
    );
    const controller = new AbortController();
    void fetchAndStore(controller.signal, setState).then(() => {
      setThrottledUntil(Date.now() + MATCHES_MIN_FETCH_INTERVAL_MS);
    });
  }, []);

  const showEmpty = state.kind === "success" && matches.length === 0;
  const showResults = state.kind === "success" && matches.length > 0;
  const showNoMatchesForFilter =
    showResults && filteredMatches.length === 0;

  return (
    <div className={styles.shell} id="top">
      <Header
        todayLabel={todayLabel}
        shareData={headerShareData}
      />
      <main className={styles.container}>
        <div className={styles.hero}>
          <div className={styles.heroTopRow}>
            <h1 className={styles.heroTitle}>Jogos de hoje</h1>
            <ActivityIndicator />
          </div>
          <p className={styles.heroSubtitle}>
            Acompanhe os jogos do dia com horários, campeonatos e canais
            disponíveis.
          </p>
        </div>

        {showResults && (
          <div className={styles.controls}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
            />
            <div className={styles.filterRow}>
              <MatchFilters
                active={activeFilter}
                counts={counts}
                onChange={setActiveFilter}
              />
              <RefreshButton
                onRefresh={handleRefresh}
                throttledUntil={throttledUntil}
              />
            </div>
          </div>
        )}

        {state.kind === "loading" && <MatchesSkeleton />}
        {state.kind === "error" && (
          <ErrorState
            message={friendlyErrorMessage(state.message)}
            onRetry={handleRetry}
          />
        )}
        {showEmpty && <EmptyState />}
        {showResults && filteredMatches.length > 0 && (
          <MatchList
            matches={filteredMatches}
            onSelect={handleSelectMatch}
          />
        )}
        {showNoMatchesForFilter && (
          <div className={styles.filterEmpty} role="status">
            <p>
              Nenhum jogo encontrado para os filtros
              {activeFilter !== "all" ? (
                <>
                  {" "}
                  do filtro{" "}
                  <strong>
                    {activeFilter === "live"
                      ? "Ao vivo"
                      : activeFilter === "upcoming"
                      ? "Em breve"
                      : "Encerrados"}
                  </strong>
                </>
              ) : null}
              {searchQuery.trim().length > 0 ? (
                <>
                  {" "}
                  e da busca{" "}
                  <strong>&ldquo;{searchQuery.trim()}&rdquo;</strong>
                </>
              ) : null}
              .
            </p>
          </div>
        )}

        <section
          className={styles.seoIntro}
          aria-labelledby="seo-intro-title"
        >
          <h2 id="seo-intro-title" className={styles.seoTitle}>
            Futebol ao vivo do Flamengo, Palmeiras e dos principais
            campeonatos
          </h2>
          <p className={styles.seoText}>
            O <strong>FuteMax</strong> reúne todos os dias a agenda completa
            de <strong>futebol ao vivo</strong> do Brasil e do mundo.
            Acompanhe os jogos do <strong>Flamengo</strong>,{" "}
            <strong>Palmeiras</strong>, Santos, Corinthians, São Paulo,
            Atlético-MG e dos principais clubes do futebol brasileiro — com
            horários, estádios e canais de TV do{" "}
            <strong>Brasileirão Série A</strong>, da{" "}
            <strong>Copa Libertadores</strong>, da{" "}
            <strong>Copa do Brasil</strong>, da <strong>Premier League</strong>,
            de <strong>La Liga</strong> e demais campeonatos organizados em um
            só lugar.
          </p>
          <ul
            className={styles.seoTags}
            aria-label="Campeonatos cobertos"
          >
            <li>Brasileirão Série A</li>
            <li>Copa Libertadores</li>
            <li>Copa do Brasil</li>
            <li>Premier League</li>
          </ul>
        </section>
      </main>

      <SiteFooter />

      <MatchModal
        key={selectedMatch?.id ?? "empty"}
        match={selectedMatch}
        onClose={handleCloseModal}
      />
    </div>
  );
}

async function fetchAndStore(
  signal: AbortSignal,
  setState: React.Dispatch<React.SetStateAction<LoadState>>
): Promise<void> {
  try {
    const result = await fetchTodayMatches({ signal });
    if (signal.aborted) return;
    const now = Date.now();
    setState({ kind: "success", matches: result.matches });
    setCachedMatches(result.matches, result.source, now);
    setLastFetchAt(now);
  } catch (error) {
    if (signal.aborted) return;
    const cached = getCachedMatches();
    if (cached) {
      setState({ kind: "success", matches: cached.matches });
      return;
    }
    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao carregar os jogos.";
    setState({ kind: "error", message });
  }
}
