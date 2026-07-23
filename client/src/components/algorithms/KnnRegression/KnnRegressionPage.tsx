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

interface KnnRegressionRequest {
  n_samples: number;
  noise: number;
  test_size: number;
  random_state: number;
  dataset_type: string;
  n_neighbors: number;
  weights: string;
  p: number;
  algorithm: string;
  leaf_size: number;
  metric: string;
  [key: string]: unknown;
}

interface KnnRegressionResponse {
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
    label: "K (Neighbors)",
    key: "n_neighbors",
    min: 1,
    max: 50,
    step: 1,
    default: 5,
    description: "Number of neighbors to use for regression.",
  },
  {
    type: "select",
    label: "Weights",
    key: "weights",
    options: [
      { value: "uniform", label: "Uniform" },
      { value: "distance", label: "Distance" },
    ],
    default: "uniform",
    description: "Weight function used in prediction.",
  },
  {
    type: "select",
    label: "Distance Metric (p)",
    key: "p",
    options: [
      { value: "1", label: "Manhattan (p=1)" },
      { value: "2", label: "Euclidean (p=2)" },
      { value: "3", label: "Minkowski (p=3)" },
    ],
    default: "2",
    description: "Power parameter for the Minkowski metric.",
  },
  {
    type: "select",
    label: "Algorithm",
    key: "algorithm",
    options: [
      { value: "auto", label: "Auto" },
      { value: "ball_tree", label: "Ball Tree" },
      { value: "kd_tree", label: "KD Tree" },
      { value: "brute", label: "Brute Force" },
    ],
    default: "auto",
    description: "Algorithm used to compute nearest neighbors.",
  },
  {
    type: "slider",
    label: "Leaf Size",
    key: "leaf_size",
    min: 5,
    max: 100,
    step: 5,
    default: 30,
    description: "Leaf size for Ball Tree / KD Tree.",
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
    heading: "What is KNN Regression?",
    emoji: "👥",
    content:
      "KNN Regression predicts continuous target values by averaging the outputs of the 'K' nearest points in feature space.",
  },
  {
    heading: "Stepwise Predictions",
    emoji: "📈",
    content:
      "Unlike Linear Regression which produces a straight line, KNN Regression produces piece-wise constant or step-like predictions, fitting complex non-linear curves naturally.",
  },
  {
    heading: "Effect of K",
    emoji: "🎯",
    content:
      "With 'Uniform' weights, all K neighbors contribute equally to the average. With 'Distance' weights, closer neighbors have a larger influence on the average. Distance weighting often creates smoother predictions and can mitigate the impact of outliers.",
  },
];

/* ----- Param explainer content ----- */

const paramExplainerData = [
  {
    name: "K (Neighbors)",
    description: "The number of closest points used to calculate the average prediction.",
    impact: "Low K → highly wiggly, noisy line fitting exactly to points. High K → flat, overly smoothed line.",
    emoji: "🔢",
  },
  {
    name: "Weights",
    description: "How to weight the values of the neighbors in the average.",
    impact: "Distance weighting can capture local spikes better, while uniform weighting heavily smooths out the local topology.",
    emoji: "🎚️",
  },
  {
    name: "Distance Metric",
    description: "How distance between points is calculated.",
    impact: "Euclidean measures straight-line distance (circular boundaries). Manhattan measures block-wise distance (diamond-like boundaries).",
    emoji: "🗺️",
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

export default function KnnRegressionPage() {
  const { params, setParam, result, loading, error, train } = useAlgorithm<
    KnnRegressionRequest,
    KnnRegressionResponse
  >({
    endpoint: "/regression/knn",
    defaultParams: {
      n_samples: 100,
      noise: 10,
      test_size: 0.2,
      random_state: 42,
      dataset_type: "linear",
      n_neighbors: 5,
      weights: "uniform",
      p: 2,
      algorithm: "auto",
      leaf_size: 30,
      metric: "minkowski",
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
        </div>

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
                      marker: { color: "#DC2626", size: 8, opacity: 0.7, line: { width: 1, color: "rgba(0,0,0,0.3)" } },
                    },
                    {
                      x: result.plot_data.x_test,
                      y: result.plot_data.y_test,
                      mode: "markers",
                      type: "scatter",
                      name: "Test Data",
                      marker: { color: "#FF5A1F", size: 9, symbol: "diamond", opacity: 0.8, line: { width: 1, color: "rgba(0,0,0,0.3)" } },
                    },
                    {
                      x: result.plot_data.x_line,
                      y: result.plot_data.y_line,
                      mode: "lines",
                      type: "scatter",
                      name: "KNN Prediction",
                      line: { color: "#F59E0B", width: 3 },
                    },
                  ]}
                  layout={{
                    ...plotLayout,
                    title: {
                      text: "KNN Regression Fit",
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
                      marker: { color: "#DC2626", size: 7, opacity: 0.7 },
                    },
                    {
                      x: result.plot_data.x_test,
                      y: result.plot_data.residuals_test,
                      mode: "markers",
                      type: "scatter",
                      name: "Test Residuals",
                      marker: { color: "#FF5A1F", size: 8, symbol: "diamond", opacity: 0.8 },
                    },
                    {
                      x: [Math.min(...result.plot_data.x_train, ...result.plot_data.x_test), Math.max(...result.plot_data.x_train, ...result.plot_data.x_test)],
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
                    yaxis: { ...plotLayout.yaxis, title: { text: "Residual (y - ŷ)", font: { size: 13, color: "#71717A" } } },
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
                👆 Adjust parameters and click <span className="text-primary">Train Model</span> to see results
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
