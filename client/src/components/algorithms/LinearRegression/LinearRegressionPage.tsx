import { useEffect } from "react";
import Plot from "react-plotly.js";
import { TrendingUp, Target, BarChart3, Percent } from "lucide-react";
import { useAlgorithm } from "@/hooks/useAlgorithm";
import {
  ControlPanel,
  MetricCard,
  TheorySection,
  ParamExplainer,
} from "@/components/shared";
import GradientDescentSection from "./GradientDescentSection";
import type { HyperParam } from "@/types";

/* ----- Request / Response types ----- */

interface LinearRequest {
  n_samples: number;
  noise: number;
  test_size: number;
  random_state: number;
  fit_intercept: boolean;
  dataset_type: string;
  positive: boolean;
  [key: string]: unknown;
}

interface LinearResponse {
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
  model_params: Record<string, unknown>;
}

/* ----- Hyperparameter config ----- */

const hyperParams: HyperParam[] = [
  {
    type: "slider",
    label: "Samples",
    key: "n_samples",
    min: 20,
    max: 500,
    step: 10,
    default: 100,
    description:
      "Number of data points to generate. More samples = more reliable fit but slower training.",
  },
  {
    type: "slider",
    label: "Noise",
    key: "noise",
    min: 0,
    max: 50,
    step: 1,
    default: 10,
    description:
      "Standard deviation of Gaussian noise added to data. Higher noise = harder for the model to fit.",
  },
  {
    type: "select",
    label: "Dataset",
    key: "dataset_type",
    options: [
      { value: "linear", label: "Linear Trend" },
      { value: "sinusoidal", label: "Sinusoidal Wave" },
      { value: "exponential", label: "Exponential Growth" },
      { value: "step", label: "Step Function" },
      { value: "quadratic", label: "Quadratic Curve" },
    ],
    default: "linear",
    description: "Shape of the synthetic regression dataset.",
  },
  {
    type: "slider",
    label: "Test Split",
    key: "test_size",
    min: 0.1,
    max: 0.5,
    step: 0.05,
    default: 0.2,
    description:
      "Fraction of data held out for testing (0.2 = 20%). Larger test set gives more reliable metric estimates.",
  },
  {
    type: "slider",
    label: "Random Seed",
    key: "random_state",
    min: 0,
    max: 100,
    step: 1,
    default: 42,
    description:
      "Seed for data generation. Change this to see different random datasets.",
  },
];

/* ----- Theory content ----- */

const theoryContent = [
  {
    heading: "What is Linear Regression?",
    emoji: "📐",
    content:
      "Linear regression models the relationship between a dependent variable y and one or more independent variables X by fitting a straight line (or hyperplane) through the data. It finds the line that minimizes the sum of squared residuals — the vertical distances between each data point and the line.",
  },
  {
    heading: "The Math",
    emoji: "🧮",
    content:
      "The model assumes: y = β₀ + β₁x + ε\n\nWhere:\n• β₀ is the intercept (y-value when x = 0)\n• β₁ is the slope (change in y per unit change in x)\n• ε is the error term (noise)\n\nThe Ordinary Least Squares (OLS) method minimizes:\n  Σ(yᵢ - ŷᵢ)² = Σ(yᵢ - β₀ - β₁xᵢ)²\n\nThe closed-form solution is: β = (XᵀX)⁻¹Xᵀy",
  },
  {
    heading: "When to Use It?",
    emoji: "🎯",
    content:
      "• When you expect a LINEAR relationship between features and target\n• When you need an interpretable model (coefficients tell you the effect of each feature)\n• When your data has low multicollinearity\n• As a baseline model before trying more complex approaches",
  },
  {
    heading: "Key Assumptions",
    emoji: "⚠️",
    content:
      "1. Linearity — The relationship between X and y is linear\n2. Independence — Observations are independent of each other\n3. Homoscedasticity — Constant variance of residuals\n4. Normality — Residuals are normally distributed\n5. No multicollinearity — Features are not highly correlated with each other",
  },
];

/* ----- Param explainer content ----- */

const paramExplainerData = [
  {
    name: "Dataset Type",
    description: "The underlying true function generating the data.",
    impact: "Linear → high R² fit. Sinusoidal / Exponential / Step / Quadratic → Linear Regression will struggle because a straight line cannot capture curvature (underfitting). This demonstrates why polynomial or non-linear models are needed.",
    emoji: "📊",
  },
  {
    name: "Samples (n_samples)",
    description:
      "The number of data points generated. More data helps the model generalize better but takes longer to process.",
    impact:
      "Low samples → overfitting risk. High samples → smoother, more stable fit.",
    emoji: "📊",
  },
  {
    name: "Noise",
    description:
      "Controls how much random noise is added to the data. Real-world data always has noise from measurement errors, missing variables, etc.",
    impact:
      "Low noise → near-perfect fit (R²≈1). High noise → model struggles, lower R².",
    emoji: "🌊",
  },
  {
    name: "Test Split",
    description:
      "What fraction of data is held out for evaluating model performance. The model never sees this data during training.",
    impact:
      "Too small → unreliable metrics. Too large → not enough training data.",
    emoji: "✂️",
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

export default function LinearRegressionPage() {
  const { params, setParam, result, loading, error, train } = useAlgorithm<
    LinearRequest,
    LinearResponse
  >({
    endpoint: "/regression/linear",
    defaultParams: {
      n_samples: 100,
      noise: 10,
      test_size: 0.2,
      random_state: 42,
      fit_intercept: true,
      dataset_type: "linear",
      positive: false,
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
                      text: "Linear Regression Fit",
                      font: { size: 16, color: "#F8FAFC", family: "Cinzel, serif" },
                    },
                    autosize: true,
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  useResizeHandler
                  style={{ width: "100%", height: "420px" }}
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

      {/* ===== Divider ===== */}
      <div className="flex items-center gap-4 my-4">
        <div className="h-px flex-1 bg-surface-border" />
        <span className="text-text-muted font-extrabold text-sm px-4 py-2 clay-sm">
          ⬇️ Part 2: Gradient Descent Approach
        </span>
        <div className="h-px flex-1 bg-surface-border" />
      </div>

      {/* ===== Gradient Descent Section ===== */}
      <GradientDescentSection />
    </div>
  );
}
