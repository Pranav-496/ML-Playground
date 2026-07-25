import { useEffect } from "react";
import Plot from "react-plotly.js";
import { TrendingUp, Target, BarChart3, Percent, CircleDot } from "lucide-react";
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

interface SvrRequest {
  n_samples: number;
  noise: number;
  test_size: number;
  random_state: number;
  C: number;
  kernel: string;
  gamma: string;
  epsilon: number;
  degree: number;
  [key: string]: unknown;
}

interface SvrResponse {
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
    y_line_upper: number[];
    y_line_lower: number[];
    y_train_pred: number[];
    y_test_pred: number[];
    residuals_train: number[];
    residuals_test: number[];
    support_vectors_x: number[];
    support_vectors_y: number[];
  };
  equation: string;
  n_support_vectors: number;
  model_params: Record<string, unknown>;
}

/* ----- Hyperparameter config ----- */

const hyperParams: HyperParam[] = [
  {
    type: "select",
    label: "Kernel",
    key: "kernel",
    options: [
      { value: "rbf", label: "RBF (Gaussian)" },
      { value: "linear", label: "Linear" },
      { value: "poly", label: "Polynomial" },
      { value: "sigmoid", label: "Sigmoid" },
    ],
    default: "rbf",
    description: "The kernel function defines how SVR models non-linear relationships.",
  },
  {
    type: "slider",
    label: "C (Regularization)",
    key: "C",
    min: 0.01,
    max: 100,
    step: 0.1,
    default: 1.0,
    description: "How much to penalize points outside the epsilon-tube. High C = tighter fit to data.",
  },
  {
    type: "slider",
    label: "Epsilon (ε-tube width)",
    key: "epsilon",
    min: 0.01,
    max: 50,
    step: 0.5,
    default: 0.1,
    description: "Width of the insensitive tube. Points inside the tube incur ZERO penalty. This is the key concept of SVR.",
  },
  {
    type: "slider",
    label: "Degree (Poly Kernel)",
    key: "degree",
    min: 2,
    max: 8,
    step: 1,
    default: 3,
    description: "Degree of the polynomial kernel. Only used when kernel is 'poly'.",
  },
  {
    type: "slider",
    label: "Samples",
    key: "n_samples",
    min: 30,
    max: 300,
    step: 10,
    default: 100,
    description: "Number of data points to generate.",
  },
  {
    type: "slider",
    label: "Noise",
    key: "noise",
    min: 1,
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
    description: "Fraction held out for testing.",
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
    heading: "What is SVR?",
    emoji: "📏",
    content:
      "Support Vector Regression adapts SVM for continuous prediction. Instead of finding a maximum-margin hyperplane between classes, SVR finds a tube (defined by ε) that best approximates the data. Points inside the tube contribute no loss — only points outside the tube are penalized.",
  },
  {
    heading: "The ε-insensitive Tube",
    emoji: "🔲",
    content:
      "The epsilon (ε) parameter defines a margin of tolerance where no penalty is given to errors. If ε = 5, any prediction within 5 units of the true value is considered 'good enough.' This makes SVR robust to small fluctuations and noise.",
  },
  {
    heading: "The Math",
    emoji: "🧮",
    content:
      "SVR minimizes: ½||w||² + C Σ (ξᵢ + ξᵢ*)\nSubject to:\n  yᵢ - (w·xᵢ + b) ≤ ε + ξᵢ\n  (w·xᵢ + b) - yᵢ ≤ ε + ξᵢ*\n\nξᵢ, ξᵢ* ≥ 0 are slack variables for points outside the tube.",
  },
  {
    heading: "Support Vectors in SVR",
    emoji: "📌",
    content:
      "In SVR, support vectors are the points that lie ON or OUTSIDE the ε-tube boundary. Points strictly inside the tube don't influence the model at all. This is fundamentally different from ordinary regression where every point contributes to the fit.",
  },
];

/* ----- Param explainer ----- */

