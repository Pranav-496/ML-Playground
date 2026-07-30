import { useState, useCallback } from "react";
import Plot from "react-plotly.js";
import { Swords, Flame, Trophy, Clock, Zap, Shield, ChevronDown } from "lucide-react";
import api from "@/lib/api";

/* ----- Types ----- */

interface CompetitorResult {
  algorithm: string;
  name: string;
  metrics?: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
  };
  z?: number[][];
  train_time_ms?: number;
  predict_time_ms?: number;
  error?: string | null;
}

interface BattleResponse {
  dataset: {
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
  };
  competitors: CompetitorResult[];
  winner: string | null;
  dataset_type: string;
  n_samples: number;
}

/* ----- Available algorithms ----- */

const BATTLE_ALGORITHMS = [
  { id: "logistic-regression", name: "Logistic Regression", color: "#6B8CAE", house: "Stark" },
  { id: "knn", name: "K-Nearest Neighbors", color: "#4CAF50", house: "Tyrell" },
  { id: "decision-tree", name: "Decision Tree", color: "#D4A017", house: "Baratheon" },
  { id: "svm", name: "Support Vector Machine", color: "#7986CB", house: "Arryn" },
  { id: "gaussian-nb", name: "Gaussian Naive Bayes", color: "#78909C", house: "Greyjoy" },
  { id: "random-forest", name: "Random Forest", color: "#059669", house: "Targaryen" },
  { id: "gradient-boosting", name: "Gradient Boosting", color: "#EA580C", house: "Targaryen" },
];

const DATASET_OPTIONS = [
  { value: "moons", label: "Half Moons" },
  { value: "blobs", label: "Gaussian Blobs" },
  { value: "circles", label: "Concentric Circles" },
  { value: "xor", label: "XOR Pattern" },
  { value: "spirals", label: "Spirals" },
  { value: "anisotropic", label: "Anisotropic" },
];

const COMPETITOR_COLORS = ["#DC2626", "#3B82F6", "#F59E0B"];
const COMPETITOR_LABELS = ["🔴 Champion I", "🔵 Champion II", "🟡 Champion III"];

/* ----- Plotly layout helper ----- */

const makePlotLayout = (title: string, color: string) => ({
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(28,28,33,0.5)",
  font: { family: "Inter, sans-serif", color: "#A1A1AA" },
  margin: { t: 40, r: 15, b: 40, l: 50 },
  title: {
    text: title,
    font: { size: 14, color, family: "Inter, sans-serif" },
  },
  xaxis: {
    gridcolor: "rgba(46,46,56,0.6)",
    title: { text: "Feature 1", font: { size: 11, color: "#71717A" } },
    zerolinecolor: "rgba(46,46,56,0.8)",
  },
  yaxis: {
    gridcolor: "rgba(46,46,56,0.6)",
    title: { text: "Feature 2", font: { size: 11, color: "#71717A" } },
    zerolinecolor: "rgba(46,46,56,0.8)",
  },
  showlegend: false,
});

/* ----- Component ----- */

