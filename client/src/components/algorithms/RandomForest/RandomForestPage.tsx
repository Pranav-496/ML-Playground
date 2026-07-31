import { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { TrendingUp, Target, BarChart3, Percent, Trees, Shuffle } from "lucide-react";
import { useAlgorithm } from "@/hooks/useAlgorithm";
import {
  ControlPanel,
  MetricCard,
  TheorySection,
  ParamExplainer,
  CodeSection,
  ModeToggle,
} from "@/components/shared";
import RandomForestRegressionContent from "@/components/algorithms/RandomForestRegression/RandomForestRegressionPage";
import type { HyperParam } from "@/types";

/* ----- Request / Response types ----- */

interface RandomForestRequest {
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

interface RandomForestResponse {
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
  oob_score: number | null;
  n_estimators_actual: number;
  individual_boundaries: {
    tree_index: number;
    z: number[][];
  }[];
  individual_xx: number[][];
  individual_yy: number[][];
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
    label: "Number of Trees",
    key: "n_estimators",
    min: 1,
    max: 300,
    step: 1,
    default: 100,
    description:
      "The number of decision trees in the forest. More trees generally improve accuracy but increase training time.",
  },
  {
    type: "select",
    label: "Criterion",
    key: "criterion",
    options: [
      { value: "gini", label: "Gini Impurity" },
      { value: "entropy", label: "Entropy (Info Gain)" },
      { value: "log_loss", label: "Log Loss" },
    ],
    default: "gini",
    description:
      "The function used to measure the quality of a split at each tree node.",
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
      "Maximum depth of each tree. 0 = unlimited. Deeper trees capture more complexity but risk overfitting.",
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
      "Number of features to consider when finding the best split. Limiting features decorrelates trees.",
  },
  {
    type: "slider",
    label: "Min Samples Split",
    key: "min_samples_split",
    min: 2,
    max: 20,
    step: 1,
    default: 2,
    description:
      "Minimum samples required to split an internal node. Higher values prevent learning overly specific rules.",
  },
  {
    type: "slider",
    label: "Min Samples Leaf",
    key: "min_samples_leaf",
    min: 1,
    max: 20,
    step: 1,
    default: 1,
    description:
      "Minimum samples required at each leaf node. Increasing this smooths the model.",
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
    description:
      "Controls how much the two classes overlap. Higher noise makes classification harder.",
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
    description: "Seed for data generation, splitting, and tree randomization.",
  },
];

/* ----- Theory content ----- */

const theoryContent = [
  {
    heading: "What is Random Forest?",
    emoji: "🌲",
    content:
      "Random Forest is an ensemble learning method that builds many decision trees during training and merges their predictions through majority voting (classification) or averaging (regression). Each tree is trained on a random bootstrap sample of the data, and at each split, only a random subset of features is considered — this 'double randomness' decorrelates the trees and dramatically reduces overfitting compared to a single decision tree.",
  },
  {
    heading: "Bagging — Bootstrap Aggregating",
    emoji: "🎒",
    content:
      "Each tree in the forest is trained on a bootstrap sample — a random sample drawn with replacement from the training data, typically the same size as the original dataset. About 37% of the data is left out of each sample (Out-of-Bag samples), which can be used for internal validation without needing a separate test set.",
  },
  {
    heading: "Feature Randomness",
    emoji: "🎲",
    content:
      "At each split, the algorithm considers only a random subset of features (typically √n for classification). This prevents dominant features from appearing in every tree and ensures diversity. Combined with bagging, this makes the ensemble far more robust than any single tree.",
  },
  {
    heading: "The Math — Majority Voting",
    emoji: "🧮",
    content:
      "For classification:\n  ŷ = mode({h₁(x), h₂(x), ..., hₜ(x)})\n\nFor regression:\n  ŷ = (1/T) Σ hₜ(x)\n\nWhere hₜ(x) is the prediction of the t-th tree.\n\nVariance reduction: Var(forest) ≈ ρσ² + (1-ρ)σ²/T\nWhere ρ is the pairwise correlation between trees, σ² is individual tree variance, and T is the number of trees.",
  },
  {
    heading: "When to use Random Forest",
    emoji: "🎯",
    content:
      "Random Forest excels when: you need a strong baseline that works 'out of the box', the data has complex non-linear relationships, you want built-in feature importance rankings, and you need resistance to overfitting. It handles missing values and mixed feature types well. Downsides: less interpretable than a single tree, can be slow for real-time prediction with many trees.",
  },
];

/* ----- Param explainer ----- */

const paramExplainerData = [
  {
    name: "n_estimators (Number of Trees)",
    description:
      "The total number of decision trees in the forest.",
    impact:
      "More trees → better accuracy and stability, but diminishing returns after ~100-200 trees. Training time scales linearly.",
    emoji: "🌲",
  },
  {
    name: "max_depth",
    description:
      "Maximum depth each individual tree can grow to.",
    impact:
      "Deeper trees → more complex boundaries, risk of overfitting individual trees (but the ensemble averages this out). Unlimited depth is common for Random Forest.",
    emoji: "📏",
  },
  {
    name: "max_features",
    description:
      "Number of features randomly sampled at each split.",
    impact:
      "√n (default for classification) decorrelates trees well. Using all features makes trees more similar, reducing the ensemble benefit. log₂(n) is a more aggressive constraint.",
    emoji: "🎲",
  },
  {
    name: "criterion",
    description:
      "Splitting quality measure — Gini impurity or Entropy.",
    impact:
      "Gini is faster to compute and tends to isolate the most frequent class. Entropy considers the full distribution and can produce more balanced splits.",
    emoji: "⚖️",
  },
  {
    name: "bootstrap",
    description:
      "Whether to use bootstrap samples when building trees.",
    impact:
      "With bootstrap=True, each tree sees ~63% of the data (random with replacement), enabling OOB scoring. Without bootstrap, each tree sees all data — less randomness, potentially more correlated trees.",
    emoji: "🎒",
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

export default function RandomForestPage() {
  const [mode, setMode] = useState<"classification" | "regression">("classification");

  if (mode === "regression") {
    return (
      <div className="max-w-7xl mx-auto animate-fade-in">
        <ModeToggle mode={mode} onModeChange={setMode} />
        <RandomForestRegressionContent />
      </div>
    );
  }

  return <RandomForestClassificationContent mode={mode} onModeChange={setMode} />;
}

function RandomForestClassificationContent({ mode, onModeChange }: { mode: "classification" | "regression"; onModeChange: (m: "classification" | "regression") => void }) {
  const { params, setParam, result, loading, error, train } = useAlgorithm<
    RandomForestRequest,
    RandomForestResponse
  >({
    endpoint: "/ensemble/random-forest/classify",
    defaultParams: {
      n_samples: 200,
      noise: 1.5,
      test_size: 0.2,
      random_state: 42,
      dataset_type: "moons",
      n_estimators: 100,
      criterion: "gini",
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

  // Helpers to split classes for plotting
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
      <ModeToggle mode={mode} onModeChange={onModeChange} />
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

          {/* Ensemble Stats Card */}
          {result && (
            <div className="clay-sm p-5 animate-bounce-in">
              <h4 className="text-sm font-extrabold text-text-muted mb-3 flex items-center gap-2">
                <Trees className="h-4 w-4 text-emerald-400" />
                Forest Statistics
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Trees in Forest</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {result.n_estimators_actual}
                  </span>
                </div>
                {result.oob_score !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">OOB Score</span>
                    <span className="text-lg font-bold text-amber-400">
                      {(result.oob_score * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Feature Importances</span>
                </div>
                {/* Feature importance bars */}
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
                            background:
                              "linear-gradient(90deg, #059669, #34D399)",
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
              {/* Ensemble Decision Boundary */}
              <div className="clay p-4">
                <h4 className="text-sm font-extrabold text-text-muted mb-2 flex items-center gap-2">
                  🌲 Ensemble Decision Boundary (All Trees Combined)
                </h4>
                <Plot
                  data={[
                    // Decision boundary contour
                    {
                      x: result.plot_data.xx[0],
                      y: result.plot_data.yy.map((row) => row[0]),
                      z: result.plot_data.z,
                      type: "contour",
                      colorscale: [
                        [0, "rgba(5,150,105,0.25)"],
                        [1, "rgba(59,130,246,0.25)"],
                      ],
                      showscale: false,
                      line: { width: 0 },
                      contours: { coloring: "fill" as const },
                      hoverinfo: "skip" as const,
                    },
                    // Class 0 — Train
                    (() => {
                      const d = getClassData(
                        result.plot_data.x_train,
                        result.plot_data.y_train,
                        0
                      );
                      return {
                        x: d.x0,
                        y: d.x1,
                        mode: "markers" as const,
                        type: "scatter" as const,
                        name: "Class 0 (Train)",
                        marker: {
                          color: "#059669",
                          size: 7,
                          line: { color: "#064E3B", width: 1 },
                        },
                      };
                    })(),
                    // Class 1 — Train
                    (() => {
                      const d = getClassData(
                        result.plot_data.x_train,
                        result.plot_data.y_train,
                        1
                      );
                      return {
                        x: d.x0,
                        y: d.x1,
                        mode: "markers" as const,
                        type: "scatter" as const,
                        name: "Class 1 (Train)",
                        marker: {
                          color: "#3B82F6",
                          size: 7,
                          line: { color: "#1E3A5F", width: 1 },
                        },
                      };
                    })(),
                    // Class 0 — Test
                    (() => {
                      const d = getClassData(
                        result.plot_data.x_test,
                        result.plot_data.y_test,
                        0
                      );
                      return {
                        x: d.x0,
                        y: d.x1,
                        mode: "markers" as const,
                        type: "scatter" as const,
                        name: "Class 0 (Test)",
                        marker: {
                          color: "#059669",
                          size: 9,
                          symbol: "diamond",
                          line: { color: "#fff", width: 1.5 },
                        },
                      };
                    })(),
                    // Class 1 — Test
                    (() => {
                      const d = getClassData(
                        result.plot_data.x_test,
                        result.plot_data.y_test,
                        1
                      );
                      return {
                        x: d.x0,
                        y: d.x1,
                        mode: "markers" as const,
                        type: "scatter" as const,
                        name: "Class 1 (Test)",
                        marker: {
                          color: "#3B82F6",
                          size: 9,
                          symbol: "diamond",
                          line: { color: "#fff", width: 1.5 },
                        },
                      };
                    })(),
                  ]}
                  layout={{
                    ...plotLayout,
                    title: {
                      text: "Random Forest — Ensemble Decision Boundary",
                      font: {
                        size: 15,
                        color: "#E4E4E7",
                        family: "Inter, sans-serif",
                      },
                    },
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  useResizeHandler
                  style={{ width: "100%", height: "500px" }}
                />
              </div>

              {/* Individual Tree Boundaries */}
              {result.individual_boundaries.length > 0 && (
                <div className="clay p-4">
                  <h4 className="text-sm font-extrabold text-text-muted mb-2 flex items-center gap-2">
                    <Shuffle className="h-4 w-4 text-amber-400" />
                    Individual Tree Decision Boundaries (First{" "}
                    {result.individual_boundaries.length} Trees)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {result.individual_boundaries.map((boundary) => (
                      <div key={boundary.tree_index} className="clay-sm p-2">
                        <Plot
                          data={[
                            {
                              x: result.individual_xx[0],
                              y: result.individual_yy.map(
                                (row: number[]) => row[0]
                              ),
                              z: boundary.z,
                              type: "contour",
                              colorscale: [
                                [0, "rgba(5,150,105,0.3)"],
                                [1, "rgba(59,130,246,0.3)"],
                              ],
                              showscale: false,
                              line: { width: 0.5, color: "rgba(255,255,255,0.15)" },
                              contours: { coloring: "fill" as const },
                              hoverinfo: "skip" as const,
                            },
                            // Train data (small markers)
                            (() => {
                              const d0 = getClassData(
                                result.plot_data.x_train,
                                result.plot_data.y_train,
                                0
                              );
                              return {
                                x: d0.x0,
                                y: d0.x1,
                                mode: "markers" as const,
                                type: "scatter" as const,
                                name: "Class 0",
                                showlegend: false,
                                marker: {
                                  color: "#059669",
                                  size: 3,
                                  opacity: 0.6,
                                },
                              };
                            })(),
                            (() => {
                              const d1 = getClassData(
                                result.plot_data.x_train,
                                result.plot_data.y_train,
                                1
                              );
                              return {
                                x: d1.x0,
                                y: d1.x1,
                                mode: "markers" as const,
                                type: "scatter" as const,
                                name: "Class 1",
                                showlegend: false,
                                marker: {
                                  color: "#3B82F6",
                                  size: 3,
                                  opacity: 0.6,
                                },
                              };
                            })(),
                          ]}
                          layout={{
                            ...plotLayout,
                            title: {
                              text: `Tree #${boundary.tree_index + 1}`,
                              font: {
                                size: 12,
                                color: "#A1A1AA",
                                family: "Inter, sans-serif",
                              },
                            },
                            margin: { t: 30, r: 10, b: 30, l: 30 },
                            xaxis: {
                              ...plotLayout.xaxis,
                              title: { text: "", font: { size: 10, color: "#71717A" } },
                            },
                            yaxis: {
                              ...plotLayout.yaxis,
                              title: { text: "", font: { size: 10, color: "#71717A" } },
                            },
                            showlegend: false,
                          }}
                          config={{
                            responsive: true,
                            displayModeBar: false,
                          }}
                          useResizeHandler
                          style={{ width: "100%", height: "220px" }}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-text-muted mt-2 italic">
                    Each tree sees a different bootstrap sample and random feature subset — notice
                    how their individual boundaries vary. The ensemble averages these jagged
                    boundaries into a smoother, more robust decision surface.
                  </p>
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
              <p className="text-text-muted font-bold">
                Assembling the forest...
              </p>
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
            code: `from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

X, y = make_classification(
    n_samples=200, n_features=2, n_redundant=0,
    n_informative=2, random_state=42
)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = RandomForestClassifier(
    n_estimators=100,     # Number of trees
    criterion="gini",     # Split quality measure
    max_depth=None,       # No depth limit
    max_features="sqrt",  # √n features per split
    bootstrap=True,       # Use bootstrap samples
    oob_score=True,       # Track out-of-bag accuracy
    random_state=42,
    n_jobs=-1,            # Use all CPU cores
)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, y_pred))
print("OOB Score:", model.oob_score_)
print("Feature Importances:", model.feature_importances_)
print(classification_report(y_test, y_pred))`,
          },
        ]}
      />
    </div>
  );
}
