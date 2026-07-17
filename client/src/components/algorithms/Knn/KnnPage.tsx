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

interface KnnRequest {
  n_samples: number;
  noise: number;
  test_size: number;
  random_state: number;
  n_neighbors: number;
  weights: string;
  p: number;
  [key: string]: unknown;
}

interface KnnResponse {
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
  model_params: Record<string, unknown>;
}

/* ----- Hyperparameter config ----- */

const hyperParams: HyperParam[] = [
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
    label: "Noise (Cluster STD)",
    key: "noise",
    min: 0.1,
    max: 5.0,
    step: 0.1,
    default: 1.5,
    description: "Standard deviation of clusters. Higher noise = classes overlap more.",
  },
  {
    type: "slider",
    label: "K (Neighbors)",
    key: "n_neighbors",
    min: 1,
    max: 50,
    step: 1,
    default: 5,
    description: "Number of neighbors to use for classification.",
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
      { value: 1, label: "Manhattan (p=1)" },
      { value: 2, label: "Euclidean (p=2)" },
    ],
    default: 2,
    description: "Power parameter for the Minkowski metric.",
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
    heading: "What is K-Nearest Neighbors?",
    emoji: "👥",
    content:
      "K-Nearest Neighbors (KNN) is a simple, instance-based learning algorithm. To classify a new data point, it looks at the 'K' closest data points in the training set and assigns the class that is most common among them.",
  },
  {
    heading: "Choosing K",
    emoji: "🎯",
    content:
      "The value of K controls the smoothness of the decision boundary. A small K (like 1) creates a highly complex, jagged boundary that fits the training data perfectly but might overfit (capturing noise). A large K creates a smoother, simpler boundary that generalizes better but might underfit.",
  },
  {
    heading: "Distance Metrics",
    emoji: "📏",
    content:
      "KNN needs a way to measure 'closeness'. Euclidean distance (straight line) is the most common. Manhattan distance (grid-like path) is another option. The choice of distance metric can affect the shape of the decision boundary.",
  },
  {
    heading: "Weighting Neighbors",
    emoji: "⚖️",
    content:
      "By default, all K neighbors have an equal vote ('Uniform'). Alternatively, closer neighbors can be given more influence than further ones ('Distance'). This is especially useful when K is large or classes overlap heavily.",
  },
];

/* ----- Param explainer content ----- */

const paramExplainerData = [
  {
    name: "K (Neighbors)",
    description: "The number of closest points considered for voting.",
    impact: "Low K → Overfitting, noisy decision boundaries (island-like regions). High K → Smoother boundaries, but too high can lead to underfitting.",
    emoji: "🔢",
  },
  {
    name: "Weights",
    description: "How much each neighbor's vote counts.",
    impact: "Uniform treats all neighbors equally. Distance gives closer neighbors a stronger vote, often creating tighter boundaries around dense regions.",
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

export default function KnnPage() {
  const { params, setParam, result, loading, error, train } = useAlgorithm<
    KnnRequest,
    KnnResponse
  >({
    endpoint: "/classification/knn",
    defaultParams: {
      n_samples: 200,
      noise: 1.5,
      test_size: 0.2,
      random_state: 42,
      n_neighbors: 5,
      weights: "uniform",
      p: 2,
    },
  });

  useEffect(() => {
    train();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Helper to split class 0 and class 1 for plotting
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
                  // Decision Boundary (Contour)
                  {
                    z: result.plot_data.z,
                    x: result.plot_data.xx[0], // 1D array of x coordinates
                    y: result.plot_data.yy.map(row => row[0]), // 1D array of y coordinates
                    type: "contour",
                    colorscale: [
                      [0, "rgba(59, 130, 246, 0.2)"], // Class 0 region (Blue)
                      [1, "rgba(239, 68, 68, 0.2)"]   // Class 1 region (Red)
                    ],
                    showscale: false,
                    hoverinfo: "skip",
                    line: {
                      width: 2,
                      color: "rgba(255,255,255,0.5)" // The actual decision boundary line
                    },
                    contours: {
                      start: 0.5,
                      end: 0.5,
                      size: 1, // Only draw the 0.5 boundary
                    }
                  } as any,
                  // Train Data Class 0
                  {
                    x: getClassData(result.plot_data.x_train, result.plot_data.y_train, 0).x0,
                    y: getClassData(result.plot_data.x_train, result.plot_data.y_train, 0).x1,
                    mode: "markers",
                    type: "scatter",
                    name: "Train (Class 0)",
                    marker: { color: "#3B82F6", size: 8, opacity: 0.8, line: { width: 1, color: "rgba(0,0,0,0.5)" } },
                  },
                  // Train Data Class 1
                  {
                    x: getClassData(result.plot_data.x_train, result.plot_data.y_train, 1).x0,
                    y: getClassData(result.plot_data.x_train, result.plot_data.y_train, 1).x1,
                    mode: "markers",
                    type: "scatter",
                    name: "Train (Class 1)",
                    marker: { color: "#EF4444", size: 8, opacity: 0.8, line: { width: 1, color: "rgba(0,0,0,0.5)" } },
                  },
                  // Test Data Class 0
                  {
                    x: getClassData(result.plot_data.x_test, result.plot_data.y_test, 0).x0,
                    y: getClassData(result.plot_data.x_test, result.plot_data.y_test, 0).x1,
                    mode: "markers",
                    type: "scatter",
                    name: "Test (Class 0)",
                    marker: { color: "#60A5FA", size: 9, symbol: "diamond", opacity: 0.9, line: { width: 1, color: "rgba(0,0,0,0.5)" } },
                  },
                  // Test Data Class 1
                  {
                    x: getClassData(result.plot_data.x_test, result.plot_data.y_test, 1).x0,
                    y: getClassData(result.plot_data.x_test, result.plot_data.y_test, 1).x1,
                    mode: "markers",
                    type: "scatter",
                    name: "Test (Class 1)",
                    marker: { color: "#F87171", size: 9, symbol: "diamond", opacity: 0.9, line: { width: 1, color: "rgba(0,0,0,0.5)" } },
                  }
                ]}
                layout={{
                  ...plotLayout,
                  title: {
                    text: "KNN Decision Boundary",
                    font: { size: 16, color: "#F8FAFC", family: "Cinzel, serif" },
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
              label="Accuracy"
              value={result.metrics.accuracy}
              icon={<Percent className="h-5 w-5" />}
              color="#22C55E"
              description="Overall percentage of correct predictions."
            />
            <MetricCard
              label="Precision"
              value={result.metrics.precision}
              icon={<Target className="h-5 w-5" />}
              color="#3B82F6"
              description="Accuracy of positive predictions (Macro)."
            />
            <MetricCard
              label="Recall"
              value={result.metrics.recall}
              icon={<BarChart3 className="h-5 w-5" />}
              color="#F59E0B"
              description="Fraction of positives correctly identified (Macro)."
            />
            <MetricCard
              label="F1 Score"
              value={result.metrics.f1_score}
              icon={<TrendingUp className="h-5 w-5" />}
              color="#A855F7"
              description="Harmonic mean of precision and recall."
            />
          </div>
        </div>
      )}

      {/* Param explainer */}
      <ParamExplainer params={paramExplainerData} />
    </div>
  );
}
