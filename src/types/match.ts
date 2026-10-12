export type MatchStatus = "scheduled" | "live" | "finished";

export type Team = {
  nome: string;
  img: string;
};

export type Match = {
  id: string;
  campeonato: string;
  hora: string;
  time_casa: Team;
  time_visitante: Team;
  canais: string[];
  status?: MatchStatus;
};

export type MatchStatusInfo = {
  status: MatchStatus;
  label: string;
};

export type MatchWithStatus = Match & {
  statusInfo: MatchStatusInfo;
};
