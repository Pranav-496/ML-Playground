import { useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HyperParam } from "@/types";

interface ControlPanelProps {
  params: HyperParam[];
  values: Record<string, number | string>;
  onChange: (key: string, value: number | string) => void;
  onRun: () => void;
  loading?: boolean;
}

export default function ControlPanel({
  params,
  values,
  onChange,
  onRun,
  loading = false,
}: ControlPanelProps) {
  const [showInfo, setShowInfo] = useState<string | null>(null);

  return (
    <div className="clay p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-extrabold text-text-primary">
          ⚙️ Hyperparameters
        </h3>
      </div>

      <div className="space-y-4">
        {params.map((param) => (
          <div key={param.key} className="space-y-2">
            {/* Label row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-sm font-bold text-text-primary">
                  {param.label}
                </label>
                <button
                  onClick={() =>
                    setShowInfo(showInfo === param.key ? null : param.key)
                  }
                  className="p-0.5 rounded-full hover:bg-surface-warm transition-colors"
                >
                  <Info className="h-3.5 w-3.5 text-text-muted" />
                </button>
              </div>
              {param.type === "slider" && (
                <span
                  className="text-sm font-extrabold px-3 py-1 rounded-full clay-sm"
                  style={{ color: "#e8553a" }}
                >
                  {values[param.key]}
                </span>
              )}
            </div>

            {/* Info tooltip */}
            {showInfo === param.key && (
              <p className="text-xs text-text-secondary clay-pressed p-3 animate-fade-in font-medium leading-relaxed">
                {param.description}
              </p>
            )}

            {/* Control input */}
            {param.type === "slider" ? (
              <input
                type="range"
                min={param.min}
                max={param.max}
                step={param.step}
                value={values[param.key] as number}
                onChange={(e) =>
                  onChange(param.key, parseFloat(e.target.value))
                }
                className={cn(
                  "w-full h-2 rounded-full appearance-none cursor-pointer",
                  "bg-surface-border",
                  "[&::-webkit-slider-thumb]:appearance-none",
                  "[&::-webkit-slider-thumb]:w-5",
                  "[&::-webkit-slider-thumb]:h-5",
                  "[&::-webkit-slider-thumb]:rounded-full",
                  "[&::-webkit-slider-thumb]:bg-primary",
                  "[&::-webkit-slider-thumb]:shadow-[2px_2px_4px_rgba(166,140,116,0.3),-1px_-1px_3px_rgba(255,255,255,0.8)]",
                  "[&::-webkit-slider-thumb]:cursor-pointer",
                  "[&::-webkit-slider-thumb]:transition-all",
                  "[&::-webkit-slider-thumb]:hover:scale-110"
                )}
              />
            ) : (
              <select
                value={values[param.key] as string}
                onChange={(e) => onChange(param.key, e.target.value)}
                className="w-full p-2.5 rounded-xl clay-sm text-sm font-bold text-text-primary bg-surface-card border-none outline-none cursor-pointer"
              >
                {param.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>

      {/* Run button */}
      <button
        onClick={onRun}
        disabled={loading}
        className={cn(
          "w-full clay-btn clay-btn-primary justify-center text-base",
          loading && "opacity-70 cursor-not-allowed"
        )}
      >
        {loading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Training...
          </>
        ) : (
          <>🚀 Train Model</>
        )}
      </button>
    </div>
  );
}
