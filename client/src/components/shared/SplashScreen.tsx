import { useState, useRef, useCallback, useEffect } from "react";
import ValorisLogoIcon from "./ValorisLogoIcon";
import { cn } from "@/lib/utils";

// Generate random values for the particles — slower durations
const particles = Array.from({ length: 40 }).map((_, i) => ({
  id: i,
  left: Math.random() * 100,
  animationDuration: 4 + Math.random() * 5, // 4–9 seconds (was 1.5–4.5)
  animationDelay: Math.random() * 3,
  size: 2 + Math.random() * 5,
}));

export default function SplashScreen() {
  const [stage, setStage] = useState<"visible" | "fading" | "hidden">("visible");
  const audioRef = useRef<HTMLAudioElement>(null);

  // Attempt autoplay on mount
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 1.0;
      audioRef.current.play().catch(() => {
        // Browser blocked autoplay — start on first click instead
        const unlockAudio = () => {
          if (audioRef.current) {
            audioRef.current.volume = 1.0;
            audioRef.current.play().catch(() => { });
          }
          document.removeEventListener("click", unlockAudio);
          document.removeEventListener("touchstart", unlockAudio);
        };
        document.addEventListener("click", unlockAudio, { once: true });
        document.addEventListener("touchstart", unlockAudio, { once: true });
      });
    }
  }, []);

  const handleEnter = useCallback(() => {
    // Stop fire sound
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setStage("fading");
    setTimeout(() => setStage("hidden"), 1500);
  }, []);

  if (stage === "hidden") return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#030303] transition-opacity duration-[1500ms] overflow-hidden",
        stage === "fading" ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
    >
      <audio ref={audioRef} src="/fire-crackling.mp3" loop />

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

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
        {/* Logo */}
        <div className="animate-float mb-6">
          <ValorisLogoIcon
            className="h-28 w-28 sm:h-40 sm:w-40"
            style={{ filter: "drop-shadow(0 0 35px rgba(185,14,10,0.7))" }}
          />
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-[0.2em] font-royal text-[#B90E0A] drop-shadow-[0_0_15px_rgba(185,14,10,0.5)] mb-8">
          VALORIS
        </h1>

        {/* Quote */}
        <div className="max-w-2xl mb-14">
          <p className="text-white/90 italic text-2xl sm:text-3xl font-serif leading-relaxed drop-shadow-xl font-bold">
            &ldquo;When you play the game of thrones, you win or you die...&rdquo;
          </p>
          <p className="text-[#B90E0A] text-sm mt-5 tracking-widest uppercase font-black font-royal drop-shadow-md">
            — Cersei Lannister
          </p>
        </div>

        {/* Royal Enter Button */}
        <button
          onClick={handleEnter}
          className="group relative px-14 py-4 font-royal font-black text-lg tracking-[0.2em] uppercase text-gold-light transition-all duration-500 hover:text-white"
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
  );
}