export default function BattleArenaPage() {
  const [datasetType, setDatasetType] = useState("moons");
  const [nSamples, setNSamples] = useState(300);
  const [noise, setNoise] = useState(1.5);
  const [randomSeed, setRandomSeed] = useState(42);
  const [numCompetitors, setNumCompetitors] = useState(2);
  const [selections, setSelections] = useState<string[]>([
    "svm",
    "random-forest",
    "gradient-boosting",
  ]);

  const [result, setResult] = useState<BattleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setSelection = (index: number, value: string) => {
    setSelections((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const runBattle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const competitors = selections.slice(0, numCompetitors).map((algoId) => ({
        algorithm: algoId,
        params: {},
      }));
      const response = await api.post<BattleResponse>("/battle/run", {
        dataset_type: datasetType,
        n_samples: nSamples,
        noise,
        random_state: randomSeed,
        test_size: 0.2,
        competitors,
      });
      setResult(response.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Battle failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [selections, numCompetitors, datasetType, nSamples, noise, randomSeed]);

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

  const getAlgoMeta = (id: string) =>
    BATTLE_ALGORITHMS.find((a) => a.id === id) || {
      id,
      name: id,
      color: "#888",
      house: "Unknown",
    };

  const winnerResult =
    result?.winner
      ? result.competitors.find((c) => c.algorithm === result.winner)
      : null;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="clay-lg p-8 border-iron text-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(185,14,10,0.3) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 mb-3">
            <Swords className="h-8 w-8 text-primary" />
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary font-royal tracking-wider">
              The Great Battle Arena
            </h1>
            <Swords className="h-8 w-8 text-primary" style={{ transform: "scaleX(-1)" }} />
          </div>
          <p className="text-text-secondary font-medium max-w-2xl mx-auto">
            Pit champions against each other on the same battlefield. Choose your warriors,
            select the terrain, and let the algorithms duel for supremacy.
          </p>
        </div>
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8">
        {/* Left — Controls */}
        <div className="space-y-6">
          {/* Dataset Config */}
          <div className="clay-sm p-5">
            <h3 className="text-sm font-extrabold text-text-muted mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-400" />
              Battlefield Terrain
            </h3>
            <div className="space-y-4">
              {/* Dataset Type */}
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1.5">
                  Dataset Shape
                </label>
                <div className="relative">
                  <select
                    value={datasetType}
                    onChange={(e) => setDatasetType(e.target.value)}
                    className="w-full bg-surface-hover border border-surface-border rounded-xl px-4 py-2.5 text-sm font-semibold text-text-primary appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {DATASET_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                </div>
              </div>
              {/* Samples */}
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1.5">
                  Samples: {nSamples}
                </label>
                <input
                  type="range"
                  min={100}
                  max={600}
                  step={50}
                  value={nSamples}
                  onChange={(e) => setNSamples(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              {/* Noise */}
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1.5">
                  Noise: {noise.toFixed(1)}
                </label>
                <input
                  type="range"
                  min={0.1}
                  max={5}
                  step={0.1}
                  value={noise}
                  onChange={(e) => setNoise(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              {/* Random Seed */}
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1.5">
                  Random Seed: {randomSeed}
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={randomSeed}
                  onChange={(e) => setRandomSeed(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>
          </div>

          {/* Competitor Selectors */}
          <div className="clay-sm p-5">
            <h3 className="text-sm font-extrabold text-text-muted mb-4 flex items-center gap-2">
              <Swords className="h-4 w-4 text-red-400" />
              Choose Your Champions
            </h3>

            {/* Number of competitors toggle */}
            <div className="flex gap-2 mb-4">
              {[2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() => setNumCompetitors(n)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all duration-300 border ${
                    numCompetitors === n
                      ? "bg-primary/15 text-primary border-primary/30"
                      : "bg-surface-hover text-text-muted border-surface-border hover:text-text-primary"
                  }`}
                >
                  {n} Champions
                </button>
              ))}
            </div>

            {/* Champion selectors */}
            <div className="space-y-3">
              {Array.from({ length: numCompetitors }).map((_, idx) => (
                <div key={idx}>
                  <label
                    className="block text-xs font-bold mb-1.5"
                    style={{ color: COMPETITOR_COLORS[idx] }}
                  >
                    {COMPETITOR_LABELS[idx]}
                  </label>
                  <div className="relative">
                    <select
                      value={selections[idx]}
                      onChange={(e) => setSelection(idx, e.target.value)}
                      className="w-full bg-surface-hover border border-surface-border rounded-xl px-4 py-2.5 text-sm font-semibold text-text-primary appearance-none cursor-pointer focus:outline-none focus:ring-2"
                      style={{
                        borderColor: `${COMPETITOR_COLORS[idx]}40`,
                      }}
                    >
                      {BATTLE_ALGORITHMS.map((algo) => (
                        <option key={algo.id} value={algo.id}>
                          {algo.name} ({algo.house})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Battle Button */}
          <button
            onClick={runBattle}
            disabled={loading}
            className="w-full py-4 rounded-2xl text-lg font-bold font-royal tracking-wider transition-all duration-500 border relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: loading
                ? "rgba(185,14,10,0.1)"
                : "linear-gradient(135deg, rgba(185,14,10,0.15) 0%, rgba(234,88,12,0.15) 100%)",
              borderColor: "rgba(185,14,10,0.3)",
              color: "#DC2626",
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                  Battle in Progress...
                </>
              ) : (
                <>
                  <Flame className="h-5 w-5" />
                  🐉 Dracarys — Begin Battle!
                  <Flame className="h-5 w-5" />
                </>
              )}
            </span>
            {!loading && (
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(185,14,10,0.08) 0%, rgba(234,88,12,0.08) 100%)",
                }}
              />
            )}
          </button>
        </div>

        {/* Right — Results */}
        <div className="space-y-6">
          {error && (
            <div className="clay-pressed p-4 text-error font-bold text-sm animate-fade-in">
              ❌ Error: {error}
            </div>
          )}

          {/* Winner Banner */}
          {result && winnerResult && (
            <div
              className="clay-lg p-6 text-center animate-bounce-in relative overflow-hidden"
              style={{
                borderColor: `${getAlgoMeta(result.winner!).color}40`,
              }}
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  background: `radial-gradient(ellipse at center, ${getAlgoMeta(result.winner!).color}40 0%, transparent 70%)`,
                }}
              />
              <div className="relative z-10">
                <Trophy className="h-10 w-10 mx-auto mb-2" style={{ color: "#F59E0B" }} />
                <h2 className="text-2xl font-bold font-royal tracking-wider text-text-primary mb-1">
                  Victory!
                </h2>
                <p className="text-lg font-bold" style={{ color: getAlgoMeta(result.winner!).color }}>
                  👑 {winnerResult.name}
                </p>
                <p className="text-sm text-text-secondary mt-1">
                  Accuracy:{" "}
                  <span className="font-bold text-emerald-400">
                    {((winnerResult.metrics?.accuracy ?? 0) * 100).toFixed(1)}%
                  </span>
                  {" · "}F1:{" "}
                  <span className="font-bold text-blue-400">
                    {((winnerResult.metrics?.f1_score ?? 0) * 100).toFixed(1)}%
                  </span>
                  {" · "}Train:{" "}
                  <span className="font-bold text-amber-400">
                    {winnerResult.train_time_ms?.toFixed(1)}ms
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Decision Boundary Plots */}
          {result && (
            <div
              className={`grid gap-4 ${
                result.competitors.length === 2
                  ? "grid-cols-1 md:grid-cols-2"
                  : "grid-cols-1 md:grid-cols-3"
              }`}
            >
              {result.competitors.map((comp, idx) => {
                const isWinner = comp.algorithm === result.winner;

                if (comp.error) {
                  return (
                    <div key={idx} className="clay-sm p-4 text-center">
                      <p className="text-error font-bold text-sm">
                        ❌ {comp.name}: {comp.error}
                      </p>
                    </div>
                  );
                }

                return (
                  <div
                    key={idx}
                    className="clay-sm p-3 relative"
                    style={{
                      borderColor: isWinner
                        ? `${COMPETITOR_COLORS[idx]}50`
                        : undefined,
                    }}
                  >
                    {isWinner && (
                      <div className="absolute -top-2 -right-2 z-10 bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                        👑 WINNER
                      </div>
                    )}
                    <Plot
                      data={[
                        // Decision boundary contour
                        {
                          x: result.dataset.xx[0],
                          y: result.dataset.yy.map((row) => row[0]),
                          z: comp.z!,
                          type: "contour",
                          colorscale: [
                            [0, `${COMPETITOR_COLORS[idx]}30`],
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
                            result.dataset.x_train,
                            result.dataset.y_train,
                            0
                          );
                          return {
                            x: d.x0,
                            y: d.x1,
                            mode: "markers" as const,
                            type: "scatter" as const,
                            marker: {
                              color: COMPETITOR_COLORS[idx],
                              size: 5,
                              opacity: 0.7,
                              line: { color: "rgba(0,0,0,0.3)", width: 0.5 },
                            },
                          };
                        })(),
                        // Class 1 — Train
                        (() => {
                          const d = getClassData(
                            result.dataset.x_train,
                            result.dataset.y_train,
                            1
                          );
                          return {
                            x: d.x0,
                            y: d.x1,
                            mode: "markers" as const,
                            type: "scatter" as const,
                            marker: {
                              color: "#3B82F6",
                              size: 5,
                              opacity: 0.7,
                              line: { color: "rgba(0,0,0,0.3)", width: 0.5 },
                            },
                          };
                        })(),
                        // Class 0 — Test
                        (() => {
                          const d = getClassData(
                            result.dataset.x_test,
                            result.dataset.y_test,
                            0
                          );
                          return {
                            x: d.x0,
                            y: d.x1,
                            mode: "markers" as const,
                            type: "scatter" as const,
                            marker: {
                              color: COMPETITOR_COLORS[idx],
                              size: 8,
                              symbol: "diamond",
                              line: { color: "#fff", width: 1 },
                            },
                          };
                        })(),
                        // Class 1 — Test
                        (() => {
                          const d = getClassData(
                            result.dataset.x_test,
                            result.dataset.y_test,
                            1
                          );
                          return {
                            x: d.x0,
                            y: d.x1,
                            mode: "markers" as const,
                            type: "scatter" as const,
                            marker: {
                              color: "#3B82F6",
                              size: 8,
                              symbol: "diamond",
                              line: { color: "#fff", width: 1 },
                            },
                          };
                        })(),
                      ]}
                      layout={makePlotLayout(comp.name, COMPETITOR_COLORS[idx])}
                      config={{ responsive: true, displayModeBar: false }}
                      useResizeHandler
                      style={{ width: "100%", height: "320px" }}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Metrics Comparison Table */}
          {result && (
            <div className="clay-sm p-5 animate-slide-up">
              <h3 className="text-sm font-extrabold text-text-muted mb-4 flex items-center gap-2">
                📊 Metrics Comparison
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-border">
                      <th className="text-left py-2 px-3 text-text-muted font-bold">
                        Metric
                      </th>
                      {result.competitors.map((comp, idx) => (
                        <th
                          key={idx}
                          className="text-center py-2 px-3 font-bold"
                          style={{ color: COMPETITOR_COLORS[idx] }}
                        >
                          {comp.name}
                          {comp.algorithm === result.winner && " 👑"}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: "accuracy", label: "Accuracy", format: "pct" },
                      { key: "precision", label: "Precision", format: "pct" },
                      { key: "recall", label: "Recall", format: "pct" },
                      { key: "f1_score", label: "F1 Score", format: "pct" },
                    ].map((metric) => {
                      const values = result.competitors.map(
                        (c) => (c.metrics as Record<string, number>)?.[metric.key] ?? 0
                      );
                      const bestVal = Math.max(...values);

                      return (
                        <tr
                          key={metric.key}
                          className="border-b border-surface-border/50 hover:bg-surface-hover/50 transition-colors"
                        >
                          <td className="py-2.5 px-3 text-text-secondary font-semibold">
                            {metric.label}
                          </td>
                          {result.competitors.map((comp, idx) => {
                            const val =
                              (comp.metrics as Record<string, number>)?.[
                                metric.key
                              ] ?? 0;
                            const isBest = val === bestVal && val > 0;
                            return (
                              <td
                                key={idx}
                                className={`text-center py-2.5 px-3 font-bold ${
                                  isBest
                                    ? "text-emerald-400"
                                    : "text-text-primary"
                                }`}
                              >
                                {(val * 100).toFixed(1)}%
                                {isBest && " ✦"}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                    {/* Timing rows */}
                    <tr className="border-b border-surface-border/50 hover:bg-surface-hover/50 transition-colors">
                      <td className="py-2.5 px-3 text-text-secondary font-semibold flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" /> Train Time
                      </td>
                      {result.competitors.map((comp, idx) => {
                        const values = result.competitors.map(
                          (c) => c.train_time_ms ?? Infinity
                        );
                        const bestVal = Math.min(...values);
                        const isBest = comp.train_time_ms === bestVal;
                        return (
                          <td
                            key={idx}
                            className={`text-center py-2.5 px-3 font-bold ${
                              isBest ? "text-emerald-400" : "text-text-primary"
                            }`}
                          >
                            {comp.train_time_ms?.toFixed(1)}ms
                            {isBest && " ⚡"}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="hover:bg-surface-hover/50 transition-colors">
                      <td className="py-2.5 px-3 text-text-secondary font-semibold flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5" /> Predict Time
                      </td>
                      {result.competitors.map((comp, idx) => {
                        const values = result.competitors.map(
                          (c) => c.predict_time_ms ?? Infinity
                        );
                        const bestVal = Math.min(...values);
                        const isBest = comp.predict_time_ms === bestVal;
                        return (
                          <td
                            key={idx}
                            className={`text-center py-2.5 px-3 font-bold ${
                              isBest ? "text-emerald-400" : "text-text-primary"
                            }`}
                          >
                            {comp.predict_time_ms?.toFixed(2)}ms
                            {isBest && " ⚡"}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Accuracy Bar Chart */}
          {result && (
            <div className="clay-sm p-4 animate-slide-up">
              <Plot
                data={result.competitors.map((comp, idx) => ({
                  x: [comp.name],
                  y: [(comp.metrics?.accuracy ?? 0) * 100],
                  type: "bar" as const,
                  name: comp.name,
                  marker: {
                    color: COMPETITOR_COLORS[idx],
                    line: {
                      color:
                        comp.algorithm === result.winner
                          ? "#F59E0B"
                          : "rgba(255,255,255,0.1)",
                      width: comp.algorithm === result.winner ? 2 : 1,
                    },
                  },
                  text: [`${((comp.metrics?.accuracy ?? 0) * 100).toFixed(1)}%`],
                  textposition: "outside" as const,
                  textfont: { color: "#FFFFFF", size: 13, family: "Inter, sans-serif" },
                }))}
                layout={{
                  paper_bgcolor: "rgba(0,0,0,0)",
                  plot_bgcolor: "rgba(28,28,33,0.5)",
                  font: { family: "Inter, sans-serif", color: "#A1A1AA" },
                  margin: { t: 40, r: 20, b: 60, l: 50 },
                  title: {
                    text: "⚔️ Accuracy Showdown",
                    font: {
                      size: 15,
                      color: "#E4E4E7",
                      family: "Inter, sans-serif",
                    },
                  },
                  yaxis: {
                    gridcolor: "rgba(46,46,56,0.6)",
                    title: {
                      text: "Accuracy (%)",
                      font: { size: 12, color: "#71717A" },
                    },
                    range: [0, 115],
                    zerolinecolor: "rgba(46,46,56,0.8)",
                  },
                  xaxis: {
                    gridcolor: "rgba(46,46,56,0.6)",
                    tickfont: { size: 11 },
                  },
                  showlegend: false,
                  barmode: "group" as const,
                }}
                config={{ responsive: true, displayModeBar: false }}
                useResizeHandler
                style={{ width: "100%", height: "300px" }}
              />
            </div>
          )}

          {/* Empty state */}
          {!result && !loading && (
            <div className="clay p-16 text-center">
              <Swords className="h-12 w-12 text-text-muted mx-auto mb-4 opacity-40" />
              <p className="text-text-muted font-bold text-lg mb-2">
                Choose your champions and click
              </p>
              <p className="text-primary font-bold font-royal tracking-wider text-xl">
                🐉 Dracarys — Begin Battle!
              </p>
            </div>
          )}

          {loading && !result && (
            <div className="clay p-16 text-center">
              <div className="inline-block w-10 h-10 border-3 border-surface-border border-t-primary rounded-full animate-spin mb-4" />
              <p className="text-text-muted font-bold text-lg font-royal tracking-wider">
                The champions are clashing...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
