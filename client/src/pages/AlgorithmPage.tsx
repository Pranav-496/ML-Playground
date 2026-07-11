import { useParams, Link } from "react-router-dom";
import { Brain, Construction, ArrowLeft } from "lucide-react";
import { algorithms } from "@/config/algorithms";
import { cn } from "@/lib/utils";
import { categoryBgColors, categoryColors, categoryLabels } from "@/config/algorithms";

// Algorithm page components
import LinearRegressionPage from "@/components/algorithms/LinearRegression/LinearRegressionPage";

/* Map slug → component */
const algorithmPages: Record<string, React.ComponentType> = {
  "linear-regression": LinearRegressionPage,
};

export default function AlgorithmPage() {
  const { slug } = useParams<{ slug: string }>();
  const algorithm = algorithms.find((a) => a.slug === slug);

  if (!algorithm) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-bounce-in">
        <div className="clay-lg p-10 text-center">
          <span className="text-5xl mb-4 block">🔍</span>
          <h2 className="text-2xl font-black text-text-primary mb-2">
            Algorithm Not Found
          </h2>
          <p className="text-text-secondary font-medium mb-6">
            The algorithm you're looking for doesn't exist yet.
          </p>
          <Link to="/algorithms" className="clay-btn clay-btn-primary">
            <ArrowLeft className="h-4 w-4" />
            Browse Algorithms
          </Link>
        </div>
      </div>
    );
  }

  const PageComponent = slug ? algorithmPages[slug] : undefined;

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Breadcrumb */}
      <Link
        to="/algorithms"
        className="inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        All Algorithms
      </Link>

      {/* Header */}
      <div className="clay-lg p-8 mb-8">
        <div className="flex items-start gap-5">
          <div
            className="p-4 rounded-2xl shrink-0"
            style={{
              backgroundColor: `${algorithm.color}15`,
              boxShadow:
                "3px 3px 8px rgba(166,140,116,0.15), -2px -2px 6px rgba(255,255,255,0.6)",
            }}
          >
            <Brain className="h-8 w-8" style={{ color: algorithm.color }} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl font-black text-text-primary">
                {algorithm.name}
              </h1>
              <span
                className={cn(
                  "pill border text-xs font-extrabold",
                  categoryBgColors[algorithm.category],
                  categoryColors[algorithm.category]
                )}
              >
                {categoryLabels[algorithm.category]}
              </span>
            </div>
            <p className="text-text-secondary font-medium text-lg">
              {algorithm.description}
            </p>
          </div>
        </div>
      </div>

      {/* Algorithm-specific content */}
      {PageComponent ? (
        <PageComponent />
      ) : (
        <div className="clay-lg p-14 text-center">
          <div className="inline-block p-5 rounded-3xl bg-[#f5a623]/10 mb-6 animate-float">
            <Construction className="h-10 w-10 text-accent" />
          </div>
          <h3 className="text-2xl font-black text-text-primary mb-3">
            Building Something Cool{" "}
            <span className="animate-wiggle inline-block">🔧</span>
          </h3>
          <p className="text-text-secondary text-center max-w-md mx-auto font-medium leading-relaxed">
            The interactive demo for <strong>{algorithm.name}</strong> is being
            built. Soon you'll see live visualizations, tunable hyperparameters,
            and deep educational content.
          </p>
        </div>
      )}
    </div>
  );
}
