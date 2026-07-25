import { useEffect } from "react";
import Plot from "react-plotly.js";
import { TrendingUp, Target, BarChart3 } from "lucide-react";
import { useAlgorithm } from "@/hooks/useAlgorithm";
import {
  ControlPanel,
  MetricCard,
  TheorySection,
  ParamExplainer,
  CodeSection,
} from "@/components/shared";
import type { HyperParam } from "@/types";
import DecisionTreeGraph, { type TreeNode } from "../DecisionTree/DecisionTreeGraph";

/* ----- Request / Response types ----- */

interface DecisionTreeRegressionRequest {
  n_samples: number;
  noise: number;
  test_size: number;
  random_state: number;
  dataset_type: string;
  criterion: string;
  splitter: string;
  max_depth: number;
  min_samples_split: number;
  min_samples_leaf: number;
  max_features: string;
  max_leaf_nodes: number;
  min_impurity_decrease: number;
  [key: string]: unknown;
}

interface DecisionTreeRegressionResponse {
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
  tree_structure: TreeNode;
  model_params: Record<string, unknown>;
}

/* ----- Hyperparameter config ----- */

const hyperParams: HyperParam[] = [
  {
    type: "select",
    label: "Dataset",
    key: "dataset_type",
    options: [
      { value: "quadratic", label: "Quadratic Curve" },
      { value: "sinusoidal", label: "Sinusoidal Wave" },
      { value: "exponential", label: "Exponential Growth" },
      { value: "step", label: "Step Function" },
      { value: "linear", label: "Linear Trend" },
    ],
    default: "quadratic",
    description: "Shape of the synthetic regression dataset.",
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
    description: "Standard deviation of Gaussian noise.",
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
    description: "Function to measure split quality.",
  },
  {
    type: "select",
    label: "Splitter",
    key: "splitter",
    options: [
      { value: "best", label: "Best" },
      { value: "random", label: "Random" },
    ],
    default: "best",
    description: "Strategy to choose split at each node.",
  },
  {
    type: "slider",
    label: "Max Depth (0 = None)",
    key: "max_depth",
    min: 0,
    max: 20,
    step: 1,
    default: 3,
    description: "Max tree depth. 0 means unlimited expansion until leaves are pure.",
  },
  {
    type: "slider",
    label: "Min Samples Split",
    key: "min_samples_split",
    min: 2,
    max: 50,
    step: 1,
    default: 2,
    description: "Min samples required to split an internal node.",
  },
  {
    type: "slider",
    label: "Min Samples Leaf",
    key: "min_samples_leaf",
    min: 1,
    max: 50,
    step: 1,
    default: 1,
    description: "Min samples required to be at a leaf node.",
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
    heading: "What is Decision Tree Regression?",
    emoji: "🌳",
    content:
      "A Decision Tree Regressor splits the feature space into rectangular regions and predicts the average target value of samples in each region.",
  },
  {
    heading: "Piecewise Step Approximations",
    emoji: "📊",
    content:
      "Unlike Linear Regression, Decision Trees build step-function predictions. As Max Depth increases, the number of steps increases, allowing it to approximate any arbitrary continuous curve.",
  },
  {
    heading: "Overfitting & Depth",
    emoji: "✂️",
    content:
      "Without depth limits, a decision tree will create a step for every single data point, memorizing training noise perfectly. Pre-pruning (Max Depth, Min Samples Leaf) forces broader steps for better generalization.",
  },
];

/* ----- Param explainer content ----- */

const paramExplainerData = [
  {
    name: "Max Depth",
    description: "Maximum height of the regression tree.",
    impact: "Depth=1 → 2-step function (underfitting). Depth=3 → good step approximation. Unlimited depth → step for every data point (overfitting).",
    emoji: "⬇️",
  },
  {
    name: "Criterion",
    description: "Function to evaluate candidate splits.",
    impact: "Squared Error (MSE) minimizes variance within leaves. Absolute Error (MAE) minimizes absolute deviations (more robust to outliers).",
    emoji: "📐",
  },
  {
    name: "Min Samples Leaf",
    description: "Minimum data points required per leaf step.",
    impact: "Larger leaf sizes force wider steps, smoothing the regression line and reducing variance.",
    emoji: "🍂",
  },
  {
    name: "Dataset Type",
    description: "Target curve shape.",
    impact: "Sinusoidal / Quadratic → demonstrates how trees use rectangular steps to approximate smooth non-linear functions.",
    emoji: "📈",
  },
];

/* ----- Plotly layout helpers ----- */

