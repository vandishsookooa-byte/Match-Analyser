import React from 'react';
import { AnalyzedFixture, SortDirection, SortField } from '../types/sports-data';
import { ChevronRight, ArrowUpRight, ShieldCheck, Flame, Compass, ChevronDown } from 'lucide-react';

interface LeaderboardTableProps {
  fixtures: AnalyzedFixture[];
  sortBy: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onSelectFixture: (fixture: AnalyzedFixture) => void;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  fixtures,
  sortBy,
  sortDirection,
  onSort,
  onSelectFixture,
}) => {
  if (fixtures.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-slate-900/40 rounded-xl border border-slate-800">
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
          <Compass className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-200">No matching fixtures found</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          No matches match your current competition or search criteria. Try resetting filters or loading another fbrapi dataset.
        </p>
      </div>
    );
  }

  const renderSortArrow = (field: SortField) => {
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
          DESKTOP DATA GRID (Visible on md and larger)
          ========================================================================= */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th
                  onClick={() => onSort('rank')}
                  className="py-3.5 px-4 text-center w-14 cursor-pointer hover:text-white"
                >
                  Rank{renderSortArrow('rank')}
                </th>
                <th className="py-3.5 px-4">Fixture & Competition</th>
                <th
                  onClick={() => onSort('favoriteEdge')}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-emerald-300"
                >
                  Favorite npxGD Edge{renderSortArrow('favoriteEdge')}
                </th>
                <th className="py-3.5 px-4 text-center">npxG (H vs A)</th>
                <th
                  onClick={() => onSort('fieldTilt')}
                  className="py-3.5 px-4 text-center w-48 cursor-pointer hover:text-white"
                >
                  Field Tilt %{renderSortArrow('fieldTilt')}
                </th>
                <th
                  onClick={() => onSort('winExpectancy')}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-white"
                >
                  Win Prob %{renderSortArrow('winExpectancy')}
                </th>
                <th className="py-3.5 px-4 text-right">EV Index</th>
                <th className="py-3.5 px-4 text-center w-20">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {fixtures.map((fixture) => {
                const isHeavy = fixture.npxgdFavoriteEdge >= 1.5;
                const isRank1 = fixture.rank === 1;

                return (
                  <tr
                    key={fixture.id}
                    onClick={() => onSelectFixture(fixture)}
                    className={`group hover:bg-slate-800/50 transition-colors cursor-pointer ${
                      isRank1 ? 'bg-emerald-950/20' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3 px-4 text-center font-mono font-bold">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded text-xs tabular-nums ${
                          isRank1
                            ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                            : fixture.rank <= 3
                            ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {fixture.rank}
                      </span>
                    </td>

                    {/* Fixture & Competition Info */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-2">
                          <span
                            className={
                              fixture.favoredSide === 'home'
                                ? 'text-emerald-300 font-bold'
                                : 'text-slate-200'
                            }
                          >
                            {fixture.homeTeam}
                          </span>
                          <span className="text-slate-500 font-normal text-xs">vs</span>
                          <span
                            className={
                              fixture.favoredSide === 'away'
                                ? 'text-emerald-300 font-bold'
                                : 'text-slate-200'
                            }
                          >
                            {fixture.awayTeam}
                          </span>
                          {fixture.favoredSide === 'away' && (
                            <span className="text-[10px] text-cyan-400 font-normal font-mono">
                              (Away Fav)
                            </span>
                          )}
                        </div>
                        {/* Zero-Pill unboxed metadata */}
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="font-medium text-slate-300">
                            {fixture.competition}
                          </span>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span className="font-mono text-slate-500">
                            {fixture.matchDate}
                          </span>
                          {fixture.country && (
                            <>
                              <span aria-hidden="true" className="text-slate-600">·</span>
                              <span className="text-slate-500">{fixture.country}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Favorite npxGD Edge */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex flex-col items-end">
                        <span
                          className={`font-mono text-sm font-bold tabular-nums flex items-center gap-1 ${
                            isHeavy
                              ? 'text-emerald-400'
                              : fixture.npxgdFavoriteEdge >= 0.8
                              ? 'text-emerald-300'
                              : 'text-slate-300'
                          }`}
                        >
                          +{fixture.npxgdFavoriteEdge.toFixed(2)}
                          {isHeavy && <Flame className="w-3.5 h-3.5 text-amber-400 inline" />}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Fav: {fixture.favoredTeam}
                        </span>
                      </div>
                    </td>

                    {/* npxG (Home vs Away) */}
                    <td className="py-3 px-4 text-center">
                      <div className="font-mono text-xs tabular-nums text-slate-300">
                        <span
                          className={
                            fixture.favoredSide === 'home'
                              ? 'font-bold text-white'
                              : 'text-slate-400'
                          }
                        >
                          {fixture.homeNpxg.toFixed(2)}
                        </span>
                        <span className="text-slate-600 mx-1.5">—</span>
                        <span
                          className={
                            fixture.favoredSide === 'away'
                              ? 'font-bold text-white'
                              : 'text-slate-400'
                          }
                        >
                          {fixture.awayNpxg.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Net: {fixture.netNpxGD > 0 ? `+${fixture.netNpxGD.toFixed(2)}` : fixture.netNpxGD.toFixed(2)}
                      </div>
                    </td>

                    {/* Field Tilt % Progress Bar */}
                    <td className="py-3 px-4">
                      <div className="w-full">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 mb-1">
                          <span
                            className={
                              fixture.favoredSide === 'home' ? 'font-bold text-emerald-300' : ''
                            }
                          >
                            {fixture.homeFieldTilt}%
                          </span>
                          <span className="text-[10px] text-slate-500">
                            +{fixture.fieldTiltDiff}% edge
                          </span>
                          <span
                            className={
                              fixture.favoredSide === 'away' ? 'font-bold text-emerald-300' : ''
                            }
                          >
                            {fixture.awayFieldTilt}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                          <div
                            style={{ width: `${fixture.homeFieldTilt}%` }}
                            className={`h-full transition-all ${
                              fixture.favoredSide === 'home'
                                ? 'bg-emerald-400'
                                : 'bg-slate-600'
                            }`}
                          />
                          <div
                            style={{ width: `${fixture.awayFieldTilt}%` }}
                            className={`h-full transition-all ${
                              fixture.favoredSide === 'away'
                                ? 'bg-cyan-400'
                                : 'bg-slate-700'
                            }`}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Favored Win Expectancy % */}
                    <td className="py-3 px-4 text-right">
                      <div className="font-mono text-sm font-bold text-white tabular-nums">
                        {fixture.winExpectancyPct}%
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Draw: {fixture.drawExpectancyPct}%
                      </div>
                    </td>

                    {/* EV Index */}
                    <td className="py-3 px-4 text-right">
                      <div className="font-mono text-xs font-bold tabular-nums text-cyan-300">
                        {fixture.expectedValueEdgeIndex.toFixed(1)} / 10
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Model Score
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectFixture(fixture);
                        }}
                        className="inline-flex items-center justify-center p-1.5 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="View Detailed Analytics & Source Payload"
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
        {fixtures.map((fixture) => {
          const isRank1 = fixture.rank === 1;
          const isHeavy = fixture.npxgdFavoriteEdge >= 1.5;

          return (
            <div
              key={fixture.id}
              onClick={() => onSelectFixture(fixture)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isRank1
                  ? 'bg-slate-900/90 border-emerald-500/50 shadow-md'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Header: Rank + Competition + Date */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-mono font-bold tabular-nums ${
                      isRank1
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    #{fixture.rank}
                  </span>
                  <div className="text-xs text-slate-400 truncate max-w-[200px]">
                    <span className="font-medium text-slate-300">{fixture.competition}</span>
                    <span className="mx-1 text-slate-600">·</span>
                    <span className="font-mono text-slate-500">{fixture.matchDate}</span>
                  </div>
                </div>

                {isRank1 && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                    Top Edge #1
                  </span>
                )}
              </div>

              {/* Match Teams */}
              <div className="text-base font-bold text-white mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={
                      fixture.favoredSide === 'home'
                        ? 'text-emerald-300 font-extrabold'
                        : 'text-slate-300'
                    }
                  >
                    {fixture.homeTeam}
                  </span>
                  <span className="text-xs text-slate-500 font-normal">vs</span>
                  <span
                    className={
                      fixture.favoredSide === 'away'
                        ? 'text-emerald-300 font-extrabold'
                        : 'text-slate-300'
                    }
                  >
                    {fixture.awayTeam}
                  </span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 shrink-0" />
              </div>

              {/* Core Analytics Metric Callouts */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 mb-3 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Favorite Edge</div>
                  <div className="font-mono text-base font-bold text-emerald-400 tabular-nums">
                    +{fixture.npxgdFavoriteEdge.toFixed(2)}{' '}
                    <span className="text-[11px] font-sans text-slate-400">npxGD</span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    Fav: {fixture.favoredTeam}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-medium">Win Probability</div>
                  <div className="font-mono text-base font-bold text-white tabular-nums">
                    {fixture.winExpectancyPct}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Draw {fixture.drawExpectancyPct}%
                  </div>
                </div>
              </div>

              {/* Field Tilt Bar */}
              <div>
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
                  <span>Field Tilt: {fixture.homeTeam} {fixture.homeFieldTilt}%</span>
                  <span>{fixture.awayTeam} {fixture.awayFieldTilt}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${fixture.homeFieldTilt}%` }}
                    className={`h-full ${
                      fixture.favoredSide === 'home' ? 'bg-emerald-400' : 'bg-slate-600'
                    }`}
                  />
                  <div
                    style={{ width: `${fixture.awayFieldTilt}%` }}
                    className={`h-full ${
                      fixture.favoredSide === 'away' ? 'bg-cyan-400' : 'bg-slate-700'
                    }`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
