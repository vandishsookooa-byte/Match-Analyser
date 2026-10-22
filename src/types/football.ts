export type CompetitionType =
  | 'first_division'
  | 'second_division'
  | 'third_division'
  | 'lower_division'
  | 'continental_competition'
  | 'national_team'
  | 'youth_competition';

export type TierCategory =
  | 'All'
  | 'First Division'
  | 'Second Division'
  | 'Third Division & Lower'
  | 'Continental'
  | 'National Teams'
  | 'Youth Football';

export interface DiscoveredCompetition {
  id: string;
  name: string;
  country: string;
  countryCode: string; // ISO 2-letter or standard
  flag: string;
  type: CompetitionType;
  tierLabel: string; // e.g. "Tier 1", "Tier 2", "Tier 3", "National Cup", "Continental", etc.
  season: string;
  availableSeasons: string[];
  status: 'active' | 'unavailable' | 'rate_limited';
  teamsCount: number;
  matchesCount: number;
  lastUpdated: string;
  providerId: string;
  providerName: string;
  notes?: string;
}

export interface TeamRankingRecord {
  id: string; // Composite ID: `${teamId}-${competitionId}-${season}`
  globalRank: number;
  teamId: string;
  teamName: string;
  shortName: string;
  teamCrest?: string;
  crestUrl?: string;
  accentColor?: string;
  country: string;
  countryCode: string;
  competitionId: string;
  competitionName: string;
  competitionType: CompetitionType;
  tierLabel: string;
  season: string;
  
  // Standings metrics
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number; // GF - GA
  points: number; // Competition points
  
  // Analytical / Ranking metrics
  winPercentage: number; // (wins / matchesPlayed) * 100
  pointsPerMatch: number; // points / matchesPlayed
  goalsScoredPerMatch: number; // goalsFor / matchesPlayed
  goalsConcededPerMatch: number; // goalsAgainst / matchesPlayed
  cleanSheets: number;
  form: ('W' | 'D' | 'L')[];

  // Top Two Selection telemetry
  intraCompetitionRank?: number; // 1 or 2
  isSoloQualifier?: boolean; // true if competition had only 1 eligible team
  totalTeamsInCompetition?: number;
}

export interface TopTwoSelectionSummary {
  totalCompetitionsDiscovered: number;
  competitionsSuccessfullyUpdated: number;
  competitionsRepresented: number;
  teamRecordsDisplayed: number;
  expectedMaxRecords: number;
  singleTeamCompetitions: {
    competitionId: string;
    competitionName: string;
    country: string;
    teamName: string;
  }[];
  excludedUnavailableCompetitions: {
    competitionId: string;
    competitionName: string;
    country: string;
    reason: string;
  }[];
}

export interface CoverageReport {
  totalCompetitionsDiscovered: number;
  competitionsSuccessfullyUpdated: number;
  countriesRepresented: number;
  divisionsRepresented: number;
  competitionsUnavailable: number;
  lastSuccessfulRefresh: string;
  isStale: boolean;
  refreshQueue: {
    pending: number;
    processing: boolean;
    nextScheduledRun: string;
  };
  provider: {
    name: string;
    mode: 'Multi-Provider Open Mesh' | 'Connected API';
    rateLimitPerMinute: number;
    rateLimitRemaining: number;
    resetTimeSeconds: number;
    tier: string;
    serverCacheTtlMinutes: number;
  };
  unavailableDetails: {
    id: string;
    name: string;
    country: string;
    type: string;
    reason: string;
    tierRequired?: string;
  }[];
}

export type SortField =
  | 'winPercentage'
  | 'goalDifference'
  | 'goalsFor'
  | 'pointsPerMatch'
  | 'points'
  | 'matchesPlayed';

export type SortDirection = 'asc' | 'desc';
