import React, { useState, useEffect } from 'react';
import { 
  X, 
  Terminal, 
  Cpu, 
  Check, 
  Copy, 
  Sparkles, 
  ShieldCheck, 
  Database,
  ExternalLink,
  Zap,
  Globe,
  Radio,
  AlertCircle,
  RefreshCw,
  Server
} from 'lucide-react';

interface PpConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFetchFromApi: (apiKey: string, endpointUrl: string) => Promise<{ count: number }>;
}

export const PpConnectionModal: React.FC<PpConnectionModalProps> = ({
  isOpen,
  onClose,
  onFetchFromApi,
}) => {
  const [activeTab, setActiveTab] = useState<'connect_app' | 'prizepicks' | 'python_pipeline'>('connect_app');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // API form state
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [endpointInput, setEndpointInput] = useState('/api/fbrapi/team-match-stats');
  const [isServerKeySet, setIsServerKeySet] = useState(false);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [apiFeedback, setApiFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Check server health and env var on open
  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data.has_fbrapi_key) {
          setIsServerKeySet(true);
        }
      })
      .catch(() => {
        // server might still be booting in dev
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleConnectAndSync = async () => {
    setIsLoadingApi(true);
    setApiFeedback(null);

    try {
      const res = await onFetchFromApi(apiKeyInput.trim(), endpointInput.trim());
      setApiFeedback({
        type: 'success',
        message: `Successfully connected to fbrapi.com! Loaded and ranked ${res.count} live fixtures.`
      });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setApiFeedback({
        type: 'error',
        message: err.message || 'Failed to connect. Verify your API token and endpoint.'
      });
    } finally {
      setIsLoadingApi(false);
    }
  };

  const curlSnippet = `# Fetch team-match-stats from fbrapi.com via terminal
curl -X GET "https://fbrapi.com/api/team-match-stats" \\
  -H "Authorization: Bearer YOUR_FBRAPI_API_KEY" \\
  -H "Accept: application/json" > matches.json`;

  const pythonSnippet = `import os, requests

# Fetch team-match-stats from fbrapi.com
api_key = os.getenv("FBRAPI_API_KEY", "your_token_here")
url = "https://fbrapi.com/api/team-match-stats"
headers = {"Authorization": f"Bearer {api_key}"}

res = requests.get(url, headers=headers)
data = res.json().get("data", [])

# Push or inspect data
print(f"Fetched {len(data)} match stats from fbrapi.com")`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                How to Connect the fbrapi API to the App
              </h2>
              <div className="text-[11px] text-slate-400">
                Direct live synchronization, proxy routing, and sports science pipeline setup
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

        {/* Tab Navigation */}
        <div className="px-6 py-2 border-b border-slate-800/80 bg-slate-950/40 flex items-center gap-3 text-xs font-medium">
          <button
            onClick={() => setActiveTab('connect_app')}
            className={`py-1.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'connect_app'
                ? 'border-emerald-400 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>Connect to this App (Live Sync)</span>
          </button>

          <button
            onClick={() => setActiveTab('prizepicks')}
            className={`py-1.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'prizepicks'
                ? 'border-cyan-400 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>PrizePicks (PP) Integration</span>
          </button>

          <button
            onClick={() => setActiveTab('python_pipeline')}
            className={`py-1.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'python_pipeline'
                ? 'border-amber-400 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>cURL / Python Pipeline</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {activeTab === 'connect_app' && (
            <div className="space-y-4">
              {/* Method 1: Direct Server Proxy Live Sync */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                      1
                    </span>
                    <span className="font-semibold text-white text-sm">
                      Method A: Live API Sync via Backend Proxy
                    </span>
                  </div>
                  {isServerKeySet ? (
                    <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> FBRAPI_API_KEY detected in .env
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-mono">
                      Proxy: /api/fbrapi/team-match-stats
                    </span>
                  )}
                </div>

                <p className="text-slate-400 text-xs leading-relaxed">
                  This app includes a built-in backend proxy (<code className="text-emerald-300 font-mono">/api/fbrapi/team-match-stats</code>) 
                  that forwards requests directly to <code className="text-emerald-300 font-mono">https://fbrapi.com</code> with Bearer authentication. 
                  This completely prevents browser CORS blocking and keeps your API credentials secure.
                </p>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      fbrapi.com API Key / Bearer Token:
                    </label>
                    <input
                      type="password"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder={isServerKeySet ? "Key configured in server .env (leave blank or enter custom key)" : "Paste your fbrapi API key here (e.g. fb_live_...)"}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      Target Endpoint:
                    </label>
                    <input
                      type="text"
                      value={endpointInput}
                      onChange={(e) => setEndpointInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                      placeholder="/api/fbrapi/team-match-stats"
                    />
                    <div className="text-[10px] text-slate-500 mt-1">
                      Default uses internal server proxy. You can also specify direct queries like <code className="text-slate-400">/api/fbrapi/team-match-stats?status=upcoming</code>.
                    </div>
                  </div>

                  {apiFeedback && (
                    <div className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                      apiFeedback.type === 'success' 
                        ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300' 
                        : 'bg-red-950/40 border border-red-500/40 text-red-300'
                    }`}>
                      {apiFeedback.type === 'success' ? (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      )}
                      <span>{apiFeedback.message}</span>
                    </div>
                  )}

                  <div className="pt-1 flex items-center justify-end">
                    <button
                      onClick={handleConnectAndSync}
                      disabled={isLoadingApi}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-sm flex items-center gap-2"
                    >
                      {isLoadingApi ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Connecting & Syncing...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          <span>Fetch & Rank Live Fixtures Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Method 2: Offline / Manual JSON Ingestion */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs">
                    2
                  </span>
                  <span className="font-semibold text-white text-sm">
                    Method B: Direct JSON Payload Ingestion
                  </span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  If your workflow already pulls responses using a script, Postman, or cron job, you can click the 
                  <strong className="text-white"> "Ingest fbrapi JSON"</strong> button on the top right. 
                  Paste the raw output from <code className="text-cyan-300 font-mono">/team-match-stats</code> or drag-and-drop your exported <code className="text-cyan-300 font-mono">.json</code> file.
                </p>
              </div>

              {/* Method 3: Environment Variable Setup */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                    3
                  </span>
                  <span className="font-semibold text-white text-sm">
                    Method C: Permanent Environment Variable Configuration
                  </span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  To keep the connection active without ever typing a token again, define your key in the workspace <code className="text-amber-300 font-mono">.env</code> file:
                </p>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 flex items-center justify-between">
                  <code>FBRAPI_API_KEY="your_api_key_here"</code>
                  <button
                    onClick={() => copyToClipboard('FBRAPI_API_KEY="your_api_key_here"', 'env')}
                    className="text-slate-400 hover:text-white text-xs px-2 py-0.5"
                  >
                    {copiedCode === 'env' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'prizepicks' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-slate-300 leading-relaxed">
                <div className="font-semibold text-emerald-300 text-sm mb-1">
                  PrizePicks (PP) Analytical Workflow
                </div>
                Macro team dynamics (<span className="text-white font-bold">npxGD</span> and <span className="text-white font-bold">Field Tilt</span>) 
                directly drive player proposition lines (Shots, Shots on Target, Goals, Saves, Clearances).
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="font-semibold text-emerald-300 text-xs">Heavy Favorite Props (Rank #1–#5)</div>
                  <ul className="text-slate-400 text-[11px] space-y-1 list-disc list-inside">
                    <li><strong className="text-white">OVER Shots on Target:</strong> For strikers with &gt; 0.18 npxG/shot.</li>
                    <li><strong className="text-white">OVER Passes Attempted:</strong> For central midfielders when field tilt &gt; 70%.</li>
                    <li><strong className="text-white">OVER Goals:</strong> In fixtures with combined xG &gt; 3.0.</li>
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="font-semibold text-cyan-300 text-xs">Underdog Props (Facing Heavy npxGD Edge)</div>
                  <ul className="text-slate-400 text-[11px] space-y-1 list-disc list-inside">
                    <li><strong className="text-white">OVER Goalkeeper Saves:</strong> When underdog concedes &gt; 18 shots.</li>
                    <li><strong className="text-white">OVER Defender Clearances:</strong> Center backs defending sustained boxes.</li>
                    <li><strong className="text-white">UNDER Goals:</strong> When underdog npxG &lt; 0.50.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'python_pipeline' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>cURL command to fetch from fbrapi.com:</span>
                <button
                  onClick={() => copyToClipboard(curlSnippet, 'curl')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                >
                  {copiedCode === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'curl' ? 'Copied' : 'Copy cURL'}</span>
                </button>
              </div>

              <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
                {curlSnippet}
              </pre>

              <div className="flex items-center justify-between text-slate-400 text-xs pt-2">
                <span>Python Pipeline script:</span>
                <button
                  onClick={() => copyToClipboard(pythonSnippet, 'py')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                >
                  {copiedCode === 'py' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'py' ? 'Copied' : 'Copy Python'}</span>
                </button>
              </div>

              <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-56 leading-relaxed">
                {pythonSnippet}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono">
            Proxy route: /api/fbrapi/team-match-stats $\rightarrow$ fbrapi.com
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
