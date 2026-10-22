import { AnalyzedFixture, LeagueRegion, RawFbrapiMatchStats, SortDirection, SortField } from '../types/sports-data';

// Standard penalty conversion xG value used in sports science (StatsBomb / FBref standard is ~0.79)
const PENALTY_XG_VALUE = 0.79;

/**
 * Categorizes any global competition string into an analytical region
 */
export function categorizeCompetition(competitionName: string): { region: LeagueRegion; country: string } {
  const comp = competitionName.toLowerCase();

  // Top 5 European leagues
  if (comp.includes('premier league') || comp.includes('epl') || comp.includes('england - premier')) {
    return { region: 'Top 5 Europe', country: 'England' };
  }
  if (comp.includes('la liga') || comp.includes('primera división') || comp.includes('spain - la liga')) {
    return { region: 'Top 5 Europe', country: 'Spain' };
  }
  if (comp.includes('serie a') && !comp.includes('serie b') && !comp.includes('brasil')) {
    return { region: 'Top 5 Europe', country: 'Italy' };
  }
  if (comp.includes('bundesliga') && !comp.includes('2. bundesliga') && !comp.includes('austria')) {
    return { region: 'Top 5 Europe', country: 'Germany' };
  }
  if (comp.includes('ligue 1') || comp.includes('france - ligue 1')) {
    return { region: 'Top 5 Europe', country: 'France' };
  }

  // Continental / International Cups
  if (comp.includes('champions league') || comp.includes('ucl') || comp.includes('europa') || comp.includes('conference league') || comp.includes('libertadores') || comp.includes('sudamericana')) {
    return { region: 'Continental Cups', country: 'Continental' };
  }

  // Americas
  if (comp.includes('mls') || comp.includes('major league soccer')) {
    return { region: 'Americas', country: 'USA' };
  }
  if (comp.includes('brasil') || comp.includes('brasileir') || comp.includes('serie a brazil')) {
    return { region: 'Americas', country: 'Brazil' };
  }
  if (comp.includes('liga mx') || comp.includes('mexico')) {
    return { region: 'Americas', country: 'Mexico' };
  }
  if (comp.includes('argentina') || comp.includes('primera nacional')) {
    return { region: 'Americas', country: 'Argentina' };
  }

  // Other European Tiers
  if (comp.includes('eredivisie') || comp.includes('netherlands')) {
    return { region: 'Other Europe', country: 'Netherlands' };
  }
  if (comp.includes('primeira liga') || comp.includes('portugal') || comp.includes('liga portugal')) {
    return { region: 'Other Europe', country: 'Portugal' };
  }
  if (comp.includes('belgian') || comp.includes('pro league') || comp.includes('belgium')) {
    return { region: 'Other Europe', country: 'Belgium' };
  }
  if (comp.includes('scottish') || comp.includes('premiership') || comp.includes('scotland')) {
    return { region: 'Other Europe', country: 'Scotland' };
  }
  if (comp.includes('süper lig') || comp.includes('super lig') || comp.includes('turkey')) {
    return { region: 'Other Europe', country: 'Turkey' };
  }

  // Asia & Middle East
  if (comp.includes('saudi') || comp.includes('spl') || comp.includes('roshn')) {
    return { region: 'Asia & Middle East', country: 'Saudi Arabia' };
  }
  if (comp.includes('j1') || comp.includes('j-league') || comp.includes('japan')) {
    return { region: 'Asia & Middle East', country: 'Japan' };
  }
  if (comp.includes('k league') || comp.includes('korea')) {
    return { region: 'Asia & Middle East', country: 'South Korea' };
  }
  if (comp.includes('a-league') || comp.includes('australia')) {
    return { region: 'Asia & Middle East', country: 'Australia' };
  }

  // Second Tiers
  if (comp.includes('championship') || comp.includes('segunda') || comp.includes('serie b') || comp.includes('2. bundesliga') || comp.includes('ligue 2')) {
    return { region: 'Second Tiers', country: 'Secondary Tier' };
  }

  return { region: 'Other Europe', country: 'Global' };
}

/**
 * Poisson Probability Mass Function: P(k; lambda) = (lambda^k * e^-lambda) / k!
 */
function poissonProbability(k: number, lambda: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let factorial = 1;
  for (let i = 2; i <= k; i++) factorial *= i;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial;
}

/**
 * Calculates win, draw, loss probabilities from xG parameters using independent Poisson distribution
 */
