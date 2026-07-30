import { useEffect } from "react";
import Plot from "react-plotly.js";
import { TrendingUp, Layers, BarChart3, Shrink } from "lucide-react";
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

interface PcaRequest {
  n_samples: number;
  noise: number;
  random_state: number;
  dataset_type: string;
  n_components: number;
  [key: string]: unknown;
}

interface PcaResponse {
  n_features_original: number;
  n_components: number;
  explained_variance_ratio: number[];
  cumulative_variance: number[];
  singular_values: number[];
  components: number[][];
  total_variance_retained: number;
  projection: {
    x: number[];
    y: number[];
  };
  labels: number[];
  original_3d?: {
    x: number[];
    y: number[];
    z: number[];
  };
}

/* ----- Hyperparameters ----- */

const hyperParams: HyperParam[] = [
  {
    type: "select",
    label: "Dataset",
    key: "dataset_type",
    options: [
      { value: "blobs_3d", label: "3D Blobs (3 clusters)" },
      { value: "blobs_5d", label: "5D Blobs (4 clusters)" },
      { value: "blobs_10d", label: "10D Blobs (5 clusters)" },
      { value: "correlated", label: "Correlated Features (5D)" },
      { value: "swiss_roll", label: "Swiss Roll (3D)" },
    ],
    default: "blobs_3d",
    description: "High-dimensional dataset to reduce. PCA works best on linearly correlated data.",
  },
  {
    type: "slider",
    label: "Target Components",
    key: "n_components",
    min: 1,
    max: 5,
    step: 1,
    default: 2,
    description: "Number of principal components to keep after reduction.",
  },
  {
    type: "slider",
    label: "Samples",
    key: "n_samples",
    min: 100,
    max: 600,
    step: 50,
    default: 300,
    description: "Number of data points to generate.",
  },
  {
    type: "slider",
    label: "Noise",
    key: "noise",
    min: 0.1,
    max: 5,
    step: 0.1,
    default: 1.0,
    description: "Standard deviation of noise added to the data.",
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

/* ----- Theory ----- */

const theoryContent = [
  {
    heading: "What is PCA?",
    emoji: "📐",
    content:
      "Principal Component Analysis (PCA) finds the directions of maximum variance in high-dimensional data and projects it onto a lower-dimensional subspace. It's the most fundamental dimensionality reduction technique — finding the 'most informative' axes to keep.",
  },
  {
    heading: "How It Works",
    emoji: "🔬",
    content:
      "1. Center the data (subtract the mean).\n2. Compute the covariance matrix.\n3. Find its eigenvectors and eigenvalues.\n4. Sort eigenvectors by decreasing eigenvalue (these are the Principal Components).\n5. Project data onto the top-k eigenvectors.\n\nEquivalently, PCA performs Singular Value Decomposition: X = UΣVᵀ, and keeps the top-k singular vectors.",
  },
  {
    heading: "Scree Plot & Explained Variance",
    emoji: "📊",
    content:
      "The scree plot shows how much variance each principal component captures. The 'elbow' in the curve indicates the optimal number of components — beyond the elbow, additional components capture mostly noise. The goal: retain as much variance as possible with as few components as possible.",
  },
  {
    heading: "When to Use PCA",
    emoji: "🎯",
    content:
      "PCA is ideal for: visualizing high-dimensional data (project to 2D/3D), removing multicollinearity, noise reduction, feature extraction before ML models, and data compression. Limitations: PCA only captures linear relationships (use t-SNE or UMAP for non-linear manifolds).",
  },
];

/* ----- Param explainer ----- */

const paramExplainerData = [
  {
    name: "n_components",
    description: "Number of principal components to retain.",
    impact:
      "More components → higher variance retained → more faithful representation. Fewer components → stronger compression → potential information loss. The scree plot helps choose the sweet spot.",
    emoji: "📐",
  },
  {
    name: "Dataset Dimensionality",
    description: "The original number of features in the dataset.",
    impact:
      "Higher dimensionality datasets benefit more from PCA. Projecting 10D data to 2D is far more dramatic than 3D to 2D. Correlated features compress better because PCA captures their shared variance.",
    emoji: "📏",
  },
];

/* ----- Cluster colors ----- */

const clusterColors = [
  "#DC2626", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6",
  "#EC4899", "#06B6D4", "#F97316", "#14B8A6", "#6366F1",
];

/* ----- Plotly layout ----- */

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
  legend: {
    bgcolor: "rgba(28,28,33,0.9)",
    bordercolor: "rgba(46,46,56,0.5)",
    borderwidth: 1,
    font: { size: 12, color: "#A1A1AA" },
  },
};

/* ----- Component ----- */

export default function PcaPage() {
  const { params, setParam, result, loading, error, train } = useAlgorithm<
    PcaRequest,
    PcaResponse
  >({
    endpoint: "/unsupervised/pca",
    defaultParams: {
      n_samples: 300,
      noise: 1.0,
      random_state: 42,
      dataset_type: "blobs_3d",
      n_components: 2,
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

          {/* PCA Stats Card */}
          {result && (
            <div className="clay-sm p-5 animate-bounce-in">
              <h4 className="text-sm font-extrabold text-text-muted mb-3 flex items-center gap-2">
                <Shrink className="h-4 w-4 text-violet-400" />
                Compression Stats
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Original Dims</span>
                  <span className="text-lg font-bold text-text-primary">
                    {result.n_features_original}D
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Reduced To</span>
                  <span className="text-lg font-bold text-violet-400">
                    {result.n_components}D
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Variance Retained</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {(result.total_variance_retained * 100).toFixed(1)}%
                  </span>
                </div>
                {/* Variance bar */}
                <div className="w-full h-3 bg-surface-hover rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${result.total_variance_retained * 100}%`,
                      background: "linear-gradient(90deg, #7C3AED, #A78BFA)",
                    }}
                  />
                </div>
                <p className="text-xs text-text-muted">
                  Compression ratio:{" "}
                  <span className="font-bold text-violet-300">
                    {result.n_features_original}D → {result.n_components}D
                  </span>{" "}
                  ({((1 - result.n_components / result.n_features_original) * 100).toFixed(0)}%
                  reduction)
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
              {/* 2D Projection */}
              <div className="clay p-4">
                <Plot
                  data={(() => {
                    const uniqueLabels = [...new Set(result.labels)].sort();
                    return uniqueLabels.map((label) => {
                      const mask = result.labels.map((l) => l === label);
                      return {
                        x: result.projection.x.filter((_, i) => mask[i]),
                        y: result.projection.y.filter((_, i) => mask[i]),
                        mode: "markers" as const,
                        type: "scatter" as const,
                        name: `Class ${label}`,
                        marker: {
                          color: clusterColors[label % clusterColors.length],
                          size: 7,
                          opacity: 0.8,
                          line: { color: "rgba(0,0,0,0.3)", width: 0.5 },
                        },
                      };
                    });
                  })()}
                  layout={{
                    ...plotLayout,
                    title: {
                      text: `PCA Projection — ${result.n_features_original}D → ${result.n_components}D`,
                      font: { size: 15, color: "#E4E4E7", family: "Inter, sans-serif" },
                    },
                    xaxis: {
                      ...plotLayout.xaxis,
                      title: { text: "PC 1", font: { size: 13, color: "#71717A" } },
                    },
                    yaxis: {
                      ...plotLayout.yaxis,
                      title: { text: "PC 2", font: { size: 13, color: "#71717A" } },
                    },
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  useResizeHandler
                  style={{ width: "100%", height: "450px" }}
                />
              </div>

              {/* 3D Original (if available) */}
              {result.original_3d && (
                <div className="clay p-4">
                  <Plot
                    data={(() => {
                      const uniqueLabels = [...new Set(result.labels)].sort();
                      return uniqueLabels.map((label) => {
                        const mask = result.labels.map((l) => l === label);
                        return {
                          x: result.original_3d!.x.filter((_, i) => mask[i]),
                          y: result.original_3d!.y.filter((_, i) => mask[i]),
                          z: result.original_3d!.z.filter((_, i) => mask[i]),
                          mode: "markers" as const,
                          type: "scatter3d" as const,
                          name: `Class ${label}`,
                          marker: {
                            color: clusterColors[label % clusterColors.length],
                            size: 4,
                            opacity: 0.7,
                          },
                        };
                      });
                    })()}
                    layout={{
                      ...plotLayout,
                      title: {
                        text: "Original 3D Data (rotate to explore!)",
                        font: { size: 14, color: "#E4E4E7", family: "Inter, sans-serif" },
                      },
                      scene: {
                        xaxis: { gridcolor: "rgba(46,46,56,0.6)", title: "X" },
                        yaxis: { gridcolor: "rgba(46,46,56,0.6)", title: "Y" },
                        zaxis: { gridcolor: "rgba(46,46,56,0.6)", title: "Z" },
                        bgcolor: "rgba(28,28,33,0.5)",
                      },
                      margin: { t: 40, r: 10, b: 10, l: 10 },
                    }}
                    config={{ responsive: true }}
                    useResizeHandler
                    style={{ width: "100%", height: "400px" }}
                  />
                </div>
              )}

              {/* Scree Plot */}
              <div className="clay p-4">
                <Plot
                  data={[
                    {
                      x: result.explained_variance_ratio.map((_, i) => `PC ${i + 1}`),
                      y: result.explained_variance_ratio.map((v) => v * 100),
                      type: "bar",
                      name: "Individual",
                      marker: {
                        color: result.explained_variance_ratio.map((_, i) =>
                          i < result.n_components
                            ? "rgba(124,58,237,0.7)"
                            : "rgba(124,58,237,0.2)"
                        ),
                        line: {
                          color: result.explained_variance_ratio.map((_, i) =>
                            i < result.n_components
                              ? "rgba(167,139,250,0.9)"
                              : "rgba(167,139,250,0.3)"
                          ),
                          width: 1,
                        },
                      },
                    },
                    {
                      x: result.cumulative_variance.map((_, i) => `PC ${i + 1}`),
                      y: result.cumulative_variance.map((v) => v * 100),
                      type: "scatter",
                      mode: "lines+markers" as const,
                      name: "Cumulative",
                      line: { color: "#F59E0B", width: 2.5 },
                      marker: { color: "#F59E0B", size: 7 },
                    },
                  ]}
                  layout={{
                    ...plotLayout,
                    title: {
                      text: "Scree Plot — Explained Variance per Component",
                      font: { size: 14, color: "#E4E4E7", family: "Inter, sans-serif" },
                    },
                    yaxis: {
                      ...plotLayout.yaxis,
                      title: { text: "Variance Explained (%)", font: { size: 12, color: "#71717A" } },
                      range: [0, 105],
                    },
                    barmode: "group" as const,
                    shapes: [
                      {
                        type: "line" as const,
                        x0: -0.5,
                        x1: result.explained_variance_ratio.length - 0.5,
                        y0: 95,
                        y1: 95,
                        line: { color: "rgba(239,68,68,0.4)", width: 1, dash: "dash" as const },
                      },
                    ],
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  useResizeHandler
                  style={{ width: "100%", height: "350px" }}
                />
                <p className="text-xs text-text-muted mt-2 italic">
                  Highlighted bars show the retained components. The dashed red line marks 95% total
                  variance — a common threshold for choosing the number of components.
                </p>
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
              <p className="text-text-muted font-bold">Computing principal components...</p>
            </div>
          )}
        </div>
      </div>

      {/* Metrics */}
      {result && (
        <div className="animate-slide-up">
          <h3 className="text-lg font-extrabold text-text-primary mb-4">
            📊 PCA Summary
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Variance Retained"
              value={result.total_variance_retained}
              icon={<TrendingUp className="h-5 w-5" />}
              color="#7C3AED"
              format="percentage"
              description="Total variance explained by selected components"
            />
            <MetricCard
              label="Original Dims"
              value={result.n_features_original}
              icon={<Layers className="h-5 w-5" />}
              color="#3B82F6"
              format="integer"
              description="Number of features before PCA"
            />
            <MetricCard
              label="Reduced Dims"
              value={result.n_components}
              icon={<Shrink className="h-5 w-5" />}
              color="#10B981"
              format="integer"
              description="Number of components after PCA"
            />
            <MetricCard
              label="PC1 Variance"
              value={result.explained_variance_ratio[0]}
              icon={<BarChart3 className="h-5 w-5" />}
              color="#F59E0B"
              format="percentage"
              description="Variance captured by the first principal component"
            />
          </div>
        </div>
      )}

      <ParamExplainer params={paramExplainerData} />

      <CodeSection
        snippets={[
          {
            title: "Import & Transform",
            code: `from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.datasets import make_blobs
import numpy as np

# Generate 3D data
X, y = make_blobs(n_samples=300, centers=3, n_features=3, random_state=42)

# Always standardize before PCA!
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Fit PCA
pca = PCA(n_components=2)
X_2d = pca.fit_transform(X_scaled)

print("Explained variance ratio:", pca.explained_variance_ratio_)
print("Cumulative variance:", np.cumsum(pca.explained_variance_ratio_))
print("Components (loadings):", pca.components_)
print("Total variance retained:", sum(pca.explained_variance_ratio_))`,
          },
        ]}
      />
    </div>
  );
}
