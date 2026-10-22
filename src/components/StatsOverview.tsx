import React from 'react';
import { AnalyzedFixture } from '../types/sports-data';
import { TrendingUp, Award, Compass, BarChart2 } from 'lucide-react';

interface StatsOverviewProps {
  fixtures: AnalyzedFixture[];
  selectedLeague: string;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ fixtures, selectedLeague }) => {
  if (fixtures.length === 0) return null;

  const topFavorite = fixtures[0]; // Ranked #1 by npxGD edge
  const avgNpxgdSpread = +(
    fixtures.reduce((acc, f) => acc + f.npxgdFavoriteEdge, 0) / fixtures.length
  ).toFixed(2);
  const maxFieldTiltMatch = [...fixtures].sort(
    (a, b) => b.favoredFieldTilt - a.favoredFieldTilt
  )[0];
  const heavyFavoritesCount = fixtures.filter(f => f.npxgdFavoriteEdge >= 1.5).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* KPI 1: Top Heavy Favorite */}
      <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="font-medium">Top Favorite Edge</span>
          <Award className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold tracking-tight text-white truncate max-w-[130px] sm:max-w-none">
            {topFavorite?.favoredTeam || 'N/A'}
          </span>
          <span className="text-sm font-semibold font-mono text-emerald-400 tabular-nums">
            +{topFavorite?.npxgdFavoriteEdge.toFixed(2)} npxGD
          </span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 truncate">
          <span>vs {topFavorite?.underdogTeam}</span>
          <span>·</span>
          <span>{topFavorite?.competition}</span>
        </div>
      </div>

      {/* KPI 2: Heavy Favorites (npxGD >= 1.5) */}
      <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="font-medium">High-Edge Fixtures</span>
          <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono tracking-tight text-white tabular-nums">
            {heavyFavoritesCount}
          </span>
          <span className="text-xs text-slate-400">
            of {fixtures.length} matches
          </span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          Threshold $\ge$ +1.50 npxGD dominance
        </div>
      </div>

      {/* KPI 3: Average Expected Goals Spread */}
      <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="font-medium">Avg npxGD Spread</span>
          <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono tracking-tight text-white tabular-nums">
            +{avgNpxgdSpread}
          </span>
          <span className="text-xs text-slate-400 font-mono">goals/match</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1 truncate">
          Scope: {selectedLeague === 'All' ? 'All Global Competitions' : selectedLeague}
        </div>
      </div>

      {/* KPI 4: Peak Field Tilt Dominance */}
      <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="font-medium">Peak Field Tilt</span>
          <Compass className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono tracking-tight text-indigo-300 tabular-nums">
            {maxFieldTiltMatch?.favoredFieldTilt}%
          </span>
          <span className="text-xs text-slate-400 truncate max-w-[90px]">
            {maxFieldTiltMatch?.favoredTeam}
          </span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1 truncate">
          Final-third territorial dominance
        </div>
      </div>
    </div>
  );
};
