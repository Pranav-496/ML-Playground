import { useEffect, useState } from "react";
import ValorisLogoIcon from "./ValorisLogoIcon";
import { cn } from "@/lib/utils";

export default function SplashScreen() {
  const [stage, setStage] = useState<"enter" | "quote" | "exit" | "done">("enter");

  useEffect(() => {
    // Reveal quote
    const t1 = setTimeout(() => setStage("quote"), 800);
    // Fade out everything
    const t2 = setTimeout(() => setStage("exit"), 3800);
    // Unmount completely
    const t3 = setTimeout(() => setStage("done"), 4800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (stage === "done") return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#030303] transition-opacity duration-1000",
        stage === "exit" ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(185,14,10,0.1)_0%,transparent_60%)] animate-pulse" />

      {/* Main Logo Container */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        
        {/* The Icon */}
        <div className="animate-float mb-6">
          <ValorisLogoIcon 
            className="h-28 w-28 sm:h-40 sm:w-40"
            style={{ filter: "drop-shadow(0 0 25px rgba(185,14,10,0.6))" }}
          />
        </div>
        
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-[0.2em] font-royal gradient-text mb-8">
          VALORIS
        </h1>

        {/* Quote */}
        <div 
          className={cn(
            "transition-all duration-1000 ease-out max-w-xl text-center px-6",
            (stage === "quote" || stage === "exit") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          )}
        >
          <p className="text-gold-light/90 italic text-xl sm:text-2xl font-serif leading-relaxed drop-shadow-md">
            "A mind needs books as a sword needs a whetstone, if it is to keep its edge."
          </p>
          <p className="text-text-muted/60 text-sm mt-5 tracking-widest uppercase font-bold font-royal">
            — Tyrion Lannister
          </p>
        </div>
      </div>
    </div>
  );
}