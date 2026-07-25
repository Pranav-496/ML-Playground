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

interface SvmRequest {
  n_samples: number;
  noise: number;
  test_size: number;
  random_state: number;
  dataset_type: string;
  C: number;
  kernel: string;
  gamma: string;
  degree: number;
  coef0: number;
  [key: string]: unknown;
}

interface SvmResponse {
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
  support_vectors: number[][];
  n_support_vectors: number;
  decision_function: {
    xx: number[][];
    yy: number[][];
    values: number[][];
  };
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
    description: "The kernel function projects data into a higher-dimensional space where a linear separator can be found.",
  },
  {
    type: "slider",
    label: "C (Regularization)",
    key: "C",
    min: 0.01,
    max: 100,
    step: 0.1,
    default: 1.0,
    description: "Trade-off between smooth decision boundary and classifying points correctly. Low C = wider margin, more misclassifications. High C = narrow margin, fewer errors.",
  },
  {
    type: "slider",
    label: "Degree (Poly Kernel)",
    key: "degree",
    min: 2,
    max: 8,
    step: 1,
    default: 3,
    description: "Only used with polynomial kernel. Controls the flexibility of the decision boundary.",
  },
  {
    type: "slider",
    label: "Coef0 (Poly/Sigmoid)",
    key: "coef0",
    min: -5.0,
    max: 5.0,
    step: 0.5,
    default: 0.0,
    description: "Independent term in kernel function. Influences high-degree polynomial terms.",
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
    description: "Controls how much the two classes overlap. Higher noise makes classification harder.",
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
    description: "Seed for data generation and splitting.",
  },
];

/* ----- Theory content ----- */

const theoryContent = [
  {
    heading: "What is SVM?",
    emoji: "⚔️",
    content:
      "Support Vector Machines find the optimal hyperplane that separates classes with the maximum margin. The 'margin' is the distance between the decision boundary and the nearest data points from each class — called Support Vectors. SVM aims to maximize this margin for better generalization.",
  },
  {
    heading: "The Kernel Trick",
    emoji: "🔮",
    content:
      "When data isn't linearly separable, SVM uses the kernel trick to implicitly project it into a higher-dimensional space. The RBF (Gaussian) kernel maps data into infinite dimensions. A polynomial kernel maps into polynomial feature space. The beauty: we never explicitly compute these transformations — the kernel function handles it through dot products.",
  },
  {
    heading: "The Math",
    emoji: "🧮",
    content:
      "SVM minimizes: ½||w||² + C Σ ξᵢ\nSubject to: yᵢ(w·xᵢ + b) ≥ 1 - ξᵢ\n\nWhere:\n• w = weight vector (defines the hyperplane)\n• ξᵢ = slack variables (allow misclassifications)\n• C = penalty for misclassification (regularization)",
  },
  {
    heading: "When to use SVM",
    emoji: "🎯",
    content:
      "SVM excels when: the number of features is high relative to samples, you need a clear margin of separation, and the dataset is small to medium-sized. It struggles with very large datasets (training is O(n²) to O(n³)) and when classes heavily overlap.",
  },
];

/* ----- Param explainer ----- */

const paramExplainerData = [
  {
    name: "C (Regularization)",
    description: "Controls the trade-off between a smooth decision boundary and correctly classifying training points.",
    impact: "Low C → wide margin, accepts more misclassifications (soft margin, prevents overfitting). High C → narrow margin, aggressively fits every point (risk of overfitting).",
    emoji: "⚖️",
  },
  {
    name: "Kernel",
    description: "The mathematical function that projects data into a higher-dimensional space.",
    impact: "RBF: handles complex non-linear boundaries. Linear: fast, simple separator. Poly: curved boundaries controlled by degree. Sigmoid: similar to neural network activation.",
    emoji: "🔮",
  },
  {
    name: "Degree",
    description: "The degree of the polynomial kernel function. Ignored by other kernels.",
    impact: "Higher degree → more flexible curve → can overfit. Degree 2 gives elliptical boundaries. Degree 3+ gives complex shapes.",
    emoji: "📐",
  },
  {
    name: "Coef0",
    description: "Independent constant term in polynomial and sigmoid kernel functions.",
    impact: "Controls the influence of higher-degree terms vs lower-degree terms in polynomial kernels.",
    emoji: "➕",
  },
  {
    name: "Dataset Type",
    description: "Shape of the synthetic dataset.",
    impact: "Blobs → easily separable with Linear kernel. Circles/Moons/Spirals → impossible for Linear kernel; requires RBF or Poly kernel to achieve good classification performance.",
    emoji: "📊",
  },
];

/* ----- Plotly layout helper ----- */

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

