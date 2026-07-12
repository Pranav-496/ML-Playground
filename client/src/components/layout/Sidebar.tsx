import { Link, useLocation } from "react-router-dom";
import {
  TrendingUp,
  GitBranch,
  Layers,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { algorithms, categoryLabels, categoryColors } from "@/config/algorithms";
import { cn } from "@/lib/utils";
import type { AlgorithmCategory } from "@/types";

const categoryIcons: Record<AlgorithmCategory, React.ReactNode> = {
  regression: <TrendingUp className="h-4 w-4" />,
  classification: <GitBranch className="h-4 w-4" />,
  clustering: <Layers className="h-4 w-4" />,
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

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-20 space-y-3 pr-4">
        <h3
          className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted mb-4 px-3"
          style={{ fontFamily: '"Cinzel", serif' }}
        >
          Disciplines
        </h3>

        {categories.map((cat) => {
          const catAlgorithms = algorithms.filter((a) => a.category === cat);

          return (
            <div key={cat} className="clay-sm p-3">
              {/* Category header */}
              <button
                onClick={() => toggleCategory(cat)}
                className={cn(
                  "w-full flex items-center justify-between px-2 py-1.5 rounded-xl text-sm font-semibold transition-all",
                  "hover:bg-surface-hover",
                  categoryColors[cat]
                )}
              >
                <span className="flex items-center gap-2">
                  {categoryIcons[cat]}
                  {categoryLabels[cat]}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-300",
                    openCategories[cat] ? "rotate-0" : "-rotate-90"
                  )}
                />
              </button>

              {/* Algorithm links */}
              {openCategories[cat] && (
                <div className="mt-2 space-y-0.5 animate-fade-in">
                  {catAlgorithms.map((algo) => {
                    const isActive =
                      location.pathname === `/algorithms/${algo.slug}`;

                    return (
                      <Link
                        key={algo.id}
                        to={`/algorithms/${algo.slug}`}
                        className={cn(
                          "block px-3 py-1.5 rounded-xl text-sm transition-all duration-200",
                          isActive
                            ? "clay-pressed font-bold text-primary"
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
    </aside>
  );
}
