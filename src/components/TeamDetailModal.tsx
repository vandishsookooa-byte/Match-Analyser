import React from 'react';
import { TeamRankingRecord } from '../types/football';
import { X, Trophy, Shield, Activity, Target, Flame, Calendar, Award } from 'lucide-react';

interface TeamDetailModalProps {
  team: TeamRankingRecord | null;
  onClose: () => void;
}

export const TeamDetailModal: React.FC<TeamDetailModalProps> = ({ team, onClose }) => {
  if (!team) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div
              style={{ borderColor: team.accentColor || '#334155' }}
              className="w-10 h-10 rounded bg-slate-950 border-2 flex items-center justify-center text-xs font-mono font-bold text-white shrink-0 shadow-xs"
            >
              {team.teamCrest || team.teamName.slice(0, 3).toUpperCase()}
            </div>
            <div>
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <span>Rank #{team.globalRank} Worldwide</span>
                <span>·</span>
                <span>{team.country}</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                {team.teamName}
              </h2>
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
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Win Percentage Feature Card */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">
                Official Global Metric
              </div>
              <div className="text-2xl font-black font-mono text-white mt-0.5">
                {team.winPercentage.toFixed(2)}% <span className="text-sm font-sans text-slate-300 font-normal">Win Rate</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                Formula: ({team.wins} wins ÷ {team.matchesPlayed} matches) × 100
              </div>
            </div>

            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-400">PPM Efficiency</span>
              <div className="text-xl font-bold text-cyan-300 tabular-nums">
                {team.pointsPerMatch.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-500">pts / match</span>
            </div>
          </div>

          {/* Competition Isolation Badge */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Competition Scope</div>
              <div className="text-sm font-semibold text-white mt-0.5">{team.competitionName}</div>
              <div className="text-[11px] text-cyan-300 font-mono">{team.tierLabel} · Season {team.season}</div>
            </div>
            <div className="text-right">
              {team.isSoloQualifier ? (
                <span className="font-mono text-amber-400 font-bold text-xs">Solo Qualifier</span>
              ) : team.intraCompetitionRank ? (
                <span className="font-mono text-emerald-400 font-bold text-xs">Top {team.intraCompetitionRank} Qualifier</span>
              ) : (
                <span className="text-[11px] text-slate-400">Isolated Record</span>
              )}
            </div>
          </div>

          {/* Standings Matrix */}
          <div className="border border-slate-800 rounded-lg overflow-hidden font-mono text-xs">
            <div className="grid grid-cols-4 bg-slate-950/70 p-2.5 font-bold text-slate-400 border-b border-slate-800 text-center text-[11px] font-sans">
              <div>Matches Played</div>
              <div>Wins (W)</div>
              <div>Draws (D)</div>
              <div>Losses (L)</div>
            </div>
            <div className="grid grid-cols-4 p-3 text-center text-sm font-bold bg-slate-950/30">
              <div className="text-white">{team.matchesPlayed}</div>
              <div className="text-emerald-400">{team.wins}</div>
              <div className="text-slate-300">{team.draws}</div>
              <div className="text-red-400">{team.losses}</div>
            </div>
          </div>

          {/* Goal Metrics */}
          <div className="grid grid-cols-3 gap-3 font-mono text-xs text-center">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-sans">Goals For (GF)</div>
              <div className="text-base font-bold text-white mt-0.5">{team.goalsFor}</div>
              <div className="text-[10px] text-slate-500 font-sans mt-0.5">{team.goalsScoredPerMatch.toFixed(2)} / match</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-sans">Goals Against (GA)</div>
              <div className="text-base font-bold text-white mt-0.5">{team.goalsAgainst}</div>
              <div className="text-[10px] text-slate-500 font-sans mt-0.5">{team.goalsConcededPerMatch.toFixed(2)} / match</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-sans">Goal Difference (GD)</div>
              <div className={`text-base font-bold mt-0.5 ${team.goalDifference > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
              </div>
              <div className="text-[10px] text-slate-500 font-sans mt-0.5">Tie-Breaker #1</div>
            </div>
          </div>

          {/* Recent Form */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">Recent Match Form (Last 5)</span>
              <span className="text-slate-500 text-[11px] font-mono">{team.cleanSheets} clean sheets</span>
            </div>
            <div className="flex items-center gap-1.5">
              {team.form.map((res, i) => (
                <span
                  key={i}
                  className={`w-6 h-6 rounded flex items-center justify-center font-mono font-bold text-xs ${
                    res === 'W'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : res === 'D'
                      ? 'bg-slate-700 text-slate-200'
                      : 'bg-red-500/20 text-red-400 border border-red-500/40'
                  }`}
                >
                  {res}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
