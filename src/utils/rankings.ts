import { 
  TeamRankingRecord, 
  SortField, 
  SortDirection, 
  TierCategory,
  DiscoveredCompetition,
  TopTwoSelectionSummary 
} from '../types/football';

/**
 * Strict 5-tier deterministic comparison function specified in Selection Rules:
 * 1. Win percentage, highest first.
 * 2. Goal difference, highest first.
 * 3. Goals scored, highest first.
 * 4. Points per match, highest first.
 * 5. Team name alphabetically as the final deterministic tie-breaker.
 */
export function compareTeamsDeterministic(a: TeamRankingRecord, b: TeamRankingRecord): number {
  // 1. Win percentage (highest first)
  const diffWin = b.winPercentage - a.winPercentage;
  if (Math.abs(diffWin) > 0.0001) return diffWin;

  // 2. Goal difference (highest first)
  const diffGd = b.goalDifference - a.goalDifference;
  if (diffGd !== 0) return diffGd;

  // 3. Goals scored (highest first)
  const diffGf = b.goalsFor - a.goalsFor;
  if (diffGf !== 0) return diffGf;

  // 4. Points per match (highest first)
  const diffPpm = b.pointsPerMatch - a.pointsPerMatch;
  if (Math.abs(diffPpm) > 0.0001) return diffPpm;

  // 5. Team name alphabetically as the final deterministic tie-breaker (A to Z)
  return a.teamName.localeCompare(b.teamName);
}

export interface TopTwoSelectionResult {
  selectedTeams: TeamRankingRecord[];
  summary: TopTwoSelectionSummary;
}

/**
 * Selection Rules Implementation:
 * 1. Retrieve all eligible team standings for each available competition.
 * 2. Calculate each team's win percentage using (wins ÷ matches played) × 100.
 * 3. Within each competition, rank teams using the 5 tie-breakers.
 * 4. Select the top two teams from each competition after applying these rules.
 * 5. Combine the selected teams from all competitions into one global leaderboard.
 * 6. If a competition has only one eligible team, include that team and record that only one team qualified. Never invent a second team.
 * 7. If a competition has no valid standings, exclude it from the ranked results and show its status in the coverage report.
 */
export function selectTopTwoTeamsPerCompetition(
  records: TeamRankingRecord[],
  discoveredCompetitions: DiscoveredCompetition[]
): TopTwoSelectionResult {
  // 1. Group records by competitionId
  const competitionGroups = new Map<string, TeamRankingRecord[]>();
  
  for (const record of records) {
    if (!competitionGroups.has(record.competitionId)) {
      competitionGroups.set(record.competitionId, []);
    }
    competitionGroups.get(record.competitionId)!.push(record);
  }

  const selectedTeamsPool: TeamRankingRecord[] = [];
  const singleTeamCompetitions: TopTwoSelectionSummary['singleTeamCompetitions'] = [];

  let representedCompsCount = 0;
  let expectedMaxRecords = 0;

  competitionGroups.forEach((compTeams, compId) => {
    // Exclude competitions with no valid standings
    if (!compTeams || compTeams.length === 0) return;

    representedCompsCount++;

    // Rank all eligible teams within this competition using the 5 tie-breakers
    const rankedInComp = [...compTeams].sort(compareTeamsDeterministic);
    const totalInComp = compTeams.length;

    if (totalInComp === 1) {
      // Rule 6: If only one eligible team, include that team and record only one team qualified. Never invent a second team.
      expectedMaxRecords += 1;
      const soloTeam: TeamRankingRecord = {
        ...rankedInComp[0],
        intraCompetitionRank: 1,
        isSoloQualifier: true,
        totalTeamsInCompetition: 1
      };
      selectedTeamsPool.push(soloTeam);
      singleTeamCompetitions.push({
        competitionId: compId,
        competitionName: soloTeam.competitionName,
        country: soloTeam.country,
        teamName: soloTeam.teamName
      });
    } else {
      // Rule 4: Select the top two teams from each competition
      expectedMaxRecords += 2;
      const top1: TeamRankingRecord = {
        ...rankedInComp[0],
        intraCompetitionRank: 1,
        isSoloQualifier: false,
        totalTeamsInCompetition: totalInComp
      };
      const top2: TeamRankingRecord = {
        ...rankedInComp[1],
        intraCompetitionRank: 2,
        isSoloQualifier: false,
        totalTeamsInCompetition: totalInComp
      };
      selectedTeamsPool.push(top1, top2);
    }
  });

  // Rule 7: Competitions with no valid standings
  const excludedUnavailableCompetitions = discoveredCompetitions
    .filter(c => c.status === 'unavailable' || !competitionGroups.has(c.id) || competitionGroups.get(c.id)!.length === 0)
    .map(c => ({
      competitionId: c.id,
      competitionName: c.name,
      country: c.country,
      reason: c.notes || 'Standings currently unavailable from provider feed or tier restricted.'
    }));

  const summary: TopTwoSelectionSummary = {
    totalCompetitionsDiscovered: discoveredCompetitions.length,
    competitionsSuccessfullyUpdated: discoveredCompetitions.filter(c => c.status === 'active').length,
    competitionsRepresented: representedCompsCount,
    teamRecordsDisplayed: selectedTeamsPool.length,
    expectedMaxRecords,
    singleTeamCompetitions,
    excludedUnavailableCompetitions
  };

  return {
    selectedTeams: selectedTeamsPool,
    summary
  };
}

