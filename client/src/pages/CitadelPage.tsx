import { Link } from "react-router-dom";
import { Scroll, Shield, Target, ArrowRight } from "lucide-react";
import { campaigns } from "@/config/campaigns";

export default function CitadelPage() {
  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-12">
      {/* Header */}
      <div className="mb-12 border-b border-surface-border/50 pb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F59E0B]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <h1 className="text-4xl sm:text-5xl font-extrabold text-text-primary mb-4 font-royal tracking-wide flex items-center gap-3">
          <Scroll className="h-10 w-10 text-[#F59E0B]" />
          The Citadel Campaigns
        </h1>
        <p className="text-lg text-text-secondary max-w-3xl font-medium leading-relaxed">
          The Grand Maesters have assembled challenges from across the Seven Kingdoms. 
          Download the datasets, forge your models in the fires of Valyria, and test your predictions 
          against the realm to claim your place on the Iron Throne leaderboards.
        </p>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {campaigns.map((campaign) => (
          <Link
            key={campaign.id}
            to={`/citadel/${campaign.id}`}
            className="group block relative clay-card border border-surface-border/50 p-8 rounded-2xl hover:border-[#F59E0B]/30 transition-all duration-300 overflow-hidden"
          >
            {/* Background Glow */}
            <div 
              className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-500"
              style={{ backgroundColor: campaign.color }}
            />

            <div className="relative z-10 flex flex-col h-full">
              {/* Badges */}
              <div className="flex items-center gap-3 mb-6">
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

              {/* Title & Lore */}
              <h2 className="text-2xl font-bold font-royal text-text-primary mb-3 group-hover:text-gold-light transition-colors">
                {campaign.title}
              </h2>
              <p className="text-text-muted text-sm italic mb-4 line-clamp-3">
                "{campaign.lore}"
              </p>
              
              <p className="text-text-secondary font-medium mb-8">
                {campaign.description}
              </p>

              <div className="mt-auto flex items-center justify-between">
                <div className="flex -space-x-2">
                  {/* Mock avatars of participants */}
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-surface border-2 border-[#1E1E24] flex items-center justify-center text-[10px] text-text-muted font-bold">
                      {i}
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full bg-surface-hover border-2 border-[#1E1E24] flex items-center justify-center text-[10px] text-text-muted font-bold">
                    +42
                  </div>
                </div>
                <span className="flex items-center gap-2 text-sm font-bold text-text-primary group-hover:text-gold-light transition-colors">
                  Begin Quest <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