const plotLayout = {
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(28,28,33,0.5)",
  font: { family: "Inter, sans-serif", color: "#A1A1AA" },
  margin: { t: 40, r: 20, b: 50, l: 60 },
  xaxis: {
    gridcolor: "rgba(46,46,56,0.6)",
    title: { text: "Feature (X)", font: { size: 13, color: "#71717A" } },
    zerolinecolor: "rgba(46,46,56,0.8)",
  },
  yaxis: {
    gridcolor: "rgba(46,46,56,0.6)",
    title: { text: "Target (y)", font: { size: 13, color: "#71717A" } },
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

export default function DecisionTreeRegressionPage() {
  const { params, setParam, result, loading, error, train } = useAlgorithm<
    DecisionTreeRegressionRequest,
    DecisionTreeRegressionResponse
  >({
    endpoint: "/regression/decision-tree",
    defaultParams: {
      n_samples: 100,
      noise: 10,
      test_size: 0.2,
      random_state: 42,
      dataset_type: "quadratic",
      criterion: "squared_error",
      splitter: "best",
      max_depth: 3,
      min_samples_split: 2,
      min_samples_leaf: 1,
      max_features: "none",
      max_leaf_nodes: 0,
      min_impurity_decrease: 0.0,
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
        </div>

        <div className="space-y-6">
          {error && (
            <div className="clay-pressed p-4 text-error font-bold text-sm animate-fade-in">
              ❌ Error: {error}
            </div>
          )}

          {result && (
            <div className="clay p-4">
              <Plot
                data={[
                  {
                    x: result.plot_data.x_train,
                    y: result.plot_data.y_train,
                    mode: "markers",
                    type: "scatter",
                    name: "Train Points",
                    marker: { color: "#3B82F6", size: 8, opacity: 0.7 },
                  },
                  {
                    x: result.plot_data.x_test,
                    y: result.plot_data.y_test,
                    mode: "markers",
                    type: "scatter",
                    name: "Test Points",
                    marker: { color: "#EF4444", size: 8, opacity: 0.9, symbol: "diamond" },
                  },
                  {
                    x: result.plot_data.x_line,
                    y: result.plot_data.y_line,
                    mode: "lines",
                    type: "scatter",
                    name: "Decision Tree Fit (Steps)",
                    line: { color: "#10B981", width: 3, shape: "hv" },
                  },
                ]}
                layout={{
                  ...plotLayout,
                  title: {
                    text: "Decision Tree Regression Step Curve",
                    font: { size: 16, color: "#F8FAFC" },
                  },
                  autosize: true,
                }}
                config={{ responsive: true, displayModeBar: false }}
                useResizeHandler
                style={{ width: "100%", height: "420px" }}
              />
            </div>
          )}

          {!result && !loading && (
            <div className="clay p-16 text-center">
              <p className="text-text-muted font-bold text-lg">
                Adjust parameters and click <span className="text-primary">Train Model</span>
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

      {/* Tree Structure Graph */}
      {result && (
        <div className="animate-slide-up mt-8">
          <div className="clay p-4">
            <h3 className="text-lg font-extrabold text-text-primary mb-2 px-2">
              🌳 Learned Tree Structure
            </h3>
            <DecisionTreeGraph
              tree={result.tree_structure}
              criterion={params.criterion as string}
            />
          </div>
        </div>
      )}

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
              color="#10B981"
              description="Proportion of variance explained."
            />
            <MetricCard
              label="MSE"
              value={result.metrics.mse}
              icon={<Target className="h-5 w-5" />}
              color="#EF4444"
              description="Mean Squared Error."
            />
            <MetricCard
              label="RMSE"
              value={result.metrics.rmse}
              icon={<BarChart3 className="h-5 w-5" />}
              color="#F59E0B"
              description="Root Mean Squared Error."
            />
            <MetricCard
              label="MAE"
              value={result.metrics.mae}
              icon={<Target className="h-5 w-5" />}
              color="#3B82F6"
              description="Mean Absolute Error."
            />
          </div>
        </div>
      )}

      {/* Parameter Explainer */}
      <ParamExplainer params={paramExplainerData} />

      {/* Code Reference */}
      <CodeSection snippets={[
        {
          title: "Import & Train",
          code: `from sklearn.tree import DecisionTreeRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error
import numpy as np

X = np.random.rand(100, 1) * 10
y = np.sin(X.squeeze()) * 10 + np.random.randn(100) * 2

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Create and fit Decision Tree Regressor
model = DecisionTreeRegressor(
    max_depth=5,
    min_samples_split=5,
    min_samples_leaf=2,
    criterion="squared_error"
)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
print("R\u00b2 Score:", r2_score(y_test, y_pred))
print("MSE:", mean_squared_error(y_test, y_pred))
print("Tree depth:", model.get_depth())
print("Num leaves:", model.get_n_leaves())`,
        },
      ]} />
    </div>
  );
}
