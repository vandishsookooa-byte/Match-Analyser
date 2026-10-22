import React, { useState } from 'react';
import { SAMPLE_GLOBAL_FBRAPI_PAYLOAD } from '../data/sample-fbrapi-data';
import { parseFbrapiJson } from '../utils/analytics';
import { RawFbrapiMatchStats } from '../types/sports-data';
import { X, Upload, FileText, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface JsonPayloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadPayload: (matches: RawFbrapiMatchStats[]) => void;
  currentCount: number;
}

export const JsonPayloadModal: React.FC<JsonPayloadModalProps> = ({
  isOpen,
  onClose,
  onLoadPayload,
  currentCount,
}) => {
  const [jsonText, setJsonText] = useState(() =>
    JSON.stringify(SAMPLE_GLOBAL_FBRAPI_PAYLOAD, null, 2)
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApply = () => {
    setErrorMsg(null);
    setSuccessInfo(null);

    const result = parseFbrapiJson(jsonText);
    if (result.error) {
      setErrorMsg(result.error);
      return;
    }

    onLoadPayload(result.data);
    setSuccessInfo(`Successfully ingested ${result.data.length} matches across all detected leagues!`);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
      setErrorMsg(null);
      setSuccessInfo(`Loaded ${file.name} into editor. Click "Apply Payload" to parse.`);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read uploaded file.');
    };
    reader.readAsText(file);
  };

  const handleLoadPreset = (preset: 'global' | 'top5' | 'champions' | 'americas') => {
    setErrorMsg(null);
    let filtered = SAMPLE_GLOBAL_FBRAPI_PAYLOAD;

    if (preset === 'top5') {
      filtered = SAMPLE_GLOBAL_FBRAPI_PAYLOAD.filter(m =>
        ['English Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1'].includes(m.competition)
      );
    } else if (preset === 'champions') {
      filtered = SAMPLE_GLOBAL_FBRAPI_PAYLOAD.filter(m =>
        m.competition.includes('Champions League')
      );
    } else if (preset === 'americas') {
      filtered = SAMPLE_GLOBAL_FBRAPI_PAYLOAD.filter(m =>
        ['Major League Soccer', 'Brasileirão Série A', 'Liga MX', 'Copa Libertadores'].includes(m.competition)
      );
    }

    setJsonText(JSON.stringify(filtered, null, 2));
    setSuccessInfo(`Loaded preset (${filtered.length} matches).`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div>
            <div className="text-[11px] font-mono text-emerald-400 font-semibold tracking-wide">
              fbrapi.com /team-match-stats Ingestion
            </div>
            <h2 className="text-base font-bold text-white mt-0.5">
              Raw Payload Parser & Ingestion Workbench
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar / Preset selector */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 font-medium">Presets:</span>
            <button
              onClick={() => handleLoadPreset('global')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              All Global Leagues ({SAMPLE_GLOBAL_FBRAPI_PAYLOAD.length})
            </button>
            <button
              onClick={() => handleLoadPreset('top5')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              Top 5 European
            </button>
            <button
              onClick={() => handleLoadPreset('americas')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              The Americas
            </button>
            <button
              onClick={() => handleLoadPreset('champions')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              Champions League
            </button>
          </div>

          <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload JSON File</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Content / Textarea */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successInfo && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successInfo}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Paste JSON payload below (direct endpoint output or array of match objects):</span>
              <span className="font-mono text-[11px] text-slate-500">
                Key fields: home_team, away_team, home_xg, away_xg, field_tilt
              </span>
            </div>
            <textarea
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setErrorMsg(null);
                setSuccessInfo(null);
              }}
              rows={14}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3.5 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 leading-relaxed scrollbar-none"
              placeholder='[ { "home_team": "...", "away_team": "...", "home_xg": 2.1, "away_xg": 0.4, "field_tilt": 68.2 } ]'
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
          <button
            onClick={() => {
              setJsonText(JSON.stringify(SAMPLE_GLOBAL_FBRAPI_PAYLOAD, null, 2));
              setErrorMsg(null);
              setSuccessInfo('Reset to default sample data.');
            }}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Default Dataset</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              Apply & Analyze Payload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
