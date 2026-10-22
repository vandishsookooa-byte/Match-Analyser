import React, { useState } from 'react';
import { CoverageReport, DiscoveredCompetition, TopTwoSelectionSummary } from '../types/football';
import { X, ShieldCheck, AlertCircle, RefreshCw, Database, Activity, CheckCircle2, Clock, Award, Users } from 'lucide-react';

interface CoverageModalProps {
  isOpen: boolean;
  onClose: () => void;
  coverage: CoverageReport;
  competitions: DiscoveredCompetition[];
  selectionSummary?: TopTwoSelectionSummary;
  onTriggerRefresh: () => void;
  isRefreshing: boolean;
}

export const CoverageModal: React.FC<CoverageModalProps> = ({
  isOpen,
  onClose,
  coverage,
  competitions,
  selectionSummary,
  onTriggerRefresh,
  isRefreshing,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'unavailable'>('all');

  if (!isOpen) return null;

  const filteredCompetitions = competitions.filter(c => {
    if (filterTab === 'active') return c.status === 'active';
    if (filterTab === 'unavailable') return c.status === 'unavailable';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Data Coverage & Provider Transparency Report
              </h2>
              <div className="text-[11px] text-slate-400">
                Full visibility into discovered football competitions, rate limits, and coverage gaps
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Provider Telemetry Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Configured Data Provider
                </span>
                <div className="text-sm font-bold text-white mt-0.5">
                  {coverage.provider.name}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onTriggerRefresh}
                  disabled={isRefreshing}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-md text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isRefreshing ? 'Refreshing Queue...' : 'Force Immediate Refresh'}</span>
                </button>
              </div>
            </div>

            {/* Provider Limits & Health Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 text-[10px]">Rate Limit Budget</span>
                <div className="font-mono text-white font-bold mt-0.5">
                  {coverage.provider.rateLimitPerMinute} calls / min
                </div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">Calls Remaining</span>
                <div className="font-mono text-emerald-400 font-bold mt-0.5">
                  {coverage.provider.rateLimitRemaining} calls
                </div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">Server Cache TTL</span>
                <div className="font-mono text-cyan-300 font-bold mt-0.5">
                  {coverage.provider.serverCacheTtlMinutes} minutes
                </div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">Refresh Queue</span>
                <div className="font-mono text-white font-bold mt-0.5">
                  {coverage.refreshQueue.pending} queued batches
                </div>
              </div>
            </div>
          </div>

          {/* Top Two Teams Selection Telemetry Card */}
          {selectionSummary && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                <Award className="w-4 h-4" />
                <span>Top Two Teams Selection Telemetry</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px]">Represented Leagues</span>
                  <div className="font-mono text-white font-bold mt-0.5">
                    {selectionSummary.competitionsRepresented} competitions
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Team Records Displayed</span>
                  <div className="font-mono text-emerald-400 font-bold mt-0.5">
                    {selectionSummary.teamRecordsDisplayed} teams
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Expected Max Records</span>
                  <div className="font-mono text-cyan-300 font-bold mt-0.5">
                    {selectionSummary.expectedMaxRecords} teams
                  </div>
                  <span className="text-[10px] text-slate-500">(2 × comps, adjusted)</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Solo Qualifying Leagues</span>
                  <div className="font-mono text-amber-300 font-bold mt-0.5">
                    {selectionSummary.singleTeamCompetitions.length} league(s)
                  </div>
                </div>
              </div>

              {selectionSummary.singleTeamCompetitions.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span className="text-slate-300 font-medium">Single-Team Competitions (Rule #6 Applied): </span>
                  {selectionSummary.singleTeamCompetitions.map(s => `${s.competitionName} (${s.teamName})`).join(', ')}
                </div>
              )}
            </div>
          )}

          {/* Transparent Coverage Gaps (Requirement 5) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Coverage Gaps & Unavailable Competitions ({coverage.unavailableDetails.length})</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              In accordance with our strict data transparency standards, we never fabricate missing league standings. Competitions requiring higher-tier provider subscriptions or experiencing upstream provider latency are documented below:
            </p>

            <div className="space-y-2">
              {coverage.unavailableDetails.map((gap) => (
                <div
                  key={gap.id}
                  className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-semibold text-white">
                      {gap.name} ({gap.country})
                    </div>
                    <div className="text-[11px] text-amber-300/80 mt-0.5">
                      {gap.reason}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="font-mono text-[10px] text-slate-400">
                      Requirement: {gap.tierRequired || 'Standard API'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Discovered Competition Catalogue List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Full Discovered Competition Catalogue ({competitions.length})</span>
              </div>

              {/* Filter tabs */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                <button
                  onClick={() => setFilterTab('all')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    filterTab === 'all' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({competitions.length})
                </button>
                <button
                  onClick={() => setFilterTab('active')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    filterTab === 'active' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Active ({competitions.filter(c => c.status === 'active').length})
                </button>
                <button
                  onClick={() => setFilterTab('unavailable')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    filterTab === 'unavailable' ? 'bg-slate-800 text-amber-400 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Unavailable ({competitions.filter(c => c.status === 'unavailable').length})
                </button>
              </div>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <th className="py-2.5 px-3">Competition</th>
                    <th className="py-2.5 px-3">Country</th>
                    <th className="py-2.5 px-3">Division</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Provider</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {filteredCompetitions.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-sans font-medium text-white">
                        {c.name}
                      </td>
                      <td className="py-2 px-3 text-slate-300 font-sans">
                        {c.flag} {c.country}
                      </td>
                      <td className="py-2 px-3 text-slate-400">
                        {c.tierLabel}
                      </td>
                      <td className="py-2 px-3">
                        {c.status === 'active' ? (
                          <span className="text-emerald-400 font-semibold">Active (Synced)</span>
                        ) : (
                          <span className="text-amber-400 font-semibold">Unavailable</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-500 font-sans">
                        {c.providerName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Last refresh: {new Date(coverage.lastSuccessfulRefresh).toLocaleString()}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
