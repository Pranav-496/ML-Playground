interface MetricCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  description?: string;
  format?: "decimal" | "percentage";
}

const westerosMetricLabels: Record<string, string> = {
  "Accuracy": "Battle Accuracy",
  "Precision": "Sword Precision",
  "Recall": "Battle Recall",
  "F1 Score": "Victory Score",
  "R² Score": "Realm Victory (R²)",
  "MSE": "Battle Casualties (MSE)",
  "RMSE": "War Variance (RMSE)",
  "MAE": "Deviations (MAE)",
};

export default function MetricCard({
  label,
  value,
  icon,
  color,
  description,
  format = "decimal",
}: MetricCardProps) {
  const displayLabel = westerosMetricLabels[label] || label;
  const displayValue =
    typeof value === "number"
      ? format === "percentage"
        ? `${(value * 100).toFixed(2)}%`
        : value.toFixed(4)
      : value;

  return (
    <div className="clay-sm p-5 clay-hover border-iron">
      <div className="flex items-start justify-between mb-3">
        <div
          className="p-2.5 rounded-2xl border border-surface-border"
          style={{ backgroundColor: `${color}15` }}
        >
          <div style={{ color }}>{icon}</div>
        </div>
      </div>
      <p className="text-2xl font-extrabold text-gold-light mb-1 tracking-tight font-mono">
        {displayValue}
      </p>
      <p className="text-sm font-bold text-text-primary font-royal">{displayLabel}</p>
      {description && (
        <p className="text-xs text-text-muted mt-1.5 leading-relaxed font-medium">
          {description}
        </p>
      )}
    </div>
  );
}