export function calculateXgMatchProbabilities(homeXg: number, awayXg: number): { homeWin: number; draw: number; awayWin: number } {
  const maxGoals = 8;
  const homeProbs: number[] = [];
  const awayProbs: number[] = [];

  for (let g = 0; g <= maxGoals; g++) {
    homeProbs.push(poissonProbability(g, Math.max(0.05, homeXg)));
    awayProbs.push(poissonProbability(g, Math.max(0.05, awayXg)));
  }

  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;

  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const prob = homeProbs[h] * awayProbs[a];
      if (h > a) homeWin += prob;
      else if (h === a) draw += prob;
      else awayWin += prob;
    }
  }

  const total = homeWin + draw + awayWin;
  if (total > 0) {
    return {
      homeWin: (homeWin / total) * 100,
      draw: (draw / total) * 100,
      awayWin: (awayWin / total) * 100
    };
  }
  return { homeWin: 33.3, draw: 33.3, awayWin: 33.3 };
}

/**
 * Analyzes a raw fbrapi team-match-stats entry and derives analytical properties:
 * - npxGD (Non-Penalty Expected Goals Differential)
 * - Favorite edge
 * - Field tilt normalization & differential
 * - EV Edge Score
 */
export function analyzeMatchStat(raw: RawFbrapiMatchStats): AnalyzedFixture {
  const homeXg = Number(raw.home_xg ?? 0);
  const awayXg = Number(raw.away_xg ?? 0);

  // 1. Non-Penalty Expected Goals (npxG) derivation
  let homeNpxg = raw.home_npxg !== undefined ? Number(raw.home_npxg) : undefined;
  let awayNpxg = raw.away_npxg !== undefined ? Number(raw.away_npxg) : undefined;
  let isNpxgDerived = false;

  if (homeNpxg === undefined) {
    const pensAtt = raw.home_pens_att ?? raw.home_pens_made ?? 0;
    homeNpxg = Math.max(0, +(homeXg - pensAtt * PENALTY_XG_VALUE).toFixed(2));
    isNpxgDerived = true;
  }
  if (awayNpxg === undefined) {
    const pensAtt = raw.away_pens_att ?? raw.away_pens_made ?? 0;
    awayNpxg = Math.max(0, +(awayXg - pensAtt * PENALTY_XG_VALUE).toFixed(2));
    isNpxgDerived = true;
  }

  // 2. npxGD calculation: Net Home npxGD = home_npxg - away_npxg
  const netNpxGD = +(homeNpxg - awayNpxg).toFixed(2);

  // Determine Favorite vs Underdog
  let favoredTeam = raw.home_team;
  let favoredSide: 'home' | 'away' | 'even' = 'home';
  let underdogTeam = raw.away_team;
  let npxgdFavoriteEdge = Math.abs(netNpxGD);

  if (homeNpxg > awayNpxg) {
    favoredTeam = raw.home_team;
    favoredSide = 'home';
    underdogTeam = raw.away_team;
  } else if (awayNpxg > homeNpxg) {
    favoredTeam = raw.away_team;
    favoredSide = 'away';
    underdogTeam = raw.home_team;
  } else {
    // Exact tie: use total xG or alphabetical
    favoredSide = 'even';
    if (homeXg >= awayXg) {
      favoredTeam = raw.home_team;
      underdogTeam = raw.away_team;
    } else {
      favoredTeam = raw.away_team;
      underdogTeam = raw.home_team;
    }
  }

  // 3. Field Tilt calculation
  let homeFieldTilt = 50;
  let awayFieldTilt = 50;

  if (raw.home_field_tilt !== undefined && raw.away_field_tilt !== undefined) {
    const total = raw.home_field_tilt + raw.away_field_tilt;
    homeFieldTilt = total > 0 ? +((raw.home_field_tilt / total) * 100).toFixed(1) : 50;
    awayFieldTilt = total > 0 ? +((raw.away_field_tilt / total) * 100).toFixed(1) : 50;
  } else if (raw.field_tilt !== undefined) {
    // standard fbrapi key where field_tilt represents home field tilt (0-100)
    homeFieldTilt = +(Math.max(0, Math.min(100, raw.field_tilt))).toFixed(1);
    awayFieldTilt = +(100 - homeFieldTilt).toFixed(1);
  } else if (raw.home_possession !== undefined && raw.away_possession !== undefined) {
    // proxy from possession if field tilt missing
    const total = raw.home_possession + raw.away_possession;
    homeFieldTilt = total > 0 ? +((raw.home_possession / total) * 100).toFixed(1) : 50;
    awayFieldTilt = total > 0 ? +((raw.away_possession / total) * 100).toFixed(1) : 50;
  }

  const favoredFieldTilt = favoredSide === 'away' ? awayFieldTilt : homeFieldTilt;
  const underdogFieldTilt = favoredSide === 'away' ? homeFieldTilt : awayFieldTilt;
  const fieldTiltDiff = +(favoredFieldTilt - underdogFieldTilt).toFixed(1);

  // 4. Match win probabilities
  const { homeWin, draw, awayWin } = calculateXgMatchProbabilities(homeXg, awayXg);
  const winExpectancyPct = +(favoredSide === 'away' ? awayWin : homeWin).toFixed(1);
  const underdogWinExpectancyPct = +(favoredSide === 'away' ? homeWin : awayWin).toFixed(1);
  const drawExpectancyPct = +draw.toFixed(1);

  // 5. Expected Value Edge Index (0 to 10 scale)
  // Combines npxGD differential magnitude + field tilt territorial dominance + win prob
  // A fixture with +2.0 npxGD, 70% field tilt, and 80%+ win prob scores ~9.2-9.9
  const npxgScore = Math.min(6.5, npxgdFavoriteEdge * 3.0); // up to 6.5 pts for >=2.17 npxGD
  const winProbScore = (winExpectancyPct / 100) * 2.5; // up to 2.5 pts
  const tiltBonus = Math.max(0, (fieldTiltDiff / 50) * 1.0); // up to 1.0 pt
  const expectedValueEdgeIndex = +Math.min(10, Math.max(0.5, npxgScore + winProbScore + tiltBonus)).toFixed(1);

  // Shot Dynamics
  const homeShots = raw.home_shots ?? 0;
  const awayShots = raw.away_shots ?? 0;
  const homeShotQuality = homeShots > 0 ? +(homeNpxg / homeShots).toFixed(2) : 0;
  const awayShotQuality = awayShots > 0 ? +(awayNpxg / awayShots).toFixed(2) : 0;

  const { region, country } = categorizeCompetition(raw.competition || 'International');

  return {
    id: raw.match_id || `${raw.home_team}-${raw.away_team}-${raw.match_date}`,
    rank: 0, // will be assigned during ranking
    competition: raw.competition,
    region,
    country: raw.country || country,
    matchDate: raw.match_date,
    status: raw.status || 'scheduled',
    venue: raw.venue || 'Stadium',
    homeTeam: raw.home_team,
    awayTeam: raw.away_team,
    homeCode: raw.home_team_code || raw.home_team.slice(0, 3).toUpperCase(),
    awayCode: raw.away_team_code || raw.away_team.slice(0, 3).toUpperCase(),
    homeXg,
    awayXg,
    homeNpxg,
    awayNpxg,
    isNpxgDerived,
    netNpxGD,
    favoredTeam,
    favoredSide,
    underdogTeam,
    npxgdFavoriteEdge,
    homeFieldTilt,
    awayFieldTilt,
    fieldTiltDiff,
    favoredFieldTilt,
    winExpectancyPct,
    drawExpectancyPct,
    underdogWinExpectancyPct,
    expectedValueEdgeIndex,
    homeShots,
    awayShots,
    homeSot: raw.home_sot ?? 0,
    awaySot: raw.away_sot ?? 0,
    homeShotQuality,
    awayShotQuality,
    rawPayload: raw
  };
}

