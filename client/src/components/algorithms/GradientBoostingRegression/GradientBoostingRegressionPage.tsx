import { useEffect } from "react";
import Plot from "react-plotly.js";
import { TrendingUp, Target, BarChart3, Calculator } from "lucide-react";
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

interface GBRegressorRequest {
  n_samples: number;
  noise: number;
  test_size: number;
  random_state: number;
  dataset_type: string;
  n_estimators: number;
  learning_rate: number;
  max_depth: number;
  min_samples_split: number;
  min_samples_leaf: number;
  subsample: number;
  max_features: string;
  loss: string;
  [key: string]: unknown;
}

interface GBRegressorResponse {
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
  n_estimators_actual: number;
  train_loss_curve: number[];
  model_params: Record<string, unknown>;
}

/* ----- Hyperparameter config ----- */

const hyperParams: HyperParam[] = [
  {
    type: "select",
    label: "Dataset",
    key: "dataset_type",
    options: [
      { value: "sine", label: "Sine Wave" },
      { value: "linear", label: "Linear" },
      { value: "quadratic", label: "Quadratic" },
      { value: "exponential", label: "Exponential" },
      { value: "step", label: "Step Function" },
    ],
    default: "sine",
    description: "Shape of the synthetic regression dataset.",
  },
  {
    type: "slider",
    label: "Number of Estimators",
    key: "n_estimators",
    min: 10,
    max: 500,
    step: 10,
    default: 100,
    description: "Number of boosting stages. More stages → finer fit.",
  },
  {
    type: "slider",
    label: "Learning Rate",
    key: "learning_rate",
    min: 0.01,
    max: 1.0,
    step: 0.01,
    default: 0.1,
    description: "Shrinks each tree's contribution. Lower = more trees needed but better generalization.",
  },
  {
    type: "slider",
    label: "Max Depth",
    key: "max_depth",
    min: 1,
    max: 15,
    step: 1,
    default: 3,
    description: "Maximum depth of each individual tree.",
  },
  {
    type: "slider",
    label: "Subsample",
    key: "subsample",
    min: 0.1,
    max: 1.0,
    step: 0.05,
    default: 1.0,
    description: "Fraction of samples used for fitting each tree. <1.0 enables Stochastic GB.",
  },
  {
    type: "select",
    label: "Loss Function",
    key: "loss",
    options: [
      { value: "squared_error", label: "Squared Error (MSE)" },
      { value: "absolute_error", label: "Absolute Error (MAE)" },
      { value: "huber", label: "Huber" },
      { value: "quantile", label: "Quantile" },
    ],
    default: "squared_error",
    description: "Loss function to minimize.",
  },
  {
    type: "slider",
    label: "Samples",
    key: "n_samples",
    min: 50,
    max: 500,
    step: 25,
    default: 100,
    description: "Number of data points to generate.",
  },
  {
    type: "slider",
    label: "Noise",
    key: "noise",
    min: 0,
    max: 0.5,
    step: 0.05,
    default: 0.1,
    description: "Noise added to the data.",
  },
  {
    type: "slider",
    label: "Random Seed",
    key: "random_state",
    min: 0,
    max: 100,
    step: 1,
    default: 42,
    description: "Controls the random seed for reproducibility.",
  },
];

/* ----- Theory ----- */

const theoryContent = [
  {
    heading: "Gradient Boosting for Regression",
    emoji: "🔥",
    content:
      "Gradient Boosting Regressor builds an additive model in a forward stage-wise fashion. At each stage, a regression tree is fitted on the negative gradient of the loss function (the residuals for squared error loss). The final prediction is the sum of all trees' predictions, each scaled by the learning rate.",
  },
  {
    heading: "The Bias-Variance Tradeoff",
    emoji: "⚖️",
    content:
      "• Learning rate controls the trade-off: smaller rates need more trees but generalize better.\n• Subsample < 1.0 introduces stochastic gradient boosting, adding regularization through row sampling.\n• Max depth controls tree complexity — shallow trees (3-5) are typical for boosting since each tree is meant to be 'weak'.",
  },
];

/* ----- Param explainer ----- */

