import { useEffect } from "react";
import Plot from "react-plotly.js";
import { TrendingUp, Target, Layers, AlertTriangle } from "lucide-react";
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

interface DbscanRequest {
  n_samples: number;
  noise: number;
  random_state: number;
  dataset_type: string;
  eps: number;
  min_samples: number;
  n_centers: number;
  [key: string]: unknown;
}

interface DbscanResponse {
  n_clusters: number;
  n_noise: number;
  n_samples: number;
  silhouette_score: number | null;
  cluster_labels: number[];
  core_sample_mask: boolean[];
  plot_data: {
    x: number[];
    y: number[];
  };
  true_labels: number[] | null;
  eps: number;
  min_samples: number;
}

/* ----- Hyperparameters ----- */

const hyperParams: HyperParam[] = [
  {
    type: "select",
    label: "Dataset",
    key: "dataset_type",
    options: [
      { value: "moons", label: "Half Moons" },
      { value: "circles", label: "Concentric Circles" },
      { value: "blobs", label: "Gaussian Blobs" },
      { value: "anisotropic", label: "Anisotropic" },
      { value: "varied", label: "Varied Density" },
    ],
    default: "moons",
    description: "Shape of the synthetic dataset. DBSCAN excels at non-spherical shapes like moons and circles.",
  },
  {
    type: "slider",
    label: "Epsilon (ε)",
    key: "eps",
    min: 0.05,
    max: 2.0,
    step: 0.05,
    default: 0.3,
    description:
      "Maximum distance between two points to be considered neighbors. This is the radius of the neighborhood.",
  },
  {
    type: "slider",
    label: "Min Samples",
    key: "min_samples",
    min: 2,
    max: 20,
    step: 1,
    default: 5,
    description:
      "Minimum number of points required in the ε-neighborhood to form a dense region (core point).",
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
    description: "Controls spread of the clusters. Higher noise makes clustering harder.",
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
    heading: "What is DBSCAN?",
    emoji: "🔍",
    content:
      "Density-Based Spatial Clustering of Applications with Noise (DBSCAN) groups together points that are closely packed (high density) and marks points in low-density regions as outliers. Unlike K-Means, DBSCAN doesn't require specifying the number of clusters — it discovers them automatically.",
  },
  {
    heading: "Core, Border & Noise Points",
    emoji: "🎯",
    content:
      "DBSCAN classifies every point as one of three types:\n• Core Point: Has at least min_samples points within distance ε.\n• Border Point: Within ε of a core point, but doesn't have min_samples neighbors.\n• Noise Point: Neither core nor border — an outlier.\n\nClusters are formed by connecting core points that are within ε of each other.",
  },
  {
    heading: "Why DBSCAN Beats K-Means",
    emoji: "⚡",
    content:
      "K-Means assumes spherical, equally-sized clusters. DBSCAN can discover clusters of arbitrary shape (crescents, rings, elongated blobs) and automatically detects outliers. Try it on Half Moons or Concentric Circles — K-Means fails badly, but DBSCAN nails it.",
  },
  {
    heading: "Choosing ε and min_samples",
    emoji: "🎛️",
    content:
      "• ε too small → too many noise points, clusters fragment.\n• ε too large → clusters merge together.\n• min_samples too small → noisy clusters.\n• min_samples too large → only very dense regions survive.\n\nRule of thumb: min_samples ≥ dimensionality + 1 (for 2D, min_samples ≥ 3). Use a k-distance plot to find ε (look for the elbow).",
  },
];

/* ----- Param explainer ----- */

