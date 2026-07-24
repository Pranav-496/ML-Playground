import { Link } from "react-router-dom";
import { Crown, Lock } from "lucide-react";
import { houses } from "@/config/houses";
import { algorithms } from "@/config/algorithms";

export default function AlgorithmsPage() {
  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 font-royal">
          <span className="gradient-text">All Disciplines</span>
        </h1>
        <p className="text-text-secondary text-lg font-medium">
          Every champion across the Seven Kingdoms. Choose your weapon. Master its power.
        </p>
      </div>

      {houses.map((house, catIndex) => {
        const houseAlgos = algorithms.filter((a) => house.algorithms.includes(a.slug));
        const unimplemented = house.algorithms.filter(
          (slug) => !algorithms.find((a) => a.slug === slug),
        );

        return (
          <section
            key={house.slug}
            className="mb-14 animate-slide-up"
            style={{ animationDelay: `${catIndex * 100}ms` }}
          >
            <div className="flex items-center gap-3 mb-7">
              <Link
                to={`/house/${house.slug}`}
                className="pill border font-bold text-sm flex items-center gap-2 hover:opacity-80 transition-opacity font-royal tracking-wide"
                style={{
                  backgroundColor: `${house.color}15`,
                  borderColor: `${house.color}30`,
                  color: house.color,
                }}
              >
                <span>{house.name}</span>
                <span className="text-xs opacity-60 italic font-royal ml-1 font-normal">
                  &ldquo;{house.motto}&rdquo;
                </span>
              </Link>
              <div className="h-px flex-1 bg-surface-border/50" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {houseAlgos.map((algo, index) => (
                <Link
                  key={algo.id}
                  to={`/algorithms/${algo.slug}`}
                  className="group clay p-6 clay-hover border-iron animate-slide-up"
                  style={{ animationDelay: `${index * 80 + catIndex * 50}ms` }}
                >
                  <div
                    className="p-3.5 rounded-2xl w-fit mb-5 transition-transform duration-300 group-hover:scale-110 border border-surface-border"
                    style={{ backgroundColor: `${house.color}15` }}
                  >
                    <Crown className="h-6 w-6" style={{ color: house.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-gold-light transition-colors font-royal">
                    {algo.name}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed font-medium">
                    {algo.description}
                  </p>
                </Link>
              ))}

              {/* Coming soon placeholders */}
              {unimplemented.map((slug) => (
                <div
                  key={slug}
                  className="clay p-6 border-iron opacity-40 cursor-not-allowed"
                >
                  <div className="p-3.5 rounded-2xl w-fit mb-5 bg-surface-border/30 border border-surface-border">
                    <Lock className="h-6 w-6 text-text-muted" />
                  </div>
                  <h3 className="text-lg font-bold text-text-muted mb-2 font-royal">
                    {slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </h3>
                  <p className="text-sm text-text-muted font-medium">
                    This champion has yet to be forged.
                  </p>
                </div>
              ))}

              {!house.implemented && house.algorithms.length === 0 && (
                <div className="clay p-6 border-iron opacity-40 cursor-not-allowed col-span-full text-center">
                  <h3 className="text-base font-bold text-text-muted font-royal">
                    Champions of {house.name} — Coming Soon
                  </h3>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
