export type LeagueRegion = 
  | 'All'
  | 'Top 5 Europe'
  | 'Other Europe'
  | 'Americas'
  | 'Asia & Middle East'
  | 'Second Tiers'
  | 'Continental Cups';

export interface RawFbrapiMatchStats {
  match_id: string;
  competition: string;
  country?: string;
  season?: string;
  round?: string | number;
  match_date: string;
  status: 'upcoming' | 'scheduled' | 'in_progress' | 'completed';
  
  // Teams
  home_team: string;
  away_team: string;
  home_team_code?: string;
  away_team_code?: string;
  venue?: string;

  // Expected Goals & Non-Penalty metrics
  home_xg: number;
  away_xg: number;
  home_npxg?: number;
  away_npxg?: number;

  // Penalties
  home_pens_made?: number;
  home_pens_att?: number;
  away_pens_made?: number;
  away_pens_att?: number;

  // Field Tilt (% of final-third passes/possession dominance, usually 0-100)
  field_tilt?: number; // home field tilt
  home_field_tilt?: number;
  away_field_tilt?: number;

  // Auxiliary Stats
  home_shots?: number;
  away_shots?: number;
  home_sot?: number; // Shots on target
  away_sot?: number;
  home_possession?: number;
  away_possession?: number;
  home_sca?: number; // Shot-creating actions
  away_sca?: number;
  home_ppda?: number; // Passes per defensive action
  away_ppda?: number;
  home_npxg_per_shot?: number;
  away_npxg_per_shot?: number;
}

export interface AnalyzedFixture {
  id: string;
  rank: number;
  competition: string;
  region: LeagueRegion;
  country: string;
  matchDate: string;
  status: string;
  venue: string;

  // Teams
  homeTeam: string;
  awayTeam: string;
  homeCode: string;
  awayCode: string;

  // Expected Goals
  homeXg: number;
  awayXg: number;
  homeNpxg: number;
  awayNpxg: number;
  isNpxgDerived: boolean;

  // Core Analytical Outcomes
  netNpxGD: number; // homeNpxg - awayNpxg
  favoredTeam: string;
  favoredSide: 'home' | 'away' | 'even';
  underdogTeam: string;
  npxgdFavoriteEdge: number; // positive edge for the favorite (|homeNpxg - awayNpxg|)
  
  // Field Tilt metrics
  homeFieldTilt: number; // 0-100
  awayFieldTilt: number; // 0-100
  fieldTiltDiff: number; // favoredFieldTilt - underdogFieldTilt
  favoredFieldTilt: number;

  // Expected Value & Probabilities
  winExpectancyPct: number; // Favored team calculated win probability (0-100)
  drawExpectancyPct: number;
  underdogWinExpectancyPct: number;
  expectedValueEdgeIndex: number; // 0-10 synthetic scale based on npxGD + field tilt dominance

  // Shot Dynamics
  homeShots: number;
  awayShots: number;
  homeSot: number;
  awaySot: number;
  homeShotQuality: number; // npxg per shot
  awayShotQuality: number;

  // Raw original item
  rawPayload: RawFbrapiMatchStats;
}

export type SortField = 
  | 'favoriteEdge' // Default: npxGD edge
  | 'winExpectancy'
  | 'fieldTilt'
  | 'totalXg'
  | 'date'
  | 'rank';

export type SortDirection = 'asc' | 'desc';
