import { useEffect } from "react";
import Plot from "react-plotly.js";
import { TrendingUp, Target, Layers, BarChart3 } from "lucide-react";
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

interface KmeansRequest {
  n_samples: number;
  noise: number;
  random_state: number;
  dataset_type: string;
  n_clusters: number;
  max_iter: number;
  init: string;
  n_init: number;
  [key: string]: unknown;
}

interface KmeansResponse {
  n_clusters: number;
  n_samples: number;
  inertia: number;
  silhouette_score: number | null;
  n_iter: number;
  cluster_labels: number[];
  centroids: number[][];
  plot_data: {
    x: number[];
    y: number[];
  };
  true_labels: number[] | null;
  elbow_curve: {
    k_values: number[];
    inertias: number[];
  };
}

/* ----- Hyperparameters ----- */

const hyperParams: HyperParam[] = [
  {
    type: "select",
    label: "Dataset",
    key: "dataset_type",
    options: [
      { value: "blobs", label: "Gaussian Blobs" },
      { value: "anisotropic", label: "Anisotropic" },
      { value: "varied", label: "Varied Density" },
      { value: "moons", label: "Half Moons" },
      { value: "circles", label: "Concentric Circles" },
    ],
    default: "blobs",
    description: "Shape of the synthetic dataset. K-Means works best on spherical blobs.",
  },
  {
    type: "slider",
    label: "Number of Clusters (k)",
    key: "n_clusters",
    min: 2,
    max: 10,
    step: 1,
    default: 3,
    description: "Number of clusters to partition the data into.",
  },
  {
    type: "select",
    label: "Initialization",
    key: "init",
    options: [
      { value: "k-means++", label: "K-Means++ (Smart)" },
      { value: "random", label: "Random" },
    ],
    default: "k-means++",
    description: "Method for initializing centroids. K-Means++ spreads them out for faster convergence.",
  },
  {
    type: "slider",
    label: "Max Iterations",
    key: "max_iter",
    min: 10,
    max: 500,
    step: 10,
    default: 300,
    description: "Maximum number of EM iterations per run.",
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
    description: "Controls spread of the clusters.",
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
    heading: "What is K-Means?",
    emoji: "🎯",
    content:
      "K-Means partitions data into k clusters by iteratively assigning each point to the nearest centroid, then updating centroids to the mean of their assigned points. It minimizes within-cluster variance (inertia): Σᵢ Σₓ∈Cᵢ ||x - μᵢ||².",
  },
  {
    heading: "The Algorithm (Lloyd's)",
    emoji: "🔄",
    content:
      "1. Initialize k centroids (using K-Means++ for smart placement).\n2. Assign: Each point → nearest centroid (Voronoi partition).\n3. Update: Each centroid → mean of assigned points.\n4. Repeat steps 2-3 until convergence (centroids stop moving).",
  },
  {
    heading: "The Elbow Method",
    emoji: "📐",
    content:
      "How to choose k? Plot inertia (within-cluster sum of squares) for k = 1, 2, ..., 10. The 'elbow' in the curve — where the rate of decrease sharply changes — suggests the optimal k. Beyond the elbow, adding clusters gives diminishing returns.",
  },
  {
    heading: "Limitations",
    emoji: "⚠️",
    content:
      "K-Means assumes: clusters are spherical and equally sized, you know k in advance, and all clusters have similar density. It fails on moons, circles, and elongated shapes. For those, use DBSCAN or Gaussian Mixture Models instead.",
  },
];

/* ----- Param explainer ----- */