const paramExplainerData = [
  {
    name: "Epsilon (ε)",
    description: "The half-width of the insensitive tube around the prediction.",
    impact: "Small ε → tight tube, more support vectors, complex fit. Large ε → wide tube, fewer support vectors, smoother underfitting.",
    emoji: "📏",
  },
  {
    name: "C (Regularization)",
    description: "Penalty for points outside the epsilon tube.",
    impact: "Low C → wide margin, tolerates large errors outside the tube. High C → narrow margin, aggressively fits outliers.",
    emoji: "⚖️",
  },
  {
    name: "Kernel",
    description: "Maps the input to a higher-dimensional space for non-linear regression.",
    impact: "RBF: flexible non-linear curves. Linear: straight-line fit. Poly: polynomial curves.",
    emoji: "🔮",
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

export default function SvrPage() {
  const { params, setParam, result, loading, error, train } = useAlgorithm<
    SvrRequest,
    SvrResponse
  >({
    endpoint: "/regression/svr",
    defaultParams: {
      n_samples: 100,
      noise: 10,
      test_size: 0.2,
      random_state: 42,
      C: 1.0,
      kernel: "rbf",
      gamma: "scale",
      epsilon: 0.1,
      degree: 3,
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

          {/* Equation */}
          {result && (
            <div className="clay-sm p-5 animate-bounce-in">
              <h4 className="text-sm font-extrabold text-text-muted mb-2">
                📝 Model Description
              </h4>
              <p className="text-lg font-black text-primary tracking-tight">
                {result.equation}
              </p>
            </div>
          )}

          {/* Support Vector Stats */}
          {result && (
            <div className="clay-sm p-5 animate-bounce-in">
              <h4 className="text-sm font-extrabold text-text-muted mb-3 flex items-center gap-2">
                <CircleDot className="h-4 w-4 text-gold" />
                Support Vectors
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Count</span>
                  <span className="text-lg font-bold text-gold">{result.n_support_vectors}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">% of Training Data</span>
                  <span className="text-sm font-bold text-gold">
                    {Math.round((result.n_support_vectors / Math.round((params.n_samples as number) * (1 - (params.test_size as number)))) * 100)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-surface-hover rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.min(100, (result.n_support_vectors / Math.round((params.n_samples as number) * (1 - (params.test_size as number)))) * 100)}%`,
                      background: "linear-gradient(90deg, #F59E0B, #FBBF24)",
                    }}
                  />
                </div>
                <p className="text-xs text-text-muted">
                  Points outside the ε-tube (gold circles on the plot) are the only ones that influence the model.
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
              {/* Main plot: data + SVR fit + epsilon tube + support vectors */}
              <div className="clay p-4">
                <Plot
                  data={[
                    // Epsilon tube — filled region
                    {
                      x: [...result.plot_data.x_line, ...[...result.plot_data.x_line].reverse()],
                      y: [...result.plot_data.y_line_upper, ...[...result.plot_data.y_line_lower].reverse()],
                      fill: "toself",
                      fillcolor: "rgba(245,158,11,0.1)",
                      line: { color: "rgba(0,0,0,0)" },
                      type: "scatter",
                      mode: "lines",
                      name: "ε-tube",
                      hoverinfo: "skip" as const,
                    },
                    // Upper tube boundary
                    {
                      x: result.plot_data.x_line,
                      y: result.plot_data.y_line_upper,
                      mode: "lines",
                      type: "scatter",
                      name: "ε boundary",
                      line: { color: "#F59E0B", width: 1.5, dash: "dash" },
                      showlegend: false,
                    },
                    // Lower tube boundary
                    {
                      x: result.plot_data.x_line,
                      y: result.plot_data.y_line_lower,
                      mode: "lines",
                      type: "scatter",
                      name: "ε boundary",
                      line: { color: "#F59E0B", width: 1.5, dash: "dash" },
                    },
                    // SVR prediction line
                    {
                      x: result.plot_data.x_line,
                      y: result.plot_data.y_line,
                      mode: "lines",
                      type: "scatter",
                      name: "SVR Prediction",
                      line: { color: "#22C55E", width: 3 },
                    },
                    // Training data
                    {
                      x: result.plot_data.x_train,
                      y: result.plot_data.y_train,
                      mode: "markers",
                      type: "scatter",
                      name: "Train Data",
                      marker: { color: "#DC2626", size: 7, opacity: 0.7, line: { width: 1, color: "rgba(0,0,0,0.3)" } },
                    },
                    // Test data
                    {
                      x: result.plot_data.x_test,
                      y: result.plot_data.y_test,
                      mode: "markers",
                      type: "scatter",
                      name: "Test Data",
                      marker: { color: "#3B82F6", size: 9, symbol: "diamond", opacity: 0.8, line: { width: 1, color: "rgba(0,0,0,0.3)" } },
                    },
                    // Support vectors highlighted
                    {
                      x: result.plot_data.support_vectors_x,
                      y: result.plot_data.support_vectors_y,
                      mode: "markers",
                      type: "scatter",
                      name: "Support Vectors",
                      marker: {
                        color: "rgba(0,0,0,0)",
                        size: 14,
                        line: { width: 2.5, color: "#F59E0B" },
                      },
                    },
                  ]}
                  layout={{
                    ...plotLayout,
                    title: {
                      text: "SVR Fit with ε-insensitive Tube",
                      font: { size: 16, color: "#F8FAFC", family: "Cinzel, serif" },
                    },
                    autosize: true,
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  useResizeHandler
                  style={{ width: "100%", height: "460px" }}
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
                      marker: { color: "#DC2626", size: 7, opacity: 0.7 },
                    },
                    {
                      x: result.plot_data.x_test,
                      y: result.plot_data.residuals_test,
                      mode: "markers",
                      type: "scatter",
                      name: "Test Residuals",
                      marker: { color: "#3B82F6", size: 8, symbol: "diamond", opacity: 0.8 },
                    },
                    // Epsilon band on residuals (should cluster within ±ε)
                    {
                      x: [Math.min(...result.plot_data.x_train, ...result.plot_data.x_test), Math.max(...result.plot_data.x_train, ...result.plot_data.x_test)],
                      y: [params.epsilon as number, params.epsilon as number],
                      mode: "lines",
                      type: "scatter",
                      name: "+ε",
                      line: { color: "#F59E0B", width: 1.5, dash: "dash" },
                      showlegend: false,
                    },
                    {
                      x: [Math.min(...result.plot_data.x_train, ...result.plot_data.x_test), Math.max(...result.plot_data.x_train, ...result.plot_data.x_test)],
                      y: [-(params.epsilon as number), -(params.epsilon as number)],
                      mode: "lines",
                      type: "scatter",
                      name: "±ε band",
                      line: { color: "#F59E0B", width: 1.5, dash: "dash" },
                    },
                    {
                      x: [Math.min(...result.plot_data.x_train, ...result.plot_data.x_test), Math.max(...result.plot_data.x_train, ...result.plot_data.x_test)],
                      y: [0, 0],
                      mode: "lines",
                      type: "scatter",
                      name: "Zero",
                      line: { color: "#71717A", width: 1, dash: "dash" },
                      showlegend: false,
                    },
                  ]}
                  layout={{
                    ...plotLayout,
                    title: {
                      text: "Residuals (with ε-band)",
                      font: { size: 16, color: "#F8FAFC", family: "Cinzel, serif" },
                    },
                    yaxis: {
                      ...plotLayout.yaxis,
                      title: { text: "Residual (y - ŷ)", font: { size: 13, color: "#71717A" } },
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
                <span className="text-primary">Train Model</span> to see results
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
              description="How much variance is explained (1.0 = perfect)"
            />
            <MetricCard
              label="MSE"
              value={result.metrics.mse}
              icon={<Target className="h-5 w-5" />}
              color="#DC2626"
              description="Mean Squared Error"
            />
            <MetricCard
              label="RMSE"
              value={result.metrics.rmse}
              icon={<BarChart3 className="h-5 w-5" />}
              color="#FF5A1F"
              description="Root Mean Squared Error — same units as y"
            />
            <MetricCard
              label="MAE"
              value={result.metrics.mae}
              icon={<TrendingUp className="h-5 w-5" />}
              color="#22C55E"
              description="Mean Absolute Error"
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
          code: `from sklearn.svm import SVR
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error
import numpy as np

X = np.random.rand(100, 1) * 10
y = np.sin(X.squeeze()) * 10 + np.random.randn(100) * 2

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# SVR works best with scaled features
model = make_pipeline(
    StandardScaler(),
    SVR(kernel="rbf", C=100, epsilon=0.1, gamma="scale")
)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
print("R\u00b2 Score:", r2_score(y_test, y_pred))
print("MSE:", mean_squared_error(y_test, y_pred))`,
        },
      ]} />
    </div>
  );
}
