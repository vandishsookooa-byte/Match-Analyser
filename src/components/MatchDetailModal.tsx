import React, { useState } from 'react';
import { AnalyzedFixture } from '../types/sports-data';
import { X, Copy, Check, BarChart3, Code, Compass, ArrowUpRight } from 'lucide-react';

interface MatchDetailModalProps {
  fixture: AnalyzedFixture | null;
  onClose: () => void;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({ fixture, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'raw_json'>('stats');

  if (!fixture) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(fixture.rawPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHomeFav = fixture.favoredSide === 'home';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <span>{fixture.competition}</span>
              <span>·</span>
              <span>Rank #{fixture.rank}</span>
              <span>·</span>
              <span>{fixture.matchDate}</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              {fixture.homeTeam} <span className="text-slate-500 font-normal text-sm">vs</span> {fixture.awayTeam}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 py-2 border-b border-slate-800/80 flex items-center gap-4 bg-slate-950/30 text-xs font-medium">
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-1.5 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'stats'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytical Metrics & npxGD</span>
          </button>
          <button
            onClick={() => setActiveTab('raw_json')}
            className={`py-1.5 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'raw_json'
                ? 'border-cyan-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>fbrapi.com Raw Payload</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {activeTab === 'stats' ? (
            <>
              {/* Highlight Banner: Favorite Edge */}
              <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">
                    Favored Team Edge
                  </div>
                  <div className="text-lg font-bold text-white mt-0.5">
                    {fixture.favoredTeam}{' '}
                    <span className="text-emerald-400 font-mono">
                      (+{fixture.npxgdFavoriteEdge.toFixed(2)} npxGD)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Win expectancy: <span className="font-mono text-white font-semibold">{fixture.winExpectancyPct}%</span>
                    {' · '}Draw expectancy: <span className="font-mono text-white font-semibold">{fixture.drawExpectancyPct}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-mono">EV Index</div>
                  <div className="text-2xl font-black font-mono text-cyan-300 tabular-nums">
                    {fixture.expectedValueEdgeIndex.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-slate-500">out of 10.0</div>
                </div>
              </div>

              {/* Head to Head Quantitative Comparison Grid */}
              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <div className="grid grid-cols-3 bg-slate-950/70 p-2.5 font-semibold text-[11px] text-slate-400 border-b border-slate-800">
                  <div className={isHomeFav ? 'text-emerald-400' : 'text-slate-200'}>
                    {fixture.homeTeam} (Home)
                  </div>
                  <div className="text-center font-mono">Analytical Metric</div>
                  <div className={`text-right ${!isHomeFav ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {fixture.awayTeam} (Away)
                  </div>
                </div>

                <div className="divide-y divide-slate-800/60 font-mono text-xs">
                  {/* Row: npxG */}
                  <div className="grid grid-cols-3 p-2.5 items-center">
                    <div className="font-bold text-white tabular-nums">{fixture.homeNpxg.toFixed(2)}</div>
                    <div className="text-center text-slate-400 font-sans text-[11px]">Non-Penalty xG (npxG)</div>
                    <div className="text-right font-bold text-white tabular-nums">{fixture.awayNpxg.toFixed(2)}</div>
                  </div>

                  {/* Row: Total xG */}
                  <div className="grid grid-cols-3 p-2.5 items-center bg-slate-950/20">
                    <div className="text-slate-300 tabular-nums">{fixture.homeXg.toFixed(2)}</div>
                    <div className="text-center text-slate-400 font-sans text-[11px]">Total Expected Goals (xG)</div>
                    <div className="text-right text-slate-300 tabular-nums">{fixture.awayXg.toFixed(2)}</div>
                  </div>

                  {/* Row: Field Tilt */}
                  <div className="grid grid-cols-3 p-2.5 items-center">
                    <div className="font-bold text-emerald-300 tabular-nums">{fixture.homeFieldTilt}%</div>
                    <div className="text-center text-slate-400 font-sans text-[11px]">Field Tilt (% final-third)</div>
                    <div className="text-right font-bold text-cyan-300 tabular-nums">{fixture.awayFieldTilt}%</div>
                  </div>

                  {/* Row: Total Shots */}
                  <div className="grid grid-cols-3 p-2.5 items-center bg-slate-950/20">
                    <div className="text-slate-300 tabular-nums">{fixture.homeShots || '—'}</div>
                    <div className="text-center text-slate-400 font-sans text-[11px]">Shots Attempted</div>
                    <div className="text-right text-slate-300 tabular-nums">{fixture.awayShots || '—'}</div>
                  </div>

                  {/* Row: Shots on Target */}
                  <div className="grid grid-cols-3 p-2.5 items-center">
                    <div className="text-slate-300 tabular-nums">{fixture.homeSot || '—'}</div>
                    <div className="text-center text-slate-400 font-sans text-[11px]">Shots on Target</div>
                    <div className="text-right text-slate-300 tabular-nums">{fixture.awaySot || '—'}</div>
                  </div>

                  {/* Row: Shot Quality (npxG/shot) */}
                  <div className="grid grid-cols-3 p-2.5 items-center bg-slate-950/20">
                    <div className="text-slate-300 tabular-nums">{fixture.homeShotQuality.toFixed(2)}</div>
                    <div className="text-center text-slate-400 font-sans text-[11px]">Shot Quality (npxG/shot)</div>
                    <div className="text-right text-slate-300 tabular-nums">{fixture.awayShotQuality.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Technical Footnote on npxGD */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-200">Data Scientist Rule: </span>
                {fixture.isNpxgDerived ? (
                  <span>
                    Non-penalty xG was calculated by deducting penalty kick expected goals (att × 0.79) from raw total xG.
                  </span>
                ) : (
                  <span>
                    Direct non-penalty expected goals (home_npxg: {fixture.homeNpxg}, away_npxg: {fixture.awayNpxg}) read directly from the fbrapi payload.
                  </span>
                )}
                {' '}Net npxGD Differential is{' '}
                <span className="font-mono text-emerald-400 font-bold">
                  {fixture.netNpxGD > 0 ? `+${fixture.netNpxGD}` : fixture.netNpxGD}
                </span>.
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">
                  Raw payload from fbrapi.com endpoint:
                </span>
                <button
                  onClick={handleCopyJson}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-96 leading-relaxed">
                {JSON.stringify(fixture.rawPayload, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
