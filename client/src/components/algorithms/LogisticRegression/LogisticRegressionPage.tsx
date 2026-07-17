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

interface LogisticRequest {
  n_samples: number;
  noise: number;
  test_size: number;
  random_state: number;
  C: number;
  penalty: string;
  max_iter: number;
  [key: string]: unknown;
}

interface LogisticResponse {
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
  coefficients: number[];
  intercept: number[];
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
    label: "Inverse Regularization (C)",
    key: "C",
    min: 0.01,
    max: 10.0,
    step: 0.01,
    default: 1.0,
    description: "Inverse of regularization strength. Smaller values specify stronger regularization.",
  },
  {
    type: "select",
    label: "Penalty",
    key: "penalty",
    options: [
      { value: "l2", label: "L2 (Ridge)" },
      { value: "none", label: "None" },
    ],
    default: "l2",
    description: "Norm used in the penalization.",
  },
  {
    type: "slider",
    label: "Max Iterations",
    key: "max_iter",
    min: 50,
    max: 1000,
    step: 50,
    default: 100,
    description: "Maximum number of iterations taken for the solvers to converge.",
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
    heading: "What is Logistic Regression?",
    emoji: "🔮",
    content:
      "Despite its name, Logistic Regression is a classification algorithm. It's used to predict a binary outcome (1 / 0, Yes / No, True / False) given a set of independent variables. It fits a line (or hyperplane) to separate the classes.",
  },
  {
    heading: "The Sigmoid Function",
    emoji: "📈",
    content:
      "Instead of fitting a straight line, it passes a linear combination of inputs through a Sigmoid function: σ(z) = 1 / (1 + e^-z). This maps any real-valued number into a value between 0 and 1, representing the probability of the default class.",
  },
  {
    heading: "Decision Boundary",
    emoji: "✂️",
    content:
      "The decision boundary is the line where the predicted probability is exactly 0.5. For 2D data, it's a straight line that separates the two classes.",
  },
  {
    heading: "Regularization (C)",
    emoji: "⚖️",
    content:
      "The 'C' parameter controls regularization strength. It is the inverse of regularization strength (C = 1/λ). A low C means MORE regularization (simpler model, prevents overfitting). A high C means LESS regularization (fits training data closer).",
  },
];

/* ----- Param explainer content ----- */

const paramExplainerData = [
  {
    name: "Noise",
    description: "Controls how overlapping the two classes are.",
    impact: "Low noise → clearly separated classes. High noise → classes mix, making it harder for a linear model to draw a perfect boundary.",
    emoji: "🌫️",
  },
  {
    name: "Inverse Regularization (C)",
    description: "How much to penalize large coefficients.",
    impact: "Small C → coefficients are pushed toward zero. Large C → model trusts the training data more, potentially overfitting if data is noisy.",
    emoji: "🛡️",
  },
  {
    name: "Penalty",
    description: "Type of regularization to apply.",
    impact: "L2 shrinks coefficients evenly. 'None' applies no regularization.",
    emoji: "📏",
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

export default function LogisticRegressionPage() {
  const { params, setParam, result, loading, error, train } = useAlgorithm<
    LogisticRequest,
    LogisticResponse
  >({
    endpoint: "/classification/logistic",
    defaultParams: {
      n_samples: 200,
      noise: 1.5,
      test_size: 0.2,
      random_state: 42,
      C: 1.0,
      penalty: "l2",
      max_iter: 100,
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
                    text: "Decision Boundary",
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
