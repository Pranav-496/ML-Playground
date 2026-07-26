import { useState, useRef, useCallback, useEffect } from "react";
import ValorisLogoIcon from "./ValorisLogoIcon";
import { cn } from "@/lib/utils";

// Slower ember particles
const particles = Array.from({ length: 40 }).map((_, i) => ({
  id: i,
  left: Math.random() * 100,
  animationDuration: 4 + Math.random() * 5,
  animationDelay: Math.random() * 3,
  size: 2 + Math.random() * 5,
}));

const SPLASH_KEY = "valoris_entered";

export default function SplashScreen() {
  const alreadyEntered = sessionStorage.getItem(SPLASH_KEY) === "true";
  const [stage, setStage] = useState<"visible" | "fading" | "hidden">(
    alreadyEntered ? "hidden" : "visible"
  );
  const audioRef = useRef<HTMLAudioElement>(null);

  // Attempt autoplay on mount & handle cleanup on refresh
  useEffect(() => {
    if (alreadyEntered) return;

    if (audioRef.current) {
      audioRef.current.volume = 1.0;
      audioRef.current.play().catch(() => {
        // Browser blocked autoplay — totally fine, it will just be silent until they enter
      });
    }

    const stopOnUnload = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
    window.addEventListener("beforeunload", stopOnUnload);
    return () => window.removeEventListener("beforeunload", stopOnUnload);
  }, [alreadyEntered]);

  // Enter the realm — stop fire, save session, fade out
  const handleEnter = useCallback(() => {
    // Play briefly for dramatic effect if it wasn't playing
    if (audioRef.current) {
      audioRef.current.volume = 1.0;
      audioRef.current.play().catch(() => {});
    }

    // Stop after a tiny moment so the user hears the fire during fade
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }, 800);

    sessionStorage.setItem(SPLASH_KEY, "true");
    setStage("fading");
    setTimeout(() => setStage("hidden"), 1500);
  }, []);

  if (stage === "hidden") return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#030303] overflow-hidden transition-opacity duration-[1500ms]",
        stage === "fading" ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
    >
      <audio ref={audioRef} src="/fire-crackling.mp3" loop preload="auto" />

      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(185,14,10,0.15)_0%,transparent_65%)] animate-pulse" />

      {/* Embers / Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute bottom-[-20px] rounded-full bg-[#B90E0A]"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              boxShadow: "0 0 10px 2px #ff4500, 0 0 20px 2px #B90E0A",
              animation: `rise ${p.animationDuration}s linear infinite`,
              animationDelay: `${p.animationDelay}s`,
              opacity: 0,
            }}
          />
        ))}
      </div>

      {/* Main Content — each element fades in with a stagger */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">

        {/* Logo */}
        <div
          className="mb-6"
          style={{ animation: "splashFadeIn 1.2s ease-out 0.3s both, float 3s ease-in-out infinite 1.5s" }}
        >
          <ValorisLogoIcon className="h-28 w-28 sm:h-40 sm:w-40" />
        </div>

        {/* Title */}
        <h1
          className="text-5xl sm:text-6xl md:text-7xl font-black tracking-[0.2em] font-royal text-[#B90E0A] drop-shadow-[0_0_15px_rgba(185,14,10,0.5)] mb-8"
          style={{ animation: "splashFadeIn 1.2s ease-out 0.8s both" }}
        >
          VALORIS
        </h1>

        {/* Quote */}
        <div
          className="max-w-2xl mb-14"
          style={{ animation: "splashFadeIn 1.2s ease-out 1.5s both" }}
        >
          <p className="text-white/90 italic text-2xl sm:text-3xl font-serif leading-relaxed drop-shadow-xl font-bold">
            &ldquo;When you play the game of thrones, you win or you die...&rdquo;
          </p>
          <p className="text-[#B90E0A] text-sm mt-5 tracking-widest uppercase font-black font-royal drop-shadow-md">
            — Cersei Lannister
          </p>
        </div>

        {/* Button */}
        <div style={{ animation: "splashFadeIn 1.2s ease-out 2.2s both" }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEnter();
            }}
            className="group relative px-8 sm:px-14 py-3 sm:py-4 font-royal font-black text-sm sm:text-lg tracking-[0.2em] uppercase text-gold-light transition-all duration-500 hover:text-white"
          >
            <span className="absolute inset-0 border-2 border-[#B90E0A]/50 rounded-sm transition-all duration-500 group-hover:border-[#B90E0A] group-hover:shadow-[0_0_30px_rgba(185,14,10,0.5)]" />
            <span className="absolute inset-[4px] border border-gold-light/20 rounded-sm transition-all duration-500 group-hover:border-gold-light/50" />
            <span className="absolute inset-0 bg-[#B90E0A]/0 transition-all duration-500 group-hover:bg-[#B90E0A]/15 rounded-sm" />
            <span className="relative z-10 flex items-center gap-3">
              <span className="text-[#B90E0A] group-hover:text-white transition-colors duration-500">⚔</span>
              Enter the Realm
              <span className="text-[#B90E0A] group-hover:text-white transition-colors duration-500">⚔</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}