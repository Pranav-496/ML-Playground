import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, Upload, Shield, Target, Trophy, Clock, Loader2 } from "lucide-react";
import { campaigns } from "@/config/campaigns";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  rank: number;
  username: string;
  first_name: string;
  score: number;
  submitted_at: string;
}

export default function CampaignPage() {
  const { id } = useParams();
  const campaign = campaigns.find(c => c.id === id);
  const [activeTab, setActiveTab] = useState<"lore" | "guide" | "trial">("lore");
  
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ score?: number; message?: string; error?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (campaign) {
      fetchLeaderboard();
    }
  }, [campaign]);

  const fetchLeaderboard = async () => {
    try {
      setIsLoadingLeaderboard(true);
      const res = await fetch(`http://localhost:8000/api/citadel/projects/${campaign?.id}/leaderboard?campaign_type=${campaign?.type}`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard", err);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Need to include auth token in real app, Assuming cookie/credentials are sent or user is mocked
      const res = await fetch(`http://localhost:8000/api/citadel/projects/${campaign?.id}/evaluate?campaign_type=${campaign?.type}`, {
        method: "POST",
        body: formData,
        // credentials: "include" - required if using cookies
      });

      const data = await res.json();
      
      if (res.ok) {
        setUploadResult({ score: data.score, message: data.message });
        fetchLeaderboard(); // Refresh leaderboard
      } else {
        setUploadResult({ error: data.detail || "Evaluation failed." });
      }
    } catch (err) {
      setUploadResult({ error: "Network error occurred." });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const downloadKit = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/citadel/projects/${campaign?.id}/kit`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${campaign?.id}_kit.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Kit not found. Please wait for the Maesters to forge it.");
      }
    } catch (err) {
      console.error("Failed to download kit", err);
    }
  };

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-4 font-royal">Campaign Not Found</h2>
        <Link to="/citadel" className="text-gold hover:underline">Return to The Citadel</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12">
      {/* Back button */}
      <Link to="/citadel" className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-8 font-medium text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Citadel
      </Link>

      {/* Hero Header */}
      <div className="clay-card border border-surface-border/50 p-8 rounded-3xl mb-8 relative overflow-hidden">
        <div 
          className="absolute -right-32 -top-32 w-96 h-96 rounded-full blur-[100px] opacity-20 pointer-events-none"
          style={{ backgroundColor: campaign.color }}
        />
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span 
                className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{ backgroundColor: `${campaign.color}20`, color: campaign.color, border: `1px solid ${campaign.color}40` }}
              >
                {campaign.type}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-surface-hover text-text-secondary border border-surface-border">
                {campaign.difficulty === 'Beginner' ? <Shield className="h-3 w-3" /> : <Target className="h-3 w-3" />}
                {campaign.difficulty}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-text-primary mb-2 font-royal">
              {campaign.title}
            </h1>
            <p className="text-text-secondary font-medium max-w-2xl">
              {campaign.description}
            </p>
          </div>
          <div className="flex gap-4">
            <button onClick={downloadKit} className="clay-btn clay-btn-primary flex items-center gap-2 px-6 py-3 border-valyrian font-bold">
              <Download className="h-4 w-4" />
              Download Raven's Kit (.zip)
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 border-b border-surface-border">
        {[
          { id: "lore", label: "The Lore & Data" },
          { id: "guide", label: "Maester's Guide" },
          { id: "trial", label: "Trial by Combat (Submit)" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-6 py-3 text-sm font-bold transition-all relative",
              activeTab === tab.id ? "text-text-primary" : "text-text-muted hover:text-text-secondary"
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 rounded-t-full bg-gold shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {activeTab === "lore" && (
            <div className="clay-sm p-8 rounded-2xl animate-fade-in">
              <h3 className="text-2xl font-bold font-royal mb-4 text-text-primary">The Scenario</h3>
              <p className="text-text-secondary text-lg italic border-l-4 pl-4 py-2 mb-8" style={{ borderColor: campaign.color }}>
                "{campaign.lore}"
              </p>
              
              <h4 className="text-lg font-bold text-text-primary mb-4">Dataset Features (Columns)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {campaign.features.map(f => (
                  <div key={f} className="flex items-center gap-2 bg-surface-hover p-3 rounded-lg border border-surface-border text-sm font-medium text-text-secondary">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: campaign.color }} />
                    {f}
                  </div>
                ))}
              </div>

              <h4 className="text-lg font-bold text-text-primary mb-4">The Target Variable</h4>
              <div className="bg-[#B90E0A]/10 border border-[#B90E0A]/30 p-4 rounded-xl text-[#B90E0A] font-bold">
                Predict: {campaign.target}
              </div>
            </div>
          )}

          {activeTab === "guide" && (
            <div className="clay-sm p-8 rounded-2xl animate-fade-in">
              <h3 className="text-2xl font-bold font-royal mb-6 text-text-primary">Maester's Step-by-Step Guide</h3>
              
              <div className="space-y-8">
                <div className="relative pl-8 border-l-2 border-surface-border">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-surface border-2 border-gold" />
                  <h4 className="text-lg font-bold text-text-primary mb-2">1. Scout the Enemy (EDA)</h4>
                  <p className="text-text-secondary text-sm">Load the <code className="bg-surface-hover px-1.5 py-0.5 rounded text-gold-light">train.csv</code> file using Pandas. Look for missing values and understand the distribution of your features.</p>
                </div>
                <div className="relative pl-8 border-l-2 border-surface-border">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-surface border-2 border-gold" />
                  <h4 className="text-lg font-bold text-text-primary mb-2">2. Forge the Weapons (Preprocessing)</h4>
                  <p className="text-text-secondary text-sm">Handle missing data. Encode categorical variables like 'Region of Origin' into numeric formats so algorithms can understand them. Scale your features if using distance-based models.</p>
                </div>
                <div className="relative pl-8 border-l-2 border-surface-border border-transparent">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-surface border-2 border-gold" />
                  <h4 className="text-lg font-bold text-text-primary mb-2">3. Choose Your Champion & Train</h4>
                  <p className="text-text-secondary text-sm">Select an algorithm. Train it on the training set, then generate predictions for the <code className="bg-surface-hover px-1.5 py-0.5 rounded text-gold-light">test.csv</code> file. Save them as <code className="bg-surface-hover px-1.5 py-0.5 rounded text-gold-light">predictions.csv</code>.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "trial" && (
            <div className="clay-sm p-8 rounded-2xl animate-fade-in flex flex-col items-center justify-center text-center border-dashed border-2 border-surface-border hover:border-gold/50 transition-colors cursor-pointer py-16"
                 onClick={() => fileInputRef.current?.click()}>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".csv"
                onChange={handleFileUpload}
              />
              {uploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 text-gold animate-spin mb-4" />
                  <p className="text-text-primary font-bold">Evaluating predictions...</p>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center mb-4">
                    <Upload className="h-8 w-8 text-text-muted" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">Upload Predictions</h3>
                  <p className="text-text-secondary mb-6 max-w-md">
                    Drag and drop your <code className="text-gold-light font-bold">predictions.csv</code> here to be judged by the Realm.
                  </p>
                  <button className="clay-btn clay-btn-secondary px-6 py-2 text-sm font-bold">
                    Select File
                  </button>
                </>
              )}
              
              {uploadResult && (
                <div className={cn(
                  "mt-6 p-4 rounded-xl border w-full max-w-md",
                  uploadResult.error ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-green-500/10 border-green-500/30 text-green-400"
                )}>
                  {uploadResult.error ? (
                    <p className="font-bold">{uploadResult.error}</p>
                  ) : (
                    <>
                      <p className="font-bold mb-1">{uploadResult.message}</p>
                      <p className="text-3xl font-royal">{uploadResult.score?.toFixed(4)}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Leaderboard */}
        <div className="lg:col-span-1">
          <div className="clay-card border border-surface-border/50 p-6 rounded-2xl sticky top-24">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface-border">
              <Trophy className="h-6 w-6 text-gold" />
              <h3 className="text-lg font-bold font-royal text-text-primary">Iron Throne</h3>
            </div>
            
            <div className="space-y-4">
              {isLoadingLeaderboard ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 text-text-muted animate-spin" />
                </div>
              ) : leaderboard.length > 0 ? (
                leaderboard.map((entry) => (
                  <div key={entry.rank} className="flex items-center justify-between p-3 rounded-xl bg-surface-hover/50 border border-surface-border hover:border-gold/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "font-bold text-sm w-5 text-center",
                        entry.rank === 1 ? "text-gold" : entry.rank === 2 ? "text-slate-300" : "text-amber-600"
                      )}>
                        #{entry.rank}
                      </span>
                      <span className="font-bold text-sm text-text-primary">{entry.first_name}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-gold-light">{entry.score.toFixed(4)}</span>
                      <span className="text-[10px] text-text-muted flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {new Date(entry.submitted_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-text-muted p-4">No champions yet. Be the first!</p>
              )}
            </div>

            <Link to="/iron-throne" className="w-full mt-6 py-2 flex items-center justify-center text-sm font-bold text-text-muted hover:text-text-primary transition-colors border border-surface-border rounded-lg bg-surface-hover/50">
              View Full Leaderboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
