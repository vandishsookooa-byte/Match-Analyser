import React from 'react';
import { Globe, ShieldCheck, RefreshCw, Layers, Flag } from 'lucide-react';

interface TopNavProps {
  activeView: 'rankings' | 'country_comparison' | 'coverage';
  onSelectView: (view: 'rankings' | 'country_comparison' | 'coverage') => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  totalCompetitions: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeView,
  onSelectView,
  onRefresh,
  isRefreshing,
  totalCompetitions,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-slate-950 font-black text-sm tracking-tighter shadow-sm">
            GR
          </div>
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
            Global Football Rankings
          </span>
        </div>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-400 tracking-wide">
          <button
            onClick={() => onSelectView('rankings')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeView === 'rankings'
                ? 'text-white font-semibold'
                : 'hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Worldwide Rankings</span>
          </button>

          <button
            onClick={() => onSelectView('country_comparison')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeView === 'country_comparison'
                ? 'text-white font-semibold'
                : 'hover:text-slate-200'
            }`}
          >
            <Flag className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cross-Division Country View</span>
          </button>

          <button
            onClick={() => onSelectView('coverage')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeView === 'coverage'
                ? 'text-white font-semibold'
                : 'hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Coverage & Transparency</span>
            <span className="text-[10px] font-mono text-slate-500">({totalCompetitions})</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 rounded-md transition-colors whitespace-nowrap shadow-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Standings'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
