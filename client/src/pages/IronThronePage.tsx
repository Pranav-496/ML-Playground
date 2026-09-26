import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Crown, Trophy, Swords, Medal, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface GlobalLeader {
  rank: number;
  username: string;
  campaigns_conquered: number;
  total_submissions: number;
}

export default function IronThronePage() {
  const [leaders, setLeaders] = useState<GlobalLeader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // We do not need auth token since this is public, but we might if we restrict it.
        // Assuming public for now.
        const res = await fetch("http://localhost:8000/api/citadel/leaderboard/global");
        if (res.ok) {
          const data = await res.json();
          setLeaders(data);
        }
      } catch (err) {
        console.error("Failed to fetch global leaderboard", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12">
      <Link to="/" className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-8 font-medium text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Realm
      </Link>

      {/* Hero */}
      <div className="clay-card border border-[#F59E0B]/30 p-12 rounded-3xl mb-12 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-[url('/houses/baratheon.png')] bg-cover bg-center opacity-10 mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-[#F59E0B]/10 blur-[100px] pointer-events-none rounded-full" />
        
        <Crown className="h-20 w-20 text-[#F59E0B] mx-auto mb-6 relative z-10 filter drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-[#FCD34D] to-[#B45309] mb-4 font-royal relative z-10 tracking-wider">
          THE IRON THRONE
        </h1>
        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto font-medium relative z-10">
          The ultimate ranking of Valoris. Only those who conquer the most campaigns across The Citadel shall ascend to the Iron Throne.
        </p>
      </div>

      {/* Leaderboard */}
      <div className="clay border border-surface-border rounded-2xl overflow-hidden relative">
        <div className="p-6 md:p-8 border-b border-surface-border bg-surface-hover/30 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-text-primary font-royal flex items-center gap-3">
            <Trophy className="h-6 w-6 text-gold" /> Global Standings
          </h2>
          <div className="text-sm text-text-muted font-medium bg-surface py-1.5 px-4 rounded-full border border-surface-border">
            Ranked by Campaigns Conquered
          </div>
        </div>

        <div className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-10 w-10 border-4 border-gold border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-text-muted font-bold animate-pulse">Summoning the ravens...</p>
            </div>
          ) : leaders.length === 0 ? (
            <div className="text-center py-20 px-6">
              <Swords className="h-12 w-12 text-text-muted mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-text-primary mb-2">The Realm is Empty</h3>
              <p className="text-text-muted max-w-md mx-auto">
                No one has staked their claim for the Iron Throne yet. Be the first to conquer a Citadel campaign!
              </p>
              <Link to="/citadel" className="inline-block mt-6 px-6 py-2.5 clay-btn clay-btn-primary border-gold text-gold font-bold">
                Enter The Citadel
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface/50 border-b border-surface-border">
                    <th className="py-4 px-6 font-bold text-text-muted text-xs uppercase tracking-wider w-24 text-center">Rank</th>
                    <th className="py-4 px-6 font-bold text-text-muted text-xs uppercase tracking-wider">Champion</th>
                    <th className="py-4 px-6 font-bold text-text-muted text-xs uppercase tracking-wider text-right">Campaigns Conquered</th>
                    <th className="py-4 px-6 font-bold text-text-muted text-xs uppercase tracking-wider text-right hidden sm:table-cell">Total Submissions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaders.map((leader, i) => (
                    <tr 
                      key={leader.username} 
                      className="border-b border-surface-border/50 hover:bg-surface-hover/30 transition-colors group"
                    >
                      <td className="py-5 px-6 text-center">
                        {i === 0 ? (
                          <div className="h-10 w-10 mx-auto rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.4)]">
                            <Crown className="h-5 w-5 text-black" />
                          </div>
                        ) : i === 1 ? (
                          <div className="h-10 w-10 mx-auto rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center">
                            <Medal className="h-5 w-5 text-white" />
                          </div>
                        ) : i === 2 ? (
                          <div className="h-10 w-10 mx-auto rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center">
                            <Medal className="h-5 w-5 text-white" />
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-text-muted">{i + 1}</span>
                        )}
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-surface-border flex items-center justify-center text-text-secondary font-bold text-lg border border-surface-border">
                            {leader.username.charAt(0).toUpperCase()}
                          </div>
                          <span className={cn(
                            "font-bold text-lg",
                            i === 0 ? "text-gold drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" : "text-text-primary"
                          )}>
                            {leader.username}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold text-lg">
                          {leader.campaigns_conquered}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right hidden sm:table-cell text-text-muted font-medium text-base">
                        {leader.total_submissions}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
