import { useState, useCallback } from "react";
import Plot from "react-plotly.js";
import { Activity, TrendingDown, GitBranch, Loader2 } from "lucide-react";
import api from "@/lib/api";

/* ----- Plotly dark layout ----- */
const darkLayout = {
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(28,28,33,0.5)",
  font: { family: "Inter, sans-serif", color: "#A1A1AA" },
  margin: { t: 45, r: 20, b: 55, l: 65 },
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
    font: { size: 11, color: "#A1A1AA" },
  },
};

/* ═══════════════ Regularization Path ═══════════════ */

interface RegPathData {
  alphas: number[];
  series: { name: string; values: number[] }[];
  model_type: string;
  degree: number;
}

export function RegularizationPath({
  modelType,
  degree = 10,
  noise = 10,
  randomState = 42,
}: {
  modelType: "ridge" | "lasso" | "elasticnet";
  degree?: number;
  noise?: number;
  randomState?: number;
}) {
  const [data, setData] = useState<RegPathData | null>(null);
  const [loading, setLoading] = useState(false);

  const compute = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.post<RegPathData>("/regression/regularization-path", {
        model_type: modelType,
        degree,
        noise,
        random_state: randomState,
        n_alphas: 60,
        alpha_max: 100,
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [modelType, degree, noise, randomState]);

  // Color palette for coefficient lines
  const colors = [
    "#DC2626", "#F59E0B", "#22C55E", "#3B82F6", "#A855F7",
    "#EC4899", "#14B8A6", "#F97316", "#6366F1", "#EF4444",
    "#84CC16", "#06B6D4", "#E879F9", "#FB923C", "#34D399",
  ];

  return (
    <div className="clay p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-extrabold text-text-primary flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-accent" />
          Regularization Path
        </h4>
        <button
          onClick={compute}
          disabled={loading}
          className="clay-btn clay-btn-primary text-xs px-4 py-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "⚡ Compute Path"
          )}
        </button>
      </div>
      <p className="text-xs text-text-muted">
        Shows how each polynomial coefficient changes as Alpha (regularization
        strength) sweeps from 0 → 100.{" "}
        {modelType === "lasso"
          ? "Notice how L1 drives coefficients to exactly zero."
          : "Notice how L2 shrinks coefficients smoothly but never reaches zero."}
      </p>

      {data && (
        <Plot
          data={data.series.map((s, i) => ({
            x: data.alphas,
            y: s.values,
            mode: "lines" as const,
            type: "scatter" as const,
            name: s.name,
            line: { color: colors[i % colors.length], width: 2 },
          }))}
          layout={{
            ...darkLayout,
            title: {
              text: `${modelType === "ridge" ? "Ridge" : modelType === "lasso" ? "Lasso" : "Elastic Net"} Regularization Path`,
              font: { size: 15, color: "#F8FAFC", family: "Cinzel, serif" },
            },
            xaxis: {
              ...darkLayout.xaxis,
              type: "log" as const,
              title: { text: "Alpha (log scale)", font: { size: 12, color: "#71717A" } },
            },
            yaxis: {
              ...darkLayout.yaxis,
              title: { text: "Coefficient Value", font: { size: 12, color: "#71717A" } },
            },
            autosize: true,
            showlegend: data.series.length <= 12,
          }}
          config={{ responsive: true, displayModeBar: false }}
          useResizeHandler
          style={{ width: "100%", height: "380px" }}
        />
      )}

      {!data && !loading && (
        <div className="clay-pressed p-10 text-center">
          <p className="text-text-muted text-sm font-bold">
            Click <span className="text-primary">⚡ Compute Path</span> to visualize the regularization path
          </p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ Bias-Variance Curve ═══════════════ */

interface BVData {
  sweep_values: number[];
  train_mse: number[];
  test_mse: number[];
  sweep_param: string;
}

export function BiasVarianceCurve({
  modelType,
  sweepParam = "degree",
  noise = 10,
  alpha = 1.0,
  randomState = 42,
}: {
  modelType: "polynomial" | "ridge" | "lasso" | "elasticnet";
  sweepParam?: "degree" | "alpha";
  noise?: number;
  alpha?: number;
  randomState?: number;
}) {
  const [data, setData] = useState<BVData | null>(null);
  const [loading, setLoading] = useState(false);

  const compute = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.post<BVData>("/regression/bias-variance", {
        model_type: modelType,
        sweep_param: sweepParam,
        noise,
        alpha,
        random_state: randomState,
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [modelType, sweepParam, noise, alpha, randomState]);

  return (
    <div className="clay p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-extrabold text-text-primary flex items-center gap-2">
          <Activity className="h-5 w-5 text-accent" />
          Bias-Variance Trade-off
        </h4>
        <button
          onClick={compute}
          disabled={loading}
          className="clay-btn clay-btn-primary text-xs px-4 py-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "⚡ Compute Curve"
          )}
        </button>
      </div>
      <p className="text-xs text-text-muted">
        Shows how training error (blue) and test error (red) diverge as{" "}
        <span className="font-bold text-text-secondary">
          {sweepParam === "degree" ? "polynomial degree" : "alpha"}
        </span>{" "}
        increases. The sweet spot is where test error is lowest.
      </p>

      {data && (
        <Plot
          data={[
            {
              x: data.sweep_values,
              y: data.train_mse,
              mode: "lines+markers" as const,
              type: "scatter" as const,
              name: "Train MSE",
              line: { color: "#3B82F6", width: 2.5 },
              marker: { size: 6 },
            },
            {
              x: data.sweep_values,
              y: data.test_mse,
              mode: "lines+markers" as const,
              type: "scatter" as const,
              name: "Test MSE",
              line: { color: "#DC2626", width: 2.5 },
              marker: { size: 6, symbol: "diamond" },
            },
          ]}
          layout={{
            ...darkLayout,
            title: {
              text: "Bias-Variance Trade-off",
              font: { size: 15, color: "#F8FAFC", family: "Cinzel, serif" },
            },
            xaxis: {
              ...darkLayout.xaxis,
              title: {
                text: sweepParam === "degree" ? "Polynomial Degree" : "Alpha (log scale)",
                font: { size: 12, color: "#71717A" },
              },
              ...(sweepParam === "alpha" ? { type: "log" as const } : {}),
            },
            yaxis: {
              ...darkLayout.yaxis,
              title: { text: "Mean Squared Error", font: { size: 12, color: "#71717A" } },
            },
            autosize: true,
          }}
          config={{ responsive: true, displayModeBar: false }}
          useResizeHandler
          style={{ width: "100%", height: "380px" }}
        />
      )}

      {!data && !loading && (
        <div className="clay-pressed p-10 text-center">
          <p className="text-text-muted text-sm font-bold">
            Click <span className="text-primary">⚡ Compute Curve</span> to visualize the bias-variance trade-off
          </p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ Learning Curve ═══════════════ */

interface LCData {
  sample_counts: number[];
  train_mse: number[];
  test_mse: number[];
}

export function LearningCurve({
  modelType,
  degree = 3,
  alpha = 1.0,
  noise = 10,
  randomState = 42,
}: {
  modelType: "polynomial" | "ridge" | "lasso" | "elasticnet";
  degree?: number;
  alpha?: number;
  noise?: number;
  randomState?: number;
}) {
  const [data, setData] = useState<LCData | null>(null);
  const [loading, setLoading] = useState(false);

  const compute = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.post<LCData>("/regression/learning-curve", {
        model_type: modelType,
        degree,
        alpha,
        noise,
        random_state: randomState,
        max_samples: 300,
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [modelType, degree, alpha, noise, randomState]);

  return (
    <div className="clay p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-extrabold text-text-primary flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-accent" />
          Learning Curve
        </h4>
        <button
          onClick={compute}
          disabled={loading}
          className="clay-btn clay-btn-primary text-xs px-4 py-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "⚡ Compute Curve"
          )}
        </button>
      </div>
      <p className="text-xs text-text-muted">
        Shows how model performance improves as more training data is added.
        When train & test curves converge, more data won't help — you need a
        better model.
      </p>

      {data && (
        <Plot
          data={[
            {
              x: data.sample_counts,
              y: data.train_mse,
              mode: "lines+markers" as const,
              type: "scatter" as const,
              name: "Train MSE",
              line: { color: "#3B82F6", width: 2.5 },
              marker: { size: 6 },
              fill: "tozeroy" as const,
              fillcolor: "rgba(59,130,246,0.08)",
            },
            {
              x: data.sample_counts,
              y: data.test_mse,
              mode: "lines+markers" as const,
              type: "scatter" as const,
              name: "Test MSE",
              line: { color: "#DC2626", width: 2.5 },
              marker: { size: 6, symbol: "diamond" },
              fill: "tozeroy" as const,
              fillcolor: "rgba(220,38,38,0.08)",
            },
          ]}
          layout={{
            ...darkLayout,
            title: {
              text: "Learning Curve",
              font: { size: 15, color: "#F8FAFC", family: "Cinzel, serif" },
            },
            xaxis: {
              ...darkLayout.xaxis,
              title: { text: "Number of Training Samples", font: { size: 12, color: "#71717A" } },
            },
            yaxis: {
              ...darkLayout.yaxis,
              title: { text: "Mean Squared Error", font: { size: 12, color: "#71717A" } },
            },
            autosize: true,
          }}
          config={{ responsive: true, displayModeBar: false }}
          useResizeHandler
          style={{ width: "100%", height: "380px" }}
        />
      )}

      {!data && !loading && (
        <div className="clay-pressed p-10 text-center">
          <p className="text-text-muted text-sm font-bold">
            Click <span className="text-primary">⚡ Compute Curve</span> to visualize the learning curve
          </p>
        </div>
      )}
    </div>
  );
}
