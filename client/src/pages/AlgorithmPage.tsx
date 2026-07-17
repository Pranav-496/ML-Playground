import { useParams, Link } from "react-router-dom";
import { Sword, Construction, ArrowLeft } from "lucide-react";
import { algorithms } from "@/config/algorithms";
import { cn } from "@/lib/utils";
import { categoryBgColors, categoryColors, categoryLabels } from "@/config/algorithms";

// Algorithm page components
import LinearRegressionPage from "@/components/algorithms/LinearRegression/LinearRegressionPage";
import PolynomialRegressionPage from "@/components/algorithms/PolynomialRegression/PolynomialRegressionPage";
import RidgeRegressionPage from "@/components/algorithms/RidgeRegression/RidgeRegressionPage";
import LassoRegressionPage from "@/components/algorithms/LassoRegression/LassoRegressionPage";
import ElasticNetRegressionPage from "@/components/algorithms/ElasticNetRegression/ElasticNetRegressionPage";
import LogisticRegressionPage from "@/components/algorithms/LogisticRegression/LogisticRegressionPage";
import KnnPage from "@/components/algorithms/Knn/KnnPage";
import DecisionTreePage from "@/components/algorithms/DecisionTree/DecisionTreePage";
import KnnRegressionPage from "@/components/algorithms/KnnRegression/KnnRegressionPage";

/* Map slug → component */
const algorithmPages: Record<string, React.ComponentType> = {
  "linear-regression": LinearRegressionPage,
  "polynomial-regression": PolynomialRegressionPage,
  "ridge-regression": RidgeRegressionPage,
  "lasso-regression": LassoRegressionPage,
  "elastic-net": ElasticNetRegressionPage,
  "logistic-regression": LogisticRegressionPage,
  "knn": KnnPage,
  "decision-tree": DecisionTreePage,
  "knn-regression": KnnRegressionPage,
};

export default function AlgorithmPage() {
  const { slug } = useParams<{ slug: string }>();
  const algorithm = algorithms.find((a) => a.slug === slug);

  if (!algorithm) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-bounce-in">
        <div className="clay-lg p-10 text-center">
          <Sword className="h-12 w-12 text-primary mx-auto mb-4 opacity-50" />
          <h2
            className="text-2xl font-bold text-text-primary mb-2"
            style={{ fontFamily: '"Cinzel", serif' }}
          >
            Discipline Not Found
          </h2>
          <p className="text-text-secondary font-medium mb-6">
            This discipline has not yet been forged.
          </p>
          <Link to="/algorithms" className="clay-btn clay-btn-primary">
            <ArrowLeft className="h-4 w-4" />
            Browse Disciplines
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
        className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        All Disciplines
      </Link>

      {/* Header */}
      <div className="clay-lg p-8 mb-8">
        <div className="flex items-start gap-5">
          <div
            className="p-4 rounded-2xl shrink-0"
            style={{
              backgroundColor: `${algorithm.color}12`,
              boxShadow: `3px 3px 10px rgba(0,0,0,0.4), -2px -2px 6px rgba(50,50,60,0.1), 0 0 15px ${algorithm.color}15`,
            }}
          >
            <Sword className="h-8 w-8" style={{ color: algorithm.color }} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1
                className="text-3xl sm:text-4xl font-bold text-text-primary"
                style={{ fontFamily: '"Cinzel", serif' }}
              >
                {algorithm.name}
              </h1>
              <span
                className={cn(
                  "pill border text-xs font-bold",
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
          <div className="inline-block p-5 rounded-3xl bg-accent/10 mb-6 animate-float">
            <Construction className="h-10 w-10 text-accent" />
          </div>
          <h3
            className="text-2xl font-bold text-text-primary mb-3"
            style={{ fontFamily: '"Cinzel", serif' }}
          >
            Being Forged
          </h3>
          <p className="text-text-secondary text-center max-w-md mx-auto font-medium leading-relaxed">
            The interactive demo for <strong>{algorithm.name}</strong> is being
            forged. Soon you'll wield live visualizations, tunable hyperparameters,
            and deep knowledge.
          </p>
        </div>
      )}
    </div>
  );
}
