import { useEffect } from "react";
import Plot from "react-plotly.js";
import { TrendingUp, Target, BarChart3, Percent } from "lucide-react";
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

interface BernoulliNBRequest {
  n_samples: number;
  noise: number;
  test_size: number;
  random_state: number;
  dataset_type: string;
  alpha: number;
  binarize: number;
  [key: string]: unknown;
}

interface BernoulliNBResponse {
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
  class_log_prior: number[];
  feature_log_prob: number[][];
  model_params: Record<string, unknown>;
}

/* ----- Hyperparameter config ----- */

const hyperParams: HyperParam[] = [
  {
    type: "select",
    label: "Dataset",
    key: "dataset_type",
    options: [
      { value: "blobs", label: "Gaussian Blobs" },
      { value: "moons", label: "Half Moons" },
      { value: "circles", label: "Concentric Circles" },
      { value: "xor", label: "XOR Pattern" },
      { value: "spirals", label: "Spirals" },
      { value: "anisotropic", label: "Anisotropic" },
    ],
    default: "blobs",
    description: "Shape of generated data.",
  },
  {
    type: "slider",
    label: "Binarize Threshold",
    key: "binarize",
    min: -5,
    max: 5,
    step: 0.5,
    default: 0.0,
    description: "Threshold for binarizing continuous features. If feature > threshold, it becomes 1. Else 0.",
  },
  {
    type: "slider",
    label: "Alpha (Laplace)",
    key: "alpha",
    min: 0,
    max: 5,
    step: 0.1,
    default: 1.0,
    description: "Laplace smoothing parameter. Adds virtual counts to prevent zero probabilities.",
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
    description: "Controls the spread of the clusters. Higher noise = more overlap.",
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
    heading: "What is Bernoulli Naive Bayes?",
    emoji: "🪙",
    content:
      "Bernoulli NB assumes that all features are binary (boolean) variables. It models the presence or absence of a feature. For example, in text classification, it asks 'Does this word appear in the document?' (Yes/No), ignoring how many times it appears.",
  },
  {
    heading: "Binarization",
    emoji: "🎚️",
    content:
      "If you pass continuous data (like our x, y coordinates here) into Bernoulli NB, it MUST be converted to binary first. The 'Binarize Threshold' parameter does this: any value strictly greater than the threshold becomes 1, and everything else becomes 0.",
  },
  {
    heading: "The Decision Boundary",
    emoji: "🟩",
    content:
      "Because the features are discretized into 0s and 1s based on the threshold, the resulting decision boundary forms blocky, orthogonal grid patterns, unlike the smooth curves of Gaussian NB or SVM.",
  },
  {
    heading: "Laplace Smoothing (Alpha)",
    emoji: "🩹",
    content:
      "If a feature never appears in the training data for a specific class, the probability becomes 0, zeroing out the entire calculation. 'Alpha' adds virtual counts to every feature to prevent this.",
  },
];

/* ----- Param explainer ----- */

const paramExplainerData = [
  {
    name: "Binarize Threshold",
    description: "The cutoff point for turning continuous data into binary 0/1.",
    impact: "Moving this changes where the vertical and horizontal grid lines of the decision boundary are placed. If set too high or low, all features become 0 or 1, and the model predicts a single class.",
    emoji: "🎚️",
  },
  {
    name: "Alpha",
    description: "Smoothing parameter to prevent zero probabilities.",
    impact: "Low alpha → trusts the data strictly. High alpha → pushes probabilities towards 50/50, acting as regularization.",
    emoji: "🛡️",
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

export default function BernoulliNBPage() {
  const { params, setParam, result, loading, error, train } = useAlgorithm<
    BernoulliNBRequest,
    BernoulliNBResponse
  >({
    endpoint: "/classification/bernoulli-nb",
    defaultParams: {
      n_samples: 200,
      noise: 1.5,
      test_size: 0.2,
      random_state: 42,
      dataset_type: "blobs",
      alpha: 1.0,
      binarize: 0.0,
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
              {/* Decision boundary */}
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
                    // Binarize Threshold Lines
                    {
                        x: [params.binarize as number, params.binarize as number],
                        y: [result.plot_data.y_min, result.plot_data.y_max],
                        mode: "lines" as const,
                        type: "scatter" as const,
                        name: "X Threshold",
                        line: { color: "#F59E0B", width: 2, dash: "dash" },
                        hoverinfo: "skip" as const,
                    },
                    {
                        x: [result.plot_data.x_min, result.plot_data.x_max],
                        y: [params.binarize as number, params.binarize as number],
                        mode: "lines" as const,
                        type: "scatter" as const,
                        name: "Y Threshold",
                        line: { color: "#F59E0B", width: 2, dash: "dash" },
                        hoverinfo: "skip" as const,
                    },
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
                  ]}
                  layout={{
                    ...plotLayout,
                    title: {
                      text: "Bernoulli NB Grid Boundary",
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
          code: `from sklearn.naive_bayes import BernoulliNB
from sklearn.preprocessing import Binarizer
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

# BernoulliNB is designed for binary/boolean features
# Binarizer converts continuous features to 0/1
model = make_pipeline(
    Binarizer(threshold=0.0),
    BernoulliNB(alpha=1.0, binarize=None)
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
