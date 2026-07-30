import { useEffect } from "react";
import Plot from "react-plotly.js";
import { TrendingUp, Target, BarChart3, Calculator, Trees } from "lucide-react";
import { useAlgorithm } from "@/hooks/useAlgorithm";
import {
  ControlPanel,
  MetricCard,
  TheorySection,
  ParamExplainer,
  CodeSection,
} from "@/components/shared";
import type { HyperParam } from "@/types";

/* ----- Request / Response types ----- */

interface RFRegressorRequest {
  n_samples: number;
  noise: number;
  test_size: number;
  random_state: number;
  dataset_type: string;
  n_estimators: number;
  criterion: string;
  max_depth: number;
  min_samples_split: number;
  min_samples_leaf: number;
  max_features: string;
  bootstrap: boolean;
  [key: string]: unknown;
}

interface RFRegressorResponse {
  metrics: {
    r2_score: number;
    mse: number;
    rmse: number;
    mae: number;
  };
  plot_data: {
    x_train: number[];
    y_train: number[];
    x_test: number[];
    y_test: number[];
    x_line: number[];
    y_line: number[];
    y_train_pred: number[];
    y_test_pred: number[];
    residuals_train: number[];
    residuals_test: number[];
  };
  feature_importances: number[];
  oob_score: number | null;
  n_estimators_actual: number;
  individual_predictions: {
    tree_index: number;
    y_pred: number[];
  }[];
  individual_x_line: number[];
  model_params: Record<string, unknown>;
}

/* ----- Hyperparameter config ----- */

const hyperParams: HyperParam[] = [
  {
    type: "select",
    label: "Dataset",
    key: "dataset_type",
    options: [
      { value: "sinusoidal", label: "Sinusoidal" },
      { value: "linear", label: "Linear" },
      { value: "quadratic", label: "Quadratic" },
      { value: "exponential", label: "Exponential" },
      { value: "step", label: "Step Function" },
    ],
    default: "sinusoidal",
    description: "Shape of the synthetic regression dataset.",
  },
  {
    type: "slider",
    label: "Number of Trees",
    key: "n_estimators",
    min: 1,
    max: 300,
    step: 1,
    default: 100,
    description:
      "The number of decision trees in the forest. More trees produce smoother predictions.",
  },
  {
    type: "select",
    label: "Criterion",
    key: "criterion",
    options: [
      { value: "squared_error", label: "Squared Error (MSE)" },
      { value: "absolute_error", label: "Absolute Error (MAE)" },
      { value: "friedman_mse", label: "Friedman MSE" },
    ],
    default: "squared_error",
    description: "The function used to measure split quality.",
  },
  {
    type: "slider",
    label: "Max Depth",
    key: "max_depth",
    min: 0,
    max: 30,
    step: 1,
    default: 0,
    description:
      "Maximum depth of each tree. 0 = unlimited.",
  },
  {
    type: "select",
    label: "Max Features",
    key: "max_features",
    options: [
      { value: "sqrt", label: "√n (Square Root)" },
      { value: "log2", label: "log₂(n)" },
      { value: "none", label: "All Features" },
    ],
    default: "sqrt",
    description:
      "Number of features to consider at each split.",
  },
  {
    type: "slider",
    label: "Min Samples Split",
    key: "min_samples_split",
    min: 2,
    max: 20,
    step: 1,
    default: 2,
    description: "Minimum samples required to split a node.",
  },
  {
    type: "slider",
    label: "Min Samples Leaf",
    key: "min_samples_leaf",
    min: 1,
    max: 20,
    step: 1,
    default: 1,
    description: "Minimum samples required at each leaf.",
  },
  {
    type: "slider",
    label: "Samples",
    key: "n_samples",
    min: 50,
    max: 500,
    step: 10,
    default: 200,
    description: "Number of data points to generate.",
  },
  {
    type: "slider",
    label: "Noise",
    key: "noise",
    min: 1,
    max: 50,
    step: 1,
    default: 15,
    description: "Standard deviation of Gaussian noise added to the target.",
  },
  {
    type: "slider",
    label: "Test Split",
    key: "test_size",
    min: 0.1,
    max: 0.5,
    step: 0.05,
    default: 0.2,
    description: "Fraction of data held out for testing.",
  },
  {
    type: "slider",
    label: "Random Seed",
    key: "random_state",
    min: 0,
    max: 100,
    step: 1,
    default: 42,
    description: "Seed for reproducibility.",
  },
];

