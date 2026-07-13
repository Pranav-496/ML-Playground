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
import type { HyperParam } from "@/types";

/* ----- Request / Response types ----- */

interface PolynomialRequest {
  n_samples: number;
  noise: number;
  test_size: number;
  random_state: number;
  fit_intercept: boolean;
  degree: number;
  [key: string]: unknown;
}

interface PolynomialResponse {
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
    label: "Degree",
    key: "degree",
    min: 1,
    max: 50,
    step: 1,
    default: 3,
    description: "The degree of the polynomial. Higher degrees can fit more complex curves but might overfit.",
  },
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
    heading: "What is Polynomial Regression?",
    emoji: "📈",
    content:
      "Polynomial Regression is a form of regression analysis in which the relationship between the independent variable x and the dependent variable y is modeled as an nth degree polynomial. It allows us to fit non-linear data while still using linear models under the hood.",
  },
  {
    heading: "The Math",
    emoji: "🧮",
    content:
      "The model assumes: y = β₀ + β₁x + β₂x² + ... + βₙxⁿ + ε\n\nEven though the curve is non-linear, the model is still considered 'linear' in terms of its parameters (the betas). We simply create new features from our original data: x₁, x₂, ..., xₙ = x, x², ..., xⁿ.",
  },
  {
    heading: "When to Use It?",
    emoji: "🎯",
    content:
      "• When you observe a non-linear, curved relationship in your data\n• When a straight line model underfits the data\n• For capturing interactions (when applied to multiple features)",
  },
  {
    heading: "The Danger: Overfitting",
    emoji: "⚠️",
    content:
      "Choosing the right degree is crucial. If the degree is too low, the model underfits. If it's too high, the model fits the noise instead of the signal (overfitting), leading to poor performance on new data.",
  },
];

/* ----- Param explainer content ----- */

const paramExplainerData = [
  {
    name: "Degree",
    description:
      "The highest power of the variable used in the polynomial equation.",
    impact:
      "Degree 1 = Straight line. Degree 2 = Parabola. Higher degrees = More wiggles (high risk of overfitting!).",
    emoji: "📈",
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
  {
    name: "Random Seed",
    description:
      "Controls the random number generator. Same seed = same data every time. Change it to see how the model performs on different data.",
    impact: "Different seeds generate different datasets with different patterns.",
    emoji: "🎲",
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

export default function PolynomialRegressionPage() {
  const { params, setParam, result, loading, error, train } = useAlgorithm<
    PolynomialRequest,
    PolynomialResponse
  >({
    endpoint: "/regression/polynomial",
    defaultParams: {
      n_samples: 100,
      noise: 10,
      test_size: 0.2,
      random_state: 42,
      fit_intercept: true,
      degree: 3,
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
                      text: "Polynomial Regression Fit",
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

    </div>
  );
}
