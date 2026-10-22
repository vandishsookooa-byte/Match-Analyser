import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const API_KEY = process.env.PITCH_API_KEY || 'pk_test_UUoydUTRhJ7yELWrMmpEdYUwUOFRFtBYZsfxdroKHwM';
const BASE_URL = process.env.PITCH_BASE_URL || 'https://api.pitchapi.dev';

const COUNTRY_FLAGS: Record<string, { country: string, flag: string }> = {
  ENG: { country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  ESP: { country: 'Spain', flag: '🇪🇸' },
  GER: { country: 'Germany', flag: '🇩🇪' },
  ITA: { country: 'Italy', flag: '🇮🇹' },
  FRA: { country: 'France', flag: '🇫🇷' },
  NED: { country: 'Netherlands', flag: '🇳🇱' },
  POR: { country: 'Portugal', flag: '🇵🇹' },
  TUR: { country: 'Turkey', flag: '🇹🇷' },
  BEL: { country: 'Belgium', flag: '🇧🇪' },
  SCO: { country: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  AUT: { country: 'Austria', flag: '🇦🇹' },
  SUI: { country: 'Switzerland', flag: '🇨🇭' },
  DEN: { country: 'Denmark', flag: '🇩🇰' },
  SWE: { country: 'Sweden', flag: '🇸🇪' },
  NOR: { country: 'Norway', flag: '🇳🇴' },
  POL: { country: 'Poland', flag: '🇵🇱' },
  CRO: { country: 'Croatia', flag: '🇭🇷' },
  SRB: { country: 'Serbia', flag: '🇷🇸' },
  GRE: { country: 'Greece', flag: '🇬🇷' },
  CZE: { country: 'Czechia', flag: '🇨🇿' },
  SVK: { country: 'Slovakia', flag: '🇸🇰' },
  ROU: { country: 'Romania', flag: '🇷🇴' },
  RUS: { country: 'Russia', flag: '🇷🇺' },
  ISR: { country: 'Israel', flag: '🇮🇱' },
  FIN: { country: 'Finland', flag: '🇫🇮' },
  ISL: { country: 'Iceland', flag: '🇮🇸' },
  IRL: { country: 'Ireland', flag: '🇮🇪' },
  LVA: { country: 'Latvia', flag: '🇱🇻' },
  USA: { country: 'United States', flag: '🇺🇸' },
  CAN: { country: 'Canada', flag: '🇨🇦' },
  MEX: { country: 'Mexico', flag: '🇲🇽' },
  BRA: { country: 'Brazil', flag: '🇧🇷' },
  ARG: { country: 'Argentina', flag: '🇦🇷' },
  COL: { country: 'Colombia', flag: '🇨🇴' },
  CHI: { country: 'Chile', flag: '🇨🇱' },
  PER: { country: 'Peru', flag: '🇵🇪' },
  ECU: { country: 'Ecuador', flag: '🇪🇨' },
  PAR: { country: 'Paraguay', flag: '🇵🇾' },
  BOL: { country: 'Bolivia', flag: '🇧🇴' },
  VEN: { country: 'Venezuela', flag: '🇻🇪' },
  JPN: { country: 'Japan', flag: '🇯🇵' },
  KOR: { country: 'South Korea', flag: '🇰🇷' },
  KSA: { country: 'Saudi Arabia', flag: '🇸🇦' },
  QAT: { country: 'Qatar', flag: '🇶🇦' },
  UAE: { country: 'United Arab Emirates', flag: '🇦🇪' },
  CHN: { country: 'China', flag: '🇨🇳' },
  IND: { country: 'India', flag: '🇮🇳' },
  THA: { country: 'Thailand', flag: '🇹🇭' },
  AUS: { country: 'Australia', flag: '🇦🇺' },
  EGY: { country: 'Egypt', flag: '🇪🇬' },
  RSA: { country: 'South Africa', flag: '🇿🇦' },
  'INT-2': { country: 'Europe (UEFA)', flag: '🇪🇺' },
  INT: { country: 'International', flag: '🌐' }
};

function categorizeLeague(name: string, countryCode: string, id: string) {
  const lower = name.toLowerCase();

  // 1. Women's / Feminine football check
  if (lower.includes('women') || lower.includes('feminin') || lower.includes('femenin') || lower.includes('frauen') || lower.includes('damas') || lower.includes('vrouwen') || lower.includes('wsl')) {
    return { type: 'womens_football' as const, isExcluded: true, reason: "Feminine football excluded per user requirement" };
  }

  // 2. Domestic Cup check
  if ((lower.includes('cup') && !lower.includes('world cup')) || lower.includes('pokal') || lower.includes('coupe') || lower.includes('coppa') || lower.includes('taça') || lower.includes('taca') || lower.includes('copa del rey') || lower.includes('fa cup')) {
    return { type: 'domestic_cup' as const, isExcluded: true, reason: "Domestic cup excluded per user requirement" };
  }

  // 3. Continental
  if (id === 'l_0bfbkO' || id === 'l_38d9HA' || id === 'l_2WZ2tt' || lower.includes('champions league') || lower.includes('europa league') || lower.includes('conference league') || lower.includes('copa libertadores')) {
    return { type: 'continental_competition' as const, tierLabel: 'Continental', isExcluded: false };
  }

  // 4. National Team
  if (id === 'l_1XLtP0' || lower.includes('world cup') || lower.includes('euro') || lower.includes('nations league') || countryCode === 'INT') {
    return { type: 'national_team' as const, tierLabel: 'National Teams', isExcluded: false };
  }

  // 5. Youth
  if (lower.includes('u21') || lower.includes('u23') || lower.includes('u19') || lower.includes('youth') || lower.includes('next pro')) {
    return { type: 'youth_competition' as const, tierLabel: 'Youth', isExcluded: false };
  }

  // 6. Third Division & Lower
  if (lower.includes('league one') || lower.includes('league two') || lower.includes('3. liga') || lower.includes('j3') || (lower.includes('league 1') && lower.includes('usl')) || lower.includes('usl league one')) {
    return { type: 'third_division' as const, tierLabel: 'Tier 3 / Lower', isExcluded: false };
  }

  // 7. Second Division
  if (lower.includes('championship') || lower.includes('2. bundesliga') || lower.includes('serie b') || lower.includes('ligue 2') || lower.includes('laliga2') || lower.includes('eerste divisie') || lower.includes('challenger pro') || lower.includes('k league 2') || lower.includes('first division') || lower.includes('1. division') || lower.includes('usl championship')) {
    return { type: 'second_division' as const, tierLabel: 'Tier 2', isExcluded: false };
  }

  // 8. First Division (Default national top flight)
  return { type: 'first_division' as const, tierLabel: 'Tier 1 Top Flight', isExcluded: false };
}

async function fetchFromPitch(endpoint: string) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'X-API-KEY': API_KEY,
      'Accept': 'application/json'
    }
  });
  if (!res.ok) {
    throw new Error(`PitchAPI request failed ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

async function buildCache() {
  console.log('Fetching all leagues from PitchAPI...');
  const leaguesResponse = await fetchFromPitch('/v1/leagues');
  const rawLeagues = leaguesResponse.data.leagues;
  console.log(`Discovered ${rawLeagues.length} total competitions from PitchAPI.`);

  const discoveredCompetitions: any[] = [];
  const excludedDetails: any[] = [];
  const teamRecords: any[] = [];

  // Group leagues to fetch: prioritize 25 key worldwide leagues across all tiers
  for (const league of rawLeagues) {
    const countryInfo = COUNTRY_FLAGS[league.country_code] || { country: league.country_code, flag: '🌐' };
    const cat = categorizeLeague(league.name, league.country_code, league.id);

    if (cat.isExcluded) {
      excludedDetails.push({
        id: league.id,
        name: league.name,
        country: countryInfo.country,
        reason: cat.reason
      });
      continue;
    }

    discoveredCompetitions.push({
      id: league.id,
      name: league.name,
      country: countryInfo.country,
      countryCode: league.country_code,
      flag: countryInfo.flag,
      type: cat.type,
      tierLabel: cat.tierLabel,
      availableSeasons: league.seasons,
      currentSeason: league.seasons[league.seasons.length - 1] || '2024/2025',
      status: 'active',
      providerName: 'PitchAPI (api.pitchapi.dev)',
      logoUrl: league.image_url,
      teamsCount: 0
    });
  }

  console.log(`Active non-excluded competitions: ${discoveredCompetitions.length}`);
  console.log(`Excluded competitions: ${excludedDetails.length}`);

  // Fetch matches for top competitions across tiers to populate live standings
  const priorityLeagues = [
    // Tier 1 Europe
    { id: 'l_4WFCIZ', season: '2024/2025' }, // Premier League
    { id: 'l_0ErfuF', season: '2024/2025' }, // LaLiga
    { id: 'l_0ALvwF', season: '2024/2025' }, // Serie A
    { id: 'l_1Isor4', season: '2024/2025' }, // Bundesliga
    { id: 'l_3FJFUl', season: '2024/2025' }, // Ligue 1
    { id: 'l_4H43wr', season: '2024/2025' }, // Eredivisie
    { id: 'l_4QexZg', season: '2024/2025' }, // Liga Portugal
    { id: 'l_0S1uaf', season: '2024/2025' }, // Super Lig
    { id: 'l_1LMdEO', season: '2024/2025' }, // Premiership (Scotland)
    { id: 'l_49Zmno', season: '2024/2025' }, // Superligaen (Denmark)

    // Tier 2
    { id: 'l_4DWyTT', season: '2024/2025' }, // Championship (ENG Tier 2)
    { id: 'l_3hvsne', season: '2024/2025' }, // 2. Bundesliga (GER Tier 2)
    { id: 'l_3qUkB8', season: '2024' },      // Serie B (BRA Tier 2)
    { id: 'l_3yVUAO', season: '2024' },      // USL Championship (USA Tier 2)

    // Tier 3 & Lower
    { id: 'l_0ahLw8', season: '2024/2025' }, // League One (ENG Tier 3)
    { id: 'l_1W6idJ', season: '2024/2025' }, // League Two (ENG Tier 4)
    { id: 'l_47077Y', season: '2024/2025' }, // 3. Liga (GER Tier 3)
    { id: 'l_3fglZv', season: '2024' },      // J3 League (JPN Tier 3)
    { id: 'l_3Kf7Ni', season: '2024' },      // USL League One (USA Tier 3)

    // Americas & Asia Tier 1
    { id: 'l_0eg6C9', season: '2024' },      // MLS
    { id: 'l_1D8Xrl', season: '2024' },      // Brasileirao Serie A
    { id: 'l_0Lpz1f', season: '2024/2025' }, // Saudi Pro League
    { id: 'l_2ApGa4', season: '2024' },      // J. League
    { id: 'l_2EKrnc', season: '2024' },      // K League 1
    { id: 'l_3v84VE', season: '2024/2025' }, // Liga MX

    // Continental & National Team
    { id: 'l_0bfbkO', season: '2024/2025' }, // Champions League
    { id: 'l_38d9HA', season: '2024/2025' }, // Europa League
    { id: 'l_1XLtP0', season: '2022' }       // World Cup
  ];

  for (const item of priorityLeagues) {
    try {
      console.log(`Fetching matches for league ${item.id} (${item.season})...`);
      const matchesRes = await fetchFromPitch(`/v1/leagues/${item.id}/matches?season=${encodeURIComponent(item.season)}`);
      const matches = matchesRes?.data?.matches || [];
      const leagueMeta = discoveredCompetitions.find(c => c.id === item.id);
      if (!leagueMeta) continue;

      const teamsMap = new Map<string, any>();
      for (const m of matches) {
        if (m.status !== 'finished') continue;
        if (!teamsMap.has(m.home_team.id)) {
          teamsMap.set(m.home_team.id, {
            id: m.home_team.id,
            name: m.home_team.name,
            crestUrl: m.home_team.image_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(m.home_team.name)}`,
            mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0
          });
        }
        if (!teamsMap.has(m.away_team.id)) {
          teamsMap.set(m.away_team.id, {
            id: m.away_team.id,
            name: m.away_team.name,
            crestUrl: m.away_team.image_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(m.away_team.name)}`,
            mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0
          });
        }

        const home = teamsMap.get(m.home_team.id);
        const away = teamsMap.get(m.away_team.id);

        home.mp++;
        away.mp++;
        home.gf += (m.score_home || 0);
        home.ga += (m.score_away || 0);
        away.gf += (m.score_away || 0);
        away.ga += (m.score_home || 0);

        if (m.score_home > m.score_away) {
          home.w++;
          home.pts += 3;
          away.l++;
        } else if (m.score_home < m.score_away) {
          away.w++;
          away.pts += 3;
          home.l++;
        } else {
          home.d++;
          away.d++;
          home.pts += 1;
          away.pts += 1;
        }
      }

      const teamList = Array.from(teamsMap.values()).map(t => {
        const gd = t.gf - t.ga;
        const winPercentage = t.mp > 0 ? Number(((t.w / t.mp) * 100).toFixed(1)) : 0;
        const pointsPerMatch = t.mp > 0 ? Number((t.pts / t.mp).toFixed(2)) : 0;
        return {
          id: `${t.id}-${item.id}-${item.season}`,
          teamId: t.id,
          teamName: t.name,
          shortName: t.name.length > 18 ? t.name.substring(0, 15) + '...' : t.name,
          crestUrl: t.crestUrl,
          country: leagueMeta.country,
          countryCode: leagueMeta.countryCode,
          flag: leagueMeta.flag,
          competitionId: leagueMeta.id,
          competitionName: leagueMeta.name,
          competitionType: leagueMeta.type,
          tierLabel: leagueMeta.tierLabel,
          season: item.season,
          matchesPlayed: t.mp,
          wins: t.w,
          draws: t.d,
          losses: t.l,
          goalsFor: t.gf,
          goalsAgainst: t.ga,
          goalDifference: gd,
          points: t.pts,
          pointsPerMatch,
          winPercentage,
          lastUpdated: new Date().toISOString()
        };
      });

      leagueMeta.teamsCount = teamList.length;
      leagueMeta.status = teamList.length > 0 ? 'active' : 'unavailable';
      teamRecords.push(...teamList);
      console.log(`  -> Processed ${teamList.length} teams for ${leagueMeta.name}`);
    } catch (err: any) {
      console.error(`Failed to process league ${item.id}:`, err?.message || err);
      const leagueMeta = discoveredCompetitions.find(c => c.id === item.id);
      if (leagueMeta) {
        leagueMeta.status = 'unavailable';
      }
    }
  }

  // Mark other discovered competitions status
  discoveredCompetitions.forEach(c => {
    if (c.teamsCount === 0 && !c.status) {
      c.status = 'active'; // ready in discovery queue
    }
  });

  const cacheOutput = {
    provider: {
      name: 'PitchAPI (api.pitchapi.dev)',
      baseUrl: BASE_URL,
      apiKeyMasked: `${API_KEY.substring(0, 11)}...${API_KEY.substring(API_KEY.length - 4)}`,
      rateLimitPerMinute: 60,
      rateLimitRemaining: 58,
      serverCacheTtlMinutes: 30,
      tier: 'PitchAPI Free/Developer Plan (77 leagues)'
    },
    discoveredCompetitions,
    excludedCompetitions: excludedDetails,
    teamRecords,
    lastRefresh: new Date().toISOString()
  };

  const outputPath = path.resolve(process.cwd(), 'src/data/pitchapi-cache.json');
  fs.writeFileSync(outputPath, JSON.stringify(cacheOutput, null, 2));
  console.log(`Cache generated at ${outputPath}: ${discoveredCompetitions.length} comps, ${teamRecords.length} teams.`);
}

buildCache().catch(err => {
  console.error('Fatal error generating cache:', err);
  process.exit(1);
});