const paramExplainerData = [
  {
    name: "learning_rate",
    description: "Shrinks each tree's contribution.",
    impact: "Lower learning rate → more trees needed but less overfitting. Common range: 0.01 – 0.3. Usually paired with n_estimators: if you halve the rate, double the trees.",
    emoji: "🐌",
  },
  {
    name: "n_estimators × learning_rate",
    description: "The key interaction. These two parameters are tightly coupled.",
    impact: "High n_estimators + low learning_rate = best performance but slower training. Start with learning_rate=0.1 and tune n_estimators with the loss curve.",
    emoji: "🔥",
  },
];

/* ----- Plotly shared ----- */

const plotLayout = {
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(28,28,33,0.5)",
  font: { family: "Inter, sans-serif", color: "#A1A1AA" },
  margin: { t: 40, r: 20, b: 50, l: 60 },
  xaxis: {
    gridcolor: "rgba(46,46,56,0.6)",
    zerolinecolor: "rgba(46,46,56,0.8)",
  },
  yaxis: {
    gridcolor: "rgba(46,46,56,0.6)",
    zerolinecolor: "rgba(46,46,56,0.8)",
  },
};

/* ----- Component ----- */

export default function GradientBoostingRegressionPage() {
  const { params, setParam, result, loading, error, train } = useAlgorithm<
    GBRegressorRequest,
    GBRegressorResponse
  >({
    endpoint: "/ensemble/gradient-boosting/regress",
    defaultParams: {
      n_samples: 100,
      noise: 0.1,
      test_size: 0.2,
      random_state: 42,
      dataset_type: "sine",
      n_estimators: 100,
      learning_rate: 0.1,
      max_depth: 3,
      min_samples_split: 2,
      min_samples_leaf: 1,
      subsample: 1.0,
      max_features: "none",
      loss: "squared_error",
    },
  });

  useEffect(() => {
    train();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <TheorySection title="📚 Theory & Intuition" sections={theoryContent} />

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
              {/* Regression Fit Plot */}
              <div className="clay p-4">
                <Plot
                  data={[
                    {
                      x: result.plot_data.x_train,
                      y: result.plot_data.y_train,
                      mode: "markers" as const,
                      type: "scatter" as const,
                      name: "Train",
                      marker: { color: "#3B82F6", size: 6, opacity: 0.7 },
                    },
                    {
                      x: result.plot_data.x_test,
                      y: result.plot_data.y_test,
                      mode: "markers" as const,
                      type: "scatter" as const,
                      name: "Test",
                      marker: { color: "#F59E0B", size: 7, opacity: 0.8, symbol: "diamond" },
                    },
                    {
                      x: result.plot_data.x_line,
                      y: result.plot_data.y_line,
                      mode: "lines" as const,
                      type: "scatter" as const,
                      name: "GB Prediction",
                      line: { color: "#EF4444", width: 2.5 },
                    },
                  ]}
                  layout={{
                    ...plotLayout,
                    title: {
                      text: "Gradient Boosting Regression Fit",
                      font: { size: 15, color: "#E4E4E7", family: "Inter, sans-serif" },
                    },
                    xaxis: { ...plotLayout.xaxis, title: { text: "Feature", font: { size: 13, color: "#71717A" } } },
                    yaxis: { ...plotLayout.yaxis, title: { text: "Target", font: { size: 13, color: "#71717A" } } },
                    legend: { bgcolor: "rgba(28,28,33,0.9)", bordercolor: "rgba(46,46,56,0.5)", borderwidth: 1, font: { size: 12, color: "#A1A1AA" } },
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  useResizeHandler
                  style={{ width: "100%", height: "450px" }}
                />
              </div>

              {/* Training Loss Curve */}
              {result.train_loss_curve && result.train_loss_curve.length > 0 && (
                <div className="clay p-4">
                  <Plot
                    data={[
                      {
                        x: result.train_loss_curve.map((_, i) => i + 1),
                        y: result.train_loss_curve,
                        mode: "lines" as const,
                        type: "scatter" as const,
                        name: "Train Loss",
                        line: { color: "#EF4444", width: 2 },
                      },
                    ]}
                    layout={{
                      ...plotLayout,
                      title: {
                        text: "Training Loss per Boosting Stage",
                        font: { size: 14, color: "#E4E4E7", family: "Inter, sans-serif" },
                      },
                      xaxis: { ...plotLayout.xaxis, title: { text: "Boosting Stage", font: { size: 12, color: "#71717A" } } },
                      yaxis: { ...plotLayout.yaxis, title: { text: "Loss", font: { size: 12, color: "#71717A" } } },
                      showlegend: false,
                    }}
                    config={{ responsive: true, displayModeBar: false }}
                    useResizeHandler
                    style={{ width: "100%", height: "300px" }}
                  />
                </div>
              )}

              {/* Residuals */}
              <div className="clay p-4">
                <Plot
                  data={[
                    {
                      x: result.plot_data.y_test_pred,
                      y: result.plot_data.residuals_test,
                      mode: "markers" as const,
                      type: "scatter" as const,
                      name: "Test Residuals",
                      marker: { color: "#F59E0B", size: 7, opacity: 0.7 },
                    },
                    {
                      x: result.plot_data.y_train_pred,
                      y: result.plot_data.residuals_train,
                      mode: "markers" as const,
                      type: "scatter" as const,
                      name: "Train Residuals",
                      marker: { color: "#3B82F6", size: 5, opacity: 0.5 },
                    },
                  ]}
                  layout={{
                    ...plotLayout,
                    title: {
                      text: "Residual Plot",
                      font: { size: 14, color: "#E4E4E7", family: "Inter, sans-serif" },
                    },
                    xaxis: { ...plotLayout.xaxis, title: { text: "Predicted", font: { size: 12, color: "#71717A" } } },
                    yaxis: { ...plotLayout.yaxis, title: { text: "Residual", font: { size: 12, color: "#71717A" } } },
                    shapes: [{ type: "line" as const, x0: 0, x1: 1, y0: 0, y1: 0, xref: "paper" as const, line: { color: "rgba(239,68,68,0.4)", width: 1, dash: "dash" as const } }],
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  useResizeHandler
                  style={{ width: "100%", height: "300px" }}
                />
              </div>
            </>
          )}

          {!result && !loading && (
            <div className="clay p-16 text-center">
              <p className="text-text-muted font-bold text-lg">
                👆 Adjust parameters and click <span className="text-primary">Train Model</span>
              </p>
            </div>
          )}

          {loading && !result && (
            <div className="clay p-16 text-center">
              <div className="inline-block w-8 h-8 border-3 border-surface-border border-t-primary rounded-full animate-spin mb-4" />
              <p className="text-text-muted font-bold">Boosting trees stage by stage...</p>
            </div>
          )}
        </div>
      </div>

      {/* Metrics */}
      {result && (
        <div className="animate-slide-up">
          <h3 className="text-lg font-extrabold text-text-primary mb-4">📊 Regression Metrics</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="R² Score" value={result.metrics.r2_score} icon={<TrendingUp className="h-5 w-5" />} color="#10B981" format="decimal" description="Proportion of variance explained" />
            <MetricCard label="MSE" value={result.metrics.mse} icon={<Target className="h-5 w-5" />} color="#EF4444" format="decimal" description="Mean Squared Error" />
            <MetricCard label="RMSE" value={result.metrics.rmse} icon={<BarChart3 className="h-5 w-5" />} color="#F59E0B" format="decimal" description="Root Mean Squared Error" />
            <MetricCard label="MAE" value={result.metrics.mae} icon={<Calculator className="h-5 w-5" />} color="#3B82F6" format="decimal" description="Mean Absolute Error" />
          </div>
        </div>
      )}

      <ParamExplainer params={paramExplainerData} />

      <CodeSection
        snippets={[{
          title: "Import & Train",
          code: `from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
import numpy as np

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

model = GradientBoostingRegressor(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=3,
    subsample=1.0,
    loss="squared_error",
    random_state=42,
)
model.fit(X_train, y_train)

print("R²:", model.score(X_test, y_test))
print("Train loss curve:", model.train_score_[:5], "...")`,
        }]}
      />
    </div>
  );
}
