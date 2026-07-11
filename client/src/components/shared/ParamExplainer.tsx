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
      <h3 className="text-lg font-extrabold text-text-primary mb-5">
        🔍 What Each Parameter Does
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {params.map((param) => (
          <div key={param.name} className="clay-pressed p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{param.emoji}</span>
              <h4 className="text-sm font-extrabold text-text-primary">
                {param.name}
              </h4>
            </div>
            <p className="text-xs text-text-secondary font-medium leading-relaxed">
              {param.description}
            </p>
            <p className="text-xs font-bold text-accent">
              💡 Impact: {param.impact}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