/**
 * Analytical Rule: Rank fixtures instantly forcing the heavy favorite with the highest
 * positive expected value edge (npxGD favorite edge) to the very top.
 */
export function rankFixtures(
  fixtures: AnalyzedFixture[], 
  sortBy: SortField = 'favoriteEdge', 
  direction: SortDirection = 'desc'
): AnalyzedFixture[] {
  const sorted = [...fixtures].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'favoriteEdge':
        // Primary Rule: highest positive npxGD edge at the top
        comparison = b.npxgdFavoriteEdge - a.npxgdFavoriteEdge;
        if (comparison === 0) {
          comparison = b.winExpectancyPct - a.winExpectancyPct;
        }
        break;
      case 'winExpectancy':
        comparison = b.winExpectancyPct - a.winExpectancyPct;
        break;
      case 'fieldTilt':
        comparison = b.favoredFieldTilt - a.favoredFieldTilt;
        break;
      case 'totalXg':
        comparison = (b.homeXg + b.awayXg) - (a.homeXg + a.awayXg);
        break;
      case 'date':
        comparison = new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime();
        break;
      case 'rank':
        comparison = a.rank - b.rank;
        break;
      default:
        comparison = b.npxgdFavoriteEdge - a.npxgdFavoriteEdge;
    }
    return direction === 'asc' ? -comparison : comparison;
  });

  // Assign 1-indexed rank based on default analytical hierarchy
  return sorted.map((fixture, idx) => ({
    ...fixture,
    rank: idx + 1
  }));
}

/**
 * Flexible JSON parser for fbrapi.com /team-match-stats raw payloads
 * Accepts raw array, { data: [...] }, { matches: [...] }, { team_match_stats: [...] }
 */
