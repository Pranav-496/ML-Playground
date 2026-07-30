import { useEffect } from "react";
import Plot from "react-plotly.js";
import { TrendingUp, Target, BarChart3, Percent, Flame } from "lucide-react";
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

interface GBRequest {
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
  [key: string]: unknown;
}

interface GBResponse {
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
  };
  plot_data: {
    x_train: number[][];
    y_train: number[];
    x_test: number[][];
    y_test: number[];
    x_min: number;
    x_max: number;
    y_min: number;
    y_max: number;
    xx: number[][];
    yy: number[][];
    z: number[][];
  };
  feature_importances: number[];
  n_estimators_actual: number;
  staged_train_accuracy: number[];
  staged_test_accuracy: number[];
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
      { value: "moons", label: "Half Moons" },
      { value: "blobs", label: "Gaussian Blobs" },
      { value: "circles", label: "Concentric Circles" },
      { value: "xor", label: "XOR Pattern" },
      { value: "spirals", label: "Spirals" },
      { value: "anisotropic", label: "Anisotropic" },
    ],
    default: "moons",
    description: "Shape of the synthetic classification dataset.",
  },
  {
    type: "slider",
    label: "Number of Stages",
    key: "n_estimators",
    min: 10,
    max: 300,
    step: 10,
    default: 100,
    description:
      "Number of sequential boosting stages (weak learners). Each stage corrects the errors of all previous stages.",
  },
  {
    type: "slider",
    label: "Learning Rate",
    key: "learning_rate",
    min: 0.01,
    max: 1.0,
    step: 0.01,
    default: 0.1,
    description:
      "Shrinks the contribution of each tree. Lower values need more trees but generalize better (learning_rate × n_estimators trade-off).",
  },
  {
    type: "slider",
    label: "Max Depth",
    key: "max_depth",
    min: 1,
    max: 10,
    step: 1,
    default: 3,
    description:
      "Maximum depth of each individual tree (weak learner). Shallow trees (3-5) are typical — they act as weak learners that correct residuals.",
  },
  {
    type: "slider",
    label: "Subsample",
    key: "subsample",
    min: 0.5,
    max: 1.0,
    step: 0.05,
    default: 1.0,
    description:
      "Fraction of samples used to fit each tree. Values < 1.0 enable Stochastic Gradient Boosting, which adds regularization.",
  },
  {
    type: "select",
    label: "Max Features",
    key: "max_features",
    options: [
      { value: "none", label: "All Features" },
      { value: "sqrt", label: "√n (Square Root)" },
      { value: "log2", label: "log₂(n)" },
    ],
    default: "none",
    description:
      "Number of features considered for the best split at each node.",
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
    min: 0.1,
    max: 5,
    step: 0.1,
    default: 1.5,
    description: "Controls how much the two classes overlap.",
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
    heading: "What is Gradient Boosting?",
    emoji: "🔥",
    content:
      "Gradient Boosting builds an ensemble of weak learners (typically shallow decision trees) in a sequential, additive fashion. Each new tree is trained to predict the negative gradient (residuals) of the loss function from the previous ensemble. Unlike Random Forest's parallel bagging, Gradient Boosting is inherently sequential — each tree depends on the errors of all previous trees.",
  },
  {
    heading: "The Boosting Idea",
    emoji: "🏗️",
    content:
      "Start with a constant prediction (e.g., the mean). At each stage:\n1. Compute the pseudo-residuals (negative gradient of the loss).\n2. Fit a weak learner (shallow tree) to these residuals.\n3. Add the tree's prediction (scaled by the learning rate) to the ensemble.\n\nF_m(x) = F_{m-1}(x) + η · h_m(x)\n\nWhere η is the learning rate and h_m is the m-th weak learner.",
  },
  {
    heading: "Learning Rate & Stages Trade-off",
    emoji: "⚖️",
    content:
      "A smaller learning rate requires more boosting stages but typically produces better generalization. The golden rule: lower learning rate + more estimators = better performance (at the cost of training time). The learning curve plot below shows how accuracy evolves as more trees are added.",
  },
  {
    heading: "When to use Gradient Boosting",
    emoji: "🎯",
    content:
      "Gradient Boosting excels in competitions and tabular data tasks. It's the backbone of XGBoost, LightGBM, and CatBoost. Best for: structured/tabular data, when you need maximum predictive power, and when training time is less critical than accuracy. Downsides: prone to overfitting if not tuned, sequential training is slower than Random Forest.",
  },
];

