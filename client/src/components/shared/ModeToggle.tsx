import { Sword, TrendingUp } from "lucide-react";

interface ModeToggleProps {
  mode: "classification" | "regression";
  onModeChange: (mode: "classification" | "regression") => void;
}

export default function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="flex items-center justify-center mb-6">
      <div className="clay-sm inline-flex p-1 rounded-2xl gap-1">
        <button
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all duration-300 ${
            mode === "classification"
              ? "bg-gradient-to-r from-amber-600/80 to-orange-600/80 text-white shadow-lg shadow-orange-500/20"
              : "text-text-muted hover:text-text-primary hover:bg-surface-hover/50"
          }`}
          onClick={() => onModeChange("classification")}
        >
          <Sword className="h-4 w-4" />
          Classification
        </button>
        <button
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all duration-300 ${
            mode === "regression"
              ? "bg-gradient-to-r from-blue-600/80 to-cyan-600/80 text-white shadow-lg shadow-blue-500/20"
              : "text-text-muted hover:text-text-primary hover:bg-surface-hover/50"
          }`}
          onClick={() => onModeChange("regression")}
        >
          <TrendingUp className="h-4 w-4" />
          Regression
        </button>
      </div>
    </div>
  );
}
