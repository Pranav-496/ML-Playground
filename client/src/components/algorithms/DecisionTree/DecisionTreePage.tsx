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
import DecisionTreeGraph, { type TreeNode } from "./DecisionTreeGraph";

/* ----- Request / Response types ----- */

interface DecisionTreeRequest {
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

interface DecisionTreeResponse {
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
      { value: "moons", label: "Moons (Non-linear)" },
      { value: "blobs", label: "Blobs (Clusters)" },
    ],
    default: "moons",
    description: "Shape of the generated data.",
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
    max: 5.0,
    step: 0.1,
    default: 1.5,
    description: "How noisy the data generation is.",
  },
  {
    type: "select",
    label: "Criterion",
    key: "criterion",
    options: [
      { value: "gini", label: "Gini Impurity" },
      { value: "entropy", label: "Entropy / Info Gain" },
      { value: "log_loss", label: "Log Loss" },
    ],
    default: "gini",
    description: "Function to measure the quality of a split.",
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
    description: "Strategy used to choose the split at each node.",
  },
  {
    type: "slider",
    label: "Max Depth (0 = None)",
    key: "max_depth",
    min: 0,
    max: 50,
    step: 1,
    default: 0,
    description: "Maximum depth of the tree. 0 means nodes are expanded until all leaves are pure.",
  },
  {
    type: "slider",
    label: "Min Samples Split",
    key: "min_samples_split",
    min: 2,
    max: 100,
    step: 1,
    default: 2,
    description: "Minimum number of samples required to split an internal node.",
  },
  {
    type: "slider",
    label: "Min Samples Leaf",
    key: "min_samples_leaf",
    min: 1,
    max: 100,
    step: 1,
    default: 1,
    description: "Minimum number of samples required to be at a leaf node.",
  },
  {
    type: "select",
    label: "Max Features",
    key: "max_features",
    options: [
      { value: "none", label: "None (All)" },
      { value: "sqrt", label: "Square Root" },
      { value: "log2", label: "Log2" },
    ],
    default: "none",
    description: "Number of features to consider when looking for the best split.",
  },
  {
    type: "slider",
    label: "Max Leaf Nodes (0 = None)",
    key: "max_leaf_nodes",
    min: 0,
    max: 200,
    step: 5,
    default: 0,
    description: "Grow a tree with Max Leaf Nodes in best-first fashion.",
  },
  {
    type: "slider",
    label: "Min Impurity Decrease",
    key: "min_impurity_decrease",
    min: 0.0,
    max: 0.5,
    step: 0.01,
    default: 0.0,
    description: "A node will be split if this split induces a decrease of the impurity greater than or equal to this value.",
  },
];

/* ----- Theory content ----- */

const theoryContent = [
  {
    heading: "What is a Decision Tree?",
    emoji: "🌳",
    content:
      "A decision tree asks a sequence of true/false questions about the features to partition the data. Because it splits axes perpendicularly (e.g. 'is Feature 1 > 0.5?'), the decision boundaries always look like a series of rectangles or step functions.",
  },
  {
    heading: "Gini vs Entropy",
    emoji: "📏",
    content:
      "When a node evaluates a split, it wants to produce the most 'pure' child nodes (nodes containing mostly one class). Gini Impurity and Entropy are mathematical ways to score how mixed a node is. The Splitter tries to minimize this impurity.",
  },
  {
    heading: "Overfitting & Pruning",
    emoji: "✂️",
    content:
      "A fully grown Decision Tree with no depth limits will keep making splits until every leaf is 100% pure, perfectly memorizing the training data (including the noise). This causes severe overfitting. We control this via hyperparameters like Max Depth, Min Samples Leaf, and Min Impurity Decrease.",
  },
];

/* ----- Param explainer content ----- */

