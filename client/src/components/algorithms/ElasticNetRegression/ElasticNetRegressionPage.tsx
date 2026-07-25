import { useEffect } from "react";
import Plot from "react-plotly.js";
import { TrendingUp, Target, BarChart3, Percent, Scissors } from "lucide-react";
import { useAlgorithm } from "@/hooks/useAlgorithm";
import {
  ControlPanel,
  MetricCard,
  TheorySection,
  ParamExplainer,
  CodeSection,
  RegularizationPath,
  BiasVarianceCurve,
  LearningCurve,
} from "@/components/shared";
import type { HyperParam } from "@/types";

/* ----- Request / Response types ----- */

interface ElasticNetRequest {
  n_samples: number;
  noise: number;
  test_size: number;
  random_state: number;
  fit_intercept: boolean;
  degree: number;
  alpha: number;
  l1_ratio: number;
  [key: string]: unknown;
}

interface ElasticNetResponse {
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
  equation: string;
  coefficients: number[];
  intercept: number;
  n_zero_coefs: number;
  n_nonzero_coefs: number;
  total_coefs: number;
  model_params: Record<string, unknown>;
}

/* ----- Hyperparameter config ----- */

const hyperParams: HyperParam[] = [
  {
    type: "slider",
    label: "Alpha (Penalty Strength)",
    key: "alpha",
    min: 0,
    max: 100,
    step: 0.1,
    default: 1.0,
    description: "Overall regularization strength. Higher values constrain the model more.",
  },
  {
    type: "slider",
    label: "L1 Ratio (Lasso vs Ridge)",
    key: "l1_ratio",
    min: 0,
    max: 1,
    step: 0.05,
    default: 0.5,
    description: "0 = Pure Ridge (L2). 1 = Pure Lasso (L1). In between = Elastic Net mix.",
  },
  {
    type: "slider",
    label: "Degree",
    key: "degree",
    min: 1,
    max: 25,
    step: 1,
    default: 15,
    description: "The degree of the polynomial. Elastic Net will shrink or eliminate unnecessary terms.",
  },
  {
    type: "slider",
    label: "Samples",
    key: "n_samples",
    min: 20,
    max: 500,
    step: 10,
    default: 100,
    description: "Number of data points to generate.",
  },
  {
    type: "slider",
    label: "Noise",
    key: "noise",
    min: 0,
    max: 50,
    step: 1,
    default: 10,
    description: "Standard deviation of Gaussian noise added to data.",
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
    description: "Seed for data generation.",
  },
];

/* ----- Theory content ----- */

const theoryContent = [
  {
    heading: "What is Elastic Net?",
    emoji: "🕸️",
    content:
      "Elastic Net is a hybrid approach that combines both L1 (Lasso) and L2 (Ridge) penalties. It aims to overcome the limitations of each individual method. Lasso can randomly select one feature among a group of highly correlated features, while Ridge shrinks them together. Elastic Net gets the best of both worlds.",
  },
  {
    heading: "The Math (L1 + L2)",
    emoji: "🧮",
    content:
      "Elastic Net minimizes: SSR + α * l1_ratio * Σ|βᵢ| + 0.5 * α * (1 - l1_ratio) * Σ(βᵢ²)\n\nWhere:\n• α (alpha) controls the overall penalty strength\n• l1_ratio controls the mix (0 = Ridge, 1 = Lasso)",
  },
  {
    heading: "Why use it?",
    emoji: "⚔️",
    content:
      "When you have many correlated features, Lasso might arbitrarily zero out some of them. Elastic Net tends to either keep or drop highly correlated features together. It's particularly useful when the number of features (p) is greater than the number of samples (n).",
  },
];

/* ----- Param explainer content ----- */

const paramExplainerData = [
  {
    name: "Alpha",
    description: "The overall magnitude of the regularization penalty.",
    impact: "Alpha = 0: No regularization. Large alpha: Severe underfitting, most coefficients near zero.",
    emoji: "⚖️",
  },
  {
    name: "L1 Ratio",
    description: "The balance between L1 (Lasso) and L2 (Ridge) penalties.",
    impact: "Ratio = 0: Pure Ridge (shrinks all). Ratio = 1: Pure Lasso (sparse, feature selection). Ratio = 0.5: Equal mix.",
    emoji: "🎛️",
  },
  {
    name: "Degree",
    description: "The highest power of the variable used in the polynomial equation.",
    impact: "High degree allows complex curves. The penalties will automatically down-weight or remove unnecessary higher powers.",
    emoji: "📈",
  },
];

/* ----- Plotly layout helpers ----- */