/* ----- Theory content ----- */

const theoryContent = [
  {
    heading: "Random Forest for Regression",
    emoji: "🌲",
    content:
      "Random Forest Regression trains an ensemble of decision tree regressors. Each tree predicts a continuous value, and the final prediction is the average of all trees' predictions. This averaging smooths out the step-function nature of individual decision trees, producing far better generalization.",
  },
  {
    heading: "Why Averaging Works",
    emoji: "📊",
    content:
      "A single decision tree regressor produces a piecewise-constant prediction (staircase shape). By averaging hundreds of trees — each trained on different bootstrap samples with random feature subsets — the ensemble produces a smooth, continuous prediction curve that closely tracks the true underlying function.",
  },
  {
    heading: "Bias-Variance Trade-off",
    emoji: "⚖️",
    content:
      "Individual decision trees have low bias but high variance (they overfit). Random Forest maintains the low bias while dramatically reducing variance through averaging. The variance reduction is:\n  Var(forest) ≈ ρσ²/T + (1-ρ)σ²\nWhere ρ is tree correlation, σ² is individual tree variance, and T is the number of trees.",
  },
];

/* ----- Param explainer ----- */

const paramExplainerData = [
  {
    name: "n_estimators (Number of Trees)",
    description: "Total number of decision trees in the forest.",
    impact:
      "More trees → smoother prediction curve. Watch the individual tree lines merge into the ensemble average. Diminishing returns after ~100 trees.",
    emoji: "🌲",
  },
  {
    name: "max_depth",
    description: "Maximum depth each individual tree can grow to.",
    impact:
      "Shallow trees → underfitting (flat staircase). Deep trees → tight fit to bootstrap sample. The ensemble averages out the overfitting.",
    emoji: "📏",
  },
  {
    name: "criterion",
    description: "Split quality measure for regression trees.",
    impact:
      "squared_error (MSE) is the standard choice. absolute_error (MAE) is more robust to outliers. friedman_mse uses a numerically improved variance estimate.",
    emoji: "📐",
  },
];

/* ----- Plotly layout ----- */

const plotLayout = {
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(28,28,33,0.5)",
  font: { family: "Inter, sans-serif", color: "#A1A1AA" },
  margin: { t: 40, r: 20, b: 50, l: 60 },
  xaxis: {
    gridcolor: "rgba(46,46,56,0.6)",
    title: { text: "x", font: { size: 13, color: "#71717A" } },
    zerolinecolor: "rgba(46,46,56,0.8)",
  },
  yaxis: {
    gridcolor: "rgba(46,46,56,0.6)",
    title: { text: "y", font: { size: 13, color: "#71717A" } },
    zerolinecolor: "rgba(46,46,56,0.8)",
  },
  legend: {
    bgcolor: "rgba(28,28,33,0.9)",
    bordercolor: "rgba(46,46,56,0.5)",
    borderwidth: 1,
    font: { size: 12, color: "#A1A1AA" },
  },
};

const treeColors = [
  "rgba(251,191,36,0.35)",
  "rgba(244,114,182,0.35)",
  "rgba(129,140,248,0.35)",
  "rgba(52,211,153,0.35)",
  "rgba(251,146,60,0.35)",
];

/* ----- Component ----- */

