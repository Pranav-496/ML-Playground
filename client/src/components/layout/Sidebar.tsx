import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Crown, Flame } from "lucide-react";
import { useState } from "react";
import { houses } from "@/config/houses";
import { algorithms } from "@/config/algorithms";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const location = useLocation();
  const [openHouses, setOpenHouses] = useState<Record<string, boolean>>(
    Object.fromEntries(houses.filter((h) => h.implemented).map((h) => [h.slug, true])),
  );

  const toggleHouse = (slug: string) => {
    setOpenHouses((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-20 space-y-2.5 pr-4 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-none">
        {/* Header */}
        <div className="flex items-center justify-between px-3 mb-3">
          <h3
            className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gold-light flex items-center gap-1.5 font-royal"
          >
            <Crown className="h-3.5 w-3.5 text-gold" />
            The Great Houses
          </h3>
          <Link
            to="/algorithms"
            className="text-[10px] font-bold uppercase text-text-muted hover:text-gold transition-colors flex items-center gap-1"
          >
            <Flame className="h-3 w-3" />
            All
          </Link>
        </div>

        {/* House sections */}
        {houses.map((house) => {
          const houseAlgos = algorithms.filter((a) => house.algorithms.includes(a.slug));
          const isOpen = openHouses[house.slug] ?? false;

          return (
            <div key={house.slug} className="clay-sm p-2.5 border-iron">
              {/* House header */}
              <div className="flex items-center gap-1">
                <Link
                  to={`/house/${house.slug}`}
                  className="flex-1 flex items-center gap-2 px-2 py-1 rounded-xl text-xs font-bold transition-all hover:bg-surface-hover font-royal tracking-wide"
                  style={{ color: house.color }}
                >
                  <span>{house.name}</span>
                </Link>
                {houseAlgos.length > 0 && (
                  <button
                    onClick={() => toggleHouse(house.slug)}
                    className="p-1 rounded-lg hover:bg-surface-hover transition-colors"
                  >
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 text-text-muted transition-transform duration-300",
                        isOpen ? "rotate-0" : "-rotate-90",
                      )}
                    />
                  </button>
                )}
                {!house.implemented && (
                  <span className="text-[8px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-surface-border/50 text-text-muted">
                    Soon
                  </span>
                )}
              </div>

              {/* Algorithm links */}
              {isOpen && houseAlgos.length > 0 && (
                <div className="mt-1.5 space-y-0.5 animate-fade-in pl-1">
                  {houseAlgos.map((algo) => {
                    const isActive = location.pathname === `/algorithms/${algo.slug}`;

                    return (
                      <Link
                        key={algo.id}
                        to={`/algorithms/${algo.slug}`}
                        className={cn(
                          "block px-2.5 py-1 rounded-lg text-xs transition-all duration-200",
                          isActive
                            ? "clay-pressed font-bold border-l-2"
                            : "text-text-secondary hover:text-text-primary hover:bg-surface-hover font-medium",
                        )}
                        style={isActive ? { color: house.color, borderColor: house.color } : {}}
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
    </aside>
  );
}