const paramExplainerData = [
  {
    name: "n_clusters (k)",
    description: "Number of clusters to form.",
    impact:
      "Too few → underfitting (distinct groups merged). Too many → overfitting (natural groups split). Use the Elbow Method to choose.",
    emoji: "🎯",
  },
  {
    name: "init (Initialization)",
    description: "How initial centroids are chosen.",
    impact:
      "K-Means++ spreads initial centroids apart, leading to faster convergence and better results. Random init can get stuck in bad local minima.",
    emoji: "🎲",
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

export default function KmeansPage() {
  const { params, setParam, result, loading, error, train } = useAlgorithm<
    KmeansRequest,
    KmeansResponse
  >({
    endpoint: "/unsupervised/kmeans",
    defaultParams: {
      n_samples: 300,
      noise: 1.0,
      random_state: 42,
      dataset_type: "blobs",
      n_clusters: 3,
      max_iter: 300,
      init: "k-means++",
      n_init: 10,
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

          {/* K-Means Stats */}
          {result && (
            <div className="clay-sm p-5 animate-bounce-in">
              <h4 className="text-sm font-extrabold text-text-muted mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4 text-amber-400" />
                Clustering Results
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Clusters</span>
                  <span className="text-lg font-bold text-amber-400">{result.n_clusters}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Iterations</span>
                  <span className="text-sm font-bold text-text-primary">{result.n_iter}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Inertia</span>
                  <span className="text-sm font-bold text-text-primary">{result.inertia.toFixed(1)}</span>
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
              {/* Cluster scatter plot */}
              <div className="clay p-4">
                <Plot
                  data={[
                    // Cluster points
                    ...(() => {
                      const uniqueLabels = [...new Set(result.cluster_labels)].sort();
                      return uniqueLabels.map((label) => {
                        const mask = result.cluster_labels.map((l) => l === label);
                        return {
                          x: result.plot_data.x.filter((_, i) => mask[i]),
                          y: result.plot_data.y.filter((_, i) => mask[i]),
                          mode: "markers" as const,
                          type: "scatter" as const,
                          name: `Cluster ${label}`,
                          marker: {
                            color: clusterColors[label % clusterColors.length],
                            size: 7,
                            opacity: 0.7,
                            line: { color: "rgba(0,0,0,0.3)", width: 0.5 },
                          },
                        };
                      });
                    })(),
                    // Centroids
                    {
                      x: result.centroids.map((c) => c[0]),
                      y: result.centroids.map((c) => c[1]),
                      mode: "markers" as const,
                      type: "scatter" as const,
                      name: "Centroids",
                      marker: {
                        color: "#fff",
                        size: 14,
                        symbol: "star",
                        line: { color: "#000", width: 2 },
                      },
                    },
                  ]}
                  layout={{
                    ...plotLayout,
                    title: {
                      text: `K-Means — ${result.n_clusters} Clusters`,
                      font: { size: 15, color: "#E4E4E7", family: "Inter, sans-serif" },
                    },
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  useResizeHandler
                  style={{ width: "100%", height: "500px" }}
                />
              </div>

              {/* Elbow curve */}
              <div className="clay p-4">
                <Plot
                  data={[
                    {
                      x: result.elbow_curve.k_values,
                      y: result.elbow_curve.inertias,
                      mode: "lines+markers" as const,
                      type: "scatter" as const,
                      name: "Inertia",
                      line: { color: "#F59E0B", width: 2.5 },
                      marker: {
                        color: result.elbow_curve.k_values.map((k) =>
                          k === result.n_clusters ? "#DC2626" : "#F59E0B"
                        ),
                        size: result.elbow_curve.k_values.map((k) =>
                          k === result.n_clusters ? 12 : 7
                        ),
                        line: {
                          color: result.elbow_curve.k_values.map((k) =>
                            k === result.n_clusters ? "#fff" : "rgba(0,0,0,0.3)"
                          ),
                          width: result.elbow_curve.k_values.map((k) =>
                            k === result.n_clusters ? 2 : 0.5
                          ),
                        },
                      },
                    },
                  ]}
                  layout={{
                    ...plotLayout,
                    title: {
                      text: "Elbow Method — Inertia vs k",
                      font: { size: 14, color: "#E4E4E7", family: "Inter, sans-serif" },
                    },
                    xaxis: {
                      ...plotLayout.xaxis,
                      title: { text: "Number of Clusters (k)", font: { size: 13, color: "#71717A" } },
                    },
                    yaxis: {
                      ...plotLayout.yaxis,
                      title: { text: "Inertia (WCSS)", font: { size: 13, color: "#71717A" } },
                    },
                    showlegend: false,
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  useResizeHandler
                  style={{ width: "100%", height: "300px" }}
                />
                <p className="text-xs text-text-muted mt-2 italic">
                  The red dot shows your current k. Look for the 'elbow' — where inertia starts
                  decreasing more slowly — to find the optimal number of clusters.
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
              <p className="text-text-muted font-bold">Computing centroids...</p>
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
              label="Clusters"
              value={result.n_clusters}
              icon={<Layers className="h-5 w-5" />}
              color="#F59E0B"
              format="integer"
              description="Number of clusters formed"
            />
            {result.silhouette_score !== null && (
              <MetricCard
                label="Silhouette"
                value={result.silhouette_score}
                icon={<TrendingUp className="h-5 w-5" />}
                color="#7C3AED"
                format="decimal"
                description="Cluster quality (-1 to 1, higher = better)"
              />
            )}
            <MetricCard
              label="Inertia"
              value={result.inertia}
              icon={<Target className="h-5 w-5" />}
              color="#3B82F6"
              format="decimal"
              description="Within-cluster sum of squares (lower = tighter)"
            />
            <MetricCard
              label="Iterations"
              value={result.n_iter}
              icon={<BarChart3 className="h-5 w-5" />}
              color="#10B981"
              format="integer"
              description="Convergence iterations used"
            />
          </div>
        </div>
      )}

      <ParamExplainer params={paramExplainerData} />

      <CodeSection
        snippets={[
          {
            title: "Import & Cluster",
            code: `from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.datasets import make_blobs
from sklearn.metrics import silhouette_score

X, y_true = make_blobs(n_samples=300, centers=3, random_state=42)

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

model = KMeans(
    n_clusters=3,
    init="k-means++",
    n_init=10,
    max_iter=300,
    random_state=42,
)
labels = model.fit_predict(X_scaled)

print("Centroids:", model.cluster_centers_)
print("Inertia:", model.inertia_)
print("Iterations:", model.n_iter_)
print("Silhouette:", silhouette_score(X_scaled, labels))`,
          },
        ]}
      />
    </div>
  );
}