export default function RandomForestRegressionPage() {
  const { params, setParam, result, loading, error, train } = useAlgorithm<
    RFRegressorRequest,
    RFRegressorResponse
  >({
    endpoint: "/ensemble/random-forest/regress",
    defaultParams: {
      n_samples: 200,
      noise: 15,
      test_size: 0.2,
      random_state: 42,
      dataset_type: "sinusoidal",
      n_estimators: 100,
      criterion: "squared_error",
      max_depth: 0,
      min_samples_split: 2,
      min_samples_leaf: 1,
      max_features: "sqrt",
      bootstrap: true,
    },
  });

  useEffect(() => {
    train();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Theory */}
      <TheorySection title="📚 Theory & Intuition" sections={theoryContent} />

      {/* Controls + Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(300px,1fr)_2fr] gap-8">
        <div className="space-y-4">
          <ControlPanel
            params={hyperParams}
            values={params as unknown as Record<string, number | string>}
            onChange={(key, value) => setParam(key, value)}
            onRun={train}
            loading={loading}
          />

          {/* Forest Stats */}
          {result && (
            <div className="clay-sm p-5 animate-bounce-in">
              <h4 className="text-sm font-extrabold text-text-muted mb-3 flex items-center gap-2">
                <Trees className="h-4 w-4 text-emerald-400" />
                Forest Statistics
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Trees</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {result.n_estimators_actual}
                  </span>
                </div>
                {result.oob_score !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">OOB R²</span>
                    <span className="text-lg font-bold text-amber-400">
                      {result.oob_score.toFixed(3)}
                    </span>
                  </div>
                )}
                <div className="space-y-2">
                  {result.feature_importances.map((imp, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs text-text-muted">
                        <span>Feature {idx + 1}</span>
                        <span className="font-bold text-emerald-300">
                          {(imp * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-surface-hover rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${imp * 100}%`,
                            background: "linear-gradient(90deg, #059669, #34D399)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Plot area */}
        <div className="space-y-6">
          {error && (
            <div className="clay-pressed p-4 text-error font-bold text-sm animate-fade-in">
              ❌ Error: {error}
            </div>
          )}

          {result && (
            <>
              {/* Prediction plot with individual trees */}
              <div className="clay p-4">
                <Plot
                  data={[
                    // Individual tree predictions (faint lines)
                    ...result.individual_predictions.map((treePred, idx) => ({
                      x: result.individual_x_line,
                      y: treePred.y_pred,
                      mode: "lines" as const,
                      type: "scatter" as const,
                      name: `Tree #${treePred.tree_index + 1}`,
                      line: {
                        color: treeColors[idx % treeColors.length],
                        width: 1.5,
                        dash: "dot" as const,
                      },
                      opacity: 0.6,
                    })),
                    // Train data
                    {
                      x: result.plot_data.x_train,
                      y: result.plot_data.y_train,
                      mode: "markers" as const,
                      type: "scatter" as const,
                      name: "Train Data",
                      marker: {
                        color: "#059669",
                        size: 6,
                        opacity: 0.7,
                        line: { color: "#064E3B", width: 1 },
                      },
                    },
                    // Test data
                    {
                      x: result.plot_data.x_test,
                      y: result.plot_data.y_test,
                      mode: "markers" as const,
                      type: "scatter" as const,
                      name: "Test Data",
                      marker: {
                        color: "#F59E0B",
                        size: 8,
                        symbol: "diamond",
                        line: { color: "#fff", width: 1.5 },
                      },
                    },
                    // Ensemble prediction line (bold)
                    {
                      x: result.plot_data.x_line,
                      y: result.plot_data.y_line,
                      mode: "lines" as const,
                      type: "scatter" as const,
                      name: "Ensemble Prediction",
                      line: {
                        color: "#DC2626",
                        width: 3.5,
                      },
                    },
                  ]}
                  layout={{
                    ...plotLayout,
                    title: {
                      text: "Random Forest — Ensemble Regression",
                      font: { size: 15, color: "#E4E4E7", family: "Inter, sans-serif" },
                    },
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  useResizeHandler
                  style={{ width: "100%", height: "500px" }}
                />
              </div>

              {/* Residuals */}
              <div className="clay p-4">
                <Plot
                  data={[
                    {
                      x: result.plot_data.x_train,
                      y: result.plot_data.residuals_train,
                      mode: "markers" as const,
                      type: "scatter" as const,
                      name: "Train Residuals",
                      marker: {
                        color: "#059669",
                        size: 6,
                        opacity: 0.7,
                      },
                    },
                    {
                      x: result.plot_data.x_test,
                      y: result.plot_data.residuals_test,
                      mode: "markers" as const,
                      type: "scatter" as const,
                      name: "Test Residuals",
                      marker: {
                        color: "#F59E0B",
                        size: 8,
                        symbol: "diamond",
                      },
                    },
                    {
                      x: [
                        Math.min(
                          ...result.plot_data.x_train,
                          ...result.plot_data.x_test
                        ),
                        Math.max(
                          ...result.plot_data.x_train,
                          ...result.plot_data.x_test
                        ),
                      ],
                      y: [0, 0],
                      mode: "lines" as const,
                      type: "scatter" as const,
                      name: "Zero",
                      line: { color: "#DC2626", width: 1.5, dash: "dash" as const },
                      showlegend: false,
                    },
                  ]}
                  layout={{
                    ...plotLayout,
                    title: {
                      text: "Residual Plot",
                      font: { size: 15, color: "#E4E4E7", family: "Inter, sans-serif" },
                    },
                    yaxis: {
                      ...plotLayout.yaxis,
                      title: {
                        text: "Residual (y - ŷ)",
                        font: { size: 13, color: "#71717A" },
                      },
                    },
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  useResizeHandler
                  style={{ width: "100%", height: "350px" }}
                />
              </div>
            </>
          )}

          {!result && !loading && (
            <div className="clay p-16 text-center">
              <p className="text-text-muted font-bold text-lg">
                👆 Adjust parameters and click{" "}
                <span className="text-primary">Train Model</span> to see results
              </p>
            </div>
          )}

          {loading && !result && (
            <div className="clay p-16 text-center">
              <div className="inline-block w-8 h-8 border-3 border-surface-border border-t-primary rounded-full animate-spin mb-4" />
              <p className="text-text-muted font-bold">Growing the forest...</p>
            </div>
          )}
        </div>
      </div>

      {/* Metrics */}
      {result && (
        <div className="animate-slide-up">
          <h3 className="text-lg font-extrabold text-text-primary mb-4">
            📊 Model Metrics
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="R² Score"
              value={result.metrics.r2_score}
              icon={<TrendingUp className="h-5 w-5" />}
              color="#22C55E"
              format="decimal"
              description="Proportion of variance explained by the model"
            />
            <MetricCard
              label="RMSE"
              value={result.metrics.rmse}
              icon={<Target className="h-5 w-5" />}
              color="#3B82F6"
              format="decimal"
              description="Root mean squared error"
            />
            <MetricCard
              label="MAE"
              value={result.metrics.mae}
              icon={<BarChart3 className="h-5 w-5" />}
              color="#F59E0B"
              format="decimal"
              description="Mean absolute error"
            />
            <MetricCard
              label="MSE"
              value={result.metrics.mse}
              icon={<Calculator className="h-5 w-5" />}
              color="#DC2626"
              format="decimal"
              description="Mean squared error"
            />
          </div>
        </div>
      )}

      {/* Param explainer */}
      <ParamExplainer params={paramExplainerData} />

      {/* Code Reference */}
      <CodeSection
        snippets={[
          {
            title: "Import & Train",
            code: `from sklearn.ensemble import RandomForestRegressor
from sklearn.datasets import make_regression
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error

X, y = make_regression(
    n_samples=200, n_features=1, noise=15, random_state=42
)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = RandomForestRegressor(
    n_estimators=100,
    criterion="squared_error",
    max_depth=None,
    max_features="sqrt",
    bootstrap=True,
    oob_score=True,
    random_state=42,
    n_jobs=-1,
)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
print("R²:", r2_score(y_test, y_pred))
print("RMSE:", mean_squared_error(y_test, y_pred, squared=False))
print("OOB R²:", model.oob_score_)`,
          },
        ]}
      />
    </div>
  );
}
