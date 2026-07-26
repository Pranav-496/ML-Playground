import { Link } from "react-router-dom";
import { ArrowRight, Crown, Lock, Flame } from "lucide-react";
import { houses } from "@/config/houses";
import { algorithms } from "@/config/algorithms";
import { useScrollReveal, useActiveSection } from "@/hooks/useScrollReveal";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

/* ─── Background images per house ─── */
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

/* ─── Single House Section Component ─── */
function HouseSection({ house, index }: { house: (typeof houses)[0]; index: number }) {
  const [ref, isVisible] = useScrollReveal<HTMLElement>(0.2);
  const houseAlgos = algorithms.filter((a) => house.algorithms.includes(a.slug));
  const isEven = index % 2 === 0;

  return (
    <section
      ref={ref}
      id={`house-${house.slug}`}
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background Image + Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={houseBgImages[house.slug]}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Dark gradient overlay — text side is darker */}
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-700 ease-out",
            isEven
              ? "bg-gradient-to-r from-black/90 via-black/75 to-black/40"
              : "bg-gradient-to-l from-black/90 via-black/75 to-black/40",
            isVisible ? "opacity-100" : "opacity-40",
          )}
        />
        {/* Bottom fade for scroll continuity */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface to-transparent" />
        {/* Top fade */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-surface to-transparent" />
      </div>

      {/* Content */}
      <div
        className={cn(
          "relative z-10 max-w-[92rem] mx-auto w-full px-6 sm:px-12 lg:px-20 py-20",
          isEven ? "text-left" : "text-right ml-auto",
        )}
      >
        <div className={cn("max-w-2xl", !isEven && "ml-auto")}>
          {/* House Name */}
          <h2
            className={cn(
              "text-4xl sm:text-5xl lg:text-6xl font-extrabold font-royal mb-3 transition-all duration-600 ease-out",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
            )}
            style={{ color: house.color }}
          >
            {house.name}
          </h2>

          {/* Motto */}
          <p
            className={cn(
              "text-xl sm:text-2xl font-bold italic text-white/70 mb-4 font-royal tracking-wide transition-all duration-600 ease-out delay-100",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
            )}
          >
            &ldquo;{house.motto}&rdquo;
          </p>

          {/* Description */}
          <p
            className={cn(
              "text-base sm:text-lg text-white/60 leading-relaxed mb-8 font-medium transition-all duration-600 ease-out delay-200",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
            )}
          >
            {house.description}
          </p>

          {/* Algorithm Pills */}
          <div
            className={cn(
              "flex flex-wrap gap-2 mb-8 transition-all duration-600 ease-out delay-300",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
              !isEven && "justify-end",
            )}
          >
            {houseAlgos.map((algo) => (
              <Link
                key={algo.slug}
                to={`/algorithms/${algo.slug}`}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all duration-300 hover:scale-105"
                style={{
                  borderColor: `${house.color}50`,
                  backgroundColor: `${house.color}15`,
                  color: house.color,
                }}
              >
                <Crown className="inline h-3 w-3 mr-1 -mt-0.5" />
                {algo.name}
              </Link>
            ))}
            {house.algorithms.length > 0 &&
              house.algorithms
                .filter((slug) => !algorithms.find((a) => a.slug === slug))
                .map((slug) => (
                  <span
                    key={slug}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold border border-white/10 bg-white/5 text-white/30 cursor-not-allowed"
                  >
                    <Lock className="inline h-3 w-3 mr-1 -mt-0.5" />
                    {slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                ))}
            {!house.implemented && house.algorithms.length === 0 && (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold border border-white/10 bg-white/5 text-white/30">
                <Lock className="inline h-3 w-3 mr-1 -mt-0.5" />
                Champions yet to be forged
              </span>
            )}
          </div>

          {/* CTA Button */}
          <div
            className={cn(
              "transition-all duration-600 ease-out delay-[400ms]",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
              !isEven && "flex justify-end",
            )}
          >
            <Link
              to={`/house/${house.slug}`}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-extrabold text-sm tracking-wider transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]"
              style={{
                background: `linear-gradient(135deg, ${house.color}, ${house.colorDark})`,
                color: "white",
                boxShadow: `0 4px 20px ${house.color}40, inset 0 1px 0 rgba(255,255,255,0.15)`,
              }}
            >
              Enter {house.name}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Sticky Realm Navigation ─── */
function RealmNav() {
  const sectionIds = useMemo(() => houses.map((h) => `house-${h.slug}`), []);
  const activeIndex = useActiveSection(sectionIds);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="sticky top-16 z-40 bg-surface/80 backdrop-blur-xl border-b border-surface-border/30">
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 py-2.5 min-w-max">
          {houses.map((house, i) => (
            <button
              key={house.slug}
              onClick={() => scrollTo(`house-${house.slug}`)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold font-royal transition-all duration-300 whitespace-nowrap tracking-wide",
                activeIndex === i
                  ? "bg-white/10 shadow-[0_0_12px_rgba(0,0,0,0.3)]"
                  : "text-text-muted hover:text-text-primary hover:bg-surface-hover",
              )}
              style={
                activeIndex === i ? { color: house.color, borderBottom: `2px solid ${house.color}` } : {}
              }
            >
              <span>{house.name.replace("House ", "")}</span>
            </button>
          ))}
          <div className="h-5 w-px bg-surface-border/50 mx-1" />
          <Link
            to="/algorithms"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-gold font-royal hover:bg-gold/10 transition-all whitespace-nowrap tracking-wide"
          >
            <Flame className="h-3.5 w-3.5" />
            View All
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Main HomePage ─── */
export default function HomePage() {
  return (
    <div className="animate-fade-in w-full">
      {/* Hero Section */}
      <section
        className="relative min-h-[85vh] flex items-center justify-center overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="/houses/hero.png"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-surface" />
        </div>

        {/* Ember Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="ember-particle"
              style={{
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
                top: `${50 + Math.random() * 50}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${5 + Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <h1
            className="text-5xl sm:text-7xl lg:text-9xl font-extrabold tracking-[0.2em] mb-6 leading-[1.05] font-royal"
          >
            <span className="logo-shine">VALORIS</span>
          </h1>

          <p className="text-xl sm:text-3xl lg:text-4xl font-bold text-gold-light mb-6 tracking-widest uppercase font-royal">
            Knowledge is Power
          </p>

          <p className="text-base sm:text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Step into the Seven Kingdoms of Machine Learning.
            Command Great Houses, forge Valyrian models, and conquer
            every discipline across Westeros.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() =>
                document.getElementById("house-stark")?.scrollIntoView({ behavior: "smooth" })
              }
              className="clay-btn clay-btn-primary text-lg font-extrabold tracking-wider border-valyrian px-8 py-3.5"
            >
              Dracarys
              <ArrowRight className="h-5 w-5 ml-1" />
            </button>
            <Link
              to="/algorithms"
              className="clay-btn clay-btn-secondary text-lg font-bold border-gold-royal px-8 py-3.5 text-gold-light font-royal"
            >
              Enter the Realm
            </Link>
          </div>
        </div>
      </section>

      {/* Sticky Realm Navigation */}
      <RealmNav />

      {/* House Sections — cinematic full-viewport scroll */}
      {houses.map((house, index) => (
        <HouseSection key={house.slug} house={house} index={index} />
      ))}

      {/* Realm Locations Teaser */}
      <section className="relative py-24 px-6 bg-dragon-scale">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-3 font-royal">
            The <span className="gradient-text-gold">Realm</span> Awaits
          </h2>
          <p className="text-text-muted max-w-xl mx-auto mb-12 font-medium">
            Beyond the Great Houses lie sanctuaries, councils, and archives — each with its own purpose in the kingdom of knowledge.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { name: "Dragonpit", desc: "Model Training", color: "#B91C1C" },
              { name: "Iron Throne", desc: "Leaderboards", color: "#F59E0B" },
              { name: "Great Council", desc: "Model Comparison", color: "#DC2626" },
              { name: "Royal Archives", desc: "Datasets", color: "#FF5A1F" },
              { name: "The Citadel", desc: "Theory & Docs", color: "#22C55E" },
              { name: "The Red Keep", desc: "Dashboard", color: "#7C3AED" },
            ].map((loc) => (
              <div
                key={loc.name}
                className="clay-sm p-6 border-iron text-center hover:scale-[1.02] transition-transform cursor-pointer"
              >
                <h4 className="text-base font-extrabold text-text-primary font-royal mb-1">
                  {loc.name}
                </h4>
                <p className="text-xs text-text-muted font-medium">{loc.desc}</p>
                <span className="inline-block mt-3 text-[9px] uppercase font-extrabold px-2.5 py-0.5 rounded bg-surface-border/50 text-text-muted tracking-wider">
                  Coming Soon
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