const paramExplainerData = [
  {
    name: "Max Depth",
    description: "Limits how many layers of questions the tree can ask.",
    impact: "Small Max Depth → Underfitting, simple boundaries. Large Max Depth → Overfitting, highly complex blocky boundaries around individual noise points.",
    emoji: "⬇️",
  },
  {
    name: "Min Samples Leaf",
    description: "Requires a leaf to have at least this many data points.",
    impact: "High values force the tree to create broader, smoother regions rather than making a tiny rectangular box for a single anomalous point.",
    emoji: "🍂",
  },
  {
    name: "Splitter",
    description: "How to choose the split threshold.",
    impact: "'Best' looks at all possible thresholds to maximize purity. 'Random' picks random thresholds, creating ensembles later (like Random Forest).",
    emoji: "🔀",
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

export default function DecisionTreePage() {
  const { params, setParam, result, loading, error, train } = useAlgorithm<
    DecisionTreeRequest,
    DecisionTreeResponse
  >({
    endpoint: "/classification/decision-tree",
    defaultParams: {
      n_samples: 200,
      noise: 1.5,
      test_size: 0.2,
      random_state: 42,
      dataset_type: "moons",
      criterion: "gini",
      splitter: "best",
      max_depth: 0,
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
            <>
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
                      [0, "rgba(59, 130, 246, 0.3)"], // Class 0 region (Blue)
                      [1, "rgba(239, 68, 68, 0.3)"]   // Class 1 region (Red)
                    ],
                    showscale: false,
                    hoverinfo: "skip",
                    line: {
                      width: 1.5,
                      color: "rgba(255,255,255,0.7)" // The actual decision boundary line
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
                    marker: { color: "#3B82F6", size: 8, opacity: 0.9, line: { width: 1, color: "rgba(0,0,0,0.5)" } },
                  },
                  // Train Data Class 1
                  {
                    x: getClassData(result.plot_data.x_train, result.plot_data.y_train, 1).x0,
                    y: getClassData(result.plot_data.x_train, result.plot_data.y_train, 1).x1,
                    mode: "markers",
                    type: "scatter",
                    name: "Train (Class 1)",
                    marker: { color: "#EF4444", size: 8, opacity: 0.9, line: { width: 1, color: "rgba(0,0,0,0.5)" } },
                  },
                  // Test Data Class 0
                  {
                    x: getClassData(result.plot_data.x_test, result.plot_data.y_test, 0).x0,
                    y: getClassData(result.plot_data.x_test, result.plot_data.y_test, 0).x1,
                    mode: "markers",
                    type: "scatter",
                    name: "Test (Class 0)",
                    marker: { color: "#60A5FA", size: 9, symbol: "diamond", opacity: 1, line: { width: 1, color: "rgba(0,0,0,0.7)" } },
                  },
                  // Test Data Class 1
                  {
                    x: getClassData(result.plot_data.x_test, result.plot_data.y_test, 1).x0,
                    y: getClassData(result.plot_data.x_test, result.plot_data.y_test, 1).x1,
                    mode: "markers",
                    type: "scatter",
                    name: "Test (Class 1)",
                    marker: { color: "#F87171", size: 9, symbol: "diamond", opacity: 1, line: { width: 1, color: "rgba(0,0,0,0.7)" } },
                  }
                ]}
                layout={{
                  ...plotLayout,
                  title: {
                    text: "Decision Tree Boundary",
                    font: { size: 16, color: "#F8FAFC", family: "Cinzel, serif" },
                  },
                  autosize: true,
                }}
                config={{ responsive: true, displayModeBar: false }}
                useResizeHandler
                style={{ width: "100%", height: "420px" }}
              />
            </div>
            
            {/* Tree Visualization */}
            <div className="clay p-4">
              <h3 className="text-lg font-extrabold text-text-primary mb-2 px-2">
                🌳 Learned Tree Structure
              </h3>
              <DecisionTreeGraph 
                tree={result.tree_structure} 
                criterion={params.criterion as string} 
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
