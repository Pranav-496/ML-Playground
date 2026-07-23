import { Link, useLocation } from "react-router-dom";
import {
  Shield,
  Crown,
  Flame,
  ChevronDown,
  BookOpen,
  Users,
  Scroll,
  Award,
  Settings,
  Landmark,
  Eye,
  Feather,
  Castle,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { algorithms } from "@/config/algorithms";
import { cn } from "@/lib/utils";

const houseIcons: Record<string, React.ReactNode> = {
  regression: <Shield className="h-4 w-4 text-[#E11D48]" />,
  classification: <Crown className="h-4 w-4 text-[#F59E0B]" />,
  clustering: <Flame className="h-4 w-4 text-[#EF4444]" />,
};

const houseBadges: Record<string, string> = {
  regression: "House Stark",
  classification: "House Lannister",
  clustering: "House Targaryen",
};

export default function Sidebar() {
  const location = useLocation();
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    regression: true,
    classification: true,
    clustering: true,
  });

  const toggleCategory = (cat: string) => {
    setOpenCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const categories = ["regression", "classification", "clustering"] as const;

  const kingdomNav = [
    { label: "King's Landing", to: "/", icon: <Landmark className="h-4 w-4 text-gold" /> },
    { label: "The Great Houses", to: "/algorithms", icon: <Crown className="h-4 w-4 text-primary-light" /> },
    { label: "The Royal Archives", to: "/algorithms", icon: <Scroll className="h-4 w-4 text-amber-500" /> },
    { label: "Council of Lords", to: "/algorithms", icon: <Users className="h-4 w-4 text-red-500" /> },
    { label: "The White Book", to: "/algorithms", icon: <Award className="h-4 w-4 text-amber-300" /> },
    { label: "Small Council", to: "/algorithms", icon: <Settings className="h-4 w-4 text-slate-400" /> },
  ];

  const westerosDisciplines = [
    { name: "House Velaryon", subtitle: "Deep Learning", icon: <Zap className="h-3.5 w-3.5 text-blue-400" /> },
    { name: "Dragonpit", subtitle: "Computer Vision", icon: <Eye className="h-3.5 w-3.5 text-red-400" /> },
    { name: "The Citadel", subtitle: "NLP", icon: <BookOpen className="h-3.5 w-3.5 text-emerald-400" /> },
    { name: "The Red Keep", subtitle: "Generative AI", icon: <Castle className="h-3.5 w-3.5 text-purple-400" /> },
    { name: "Three-Eyed Raven", subtitle: "RAG", icon: <Eye className="h-3.5 w-3.5 text-cyan-400" /> },
    { name: "Master of Whisperers", subtitle: "AI Agents", icon: <Feather className="h-3.5 w-3.5 text-amber-400" /> },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-20 space-y-4 pr-4">
        {/* Realm Navigation Header */}
        <div className="clay-sm p-3 border-iron">
          <h3
            className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gold-light mb-2.5 px-2 flex items-center gap-1.5"
            style={{ fontFamily: '"Cinzel", serif' }}
          >
            <Crown className="h-3.5 w-3.5 text-gold" />
            The Seven Kingdoms
          </h3>
          <div className="space-y-1">
            {kingdomNav.slice(0, 2).map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                  location.pathname === item.to
                    ? "clay-pressed text-gold"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* The Great Houses (Algorithms) */}
        <div className="space-y-2.5">
          <h3
            className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-text-muted px-3"
            style={{ fontFamily: '"Cinzel", serif' }}
          >
            The Great Houses
          </h3>

          {categories.map((cat) => {
            const catAlgorithms = algorithms.filter((a) => a.category === cat);

            return (
              <div key={cat} className="clay-sm p-2.5 border-iron">
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(cat)}
                  className="w-full flex items-center justify-between px-2 py-1 rounded-xl text-xs font-bold transition-all hover:bg-surface-hover text-text-primary"
                >
                  <span className="flex items-center gap-2">
                    {houseIcons[cat]}
                    <span className="font-royal text-gold-light">{houseBadges[cat]}</span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-text-muted transition-transform duration-300",
                      openCategories[cat] ? "rotate-0" : "-rotate-90"
                    )}
                  />
                </button>

                {/* Algorithm links */}
                {openCategories[cat] && (
                  <div className="mt-1.5 space-y-0.5 animate-fade-in pl-1">
                    {catAlgorithms.map((algo) => {
                      const isActive =
                        location.pathname === `/algorithms/${algo.slug}`;

                      return (
                        <Link
                          key={algo.id}
                          to={`/algorithms/${algo.slug}`}
                          className={cn(
                            "block px-2.5 py-1 rounded-lg text-xs transition-all duration-200",
                            isActive
                              ? "clay-pressed font-bold text-primary border-l-2 border-primary"
                              : "text-text-secondary hover:text-text-primary hover:bg-surface-hover font-medium"
                          )}
                        >
                          {algo.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Future Realm Disciplines */}
        <div className="clay-sm p-3 border-iron space-y-2">
          <h3
            className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-text-muted px-1"
            style={{ fontFamily: '"Cinzel", serif' }}
          >
            Realms & Sanctuaries
          </h3>
          <div className="space-y-1">
            {westerosDisciplines.map((d) => (
              <div
                key={d.name}
                className="flex items-center justify-between px-2 py-1 rounded-lg text-[11px] text-text-muted font-medium hover:bg-surface-hover/50 cursor-pointer"
              >
                <span className="flex items-center gap-2 text-text-secondary">
                  {d.icon}
                  <span className="font-semibold">{d.name}</span>
                </span>
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-surface-border/50 text-text-muted font-mono">
                  {d.subtitle}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
