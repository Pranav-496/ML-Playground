import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Eye, UploadCloud, Cpu, Trophy, ArrowLeft, Target, Activity, FileSpreadsheet, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModelResult {
  name: string;
  score: number;
  metric_name: string;
  secondary_score: number;
  secondary_metric_name: string;
}

interface AutoMlResponse {
  task: string;
  champion: ModelResult;
  leaderboard: ModelResult[];
  dataset_stats: {
    rows: number;
    features: number;
  };
}

export default function AutoMlPage() {
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [targetCol, setTargetCol] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AutoMlResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    
    if (!selected.name.endsWith('.csv')) {
      setError("Only CSV files are supported.");
      return;
    }

    setFile(selected);
    setError(null);
    setResult(null);
    
    // Parse headers
    try {
      const text = await selected.slice(0, 4096).text();
      const firstLine = text.split('\n')[0];
      const cols = firstLine.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      setColumns(cols);
      if (cols.length > 0) setTargetCol(cols[cols.length - 1]);
    } catch (err) {
      console.error("Could not parse columns", err);
    }
  };

  const handleTrain = async () => {
    if (!file || !targetCol) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_column", targetCol);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || "/api";
      const res = await fetch(`${baseUrl}/automl/train`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Training failed");
      }

      const data: AutoMlResponse = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      <Link to="/royal-archives" className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-8 font-medium text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Archives
      </Link>

      {/* Hero */}
      <div className="clay-card border border-[#8B5CF6]/30 p-10 rounded-3xl mb-12 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-[url('/houses/arryn.png')] bg-cover bg-center opacity-10 mix-blend-overlay pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[200px] bg-[#8B5CF6]/10 blur-[80px] pointer-events-none rounded-full" />
        
        <Eye className="h-16 w-16 text-[#8B5CF6] mx-auto mb-6 relative z-10 filter drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
        
        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-[#C4B5FD] to-[#7C3AED] mb-4 font-royal relative z-10 tracking-wider">
          THE ALL-SEEING EYE
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto font-medium relative z-10">
          Upload your custom datasets to the Royal Archives. Valoris will automatically process your data, deploy a fleet of algorithms, and forge the ultimate champion model.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload & Config Section */}
        <div className="space-y-6">
          <div className="clay border border-surface-border p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-text-primary font-royal mb-4 flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-[#8B5CF6]" /> 1. Provide Dataset
            </h2>
            
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
            />
            
            {!file ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-surface-border hover:border-[#8B5CF6]/50 rounded-xl p-8 text-center cursor-pointer transition-colors bg-surface-hover/30"
              >
                <FileSpreadsheet className="h-10 w-10 text-text-muted mx-auto mb-3" />
                <p className="text-text-primary font-bold">Click to upload CSV</p>
                <p className="text-text-muted text-sm mt-1">or drag and drop</p>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-surface-hover border border-surface-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-8 w-8 text-[#8B5CF6]" />
                  <div className="text-left">
                    <p className="text-text-primary font-bold text-sm truncate max-w-[200px]">{file.name}</p>
                    <p className="text-text-muted text-xs">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setFile(null); setColumns([]); setResult(null); }}
                  className="text-xs text-error hover:underline font-bold"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className={cn("clay border border-surface-border p-6 rounded-2xl transition-opacity", !file && "opacity-50 pointer-events-none")}>
            <h2 className="text-xl font-bold text-text-primary font-royal mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-[#8B5CF6]" /> 2. Select Target
            </h2>
            <p className="text-text-muted text-sm mb-4">Which column should the models predict?</p>
            
            <select 
              value={targetCol}
              onChange={(e) => setTargetCol(e.target.value)}
              className="w-full bg-surface-hover border border-surface-border rounded-lg p-3 text-text-primary focus:border-[#8B5CF6] focus:outline-none"
            >
              {columns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
            
            <button 
              onClick={handleTrain}
              disabled={loading || !file || !targetCol}
              className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-4 clay-btn border-[#8B5CF6]/50 text-white font-bold text-lg disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' }}
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Forging Models...
                </>
              ) : (
                <>
                  <Cpu className="h-5 w-5" /> Automate Training
                </>
              )}
            </button>
            {error && <p className="text-error text-sm font-bold mt-4 text-center">❌ {error}</p>}
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {result ? (
            <div className="animate-slide-up space-y-6">
              {/* Champion Card */}
              <div className="clay-card border-2 border-gold p-6 rounded-2xl relative overflow-hidden bg-gradient-to-br from-surface to-[#F59E0B]/5">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Trophy className="h-32 w-32 text-gold" />
                </div>
                
                <span className="inline-block px-3 py-1 rounded bg-gold/20 text-gold border border-gold/30 text-[10px] font-extrabold uppercase tracking-wider mb-4">
                  Grand Champion • {result.task}
                </span>
                
                <h3 className="text-3xl font-extrabold text-text-primary mb-1">{result.champion.name}</h3>
                <p className="text-text-muted text-sm mb-6">Defeated {result.leaderboard.length - 1} other algorithms.</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface/50 border border-surface-border p-4 rounded-xl">
                    <p className="text-xs text-text-muted uppercase font-bold tracking-wider mb-1">{result.champion.metric_name}</p>
                    <p className="text-3xl font-extrabold text-primary">
                      {result.champion.score.toFixed(4)}
                    </p>
                  </div>
                  <div className="bg-surface/50 border border-surface-border p-4 rounded-xl">
                    <p className="text-xs text-text-muted uppercase font-bold tracking-wider mb-1">{result.champion.secondary_metric_name}</p>
                    <p className="text-3xl font-extrabold text-secondary">
                      {result.champion.secondary_score.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Leaderboard */}
              <div className="clay border border-surface-border rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-surface-border bg-surface-hover/30 flex justify-between items-center">
                  <h3 className="font-bold text-text-primary flex items-center gap-2">
                    <Activity className="h-4 w-4 text-[#8B5CF6]" /> Tournament Results
                  </h3>
                  <span className="text-xs text-text-muted">{result.dataset_stats.rows} rows • {result.dataset_stats.features} features</span>
                </div>
                <div className="p-0">
                  <table className="w-full text-left">
                    <tbody>
                      {result.leaderboard.map((model, i) => (
                        <tr key={model.name} className="border-b border-surface-border/50 last:border-0 hover:bg-surface-hover/30">
                          <td className="py-3 px-4 w-12 text-center">
                            {i === 0 ? <Crown className="h-4 w-4 text-gold mx-auto" /> : <span className="text-text-muted text-xs font-bold">{i + 1}</span>}
                          </td>
                          <td className="py-3 px-4 font-bold text-sm text-text-primary">{model.name}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={cn(
                              "font-bold text-sm",
                              i === 0 ? "text-primary" : "text-text-muted"
                            )}>
                              {model.score.toFixed(4)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] clay border border-surface-border rounded-2xl flex flex-col items-center justify-center p-8 text-center opacity-60">
              <Cpu className="h-16 w-16 text-text-muted mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-text-primary mb-2">Awaiting Dataset</h3>
              <p className="text-sm text-text-muted max-w-sm">
                Once you upload a dataset and select a target, Valoris will automatically evaluate top algorithms and present the champion here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