/**
 * Combine selected teams and sort globally using the same ranking rules
 */
export function rankSelectedTeamsGlobally(
  teams: TeamRankingRecord[],
  sortBy: SortField = 'winPercentage',
  sortDirection: SortDirection = 'desc'
): TeamRankingRecord[] {
  const sorted = [...teams].sort((a, b) => {
    if (sortBy === 'winPercentage') {
      const cmp = compareTeamsDeterministic(a, b);
      return sortDirection === 'desc' ? cmp : -cmp;
    }

    let diff = 0;
    switch (sortBy) {
      case 'goalDifference':
        diff = b.goalDifference - a.goalDifference;
        break;
      case 'goalsFor':
        diff = b.goalsFor - a.goalsFor;
        break;
      case 'pointsPerMatch':
        diff = b.pointsPerMatch - a.pointsPerMatch;
        break;
      case 'points':
        diff = b.points - a.points;
        break;
      case 'matchesPlayed':
        diff = b.matchesPlayed - a.matchesPlayed;
        break;
      default:
        return sortDirection === 'desc' ? compareTeamsDeterministic(a, b) : -compareTeamsDeterministic(a, b);
    }

    if (diff === 0) {
      return compareTeamsDeterministic(a, b);
    }
    return sortDirection === 'asc' ? -diff : diff;
  });

  return sorted.map((record, index) => ({
    ...record,
    globalRank: index + 1
  }));
}

/**
 * Filter team records based on user-selected criteria
 */
export function filterTeamRecords(
  records: TeamRankingRecord[],
  filters: {
    country: string;
    tierCategory: TierCategory;
    competitionId: string;
    season: string;
    searchQuery: string;
  }
): TeamRankingRecord[] {
  return records.filter((team) => {
    // 1. Country filter
    if (filters.country !== 'All' && team.country !== filters.country) {
      return false;
    }

    // 2. Division / Tier category filter
    if (filters.tierCategory !== 'All') {
      switch (filters.tierCategory) {
        case 'First Division':
          if (team.competitionType !== 'first_division') return false;
          break;
        case 'Second Division':
          if (team.competitionType !== 'second_division') return false;
          break;
        case 'Third Division & Lower':
          if (team.competitionType !== 'third_division' && team.competitionType !== 'lower_division') return false;
          break;
        case 'Continental':
          if (team.competitionType !== 'continental_competition') return false;
          break;
        case 'National Teams':
          if (team.competitionType !== 'national_team') return false;
          break;
        case 'Youth Football':
          if (team.competitionType !== 'youth_competition') return false;
          break;
      }
    }

    // 3. Specific competition filter
    if (filters.competitionId !== 'All' && team.competitionId !== filters.competitionId) {
      return false;
    }

    // 4. Season filter
    if (filters.season !== 'All' && team.season !== filters.season) {
      return false;
    }

    // 5. Search query (matches team, competition, or country)
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const searchable = `${team.teamName} ${team.shortName} ${team.competitionName} ${team.country} ${team.tierLabel}`.toLowerCase();
      if (!searchable.includes(q)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Extracts all unique countries represented in active records
 */
export function extractUniqueCountries(records: TeamRankingRecord[]): string[] {
  const set = new Set<string>();
  records.forEach((r) => set.add(r.country));
  return Array.from(set).sort();
}

/**
 * Extracts all unique seasons available
 */
export function extractUniqueSeasons(records: TeamRankingRecord[]): string[] {
  const set = new Set<string>();
  records.forEach((r) => set.add(r.season));
  return Array.from(set).sort().reverse();
}

/**
 * Converts rankings to downloadable CSV format reflecting the active selection and sorting
 */
export function exportRankingsToCsv(records: TeamRankingRecord[], isTopTwoMode: boolean = true): string {
  const headers = [
    'Global Rank',
    'Team Name',
    'Country',
    'Competition',
    'Division / Tier',
    'Competition Rank',
    'Season',
    'Win %',
    'Matches Played',
    'Wins',
    'Draws',
    'Losses',
    'Goals For',
    'Goals Against',
    'Goal Difference',
    'Points',
    'Points Per Match'
  ];

  const rows = records.map((r) => [
    r.globalRank,
    `"${r.teamName}"`,
    `"${r.country}"`,
    `"${r.competitionName}"`,
    `"${r.tierLabel}"`,
    r.isSoloQualifier ? '"Solo Qualifier"' : r.intraCompetitionRank ? `"Top ${r.intraCompetitionRank}"` : '"Participant"',
    `"${r.season}"`,
    `${r.winPercentage.toFixed(2)}%`,
    r.matchesPlayed,
    r.wins,
    r.draws,
    r.losses,
    r.goalsFor,
    r.goalsAgainst,
    r.goalDifference,
    r.points,
    r.pointsPerMatch.toFixed(2)
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}
