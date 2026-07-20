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

interface GaussianNBRequest {
  n_samples: number;
  noise: number;
  test_size: number;
  random_state: number;
  dataset_type: string;
  var_smoothing: number;
  [key: string]: unknown;
}

interface GaussianNBResponse {
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
  class_prior: number[];
  theta: number[][];
  var: number[][];
  model_params: Record<string, unknown>;
}

/* ----- Hyperparameter config ----- */

const hyperParams: HyperParam[] = [
  {
    type: "select",
    label: "Dataset",
    key: "dataset_type",
    options: [
      { value: "blobs", label: "Blobs (Gaussian Clusters)" },
      { value: "moons", label: "Moons (Non-linear)" },
    ],
    default: "blobs",
    description: "Shape of generated data. Gaussian NB assumes features are normally distributed, making it perfect for Blobs.",
  },
  {
    type: "slider",
    label: "Var Smoothing",
    key: "var_smoothing",
    min: -12,
    max: -1,
    step: 1,
    default: -9,
    description: "10^x: Portion of the largest variance of all features that is added to variances for calculation stability.",
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
    description: "Seed for data generation and splitting.",
  },
];

/* ----- Theory content ----- */

const theoryContent = [
  {
    heading: "What is Gaussian Naive Bayes?",
    emoji: "🔔",
    content:
      "Naive Bayes classifiers apply Bayes' theorem with a 'naive' assumption: all features are independent of each other. Gaussian Naive Bayes specifically assumes that continuous features follow a Gaussian (normal) distribution.",
  },
  {
    heading: "Bayes' Theorem",
    emoji: "🧮",
    content:
      "P(Class | Features) = [P(Features | Class) * P(Class)] / P(Features)\n\n• P(Class) is the Prior probability.\n• P(Features | Class) is the Likelihood.\n• P(Class | Features) is the Posterior (what we want to predict).",
  },
  {
    heading: "The Gaussian Assumption",
    emoji: "📉",
    content:
      "Since our features are continuous (x, y coordinates), we need to estimate P(Feature | Class). Gaussian NB calculates the mean (μ) and variance (σ²) of the features for each class, and uses the Gaussian probability density function to estimate likelihood.",
  },
  {
    heading: "Why is it 'Naive'?",
    emoji: "🫣",
    content:
      "It assumes that knowing one feature gives no information about the other features. In real life, features are often correlated. Despite this mathematically flawed assumption, Naive Bayes often performs surprisingly well, especially on high-dimensional data like text.",
  },
];

/* ----- Param explainer ----- */

const paramExplainerData = [
  {
    name: "Dataset (Blobs vs Moons)",
    description: "How the data is distributed in space.",
    impact: "Gaussian NB draws elliptical boundaries. It excels on 'Blobs' because they are Gaussian. It fails on 'Moons' because the data distribution is crescent-shaped, breaking the Gaussian assumption.",
    emoji: "🎯",
  },
  {
    name: "Var Smoothing",
    description: "Adds a tiny value to variances for numerical stability.",
    impact: "Prevents division-by-zero errors when calculating probabilities if a feature has zero variance. A higher value artificially widens the Gaussian curves.",
    emoji: "➕",
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

export default function GaussianNBPage() {
  const { params, setParam, result, loading, error, train } = useAlgorithm<
    GaussianNBRequest,
    GaussianNBResponse
  >({
    endpoint: "/classification/gaussian-nb",
    defaultParams: {
      n_samples: 200,
      noise: 1.5,
      test_size: 0.2,
      random_state: 42,
      dataset_type: "blobs",
      var_smoothing: -9,
    },
  });

  useEffect(() => {
    handleTrain();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Request requires var_smoothing to be 10^value
  const handleTrain = () => {
    const payload = {
      ...params,
      var_smoothing: Math.pow(10, params.var_smoothing as number),
    };
    train(payload);
  };

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
            onRun={handleTrain}
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
                    // Class Means (Theta)
                    {
                        x: result.theta.map(t => t[0]),
                        y: result.theta.map(t => t[1]),
                        mode: "markers" as const,
                        type: "scatter" as const,
                        name: "Class Means (μ)",
                        marker: {
                            color: ["#DC2626", "#3B82F6"],
                            size: 16,
                            symbol: "cross",
                            line: { width: 3, color: "#FFFFFF" },
                        },
                    },
                  ]}
                  layout={{
                    ...plotLayout,
                    title: {
                      text: "Gaussian NB Decision Boundary",
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
    </div>
  );
}
