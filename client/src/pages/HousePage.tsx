import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Crown, Lock, Sword } from "lucide-react";
import { houses, getHouseBySlug } from "@/config/houses";
import { algorithms } from "@/config/algorithms";

const houseBgImages: Record<string, string> = {
  stark: "/houses/stark.png",
  baratheon: "/houses/baratheon.png",
  tyrell: "/houses/tyrell.png",
  greyjoy: "/houses/greyjoy.png",
  arryn: "/houses/arryn.png",
  targaryen: "/houses/targaryen.png",
  martell: "/houses/martell.png",
  velaryon: "/houses/velaryon.png",
  blackfyre: "/houses/blackfyre.png",
};

export default function HousePage() {
  const { houseSlug } = useParams<{ houseSlug: string }>();
  const house = houseSlug ? getHouseBySlug(houseSlug) : undefined;

  if (!house) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-bounce-in">
        <div className="clay-lg p-10 text-center">
          <Sword className="h-12 w-12 text-primary mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-text-primary mb-2 font-royal">
            House Not Found
          </h2>
          <p className="text-text-secondary font-medium mb-6">
            This Great House has yet to pledge allegiance.
          </p>
          <Link to="/" className="clay-btn clay-btn-primary">
            <ArrowLeft className="h-4 w-4" />
            Return to King's Landing
          </Link>
        </div>
      </div>
    );
  }

  const houseAlgos = algorithms.filter((a) => house.algorithms.includes(a.slug));
  const unimplementedSlugs = house.algorithms.filter(
    (slug) => !algorithms.find((a) => a.slug === slug),
  );

  return (
    <div className="animate-fade-in w-full overflow-x-hidden">
      {/* Hero Banner */}
      <div className="relative rounded-2xl -mt-2 mb-8 overflow-hidden border border-surface-border/50">
        <div className="relative min-h-[130px] sm:min-h-[160px] flex items-center p-5 sm:p-7">
          <img
            src={houseBgImages[house.slug]}
            alt={house.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface/80 via-transparent to-black/40" />

          {/* Content over image */}
          <div className="relative z-10 space-y-1">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white/60 hover:text-white transition-colors mb-1 font-royal"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              King's Landing
            </Link>

            <h1
              className="text-2xl sm:text-4xl font-extrabold font-royal leading-tight"
              style={{ color: house.color }}
            >
              {house.name}
            </h1>
            <p className="text-xs sm:text-sm font-bold italic text-white/70 font-royal">
              &ldquo;{house.motto}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* House Description */}
      <div className="max-w-5xl mx-auto mb-10">
        <p className="text-text-secondary text-lg leading-relaxed font-medium max-w-3xl">
          {house.description}
        </p>
      </div>

      {/* Implemented Algorithms */}
      {houseAlgos.length > 0 && (
        <div className="max-w-5xl mx-auto mb-12">
          <h2 className="text-xl font-extrabold text-text-primary font-royal mb-6 flex items-center gap-2">
            <Crown className="h-5 w-5" style={{ color: house.color }} />
            Champions of {house.name}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {houseAlgos.map((algo, index) => (
              <Link
                key={algo.id}
                to={`/algorithms/${algo.slug}`}
                className="group clay p-6 clay-hover border-iron animate-slide-up"
                style={{ animationDelay: `${index * 80}ms` }}
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
          </div>
        </div>
      )}

      {/* Unimplemented / Coming Soon */}
      {(unimplementedSlugs.length > 0 || (!house.implemented && house.algorithms.length === 0)) && (
        <div className="max-w-5xl mx-auto mb-12">
          <h2 className="text-xl font-extrabold text-text-muted font-royal mb-6 flex items-center gap-2">
            <Lock className="h-5 w-5 text-text-muted" />
            Champions Yet To Be Forged
          </h2>

          {house.algorithms.length === 0 ? (
            <div className="clay-lg p-14 text-center border-iron">
              <h3 className="text-xl font-bold text-text-primary mb-3 font-royal">
                This House Has No Champions Yet
              </h3>
              <p className="text-text-secondary max-w-md mx-auto font-medium">
                The algorithms of {house.name} are being forged in the fires of Valyria.
                They will rise soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {unimplementedSlugs.map((slug) => (
                <div
                  key={slug}
                  className="clay p-6 border-iron opacity-50 cursor-not-allowed"
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
            </div>
          )}
        </div>
      )}

      {/* Other Houses Navigation */}
      <div className="max-w-5xl mx-auto mb-8">
        <h2 className="text-xl font-extrabold text-text-primary font-royal mb-6">
          Other Great Houses
        </h2>
        <div className="flex flex-wrap gap-3">
          {houses
            .filter((h) => h.slug !== house.slug)
            .map((h) => (
              <Link
                key={h.slug}
                to={`/house/${h.slug}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full clay-sm text-sm font-bold font-royal tracking-wide transition-all hover:scale-105"
                style={{ color: h.color }}
              >
                {h.name}
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
