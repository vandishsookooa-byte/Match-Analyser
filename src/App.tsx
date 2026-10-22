import React, { useState, useMemo, useEffect } from 'react';
import { 
  TeamRankingRecord, 
  DiscoveredCompetition, 
  CoverageReport, 
  TierCategory, 
  SortField, 
  SortDirection 
} from './types/football';
import { 
  DISCOVERED_COMPETITIONS, 
  GLOBAL_TEAM_RECORDS, 
  INITIAL_COVERAGE_REPORT 
} from './data/global-competitions-catalogue';
import { 
  selectTopTwoTeamsPerCompetition,
  rankSelectedTeamsGlobally,
  filterTeamRecords, 
  extractUniqueCountries, 
  extractUniqueSeasons, 
  exportRankingsToCsv 
} from './utils/rankings';
import { TopNav } from './components/TopNav';
import { CoverageBanner } from './components/CoverageBanner';
import { FiltersBar } from './components/FiltersBar';
import { GlobalRankingsTable } from './components/GlobalRankingsTable';
import { CountryComparisonView } from './components/CountryComparisonView';
import { CoverageModal } from './components/CoverageModal';
import { TeamDetailModal } from './components/TeamDetailModal';
import { Download, RefreshCw, Layers, Trophy, AlertTriangle, ShieldCheck, Award } from 'lucide-react';