const paramExplainerData = [
  {
    name: "Epsilon (ε)",
    description: "The radius of the neighborhood around each point.",
    impact:
      "Smaller ε → tighter, more fragmented clusters with more noise. Larger ε → bigger, merged clusters. The sweet spot depends on the data density — try sliding it and watch clusters form and merge.",
    emoji: "📏",
  },
  {
    name: "min_samples",
    description: "Minimum points in the ε-neighborhood to be a core point.",
    impact:
      "Higher values → denser, more conservative clusters (ignores sparse regions). Lower values → more inclusive clusters but picks up noise as clusters.",
    emoji: "👥",
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

export default function DbscanPage() {
  const { params, setParam, result, loading, error, train } = useAlgorithm<
    DbscanRequest,
    DbscanResponse
  >({
    endpoint: "/unsupervised/dbscan",
    defaultParams: {
      n_samples: 300,
      noise: 1.0,
      random_state: 42,
      dataset_type: "moons",
      eps: 0.3,
      min_samples: 5,
      n_centers: 3,
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

          {/* DBSCAN Stats */}
          {result && (
            <div className="clay-sm p-5 animate-bounce-in">
              <h4 className="text-sm font-extrabold text-text-muted mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4 text-orange-400" />
                Clustering Results
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Clusters Found</span>
                  <span className="text-lg font-bold text-orange-400">
                    {result.n_clusters}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Noise Points</span>
                  <span className="text-lg font-bold text-red-400">
                    {result.n_noise}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Core Points</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {result.core_sample_mask.filter(Boolean).length}
                  </span>
                </div>
                {/* Noise ratio bar */}
                <div className="w-full h-3 bg-surface-hover rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${(result.n_noise / result.n_samples) * 100}%`,
                      background: "linear-gradient(90deg, #EF4444, #F87171)",
                    }}
                  />
                </div>
                <p className="text-xs text-text-muted">
                  <span className="font-bold text-red-400">
                    {((result.n_noise / result.n_samples) * 100).toFixed(1)}%
                  </span>{" "}
                  of points classified as noise/outliers.
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
              {/* DBSCAN Cluster Plot */}
              <div className="clay p-4">
                <Plot
                  data={(() => {
                    const uniqueLabels = [...new Set(result.cluster_labels)].sort();
                    return uniqueLabels.map((label) => {
                      const mask = result.cluster_labels.map((l) => l === label);
                      const isNoise = label === -1;
                      return {
                        x: result.plot_data.x.filter((_, i) => mask[i]),
                        y: result.plot_data.y.filter((_, i) => mask[i]),
                        mode: "markers" as const,
                        type: "scatter" as const,
                        name: isNoise ? "Noise / Outliers" : `Cluster ${label}`,
                        marker: {
                          color: isNoise
                            ? "rgba(120,120,120,0.4)"
                            : clusterColors[label % clusterColors.length],
                          size: isNoise ? 5 : 8,
                          symbol: isNoise ? "x" : "circle",
                          opacity: isNoise ? 0.5 : 0.8,
                          line: isNoise
                            ? { color: "rgba(200,200,200,0.3)", width: 0.5 }
                            : {
                                color: result.core_sample_mask
                                  .map((isCore, i) =>
                                    mask[i] && isCore ? "#fff" : "rgba(0,0,0,0.3)"
                                  )
                                  .filter((_, i) => mask[i]),
                                width: result.core_sample_mask
                                  .map((isCore, i) =>
                                    mask[i] && isCore ? 1.5 : 0.5
                                  )
                                  .filter((_, i) => mask[i]),
                              },
                        },
                      };
                    });
                  })()}
                  layout={{
                    ...plotLayout,
                    title: {
                      text: `DBSCAN — ${result.n_clusters} Cluster${result.n_clusters !== 1 ? "s" : ""} Found (ε=${result.eps}, min_samples=${result.min_samples})`,
                      font: { size: 14, color: "#E4E4E7", family: "Inter, sans-serif" },
                    },
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  useResizeHandler
                  style={{ width: "100%", height: "500px" }}
                />
                <p className="text-xs text-text-muted mt-2 italic">
                  Core points have white outlines. Noise/outlier points are shown as grey ✕ markers.
                  Try adjusting ε to see clusters form, merge, and split.
                </p>
              </div>

              {/* Comparison with ground truth */}
              {result.true_labels && (
                <div className="clay p-4">
                  <Plot
                    data={(() => {
                      const uniqueLabels = [
                        ...new Set(result.true_labels!),
                      ].sort();
                      return uniqueLabels.map((label) => {
                        const mask = result.true_labels!.map((l) => l === label);
                        return {
                          x: result.plot_data.x.filter((_, i) => mask[i]),
                          y: result.plot_data.y.filter((_, i) => mask[i]),
                          mode: "markers" as const,
                          type: "scatter" as const,
                          name: `True Class ${label}`,
                          marker: {
                            color: clusterColors[label % clusterColors.length],
                            size: 7,
                            opacity: 0.7,
                            line: { color: "rgba(0,0,0,0.3)", width: 0.5 },
                          },
                        };
                      });
                    })()}
                    layout={{
                      ...plotLayout,
                      title: {
                        text: "Ground Truth Labels (for comparison)",
                        font: { size: 14, color: "#E4E4E7", family: "Inter, sans-serif" },
                      },
                    }}
                    config={{ responsive: true, displayModeBar: false }}
                    useResizeHandler
                    style={{ width: "100%", height: "350px" }}
                  />
                </div>
              )}

              {/* Warning if no clusters found */}
              {result.n_clusters === 0 && (
                <div className="clay-sm p-5 border border-amber-500/30 animate-bounce-in">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-400 mb-1">
                        No Clusters Found
                      </h4>
                      <p className="text-xs text-text-muted">
                        All points were classified as noise. Try increasing{" "}
                        <strong>ε (epsilon)</strong> or decreasing{" "}
                        <strong>min_samples</strong> to find dense regions.
                      </p>
                    </div>
                  </div>
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
              <p className="text-text-muted font-bold">Scanning for density clusters...</p>
            </div>
          )}
        </div>
      </div>

      {/* Metrics */}
      {result && (
        <div className="animate-slide-up">
          <h3 className="text-lg font-extrabold text-text-primary mb-4">
            📊 Clustering Metrics
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Clusters Found"
              value={result.n_clusters}
              icon={<Layers className="h-5 w-5" />}
              color="#F97316"
              format="integer"
              description="Number of clusters discovered by DBSCAN"
            />
            <MetricCard
              label="Noise Points"
              value={result.n_noise}
              icon={<AlertTriangle className="h-5 w-5" />}
              color="#EF4444"
              format="integer"
              description="Points classified as outliers"
            />
            <MetricCard
              label="Core Points"
              value={result.core_sample_mask.filter(Boolean).length}
              icon={<Target className="h-5 w-5" />}
              color="#10B981"
              format="integer"
              description="Dense region points with ≥ min_samples neighbors"
            />
            {result.silhouette_score !== null && (
              <MetricCard
                label="Silhouette Score"
                value={result.silhouette_score}
                icon={<TrendingUp className="h-5 w-5" />}
                color="#7C3AED"
                format="decimal"
                description="Cluster quality measure (-1 to 1, higher is better)"
              />
            )}
          </div>
        </div>
      )}

      <ParamExplainer params={paramExplainerData} />

      <CodeSection
        snippets={[
          {
            title: "Import & Cluster",
            code: `from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.datasets import make_moons
from sklearn.metrics import silhouette_score

# Generate non-spherical data
X, y_true = make_moons(n_samples=300, noise=0.1, random_state=42)

# Always standardize for distance-based methods!
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Fit DBSCAN
db = DBSCAN(eps=0.3, min_samples=5)
labels = db.fit_predict(X_scaled)

n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
n_noise = sum(labels == -1)

print(f"Clusters: {n_clusters}")
print(f"Noise points: {n_noise}")
print(f"Core points: {len(db.core_sample_indices_)}")

# Silhouette score (exclude noise)
mask = labels != -1
if len(set(labels[mask])) >= 2:
    print(f"Silhouette: {silhouette_score(X_scaled[mask], labels[mask]):.3f}")`,
          },
        ]}
      />
    </div>
  );
}