const plotLayout = {
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(28,28,33,0.5)",
  font: {
    family: "Inter, sans-serif",
    color: "#A1A1AA",
  },
  margin: { t: 40, r: 20, b: 50, l: 60 },
  xaxis: {
    gridcolor: "rgba(46,46,56,0.6)",
    title: { text: "X", font: { size: 13, color: "#71717A" } },
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

/* ----- Component ----- */

export default function ElasticNetRegressionPage() {
  const { params, setParam, result, loading, error, train } = useAlgorithm<
    ElasticNetRequest,
    ElasticNetResponse
  >({
    endpoint: "/regression/elastic-net",
    defaultParams: {
      n_samples: 100,
      noise: 10,
      test_size: 0.2,
      random_state: 42,
      fit_intercept: true,
      degree: 15,
      alpha: 1.0,
      l1_ratio: 0.5,
    },
  });

  // Auto-train on mount
  useEffect(() => {
    train();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Theory */}
      <TheorySection title="📚 Theory & Intuition" sections={theoryContent} />

      {/* Controls + Visualization side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(300px,1fr)_2fr] gap-8">
        {/* Controls */}
        <div className="space-y-4">
          <ControlPanel
            params={hyperParams}
            values={params as unknown as Record<string, number | string>}
            onChange={(key, value) => setParam(key, value)}
            onRun={train}
            loading={loading}
          />

          {/* Equation display */}
          {result && (
            <div className="clay-sm p-5 animate-bounce-in">
              <h4 className="text-sm font-extrabold text-text-muted mb-2">
                📝 Learned Equation
              </h4>
              <p className="text-lg font-black text-primary tracking-tight">
                {result.equation}
              </p>
            </div>
          )}

          {/* Sparsity indicator */}
          {result && (
            <div className="clay-sm p-5 animate-bounce-in">
              <h4 className="text-sm font-extrabold text-text-muted mb-3 flex items-center gap-2">
                <Scissors className="h-4 w-4 text-accent" />
                Feature Selection (Sparsity)
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Total Coefficients</span>
                  <span className="text-sm font-bold text-text-primary">{result.total_coefs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Zeroed Out (Eliminated)</span>
                  <span className="text-sm font-bold text-error">{result.n_zero_coefs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Surviving Features</span>
                  <span className="text-sm font-bold text-success">{result.n_nonzero_coefs}</span>
                </div>
                {/* Visual bar */}
                <div className="w-full h-3 bg-surface-hover rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${(result.n_nonzero_coefs / result.total_coefs) * 100}%`,
                      background: "linear-gradient(90deg, #22C55E, #4ADE80)",
                    }}
                  />
                </div>
                <p className="text-xs text-text-muted">
                  With L1 Ratio = {params.l1_ratio}, Elastic Net eliminated{" "}
                  <span className="font-bold text-error">
                    {Math.round((result.n_zero_coefs / result.total_coefs) * 100)}%
                  </span>{" "}
                  of terms.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Plots */}
        <div className="space-y-6">
          {error && (
            <div className="clay-pressed p-4 text-error font-bold text-sm animate-fade-in">
              ❌ Error: {error}
            </div>
          )}

          {result && (
            <>
              {/* Main scatter + regression line */}
              <div className="clay p-4">
                <Plot
                  data={[
                    {
                      x: result.plot_data.x_train,
                      y: result.plot_data.y_train,
                      mode: "markers",
                      type: "scatter",
                      name: "Train Data",
                      marker: {
                        color: "#DC2626",
                        size: 8,
                        opacity: 0.7,
                        line: { width: 1, color: "rgba(0,0,0,0.3)" },
                      },
                    },
                    {
                      x: result.plot_data.x_test,
                      y: result.plot_data.y_test,
                      mode: "markers",
                      type: "scatter",
                      name: "Test Data",
                      marker: {
                        color: "#FF5A1F",
                        size: 9,
                        symbol: "diamond",
                        opacity: 0.8,
                        line: { width: 1, color: "rgba(0,0,0,0.3)" },
                      },
                    },
                    {
                      x: result.plot_data.x_line,
                      y: result.plot_data.y_line,
                      mode: "lines",
                      type: "scatter",
                      name: "Regression Line",
                      line: {
                        color: "#F59E0B",
                        width: 3,
                        dash: undefined,
                      },
                    },
                  ]}
                  layout={{
                    ...plotLayout,
                    title: {
                      text: "Elastic Net Fit",
                      font: { size: 16, color: "#F8FAFC", family: "Cinzel, serif" },
                    },
                    autosize: true,
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  useResizeHandler
                  style={{ width: "100%", height: "420px" }}
                />
              </div>

              {/* Coefficient bar chart — shows which coefficients survived */}
              <div className="clay p-4">
                <Plot
                  data={[
                    {
                      x: result.coefficients.map((_, i) => `x^${i + 1}`),
                      y: result.coefficients,
                      type: "bar",
                      name: "Coefficient Value",
                      marker: {
                        color: result.coefficients.map((c) =>
                          Math.abs(c) < 1e-10 ? "#3F3F46" : "#DC2626"
                        ),
                        line: {
                          color: result.coefficients.map((c) =>
                            Math.abs(c) < 1e-10 ? "#52525B" : "#F59E0B"
                          ),
                          width: 1,
                        },
                      },
                    },
                  ]}
                  layout={{
                    ...plotLayout,
                    title: {
                      text: "Coefficient Magnitudes (Zeroed = Gray)",
                      font: { size: 16, color: "#F8FAFC", family: "Cinzel, serif" },
                    },
                    yaxis: {
                      ...plotLayout.yaxis,
                      title: {
                        text: "Coefficient Value",
                        font: { size: 13, color: "#71717A" },
                      },
                    },
                    xaxis: {
                      ...plotLayout.xaxis,
                      title: {
                        text: "Polynomial Term",
                        font: { size: 13, color: "#71717A" },
                      },
                    },
                    autosize: true,
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  useResizeHandler
                  style={{ width: "100%", height: "340px" }}
                />
              </div>

              {/* Residuals plot */}
              <div className="clay p-4">
                <Plot
                  data={[
                    {
                      x: result.plot_data.x_train,
                      y: result.plot_data.residuals_train,
                      mode: "markers",
                      type: "scatter",
                      name: "Train Residuals",
                      marker: {
                        color: "#DC2626",
                        size: 7,
                        opacity: 0.7,
                      },
                    },
                    {
                      x: result.plot_data.x_test,
                      y: result.plot_data.residuals_test,
                      mode: "markers",
                      type: "scatter",
                      name: "Test Residuals",
                      marker: {
                        color: "#FF5A1F",
                        size: 8,
                        symbol: "diamond",
                        opacity: 0.8,
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
                      mode: "lines",
                      type: "scatter",
                      name: "Zero Line",
                      line: { color: "#71717A", width: 1.5, dash: "dash" },
                      showlegend: false,
                    },
                  ]}
                  layout={{
                    ...plotLayout,
                    title: {
                      text: "Residuals Plot",
                      font: { size: 16, color: "#F8FAFC", family: "Cinzel, serif" },
                    },
                    yaxis: {
                      ...plotLayout.yaxis,
                      title: {
                        text: "Residual (y - ŷ)",
                        font: { size: 13, color: "#71717A" },
                      },
                    },
                    autosize: true,
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  useResizeHandler
                  style={{ width: "100%", height: "340px" }}
                />
              </div>
            </>
          )}

          {!result && !loading && (
            <div className="clay p-16 text-center">
              <p className="text-text-muted font-bold text-lg">
                👆 Adjust parameters and click{" "}
                <span className="text-primary">Train Model</span> to see
                results
              </p>
            </div>
          )}

          {loading && !result && (
            <div className="clay p-16 text-center">
              <div className="inline-block w-8 h-8 border-3 border-surface-border border-t-primary rounded-full animate-spin mb-4" />
              <p className="text-text-muted font-bold">Training model...</p>
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
              icon={<Percent className="h-5 w-5" />}
              color="#F59E0B"
              description="How much variance is explained by the model (1.0 = perfect)"
            />
            <MetricCard
              label="MSE"
              value={result.metrics.mse}
              icon={<Target className="h-5 w-5" />}
              color="#DC2626"
              description="Mean Squared Error — average of squared differences"
            />
            <MetricCard
              label="RMSE"
              value={result.metrics.rmse}
              icon={<BarChart3 className="h-5 w-5" />}
              color="#FF5A1F"
              description="Root MSE — in the same units as y"
            />
            <MetricCard
              label="MAE"
              value={result.metrics.mae}
              icon={<TrendingUp className="h-5 w-5" />}
              color="#22C55E"
              description="Mean Absolute Error — average absolute difference"
            />
          </div>
        </div>
      )}

      {/* Param explainer */}
      <ParamExplainer params={paramExplainerData} />

      {/* Code Reference */}
      <CodeSection snippets={[
        {
          title: "Import & Train",
          code: `from sklearn.linear_model import ElasticNet
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error
import numpy as np

X = np.random.rand(100, 10)
y = X[:, :3] @ np.array([5, -3, 2]) + np.random.randn(100) * 0.5

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ElasticNet combines L1 + L2 regularization
# l1_ratio=0 is pure Ridge, l1_ratio=1 is pure Lasso
model = ElasticNet(alpha=0.1, l1_ratio=0.5, max_iter=10000)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
print("R² Score:", r2_score(y_test, y_pred))
print("Coefficients:", model.coef_)
print("Non-zero features:", np.sum(model.coef_ != 0))`,
        },
      ]} />

      {/* ===== Interactive Analysis ===== */}
      <div className="flex items-center gap-4 my-4">
        <div className="h-px flex-1 bg-surface-border" />
        <span className="text-text-muted font-extrabold text-sm px-4 py-2 clay-sm">
          ⚡ Interactive Analysis
        </span>
        <div className="h-px flex-1 bg-surface-border" />
      </div>

      <RegularizationPath
        modelType="elasticnet"
        degree={params.degree as number}
        noise={params.noise as number}
        randomState={params.random_state as number}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <BiasVarianceCurve
          modelType="elasticnet"
          sweepParam="alpha"
          noise={params.noise as number}
          alpha={params.alpha as number}
          randomState={params.random_state as number}
        />
        <LearningCurve
          modelType="elasticnet"
          degree={params.degree as number}
          alpha={params.alpha as number}
          noise={params.noise as number}
          randomState={params.random_state as number}
        />
      </div>

    </div>
  );
}