export default function SvmPage() {
  const { params, setParam, result, loading, error, train } = useAlgorithm<
    SvmRequest,
    SvmResponse
  >({
    endpoint: "/classification/svm",
    defaultParams: {
      n_samples: 200,
      noise: 1.5,
      test_size: 0.2,
      random_state: 42,
      dataset_type: "moons",
      C: 1.0,
      kernel: "rbf",
      gamma: "scale",
      degree: 3,
      coef0: 0.0,
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

          {/* Support Vector Count */}
          {result && (
            <div className="clay-sm p-5 animate-bounce-in">
              <h4 className="text-sm font-extrabold text-text-muted mb-3 flex items-center gap-2">
                <CircleDot className="h-4 w-4 text-gold" />
                Support Vectors
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Total Support Vectors</span>
                  <span className="text-lg font-bold text-gold">{result.n_support_vectors}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Total Samples</span>
                  <span className="text-sm font-bold text-text-primary">{params.n_samples}</span>
                </div>
                {/* Ratio bar */}
                <div className="w-full h-3 bg-surface-hover rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.min(100, (result.n_support_vectors / (params.n_samples as number)) * 100)}%`,
                      background: "linear-gradient(90deg, #F59E0B, #FBBF24)",
                    }}
                  />
                </div>
                <p className="text-xs text-text-muted">
                  <span className="font-bold text-gold">
                    {Math.round((result.n_support_vectors / (params.n_samples as number)) * 100)}%
                  </span>{" "}
                  of training points are support vectors — they define the decision boundary.
                </p>
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
              {/* Decision boundary + support vectors */}
              <div className="clay p-4">
                <Plot
                  data={[
                    // Decision boundary contour
                    {
                      x: result.plot_data.xx[0],
                      y: result.plot_data.yy.map((row) => row[0]),
                      z: result.plot_data.z,
                      type: "contour",
                      colorscale: [
                        [0, "rgba(185,28,28,0.25)"],
                        [1, "rgba(59,130,246,0.25)"],
                      ],
                      showscale: false,
                      line: { width: 0 },
                      contours: { coloring: "fill" as const },
                      hoverinfo: "skip" as const,
                    },
                    // Decision function contours (margin lines at -1, 0, +1)
                    ...(result.decision_function
                      ? [
                          {
                            x: result.decision_function.xx[0],
                            y: result.decision_function.yy.map((row: number[]) => row[0]),
                            z: result.decision_function.values,
                            type: "contour" as const,
                            showscale: false,
                            contours: {
                              coloring: "none" as const,
                              showlabels: false,
                              start: -1,
                              end: 1,
                              size: 1,
                            },
                            line: {
                              color: "#F59E0B",
                              width: 1.5,
                              dash: "dash" as const,
                            },
                            hoverinfo: "skip" as const,
                            name: "Margin",
                          },
                        ]
                      : []),
                    // Class 0 — Train
                    (() => {
                      const cls = getClassData(result.plot_data.x_train, result.plot_data.y_train, 0);
                      return {
                        x: cls.x0,
                        y: cls.x1,
                        mode: "markers" as const,
                        type: "scatter" as const,
                        name: "Class 0 (Train)",
                        marker: { color: "#DC2626", size: 7, opacity: 0.7, line: { width: 1, color: "rgba(0,0,0,0.3)" } },
                      };
                    })(),
                    // Class 1 — Train
                    (() => {
                      const cls = getClassData(result.plot_data.x_train, result.plot_data.y_train, 1);
                      return {
                        x: cls.x0,
                        y: cls.x1,
                        mode: "markers" as const,
                        type: "scatter" as const,
                        name: "Class 1 (Train)",
                        marker: { color: "#3B82F6", size: 7, opacity: 0.7, line: { width: 1, color: "rgba(0,0,0,0.3)" } },
                      };
                    })(),
                    // Class 0 — Test
                    (() => {
                      const cls = getClassData(result.plot_data.x_test, result.plot_data.y_test, 0);
                      return {
                        x: cls.x0,
                        y: cls.x1,
                        mode: "markers" as const,
                        type: "scatter" as const,
                        name: "Class 0 (Test)",
                        marker: { color: "#DC2626", size: 9, symbol: "diamond", opacity: 0.9, line: { width: 1.5, color: "rgba(255,255,255,0.3)" } },
                      };
                    })(),
                    // Class 1 — Test
                    (() => {
                      const cls = getClassData(result.plot_data.x_test, result.plot_data.y_test, 1);
                      return {
                        x: cls.x0,
                        y: cls.x1,
                        mode: "markers" as const,
                        type: "scatter" as const,
                        name: "Class 1 (Test)",
                        marker: { color: "#3B82F6", size: 9, symbol: "diamond", opacity: 0.9, line: { width: 1.5, color: "rgba(255,255,255,0.3)" } },
                      };
                    })(),
                    // Support Vectors — highlighted
                    ...(result.support_vectors
                      ? [
                          {
                            x: result.support_vectors.map((sv: number[]) => sv[0]),
                            y: result.support_vectors.map((sv: number[]) => sv[1]),
                            mode: "markers" as const,
                            type: "scatter" as const,
                            name: "Support Vectors",
                            marker: {
                              color: "rgba(0,0,0,0)",
                              size: 16,
                              line: { width: 2.5, color: "#F59E0B" },
                            },
                          },
                        ]
                      : []),
                  ]}
                  layout={{
                    ...plotLayout,
                    title: {
                      text: "SVM Decision Boundary & Margin",
                      font: { size: 16, color: "#F8FAFC", family: "Cinzel, serif" },
                    },
                    autosize: true,
                    xaxis: {
                      ...plotLayout.xaxis,
                      range: [result.plot_data.x_min, result.plot_data.x_max],
                    },
                    yaxis: {
                      ...plotLayout.yaxis,
                      range: [result.plot_data.y_min, result.plot_data.y_max],
                    },
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  useResizeHandler
                  style={{ width: "100%", height: "500px" }}
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
      <CodeSection snippets={[
        {
          title: "Import & Train",
          code: `from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
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

# SVM works best with scaled features
model = make_pipeline(
    StandardScaler(),
    SVC(
        kernel="rbf",   # "linear", "poly", "rbf", "sigmoid"
        C=1.0,          # regularization parameter
        gamma="scale",  # kernel coefficient
    )
)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, y_pred))
print(classification_report(y_test, y_pred))`,
        },
      ]} />
    </div>
  );
}
