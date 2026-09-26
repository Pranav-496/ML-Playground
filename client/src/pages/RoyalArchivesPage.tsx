import { Link } from "react-router-dom";
import { Database, Download, ArrowLeft, Search, Filter } from "lucide-react";
import { campaigns } from "@/config/campaigns";

export default function RoyalArchivesPage() {
  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12">
      <Link to="/" className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-8 font-medium text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Realm
      </Link>

      {/* Hero */}
      <div className="clay-card border border-[#FF5A1F]/30 p-12 rounded-3xl mb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/houses/martell.png')] bg-cover bg-center opacity-10 mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/90 to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <Database className="h-16 w-16 text-[#FF5A1F] mb-6 filter drop-shadow-[0_0_15px_rgba(255,90,31,0.5)]" />
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A45] to-[#D93800] mb-4 font-royal tracking-wider">
            ROYAL ARCHIVES
          </h1>
          <p className="text-lg md:text-xl text-text-secondary font-medium">
            Explore the vast collection of datasets gathered by the Maesters across the Seven Kingdoms. Download them directly to train your models locally before entering the Citadel campaigns.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search the archives..." 
            className="w-full bg-surface-hover/50 border border-surface-border rounded-xl py-3 pl-12 pr-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-[#FF5A1F]/50 focus:ring-1 focus:ring-[#FF5A1F]/50 transition-all"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 clay-sm border-surface-border text-text-primary font-bold hover:text-[#FF5A1F] hover:border-[#FF5A1F]/50 transition-colors">
          <Filter className="h-4 w-4" /> Filter
        </button>
      </div>

      {/* Dataset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {campaigns.map(campaign => (
          <div key={campaign.id} className="clay-card border border-surface-border/50 p-6 rounded-2xl group hover:border-[#FF5A1F]/30 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-3 border" style={{ backgroundColor: `${campaign.color}15`, color: campaign.color, borderColor: `${campaign.color}30` }}>
                  {campaign.type}
                </span>
                <h3 className="text-2xl font-bold text-text-primary font-royal mb-2">{campaign.title} Dataset</h3>
              </div>
            </div>
            
            <p className="text-text-secondary text-sm mb-6 line-clamp-2">
              {campaign.description}
            </p>
            
            <div className="space-y-4 mb-6">
              <div>
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Target Variable</h4>
                <div className="bg-surface py-2 px-3 rounded-lg border border-surface-border text-sm font-medium text-text-primary">
                  {campaign.target}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Key Features</h4>
                <div className="flex flex-wrap gap-2">
                  {campaign.features.slice(0, 4).map(f => (
                    <span key={f} className="text-xs bg-surface py-1 px-2.5 rounded text-text-secondary border border-surface-border">
                      {f}
                    </span>
                  ))}
                  {campaign.features.length > 4 && (
                    <span className="text-xs bg-surface py-1 px-2 rounded text-text-muted border border-surface-border border-dashed">
                      +{campaign.features.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-auto pt-4 border-t border-surface-border/50">
              <button 
                onClick={async () => {
                  try {
                    const res = await fetch(`http://localhost:8000/api/citadel/projects/${campaign.id}/kit`);
                    if (res.ok) {
                      const blob = await res.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.style.display = 'none';
                      a.href = url;
                      a.download = `${campaign.id}_dataset.zip`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                    } else {
                      alert("Dataset not found in the archives.");
                    }
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-[#FF5A1F]/10 hover:bg-[#FF5A1F]/20 text-[#FF5A1F] border border-[#FF5A1F]/20 py-2.5 rounded-lg font-bold text-sm transition-colors"
              >
                <Download className="h-4 w-4" /> Download .zip
              </button>
              <Link 
                to={`/citadel/${campaign.id}`}
                className="flex-1 flex items-center justify-center bg-surface hover:bg-surface-hover text-text-primary border border-surface-border py-2.5 rounded-lg font-bold text-sm transition-colors"
              >
                View Campaign
              </Link>
            </div>
          </div>
        ))}
        
        {/* AutoML Dataset Upload */}
        <Link to="/automl" className="clay border border-[#8B5CF6]/30 p-8 rounded-2xl flex flex-col items-center justify-center text-center opacity-80 hover:opacity-100 hover:border-[#8B5CF6]/80 transition-all cursor-pointer group">
          <div className="h-16 w-16 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center mb-4 border border-[#8B5CF6]/30 group-hover:scale-110 transition-transform">
            <Database className="h-8 w-8 text-[#8B5CF6]" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2 font-royal">AutoML Vision</h3>
          <p className="text-sm text-text-muted max-w-xs mb-4">
            Upload your own dataset. Valoris will automatically evaluate top algorithms and forge the ultimate champion.
          </p>
          <span className="text-[10px] uppercase font-extrabold px-4 py-1.5 rounded-full bg-[#8B5CF6] text-white tracking-wider shadow-[0_0_10px_rgba(139,92,246,0.5)]">
            Enter The All-Seeing Eye
          </span>
        </Link>
      </div>
    </div>
  );
}
