import React from 'react';
import { X, BookOpen, Calculator, Target, Compass, Award } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              Sports Data Scientist: Analytical Rules & Methodology
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed">
          {/* Rule 1 */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 font-semibold text-white text-sm">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>01. Ingestion of fbrapi.com /team-match-stats Keys</span>
            </div>
            <p className="text-slate-400">
              The engine directly parses JSON payloads fetched from the <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded font-mono">/team-match-stats</code> endpoint. Core incoming attributes extracted per fixture:
            </p>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
              <div><span className="text-cyan-400">home_xg</span>, <span className="text-cyan-400">away_xg</span>: Total Expected Goals generated</div>
              <div><span className="text-cyan-400">home_npxg</span>, <span className="text-cyan-400">away_npxg</span>: Non-Penalty Expected Goals</div>
              <div><span className="text-cyan-400">field_tilt</span>: Percentage of final-third territorial possession</div>
              <div><span className="text-cyan-400">home_pens_att</span>, <span className="text-cyan-400">away_pens_att</span>: Penalty kick records</div>
            </div>
          </section>

          {/* Rule 2 */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 font-semibold text-white text-sm">
              <Calculator className="w-4 h-4 text-cyan-400" />
              <span>02. Non-Penalty Expected Goals Differential (npxGD)</span>
            </div>
            <p className="text-slate-400">
              Penalties carry an artificial ~0.79 xG spike that obscures sustained open-play attacking dominance. The non-penalty differential is calculated as:
            </p>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center font-mono text-emerald-400 text-sm font-bold">
              npxGD = home_npxg − away_npxg
            </div>
            <p className="text-slate-400 text-[11px]">
              If an incoming feed only provides total xG and penalty attempts, non-penalty xG is derived via:
              <br />
              <code className="text-slate-300 font-mono">npxG = max(0, xG − (pens_att × 0.79))</code>
            </p>
          </section>

          {/* Rule 3 */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 font-semibold text-white text-sm">
              <Award className="w-4 h-4 text-amber-400" />
              <span>03. Heavy Favorite Ranking & Expected Value Edge</span>
            </div>
            <p className="text-slate-400">
              The analytical ranker identifies the fixture's projected favorite (the squad with higher npxG) and evaluates their positive expected value edge:
            </p>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center font-mono text-amber-300 text-sm font-bold">
              Favorite Edge = |home_npxg − away_npxg|
            </div>
            <p className="text-slate-400">
              The leaderboard forces the heavy favorite with the highest positive differential to Rank #1, providing sports science desks with immediate visibility into high-conviction fixtures.
            </p>
          </section>

          {/* Rule 4 */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 font-semibold text-white text-sm">
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>04. Field Tilt & Bivariate Poisson Goal Expectation</span>
            </div>
            <p className="text-slate-400">
              <strong>Field Tilt</strong> measures territorial dominance: the percentage of passes completed in the attacking final third compared to the opponent.
              Match win/draw probabilities are modeled using independent Poisson goal distributions parameterized on xG.
            </p>
          </section>
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