/* ----- Param explainer ----- */

const paramExplainerData = [
  {
    name: "n_estimators (Boosting Stages)",
    description:
      "Number of sequential trees to build. Each tree corrects the previous ensemble's errors.",
    impact:
      "More stages → potential overfitting (unlike Random Forest, where more trees always help). Watch the learning curve to find the sweet spot.",
    emoji: "🏗️",
  },
  {
    name: "learning_rate",
    description:
      "Shrinkage factor that scales each tree's contribution.",
    impact:
      "Low (0.01-0.1) → needs many trees but generalizes better. High (0.5-1.0) → fast convergence but risk of overfitting. The learning_rate × n_estimators product is the key tuning knob.",
    emoji: "📉",
  },
  {
    name: "max_depth",
    description:
      "Depth of each individual weak learner.",
    impact:
      "Shallow trees (2-5) are ideal for boosting — they capture interactions without overfitting. Depth 1 ('stumps') captures only main effects. Depth 3 is the classic default.",
    emoji: "📏",
  },
  {
    name: "subsample",
    description:
      "Fraction of training data used for each tree.",
    impact:
      "Values < 1.0 introduce Stochastic Gradient Boosting — random subsampling adds regularization and can improve generalization. 0.8 is a common choice.",
    emoji: "🎲",
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
    title: { text: "Feature 1", font: { size: 13, color: "#71717A" } },
    zerolinecolor: "rgba(46,46,56,0.8)",
  },
  yaxis: {
    gridcolor: "rgba(46,46,56,0.6)",
    title: { text: "Feature 2", font: { size: 13, color: "#71717A" } },
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

export default function GradientBoostingPage() {
  const { params, setParam, result, loading, error, train } = useAlgorithm<
    GBRequest,
    GBResponse
  >({
    endpoint: "/ensemble/gradient-boosting/classify",
    defaultParams: {
      n_samples: 200,
      noise: 1.5,
      test_size: 0.2,
      random_state: 42,
      dataset_type: "moons",
      n_estimators: 100,
      learning_rate: 0.1,
      max_depth: 3,
      min_samples_split: 2,
      min_samples_leaf: 1,
      subsample: 1.0,
      max_features: "none",
    },
  });

  useEffect(() => {
    train();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getClassData = (X: number[][], y: number[], targetClass: number) => {
    const x0: number[] = [];
    const x1: number[] = [];
    y.forEach((val, idx) => {
      if (val === targetClass) {
        x0.push(X[idx][0]);
        x1.push(X[idx][1]);
      }
    });
    return { x0, x1 };
  };

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

          {/* Boosting Stats */}
          {result && (
            <div className="clay-sm p-5 animate-bounce-in">
              <h4 className="text-sm font-extrabold text-text-muted mb-3 flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-400" />
                Boosting Statistics
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Stages Built</span>
                  <span className="text-lg font-bold text-orange-400">
                    {result.n_estimators_actual}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Learning Rate</span>
                  <span className="text-sm font-bold text-text-primary">
                    {params.learning_rate}
                  </span>
                </div>
                {/* Feature importance */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-bold text-text-muted">Feature Importances</span>
                  {result.feature_importances.map((imp, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs text-text-muted">
                        <span>Feature {idx + 1}</span>
                        <span className="font-bold text-orange-300">
                          {(imp * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-surface-hover rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${imp * 100}%`,
                            background: "linear-gradient(90deg, #EA580C, #FB923C)",
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
              {/* Decision Boundary */}
              <div className="clay p-4">
                <Plot
                  data={[
                    {
                      x: result.plot_data.xx[0],
                      y: result.plot_data.yy.map((row) => row[0]),
                      z: result.plot_data.z,
                      type: "contour",
                      colorscale: [
                        [0, "rgba(234,88,12,0.25)"],
                        [1, "rgba(59,130,246,0.25)"],
                      ],
                      showscale: false,
                      line: { width: 0 },
                      contours: { coloring: "fill" as const },
                      hoverinfo: "skip" as const,
                    },
                    (() => {
                      const d = getClassData(result.plot_data.x_train, result.plot_data.y_train, 0);
                      return {
                        x: d.x0, y: d.x1,
                        mode: "markers" as const, type: "scatter" as const,
                        name: "Class 0 (Train)",
                        marker: { color: "#EA580C", size: 7, line: { color: "#7C2D12", width: 1 } },
                      };
                    })(),
                    (() => {
                      const d = getClassData(result.plot_data.x_train, result.plot_data.y_train, 1);
                      return {
                        x: d.x0, y: d.x1,
                        mode: "markers" as const, type: "scatter" as const,
                        name: "Class 1 (Train)",
                        marker: { color: "#3B82F6", size: 7, line: { color: "#1E3A5F", width: 1 } },
                      };
                    })(),
                    (() => {
                      const d = getClassData(result.plot_data.x_test, result.plot_data.y_test, 0);
                      return {
                        x: d.x0, y: d.x1,
                        mode: "markers" as const, type: "scatter" as const,
                        name: "Class 0 (Test)",
                        marker: { color: "#EA580C", size: 9, symbol: "diamond", line: { color: "#fff", width: 1.5 } },
                      };
                    })(),
                    (() => {
                      const d = getClassData(result.plot_data.x_test, result.plot_data.y_test, 1);
                      return {
                        x: d.x0, y: d.x1,
                        mode: "markers" as const, type: "scatter" as const,
                        name: "Class 1 (Test)",
                        marker: { color: "#3B82F6", size: 9, symbol: "diamond", line: { color: "#fff", width: 1.5 } },
                      };
                    })(),
                  ]}
                  layout={{
                    ...plotLayout,
                    title: {
                      text: "Gradient Boosting — Decision Boundary",
                      font: { size: 15, color: "#E4E4E7", family: "Inter, sans-serif" },
                    },
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  useResizeHandler
                  style={{ width: "100%", height: "500px" }}
                />
              </div>

              {/* Learning Curve — Staged Accuracy */}
              {result.staged_train_accuracy.length > 0 && (
                <div className="clay p-4">
                  <h4 className="text-sm font-extrabold text-text-muted mb-2 flex items-center gap-2">
                    📈 Learning Curve — Accuracy vs Boosting Stage
                  </h4>
                  <Plot
                    data={[
                      {
                        x: result.staged_train_accuracy.map((_, i) => i + 1),
                        y: result.staged_train_accuracy,
                        mode: "lines" as const,
                        type: "scatter" as const,
                        name: "Train Accuracy",
                        line: { color: "#EA580C", width: 2 },
                      },
                      {
                        x: result.staged_test_accuracy.map((_, i) => i + 1),
                        y: result.staged_test_accuracy,
                        mode: "lines" as const,
                        type: "scatter" as const,
                        name: "Test Accuracy",
                        line: { color: "#3B82F6", width: 2.5, dash: "dash" as const },
                      },
                    ]}
                    layout={{
                      ...plotLayout,
                      title: {
                        text: "Staged Accuracy — Train vs Test",
                        font: { size: 14, color: "#E4E4E7", family: "Inter, sans-serif" },
                      },
                      xaxis: {
                        ...plotLayout.xaxis,
                        title: { text: "Boosting Stage", font: { size: 13, color: "#71717A" } },
                      },
                      yaxis: {
                        ...plotLayout.yaxis,
                        title: { text: "Accuracy", font: { size: 13, color: "#71717A" } },
                        range: [0, 1.05],
                      },
                    }}
                    config={{ responsive: true, displayModeBar: false }}
                    useResizeHandler
                    style={{ width: "100%", height: "350px" }}
                  />
                  <p className="text-xs text-text-muted mt-2 italic">
                    Watch for the gap between train and test accuracy — when the test curve
                    plateaus or drops while train keeps climbing, you're overfitting. Reduce
                    n_estimators, increase learning_rate, or reduce max_depth.
                  </p>
                </div>
              )}

              {/* Training Loss Curve */}
              {result.train_loss_curve.length > 0 && (
                <div className="clay p-4">
                  <Plot
                    data={[
                      {
                        x: result.train_loss_curve.map((_, i) => i + 1),
                        y: result.train_loss_curve,
                        mode: "lines" as const,
                        type: "scatter" as const,
                        name: "Training Deviance",
                        line: { color: "#F59E0B", width: 2 },
                        fill: "tozeroy" as const,
                        fillcolor: "rgba(245,158,11,0.1)",
                      },
                    ]}
                    layout={{
                      ...plotLayout,
                      title: {
                        text: "Training Deviance (Loss)",
                        font: { size: 14, color: "#E4E4E7", family: "Inter, sans-serif" },
                      },
                      xaxis: {
                        ...plotLayout.xaxis,
                        title: { text: "Boosting Stage", font: { size: 13, color: "#71717A" } },
                      },
                      yaxis: {
                        ...plotLayout.yaxis,
                        title: { text: "Deviance", font: { size: 13, color: "#71717A" } },
                      },
                    }}
                    config={{ responsive: true, displayModeBar: false }}
                    useResizeHandler
                    style={{ width: "100%", height: "300px" }}
                  />
                </div>
              )}
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
              <p className="text-text-muted font-bold">Boosting in progress...</p>
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
              label="Accuracy"
              value={result.metrics.accuracy}
              icon={<Percent className="h-5 w-5" />}
              color="#22C55E"
              format="percentage"
              description="Fraction of correctly classified samples"
            />
            <MetricCard
              label="Precision"
              value={result.metrics.precision}
              icon={<Target className="h-5 w-5" />}
              color="#3B82F6"
              format="percentage"
              description="Of predicted positives, how many are actually positive"
            />
            <MetricCard
              label="Recall"
              value={result.metrics.recall}
              icon={<BarChart3 className="h-5 w-5" />}
              color="#F59E0B"
              format="percentage"
              description="Of actual positives, how many were correctly identified"
            />
            <MetricCard
              label="F1 Score"
              value={result.metrics.f1_score}
              icon={<TrendingUp className="h-5 w-5" />}
              color="#DC2626"
              format="percentage"
              description="Harmonic mean of precision and recall"
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
            code: `from sklearn.ensemble import GradientBoostingClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

X, y = make_classification(
    n_samples=200, n_features=2, n_redundant=0,
    n_informative=2, random_state=42
)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = GradientBoostingClassifier(
    n_estimators=100,      # Number of boosting stages
    learning_rate=0.1,     # Shrinkage per stage
    max_depth=3,           # Depth of each weak learner
    subsample=1.0,         # 1.0 = no stochastic subsampling
    random_state=42,
)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, y_pred))
print("Feature Importances:", model.feature_importances_)

# Staged predictions for learning curve
import numpy as np
staged_scores = [
    accuracy_score(y_test, pred)
    for pred in model.staged_predict(X_test)
]
print("Best stage:", np.argmax(staged_scores) + 1)`,
          },
        ]}
      />
    </div>
  );
}