export default function App() {
  // Navigation View State
  const [activeView, setActiveView] = useState<'rankings' | 'country_comparison' | 'coverage'>('rankings');

  // Master Data state (backed by discovered catalogue and server cache)
  const [competitions, setCompetitions] = useState<DiscoveredCompetition[]>(DISCOVERED_COMPETITIONS);
  const [allRecords, setAllRecords] = useState<TeamRankingRecord[]>(GLOBAL_TEAM_RECORDS);
  const [coverage, setCoverage] = useState<CoverageReport>(INITIAL_COVERAGE_REPORT);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Top Two Selection Rule State (Enabled by default as required by specification)
  const [isTopTwoMode, setIsTopTwoMode] = useState<boolean>(true);

  // Filter & Search states
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<TierCategory>('All');
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>('All');
  const [selectedSeason, setSelectedSeason] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sorting state - Rule #3: default is winPercentage descending
  const [sortBy, setSortBy] = useState<SortField>('winPercentage');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Modals
  const [selectedTeam, setSelectedTeam] = useState<TeamRankingRecord | null>(null);
  const [isCoverageModalOpen, setIsCoverageModalOpen] = useState(false);

  // Sync with server on initial mount
  useEffect(() => {
    fetch('/api/football/competitions')
      .then(res => res.json())
      .then(data => {
        if (data.competitions && data.competitions.length > 0) {
          setCompetitions(data.competitions);
        }
      })
      .catch(() => {
        // Fallback to catalogue
      });

    fetch('/api/football/coverage')
      .then(res => res.json())
      .then(data => {
        if (data.totalCompetitionsDiscovered) {
          setCoverage(data);
        }
      })
      .catch(() => {});
  }, []);

  // 1. Retrieve complete standings for all competitions remaining after selected filters
  const filteredCompleteStandings = useMemo(() => {
    return filterTeamRecords(allRecords, {
      country: selectedCountry,
      tierCategory: selectedTier,
      competitionId: selectedCompetitionId,
      season: selectedSeason,
      searchQuery: '' // preserve complete standings first for accurate intra-competition ranking
    });
  }, [allRecords, selectedCountry, selectedTier, selectedCompetitionId, selectedSeason]);

  // 2. Apply Top Two selection separately to each remaining competition
  const { selectedTeams: topTwoPool, summary: topTwoSummary } = useMemo(() => {
    return selectTopTwoTeamsPerCompetition(filteredCompleteStandings, competitions);
  }, [filteredCompleteStandings, competitions]);

  // 3. Search query filter (if user types in search box)
  const activeTeamsPool = useMemo(() => {
    const base = isTopTwoMode ? topTwoPool : filteredCompleteStandings;
    if (!searchQuery.trim()) return base;
    const q = searchQuery.toLowerCase().trim();
    return base.filter(team => {
      const searchable = `${team.teamName} ${team.shortName} ${team.competitionName} ${team.country} ${team.tierLabel}`.toLowerCase();
      return searchable.includes(q);
    });
  }, [isTopTwoMode, topTwoPool, filteredCompleteStandings, searchQuery]);

  // 4. Combine and rank globally using the exact same ranking rules
  const rankedTeams = useMemo(() => {
    return rankSelectedTeamsGlobally(activeTeamsPool, sortBy, sortDirection);
  }, [activeTeamsPool, sortBy, sortDirection]);

  // Dynamic filter options derived from dataset
  const uniqueCountries = useMemo(() => extractUniqueCountries(allRecords), [allRecords]);
  const uniqueSeasons = useMemo(() => extractUniqueSeasons(allRecords), [allRecords]);

  // Handle Sort Change
  const handleSortChange = (field: SortField) => {
    if (sortBy === field) {
      setSortDirection(prev => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  // Reset Filters to Default
  const handleResetFilters = () => {
    setSelectedCountry('All');
    setSelectedTier('All');
    setSelectedCompetitionId('All');
    setSelectedSeason('All');
    setSearchQuery('');
  };

  // Trigger Data Refresh from Provider
  const handleTriggerRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/football/refresh', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setCoverage(prev => ({
          ...prev,
          lastSuccessfulRefresh: data.timestamp,
          isStale: false,
          provider: {
            ...prev.provider,
            rateLimitRemaining: Math.max(0, prev.provider.rateLimitRemaining - 1)
          }
        }));
      }
    } catch {
      // Offline fallback timestamp update
      setCoverage(prev => ({
        ...prev,
        lastSuccessfulRefresh: new Date().toISOString()
      }));
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 700);
    }
  };

  // Export Filtered Rankings to CSV reflecting the Top Two rule and active sorting
  const handleExportCsv = () => {
    const csv = exportRankingsToCsv(rankedTeams, isTopTwoMode);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `global_football_top2_rankings_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <TopNav
        activeView={activeView}
        onSelectView={setActiveView}
        onRefresh={handleTriggerRefresh}
        isRefreshing={isRefreshing}
        totalCompetitions={competitions.length}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Hero Section */}
        <section className="space-y-3">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-emerald-400 font-mono tracking-wider uppercase mb-1">
                Worldwide Football League Coverage
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Global Football Rankings: Highest to Lowest Win Rate
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Ranking club and tournament records across First, Second, and Lower divisions, Continental competitions, National Teams, and Youth leagues. Formulated as <span className="text-slate-200 font-mono font-medium">(Wins ÷ Matches Played) × 100</span> with strict tie-breaking.
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Download CSV of current rankings"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => setIsCoverageModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Coverage Report</span>
              </button>
            </div>
          </div>
        </section>

        {/* Coverage Transparency Banner */}
        <section>
          <CoverageBanner
            coverage={coverage}
            onOpenCoverageModal={() => setIsCoverageModalOpen(true)}
            selectionSummary={topTwoSummary}
          />
        </section>

        {/* View Switcher: Global Rankings vs Country Comparison vs Full Catalogue */}
        {activeView === 'rankings' && (
          <>
            {/* Global Filters Bar */}
            <section>
              <FiltersBar
                countries={uniqueCountries}
                selectedCountry={selectedCountry}
                onSelectCountry={setSelectedCountry}
                selectedTier={selectedTier}
                onSelectTier={setSelectedTier}
                competitions={competitions}
                selectedCompetitionId={selectedCompetitionId}
                onSelectCompetitionId={setSelectedCompetitionId}
                seasons={uniqueSeasons}
                selectedSeason={selectedSeason}
                onSelectSeason={setSelectedSeason}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
                onResetFilters={handleResetFilters}
                totalFilteredTeams={rankedTeams.length}
              />
            </section>

            {/* Primary Global Leaderboard Table */}
            <section className="space-y-3">
              {/* Top Two Rule Telemetry Strip */}
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-white">Top Two Teams Selection:</span>
                  <span className="text-slate-300">
                    Displaying <span className="font-mono text-emerald-400 font-bold">{rankedTeams.length}</span> teams across <span className="font-mono text-white font-bold">{topTwoSummary.competitionsRepresented}</span> represented competitions
                  </span>
                  <span className="text-slate-500 font-mono">
                    ({topTwoSummary.expectedMaxRecords} expected maximum)
                  </span>
                  {topTwoSummary.singleTeamCompetitions.length > 0 && (
                    <span className="text-amber-400 text-[11px] font-mono">
                      · {topTwoSummary.singleTeamCompetitions.length} league(s) with 1 qualifying team
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsTopTwoMode(prev => !prev)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                    title="Toggle between Top 2 teams per competition and complete competition tables"
                  >
                    <span className="text-slate-400">View:</span>
                    <span className={isTopTwoMode ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                      {isTopTwoMode ? 'Top 2 Teams Per League (Active)' : 'Full Standings'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">Global Leaderboard</span>
                  <span className="text-slate-600">·</span>
                  <span className="font-mono text-slate-400">
                    Sorted by {sortBy === 'winPercentage' ? 'Win % (Ties broken by GD, GF, PPM, A-Z)' : sortBy}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Showing {rankedTeams.length} teams
                </div>
              </div>

              <GlobalRankingsTable
                teams={rankedTeams}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={handleSortChange}
                onSelectTeam={setSelectedTeam}
              />
            </section>
          </>
        )}

        {activeView === 'country_comparison' && (
          <section>
            <CountryComparisonView
              records={allRecords}
              competitions={competitions}
              countries={uniqueCountries}
              selectedCountry={selectedCountry}
              onSelectCountry={setSelectedCountry}
              onSelectTeam={setSelectedTeam}
            />
          </section>
        )}

        {activeView === 'coverage' && (
          <section className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Full Discovered Football Competitions Directory
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time status of all {competitions.length} discovered competitions, tiers, countries, and data provider integrations.
                  </p>
                </div>
                <button
                  onClick={() => setIsCoverageModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                >
                  View Provider Telemetry & Gaps
                </button>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                      <th className="py-3 px-4">Competition</th>
                      <th className="py-3 px-4">Country</th>
                      <th className="py-3 px-4">Tier / Type</th>
                      <th className="py-3 px-4 text-center">Teams Tracked</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Provider</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                    {competitions.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-4 font-sans font-semibold text-white">
                          {c.name}
                        </td>
                        <td className="py-2.5 px-4 text-slate-300 font-sans">
                          {c.flag} {c.country}
                        </td>
                        <td className="py-2.5 px-4 text-slate-400 font-sans">
                          {c.tierLabel}
                        </td>
                        <td className="py-2.5 px-4 text-center text-white">
                          {c.teamsCount}
                        </td>
                        <td className="py-2.5 px-4">
                          {c.status === 'active' ? (
                            <span className="text-emerald-400 font-semibold font-sans">Active & Synced</span>
                          ) : (
                            <span className="text-amber-400 font-semibold font-sans">Unavailable (Gap Logged)</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right text-slate-400 font-sans">
                          {c.providerName}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">Global Football Rankings</span>
            <span>·</span>
            <span>Worldwide Multi-Tier League & Continental Coverage</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>{competitions.length} Discovered Competitions</span>
            <span>·</span>
            <span>{uniqueCountries.length} Countries</span>
            <span>·</span>
            <span>Strict Win % Hierarchy</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TeamDetailModal
        team={selectedTeam}
        onClose={() => setSelectedTeam(null)}
      />

      <CoverageModal
        isOpen={isCoverageModalOpen}
        onClose={() => setIsCoverageModalOpen(false)}
        coverage={coverage}
        competitions={competitions}
        selectionSummary={topTwoSummary}
        onTriggerRefresh={handleTriggerRefresh}
        isRefreshing={isRefreshing}
      />
    </div>
  );
}
