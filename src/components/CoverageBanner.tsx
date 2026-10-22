import React from 'react';
import { CoverageReport, TopTwoSelectionSummary } from '../types/football';
import { ShieldCheck, AlertCircle, RefreshCw, Globe, Layers, Activity, Users, Award } from 'lucide-react';

interface CoverageBannerProps {
  coverage: CoverageReport;
  onOpenCoverageModal: () => void;
  selectionSummary?: TopTwoSelectionSummary;
}

export const CoverageBanner: React.FC<CoverageBannerProps> = ({
  coverage,
  onOpenCoverageModal,
  selectionSummary,
}) => {
  const representedCount = selectionSummary?.competitionsRepresented ?? coverage.competitionsSuccessfullyUpdated;
  const displayedCount = selectionSummary?.teamRecordsDisplayed ?? 0;
  const expectedMax = selectionSummary?.expectedMaxRecords ?? (representedCount * 2);
  const singleTeamCount = selectionSummary?.singleTeamCompetitions.length ?? 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {/* Metric 1: Total Discovered */}
      <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium">Total Discovered</span>
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono tracking-tight text-white tabular-nums">
            {coverage.totalCompetitionsDiscovered}
          </span>
          <span className="text-xs text-slate-400">competitions</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          Global catalogue across all tiers
        </div>
      </div>

      {/* Metric 2: Successfully Updated */}
      <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium">Successfully Synced</span>
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono tracking-tight text-emerald-400 tabular-nums">
            {coverage.competitionsSuccessfullyUpdated}
          </span>
          <span className="text-xs text-slate-400">active tables</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          Valid standings retrieved
        </div>
      </div>

      {/* Metric 3: Represented in Leaderboard */}
      <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium">Represented Leagues</span>
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono tracking-tight text-indigo-300 tabular-nums">
            {representedCount}
          </span>
          <span className="text-xs text-slate-400">competitions</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          Under active filter selections
        </div>
      </div>

      {/* Metric 4: Team Records Displayed vs Expected Max */}
      <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium">Top Two Teams</span>
          <Award className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold font-mono tracking-tight text-white tabular-nums">
            {displayedCount}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            / {expectedMax} expected max
          </span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
          <span>Max 2 teams per league</span>
          {singleTeamCount > 0 && (
            <span className="text-amber-400 text-[10px]" title="Competitions with only 1 eligible team">
              ({singleTeamCount} solo)
            </span>
          )}
        </div>
      </div>

      {/* Metric 5: Coverage Gaps & Rate Limits */}
      <div className="col-span-2 lg:col-span-1 p-3.5 rounded-lg bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium">Coverage Transparency</span>
          <Activity className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono tracking-tight text-amber-300 tabular-nums">
            {coverage.competitionsUnavailable}
          </span>
          <button
            onClick={onOpenCoverageModal}
            className="text-[11px] text-amber-400 hover:underline cursor-pointer"
          >
            unavailable gaps
          </button>
        </div>
        <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
          <span>Rate: {coverage.provider.rateLimitRemaining} calls left</span>
          <button
            onClick={onOpenCoverageModal}
            className="text-emerald-400 hover:underline text-[11px] cursor-pointer"
          >
            Inspect
          </button>
        </div>
      </div>
    </div>
  );
};