export function parseFbrapiJson(jsonString: string): { data: RawFbrapiMatchStats[]; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    let rawList: any[] = [];

    if (Array.isArray(parsed)) {
      rawList = parsed;
    } else if (parsed && typeof parsed === 'object') {
      if (Array.isArray(parsed.data)) rawList = parsed.data;
      else if (Array.isArray(parsed.matches)) rawList = parsed.matches;
      else if (Array.isArray(parsed.team_match_stats)) rawList = parsed.team_match_stats;
      else if (Array.isArray(parsed.results)) rawList = parsed.results;
      else if (parsed.home_team && parsed.away_team) rawList = [parsed];
      else {
        // try to find first array property
        const arrayProp = Object.values(parsed).find(v => Array.isArray(v));
        if (arrayProp && Array.isArray(arrayProp)) rawList = arrayProp;
      }
    }

    if (rawList.length === 0) {
      return { 
        data: [], 
        error: 'No match records detected in JSON. Ensure payload contains an array of matches with home_team, away_team, and home_xg keys.' 
      };
    }

    // Sanitize and validate minimum required keys
    const validMatches: RawFbrapiMatchStats[] = [];
    for (let i = 0; i < rawList.length; i++) {
      const item = rawList[i];
      if (!item.home_team || !item.away_team) {
        continue;
      }
      validMatches.push({
        match_id: item.match_id || item.id || `fbrapi-${i + 1}`,
        competition: item.competition || item.league || 'International',
        country: item.country,
        season: item.season,
        round: item.round || item.gameweek,
        match_date: item.match_date || item.date || new Date().toISOString().split('T')[0],
        status: item.status || 'scheduled',
        home_team: String(item.home_team),
        away_team: String(item.away_team),
        home_team_code: item.home_team_code || item.home_code,
        away_team_code: item.away_team_code || item.away_code,
        venue: item.venue,
        home_xg: Number(item.home_xg ?? item.home_expected_goals ?? 0),
        away_xg: Number(item.away_xg ?? item.away_expected_goals ?? 0),
        home_npxg: item.home_npxg !== undefined ? Number(item.home_npxg) : undefined,
        away_npxg: item.away_npxg !== undefined ? Number(item.away_npxg) : undefined,
        home_pens_made: item.home_pens_made,
        home_pens_att: item.home_pens_att,
        away_pens_made: item.away_pens_made,
        away_pens_att: item.away_pens_att,
        field_tilt: item.field_tilt !== undefined ? Number(item.field_tilt) : undefined,
        home_field_tilt: item.home_field_tilt !== undefined ? Number(item.home_field_tilt) : undefined,
        away_field_tilt: item.away_field_tilt !== undefined ? Number(item.away_field_tilt) : undefined,
        home_shots: item.home_shots,
        away_shots: item.away_shots,
        home_sot: item.home_sot,
        away_sot: item.away_sot,
        home_possession: item.home_possession,
        away_possession: item.away_possession,
        home_sca: item.home_sca,
        away_sca: item.away_sca,
        home_ppda: item.home_ppda,
        away_ppda: item.away_ppda,
        home_npxg_per_shot: item.home_npxg_per_shot,
        away_npxg_per_shot: item.away_npxg_per_shot,
      });
    }

    if (validMatches.length === 0) {
      return {
        data: [],
        error: 'JSON parsed successfully but lacked valid matches with home_team and away_team fields.'
      };
    }

    return { data: validMatches };
  } catch (err: any) {
    return { data: [], error: `Malformed JSON format: ${err.message}` };
  }
}

/**
 * Extracts a dynamic list of all distinct competitions in the dataset
 */
export function extractDistinctCompetitions(fixtures: AnalyzedFixture[]): string[] {
  const compSet = new Set<string>();
  fixtures.forEach(f => {
    if (f.competition) compSet.add(f.competition);
  });
  return Array.from(compSet).sort();
}

/**
 * Converts analyzed fixtures to downloadable CSV formatted data
 */
export function exportToCsv(fixtures: AnalyzedFixture[]): string {
  const headers = [
    'Rank',
    'Competition',
    'Region',
    'Date',
    'Home Team',
    'Away Team',
    'Favored Team',
    'Favored Side',
    'npxGD Favorite Edge',
    'Net npxGD (H-A)',
    'Home xG',
    'Away xG',
    'Home npxG',
    'Away npxG',
    'Home Field Tilt %',
    'Away Field Tilt %',
    'Favored Win Prob %',
    'EV Edge Rating',
    'Home Shots',
    'Away Shots'
  ];

  const rows = fixtures.map(f => [
    f.rank,
    `"${f.competition}"`,
    `"${f.region}"`,
    f.matchDate,
    `"${f.homeTeam}"`,
    `"${f.awayTeam}"`,
    `"${f.favoredTeam}"`,
    f.favoredSide,
    f.npxgdFavoriteEdge,
    f.netNpxGD,
    f.homeXg,
    f.awayXg,
    f.homeNpxg,
    f.awayNpxg,
    f.homeFieldTilt,
    f.awayFieldTilt,
    f.winExpectancyPct,
    f.expectedValueEdgeIndex,
    f.homeShots,
    f.awayShots
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
