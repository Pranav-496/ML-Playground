import { Link } from "react-router-dom";
import { Sword } from "lucide-react";
import {
  algorithms,
  categoryLabels,
  categoryColors,
  categoryBgColors,
} from "@/config/algorithms";
import { cn } from "@/lib/utils";
import type { AlgorithmCategory } from "@/types";

export default function AlgorithmsPage() {
  const categories: AlgorithmCategory[] = [
    "regression",
    "classification",
    "clustering",
  ];

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-12">
        <h1
          className="text-4xl sm:text-5xl font-bold mb-3"
          style={{ fontFamily: '"Cinzel", serif' }}
        >
          <span className="gradient-text">All Disciplines</span>
        </h1>
        <p className="text-text-secondary text-lg font-medium">
          Choose your weapon. Tune its parameters. Master its power.
        </p>
      </div>

      {categories.map((cat, catIndex) => {
        const catAlgorithms = algorithms.filter((a) => a.category === cat);

        return (
          <section
            key={cat}
            className="mb-14 animate-slide-up"
            style={{ animationDelay: `${catIndex * 150}ms` }}
          >
            <div className="flex items-center gap-3 mb-7">
              <span
                className={cn(
                  "pill border font-bold text-sm",
                  categoryBgColors[cat],
                  categoryColors[cat]
                )}
              >
                {categoryLabels[cat]}
              </span>
              <div className="h-px flex-1 bg-surface-border/50" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {catAlgorithms.map((algo, index) => (
                <Link
                  key={algo.id}
                  to={`/algorithms/${algo.slug}`}
                  className="group clay p-6 clay-hover animate-slide-up"
                  style={{ animationDelay: `${index * 80 + catIndex * 100}ms` }}
                >
                  <div
                    className="p-3.5 rounded-2xl w-fit mb-5 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${algo.color}12` }}
                  >
                    <Sword
                      className="h-6 w-6"
                      style={{ color: algo.color }}
                    />
                  </div>
                  <h3
                    className="text-lg font-bold text-text-primary mb-2 group-hover:text-primary transition-colors"
                    style={{ fontFamily: '"Cinzel", serif' }}
                  >
                    {algo.name}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed font-medium">
                    {algo.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
