interface ParamExplainerProps {
  params: {
    name: string;
    description: string;
    impact: string;
    emoji: string;
  }[];
}

export default function ParamExplainer({ params }: ParamExplainerProps) {
  return (
    <div className="clay p-6">
      <h3
        className="text-lg font-bold text-gold-light font-royal mb-5 border-b border-surface-border/50 pb-3"
      >
        The Small Council Advises
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {params.map((param) => (
          <div key={param.name} className="clay-pressed p-4 space-y-2">
            <h4 className="text-sm font-bold text-text-primary font-royal">
              {param.name}
            </h4>
            <p className="text-xs text-text-secondary font-medium leading-relaxed">
              {param.description}
            </p>
            <p className="text-xs font-bold text-accent font-royal">
              Impact: {param.impact}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
