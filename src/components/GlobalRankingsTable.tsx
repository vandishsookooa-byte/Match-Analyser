import React from 'react';
import { TeamRankingRecord, SortField, SortDirection } from '../types/football';
import { Trophy, ChevronRight, ArrowUpRight, Flame, Shield, HelpCircle } from 'lucide-react';

interface GlobalRankingsTableProps {
  teams: TeamRankingRecord[];
  sortBy: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onSelectTeam: (team: TeamRankingRecord) => void;
}

export const GlobalRankingsTable: React.FC<GlobalRankingsTableProps> = ({
  teams,
  sortBy,
  sortDirection,
  onSort,
  onSelectTeam,
}) => {
  if (teams.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-slate-900/40 rounded-xl border border-slate-800">
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
          <Trophy className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-200">No matching team records</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          No team standings match your current filter selections. Try resetting the country or division filters.
        </p>
      </div>
    );
  }

  const renderSortIndicator = (field: SortField) => {
    if (sortBy !== field) return null;
    return (
      <span className="inline-block ml-1 text-emerald-400 text-[10px]">
        {sortDirection === 'desc' ? '▼' : '▲'}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* =========================================================================
          DESKTOP HIGH-DENSITY LEADERBOARD (Visible on md and larger)
          ========================================================================= */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th
                  onClick={() => onSort('winPercentage')}
                  className="py-3.5 px-3.5 text-center w-14 cursor-pointer hover:text-white"
                >
                  Rank
                </th>
                <th className="py-3.5 px-4">Team & Country</th>
                <th className="py-3.5 px-4">Competition & Division</th>
                <th
                  onClick={() => onSort('winPercentage')}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-emerald-300"
                >
                  Win %{renderSortIndicator('winPercentage')}
                </th>
                <th
                  onClick={() => onSort('matchesPlayed')}
                  className="py-3.5 px-3 text-center cursor-pointer hover:text-white"
                >
                  MP{renderSortIndicator('matchesPlayed')}
                </th>
                <th className="py-3.5 px-3 text-center">W - D - L</th>
                <th className="py-3.5 px-3 text-center">GF : GA</th>
                <th
                  onClick={() => onSort('goalDifference')}
                  className="py-3.5 px-3 text-center cursor-pointer hover:text-white"
                >
                  GD{renderSortIndicator('goalDifference')}
                </th>
                <th
                  onClick={() => onSort('points')}
                  className="py-3.5 px-3 text-center cursor-pointer hover:text-white"
                >
                  Pts{renderSortIndicator('points')}
                </th>
                <th
                  onClick={() => onSort('pointsPerMatch')}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-white"
                >
                  PPM{renderSortIndicator('pointsPerMatch')}
                </th>
                <th className="py-3.5 px-3 text-center w-14">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {teams.map((record) => {
                const isRank1 = record.globalRank === 1;
                const isPerfect = record.winPercentage === 100.0;

                return (
                  <tr
                    key={record.id}
                    onClick={() => onSelectTeam(record)}
                    className={`group hover:bg-slate-800/50 transition-colors cursor-pointer ${
                      isRank1 ? 'bg-emerald-950/20' : ''
                    }`}
                  >
                    {/* Global Rank */}
                    <td className="py-3 px-3.5 text-center font-mono font-bold">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded text-xs tabular-nums ${
                          isRank1
                            ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                            : record.globalRank <= 3
                            ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {record.globalRank}
                      </span>
                    </td>

                    {/* Team Name, Crest Badge, Country */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          style={{ borderColor: record.accentColor || '#334155' }}
                          className="w-7 h-7 rounded bg-slate-950 border flex items-center justify-center text-[10px] font-black font-mono text-slate-200 shrink-0"
                        >
                          {record.teamCrest || record.teamName.slice(0, 3).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                            <span>{record.teamName}</span>
                            {isPerfect && (
                              <span title="100% Perfect Winning Record" className="inline-flex">
                                <Flame className="w-3.5 h-3.5 text-amber-400 inline" />
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span>{record.country}</span>
                            <span aria-hidden="true" className="text-slate-600">·</span>
                            <span className="font-mono text-slate-500">{record.season}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* League or Competition & Division */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-200">
                          {record.competitionName}
                        </span>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-slate-400">{record.tierLabel}</span>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          {record.isSoloQualifier ? (
                            <span className="font-mono text-amber-400 font-semibold">
                              Solo Qualifier
                            </span>
                          ) : record.intraCompetitionRank ? (
                            <span className="font-mono text-emerald-400 font-semibold">
                              Comp Top {record.intraCompetitionRank}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </td>

                    {/* Win Percentage (Primary Metric) */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex flex-col items-end">
                        <span
                          className={`font-mono text-sm font-bold tabular-nums ${
                            isPerfect
                              ? 'text-emerald-400'
                              : record.winPercentage >= 75
                              ? 'text-emerald-300'
                              : record.winPercentage >= 60
                              ? 'text-cyan-300'
                              : 'text-slate-200'
                          }`}
                        >
                          {record.winPercentage.toFixed(2)}%
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {record.wins} / {record.matchesPlayed} won
                        </span>
                      </div>
                    </td>

                    {/* Matches Played */}
                    <td className="py-3 px-3 text-center font-mono text-xs tabular-nums text-slate-300">
                      {record.matchesPlayed}
                    </td>

                    {/* Record: W - D - L */}
                    <td className="py-3 px-3 text-center font-mono text-xs tabular-nums text-slate-300">
                      <span className="text-emerald-400 font-bold">{record.wins}</span>
                      <span className="text-slate-600 mx-1">-</span>
                      <span className="text-slate-400">{record.draws}</span>
                      <span className="text-slate-600 mx-1">-</span>
                      <span className="text-red-400">{record.losses}</span>
                    </td>

                    {/* Goals: GF : GA */}
                    <td className="py-3 px-3 text-center font-mono text-xs tabular-nums text-slate-300">
                      {record.goalsFor} : {record.goalsAgainst}
                    </td>

                    {/* Goal Difference */}
                    <td className="py-3 px-3 text-center font-mono text-xs tabular-nums">
                      <span
                        className={
                          record.goalDifference > 0
                            ? 'text-emerald-400 font-bold'
                            : record.goalDifference === 0
                            ? 'text-slate-400'
                            : 'text-red-400'
                        }
                      >
                        {record.goalDifference > 0 ? `+${record.goalDifference}` : record.goalDifference}
                      </span>
                    </td>

                    {/* Competition Points */}
                    <td className="py-3 px-3 text-center font-mono text-xs font-bold tabular-nums text-white">
                      {record.points}
                    </td>

                    {/* Points Per Match */}
                    <td className="py-3 px-4 text-right font-mono text-xs tabular-nums text-cyan-300">
                      {record.pointsPerMatch.toFixed(2)}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTeam(record);
                        }}
                        className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="View Team Competition Breakdown"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          MOBILE RESPONSIVE CARD VIEW (Visible on mobile screens)
          ========================================================================= */}
      <div className="md:hidden space-y-3">
        {teams.map((record) => {
          const isRank1 = record.globalRank === 1;
          const isPerfect = record.winPercentage === 100.0;

          return (
            <div
              key={record.id}
              onClick={() => onSelectTeam(record)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isRank1
                  ? 'bg-slate-900/90 border-emerald-500/50 shadow-md'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header: Rank + League + Season */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-mono font-bold tabular-nums ${
                      isRank1
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    #{record.globalRank}
                  </span>
                  <div className="text-xs text-slate-400 truncate max-w-[210px]">
                    <span className="font-medium text-slate-300">{record.competitionName}</span>
                    <span className="mx-1 text-slate-600">·</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {record.isSoloQualifier ? 'Solo' : `Top ${record.intraCompetitionRank}`}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-emerald-400 tabular-nums">
                    {record.winPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Team Name & Crest */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    style={{ borderColor: record.accentColor || '#334155' }}
                    className="w-6 h-6 rounded bg-slate-950 border flex items-center justify-center text-[10px] font-mono font-bold text-white shrink-0"
                  >
                    {record.teamCrest || record.teamName.slice(0, 3).toUpperCase()}
                  </div>
                  <span className="text-base font-bold text-white">
                    {record.teamName}
                  </span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 shrink-0" />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-center font-mono text-xs">
                <div>
                  <div className="text-[10px] font-sans text-slate-500">Record</div>
                  <div className="font-bold text-white tabular-nums">
                    {record.wins}-{record.draws}-{record.losses}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-sans text-slate-500">GD</div>
                  <div className="font-bold text-emerald-400 tabular-nums">
                    {record.goalDifference > 0 ? `+${record.goalDifference}` : record.goalDifference}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-sans text-slate-500">Pts</div>
                  <div className="font-bold text-white tabular-nums">
                    {record.points}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-sans text-slate-500">PPM</div>
                  <div className="font-bold text-cyan-300 tabular-nums">
                    {record.pointsPerMatch.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
