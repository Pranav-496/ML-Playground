import { Link } from "react-router-dom";
import { ArrowRight, Crown, Lock } from "lucide-react";
import { houses } from "@/config/houses";
import { algorithms } from "@/config/algorithms";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, useCallback } from "react";
import Footer from "@/components/layout/Footer";

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

/* ─── Scroll-driven crossfade hook ─── */
function useScrollProgress(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      setProgress(scrollHeight > 0 ? scrollTop / scrollHeight : 0);
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [containerRef]);

  return progress;
}

/* ─── Main HomePage ─── */
export default function HomePage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(scrollRef);

  // Total "pages": hero + houses + teaser
  const totalPages = houses.length + 2;
  const pageSize = 1 / (totalPages - 1);

  // Calculate current exact scroll index
  const rawIndex = progress / pageSize;

  // Compute opacity for each layer perfectly with NO OVERLAP
  const getLayerOpacity = useCallback(
    (layerIndex: number) => {
      const distance = Math.abs(rawIndex - layerIndex);
      
      // Fully visible when scroll is very close
      if (distance <= 0.4) return 1;
      
      // Fully hidden when beyond overlap threshold
      if (distance >= 0.5) return 0;
      
      // Fading phase (distance from 0.4 to 0.5) -> Opacity (1 to 0)
      // This guarantees that at exactly 0.5 (the midpoint), BOTH layers are at 0 opacity.
      // Therefore, they never overlap.
      return 1 - ((distance - 0.4) / 0.1);
    },
    [rawIndex],
  );

  // Text visibility (higher threshold for text animations)
  const isLayerVisible = useCallback(
    (layerIndex: number) => getLayerOpacity(layerIndex) > 0.4,
    [getLayerOpacity],
  );

  return (
    <div
      ref={scrollRef}
      className="scroll-cinema-container"
    >
      {/* ─── Fixed Viewport ─── */}
      <div className="scroll-cinema-viewport">

        {/* ── Background Layers ── */}

        {/* Hero bg */}
        <div className="scroll-cinema-bg" style={{ opacity: getLayerOpacity(0) }}>
          <img src="/houses/hero.png" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/80" />
        </div>

        {/* House bgs */}
        {houses.map((house, i) => (
          <div
            key={house.slug}
            className="scroll-cinema-bg"
            style={{ opacity: getLayerOpacity(i + 1) }}
          >
            <img
              src={houseBgImages[house.slug]}
              alt=""
              className={cn(
                "w-full h-full object-cover transition-transform duration-[2s] ease-out",
                isLayerVisible(i + 1) ? "scale-100" : "scale-110",
              )}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
            {/* House-colored radial glow */}
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at 50% 40%, ${house.color}18 0%, transparent 55%)`,
              }}
            />
          </div>
        ))}

        {/* Teaser bg */}
        <div className="scroll-cinema-bg" style={{ opacity: getLayerOpacity(houses.length + 1) }}>
          <div className="w-full h-full bg-dragon-scale" />
        </div>

        {/* ── Content Layers ── */}

        {/* Hero content */}
        <div
          className="scroll-cinema-content"
          style={{ opacity: getLayerOpacity(0), pointerEvents: getLayerOpacity(0) > 0.1 ? "auto" : "none" }}
        >
          {/* Ember Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
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

          <div className="text-center px-6 max-w-4xl mx-auto">
            <h1 className={cn(
              "text-5xl sm:text-7xl lg:text-9xl font-extrabold tracking-[0.2em] mb-6 leading-[1.05] font-royal transition-all duration-700",
              isLayerVisible(0) ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
            )}>
              <span className="logo-shine">VALORIS</span>
            </h1>

            <p className={cn(
              "text-xl sm:text-3xl lg:text-4xl font-bold text-gold-light mb-6 tracking-widest uppercase font-royal transition-all duration-700 delay-100",
              isLayerVisible(0) ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
            )}>
              Knowledge is Power
            </p>

            <p className={cn(
              "text-base sm:text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed font-medium transition-all duration-700 delay-200",
              isLayerVisible(0) ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
            )}>
              Step into the Seven Kingdoms of Machine Learning.
              Command Great Houses, forge Valyrian models, and conquer
              every discipline across Westeros.
            </p>

            <div className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-300 mb-16",
              isLayerVisible(0) ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
            )}>
              <button
                onClick={() => {
                  scrollRef.current?.scrollTo({
                    top: scrollRef.current.scrollHeight / (totalPages - 1),
                    behavior: "smooth",
                  });
                }}
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

            {/* Scroll hint - Premium style (in normal flow to avoid overlap) */}
            <div className={cn(
              "flex flex-col items-center gap-3 opacity-80 transition-all duration-700 delay-500",
              isLayerVisible(0) ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
            )}>
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-white">
                SCROLL
              </span>
              <div className="h-12 w-[1px] bg-white/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1/2 bg-white animate-scroll-line" />
              </div>
            </div>
          </div>
        </div>

        {/* House content layers — ALL CENTER ALIGNED */}
        {houses.map((house, i) => {
          const layerIndex = i + 1;
          const houseAlgos = algorithms.filter((a) => house.algorithms.includes(a.slug));
          const visible = isLayerVisible(layerIndex);
          const opacity = getLayerOpacity(layerIndex);

          return (
            <div
              key={house.slug}
              className="scroll-cinema-content"
              style={{ opacity, pointerEvents: opacity > 0.1 ? "auto" : "none" }}
            >
              <div className="text-center max-w-3xl mx-auto px-6">
                {/* House Name */}
                <h2
                  className={cn(
                    "text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold font-royal mb-5 leading-[1] transition-all duration-700",
                    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
                  )}
                  style={{
                    color: house.color,
                    textShadow: `0 0 80px ${house.color}40, 0 4px 20px rgba(0,0,0,0.6)`,
                  }}
                >
                  {house.name}
                </h2>

                {/* Decorative divider */}
                <div className="flex justify-center mb-5">
                  <div
                    className={cn(
                      "h-[2px] transition-all duration-700 delay-100",
                      visible ? "w-20 opacity-100" : "w-0 opacity-0",
                    )}
                    style={{ background: `linear-gradient(to right, transparent, ${house.color}, transparent)` }}
                  />
                </div>

                {/* Motto */}
                <p
                  className={cn(
                    "text-xl sm:text-2xl lg:text-3xl font-bold italic text-white/70 mb-5 font-royal tracking-wide transition-all duration-700 delay-150",
                    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
                  )}
                >
                  &ldquo;{house.motto}&rdquo;
                </p>

                {/* Description */}
                <p
                  className={cn(
                    "text-base sm:text-lg text-white/50 leading-relaxed mb-8 font-medium max-w-2xl mx-auto transition-all duration-700 delay-200",
                    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
                  )}
                >
                  {house.description}
                </p>

                {/* Algorithm Pills */}
                <div
                  className={cn(
                    "flex flex-wrap justify-center gap-2.5 mb-8 transition-all duration-700 delay-300",
                    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
                  )}
                >
                  {houseAlgos.map((algo) => (
                    <Link
                      key={algo.slug}
                      to={`/algorithms/${algo.slug}`}
                      className="group px-4 py-2 rounded-full text-xs font-bold border backdrop-blur-sm transition-all duration-300 hover:scale-105"
                      style={{
                        borderColor: `${house.color}40`,
                        backgroundColor: `${house.color}10`,
                        color: house.color,
                      }}
                    >
                      <Crown className="inline h-3 w-3 mr-1.5 -mt-0.5 group-hover:rotate-12 transition-transform" />
                      {algo.name}
                    </Link>
                  ))}
                  {!house.implemented && house.algorithms.length === 0 && (
                    <span className="px-4 py-2 rounded-full text-xs font-bold border border-white/10 bg-white/5 text-white/30 backdrop-blur-sm">
                      <Lock className="inline h-3 w-3 mr-1 -mt-0.5" />
                      Champions yet to be forged
                    </span>
                  )}
                </div>

                {/* CTA */}
                <div
                  className={cn(
                    "transition-all duration-700 delay-[400ms]",
                    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
                  )}
                >
                  <Link
                    to={`/house/${house.slug}`}
                    className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-extrabold text-sm tracking-wider transition-all duration-300 hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${house.color}, ${house.colorDark})`,
                      color: "white",
                      boxShadow: `0 4px 30px ${house.color}40, inset 0 1px 0 rgba(255,255,255,0.15)`,
                    }}
                  >
                    Enter {house.name}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

          {/* Teaser content */}
        <div
          className="scroll-cinema-content flex-col"
          style={{
            opacity: getLayerOpacity(houses.length + 1),
            pointerEvents: getLayerOpacity(houses.length + 1) > 0.1 ? "auto" : "none",
          }}
        >
          <div className="flex-1 flex flex-col justify-center items-center w-full max-w-5xl mx-auto text-center px-6">
            <h2 className={cn(
              "text-3xl sm:text-4xl font-extrabold text-text-primary mb-3 font-royal transition-all duration-700",
              isLayerVisible(houses.length + 1) ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
            )}>
              The <span className="gradient-text-gold">Realm</span> Awaits
            </h2>
            <p className={cn(
              "text-text-muted max-w-xl mx-auto mb-12 font-medium transition-all duration-700 delay-100",
              isLayerVisible(houses.length + 1) ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
            )}>
              Beyond the Great Houses lie sanctuaries, councils, and archives — each with its own purpose in the kingdom of knowledge.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
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
          
          <div className="w-full">
            <Footer />
          </div>
        </div>

      </div>

      {/* ─── Scroll spacer — 150vh per page for slightly faster transitions ─── */}
      <div style={{ height: `${totalPages * 150}vh` }} />
    </div>
  );
}
