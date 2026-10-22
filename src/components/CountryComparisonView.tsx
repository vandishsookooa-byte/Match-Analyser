import React, { useState, useMemo } from 'react';
import { TeamRankingRecord, DiscoveredCompetition } from '../types/football';
import { Flag, Layers, Trophy, ArrowRight, ShieldCheck, Check } from 'lucide-react';

interface CountryComparisonViewProps {
  records: TeamRankingRecord[];
  competitions: DiscoveredCompetition[];
  countries: string[];
  selectedCountry: string;
  onSelectCountry: (c: string) => void;
  onSelectTeam: (team: TeamRankingRecord) => void;
}

export const CountryComparisonView: React.FC<CountryComparisonViewProps> = ({
  records,
  competitions,
  countries,
  selectedCountry,
  onSelectCountry,
  onSelectTeam,
}) => {
  // Default to England if All is selected, so country comparison is instantly populated
  const activeCountry = selectedCountry === 'All' ? 'England' : selectedCountry;

  // Filter records belonging to this country
  const countryRecords = useMemo(() => {
    return records.filter(r => r.country === activeCountry);
  }, [records, activeCountry]);

  // Group by competition
  const groupedByCompetition = useMemo(() => {
    const map = new Map<string, { compName: string; tier: string; teams: TeamRankingRecord[] }>();
    
    countryRecords.forEach(team => {
      if (!map.has(team.competitionId)) {
        map.set(team.competitionId, {
          compName: team.competitionName,
          tier: team.tierLabel,
          teams: []
        });
      }
      map.get(team.competitionId)!.teams.push(team);
    });

    // Sort each group by win percentage
    map.forEach(group => {
      group.teams.sort((a, b) => b.winPercentage - a.winPercentage || b.goalDifference - a.goalDifference);
    });

    return Array.from(map.entries());
  }, [countryRecords]);

  // Combined country leaderboard: ranked strictly by Win %
  const nationalLeaderboard = useMemo(() => {
    return [...countryRecords].sort(
      (a, b) => b.winPercentage - a.winPercentage || b.goalDifference - a.goalDifference
    );
  }, [countryRecords]);

  return (
    <div className="space-y-6">
      {/* Country Selector Header */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 font-mono tracking-wider uppercase mb-1">
            <Flag className="w-3.5 h-3.5" />
            <span>National Pyramids & Multi-Tier Analytics</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Isolate & Compare Country: {activeCountry}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare winning percentages, goal differentials, and form across First, Second, and Lower divisions side-by-side.
          </p>
        </div>

        {/* Country Quick Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {countries.slice(0, 7).map(c => (
            <button
              key={c}
              onClick={() => onSelectCountry(c)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                activeCountry === c
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Cross-Division Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 & 2: Division Breakdown Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Divisions & Leagues in {activeCountry} ({groupedByCompetition.length} tiers active)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupedByCompetition.map(([compId, group]) => (
              <div
                key={compId}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between border-b border-slate-800 pb-2.5">
                  <div>
                    <h3 className="text-sm font-bold text-white">{group.compName}</h3>
                    <div className="text-[11px] font-mono text-cyan-300 mt-0.5">
                      {group.tier}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {group.teams.length} teams
                  </span>
                </div>

                {/* Team Mini Leaderboard */}
                <div className="space-y-1.5 text-xs">
                  {group.teams.map((team, idx) => (
                    <div
                      key={team.id}
                      onClick={() => onSelectTeam(team)}
                      className="p-2 rounded-lg bg-slate-950/50 hover:bg-slate-800/60 border border-slate-800/60 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-500 text-[11px] w-4">
                          #{idx + 1}
                        </span>
                        <span className="font-semibold text-white">{team.teamName}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-right">
                        <span className="text-slate-400 text-[11px]">
                          {team.wins}W-{team.draws}D-{team.losses}L
                        </span>
                        <span className="font-bold text-emerald-400">
                          {team.winPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: All-Tiers Unified National Leaderboard */}
        <div className="space-y-4">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span>Combined National Ranking</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="text-[11px] text-slate-400 pb-2 border-b border-slate-800">
              Ranked strictly by Win % regardless of division:
            </div>

            <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
              {nationalLeaderboard.map((team, idx) => (
                <div
                  key={team.id}
                  onClick={() => onSelectTeam(team)}
                  className="p-2.5 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800/80 flex items-center justify-between transition-colors cursor-pointer text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-500 text-[11px]">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-white">{team.teamName}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 pl-5">
                      {team.competitionName} ({team.tierLabel})
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="font-bold text-emerald-400">
                      {team.winPercentage.toFixed(1)}%
                    </div>
                    <div className="text-[10px] text-slate-500">
                      GD {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
