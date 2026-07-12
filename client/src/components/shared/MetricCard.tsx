interface MetricCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  description?: string;
  format?: "decimal" | "percentage";
}

export default function MetricCard({
  label,
  value,
  icon,
  color,
  description,
  format = "decimal",
}: MetricCardProps) {
  const displayValue =
    typeof value === "number"
      ? format === "percentage"
        ? `${(value * 100).toFixed(2)}%`
        : value.toFixed(4)
      : value;

  return (
    <div className="clay-sm p-5 clay-hover">
      <div className="flex items-start justify-between mb-3">
        <div
          className="p-2.5 rounded-2xl"
          style={{ backgroundColor: `${color}12` }}
        >
          <div style={{ color }}>{icon}</div>
        </div>
      </div>
      <p className="text-2xl font-bold text-text-primary mb-1 tracking-tight">
        {displayValue}
      </p>
      <p className="text-sm font-semibold text-text-muted">{label}</p>
      {description && (
        <p className="text-xs text-text-muted mt-2 leading-relaxed font-medium">
          {description}
        </p>
      )}
    </div>
  );
}
