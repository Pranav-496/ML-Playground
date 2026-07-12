import { useState, useCallback, useEffect } from "react";
import Plot from "react-plotly.js";
import {
  TrendingDown,
  Target,
  Percent,
  TrendingUp,
} from "lucide-react";
import api from "@/lib/api";
import { MetricCard, TheorySection, ParamExplainer } from "@/components/shared";
import { cn } from "@/lib/utils";

/* ---------- Types ---------- */

interface GDRequest {
  n_samples: number;
  noise: number;
  learning_rate: number;
  epochs: number;
  gd_type: string;
  batch_size: number;
  random_state: number;
}

interface GDResponse {
  metrics: {
    r2_score: number;
    mse: number;
    rmse: number;
    mae: number;
  };
  gd_equation: string;
  ols_equation: string;
  loss_history: number[];
  param_history: { w: number; b: number }[];
  plot_data: {
    x_data: number[];
    y_data: number[];
    x_line: number[];
    y_line_gd: number[];
    y_line_ols: number[];
  };
  final_params: {
    gd: { w: number; b: number };
    ols: { w: number; b: number };
  };
  model_config: Record<string, unknown>;
}

/* ---------- GD Type cards config ---------- */

const gdTypes = [
  {
    value: "batch",
    label: "Batch GD",
    emoji: "📦",
    color: "#DC2626",
    description: "Uses the ENTIRE dataset for each gradient step.",
  },
  {
    value: "stochastic",
    label: "Stochastic GD",
    emoji: "🎲",
    color: "#FF5A1F",
    description: "Uses ONE random sample per gradient step.",
  },
  {
    value: "mini-batch",
    label: "Mini-Batch GD",
    emoji: "🧩",
    color: "#F59E0B",
    description: "Uses a SMALL BATCH of samples per gradient step.",
  },
];

/* ---------- Theory content ---------- */

const gdTheory = [
  {
    heading: "What is Gradient Descent?",
    emoji: "⛰️",
    content:
      "Gradient Descent is an iterative optimisation algorithm that finds the minimum of a function by repeatedly taking steps proportional to the negative of the gradient (slope). Imagine standing on a hilly landscape blindfolded — gradient descent tells you to always step downhill. Over many steps, you reach the valley (the minimum loss).",
  },
  {
    heading: "The Update Rule",
    emoji: "🧮",
    content:
      "At each step, parameters are updated:\n\nθ = θ - α · ∂L/∂θ\n\nWhere:\n• θ is the parameter (weight or bias)\n• α is the learning rate (step size)\n• ∂L/∂θ is the gradient of the loss function\n\nFor linear regression with MSE loss:\n• ∂L/∂w = -(2/n) · Σ xᵢ(yᵢ - ŷᵢ)\n• ∂L/∂b = -(2/n) · Σ (yᵢ - ŷᵢ)",
  },
  {
    heading: "OLS vs Gradient Descent",
    emoji: "⚔️",
    content:
      "OLS (Ordinary Least Squares) finds the EXACT solution in one shot using the formula β = (XᵀX)⁻¹Xᵀy. It's fast for small datasets but requires matrix inversion (O(n³)).\n\nGradient Descent finds an APPROXIMATE solution iteratively. It scales better to massive datasets because it doesn't need to load all data into memory at once. Deep learning frameworks use GD exclusively because there's no closed-form solution for neural networks.",
  },
];

/* ---------- 3 Types of GD — Deep Explainer ---------- */

const gdTypesTheory = [
  {
    heading: "1. Batch Gradient Descent",
    emoji: "📦",
    content:
      "Computes the gradient using the ENTIRE training dataset at each step.\n\n✅ Pros:\n• Smooth, stable convergence\n• Guaranteed to converge to global minimum (for convex functions)\n• Consistent gradient direction\n\n❌ Cons:\n• Very slow on large datasets (loads all data each step)\n• High memory usage\n• Can get stuck in local minima (for non-convex functions)",
  },
  {
    heading: "2. Stochastic Gradient Descent (SGD)",
    emoji: "🎲",
    content:
      "Computes the gradient using ONE randomly picked sample at each step.\n\n✅ Pros:\n• Very fast updates (one sample at a time)\n• Low memory usage\n• Noisy updates can escape local minima\n• Works for online learning (streaming data)\n\n❌ Cons:\n• Very noisy convergence (loss curve zigzags)\n• May never settle at exact minimum (oscillates around it)\n• Requires learning rate scheduling",
  },
  {
    heading: "3. Mini-Batch Gradient Descent",
    emoji: "🧩",
    content:
      "The BEST OF BOTH WORLDS — computes the gradient using a small batch (e.g., 16-128 samples) at each step.\n\n✅ Pros:\n• Faster than Batch GD, smoother than SGD\n• Efficient GPU utilisation (vectorised operations on batches)\n• Good balance of speed and stability\n• This is what most deep learning frameworks use by default\n\n❌ Cons:\n• Requires tuning of batch size\n• Still somewhat noisy (but much less than SGD)",
  },
];

const gdParamExplainer = [
  {
    name: "Learning Rate (α)",
    description:
      "Controls the step size. Too small → very slow convergence (needs many epochs). Too large → may overshoot the minimum and diverge (loss explodes).",
    impact:
      "The MOST critical hyperparameter. Try 0.001–0.1 for stable training.",
    emoji: "🎛️",
  },
  {
    name: "Epochs",
    description:
      "Number of complete passes through the training dataset. Each epoch computes gradients and updates parameters.",
    impact:
      "Too few → underfitting. Too many → wasted compute (loss already converged).",
    emoji: "🔄",
  },
  {
    name: "GD Type",
    description:
      "Batch uses all data per step (smooth but slow). Stochastic uses 1 sample (noisy but fast). Mini-batch uses a small batch (best of both).",
    impact:
      "Affects convergence speed, smoothness, and memory usage.",
    emoji: "⚡",
  },
  {
    name: "Batch Size",
    description:
      "Only relevant for mini-batch GD. Controls how many samples are used per gradient step. Common values: 16, 32, 64, 128.",
    impact:
      "Smaller batch → noisier but more updates. Larger batch → smoother but fewer updates per epoch.",
    emoji: "📏",
  },
];

/* ---------- Plotly layout ---------- */

const plotLayout = {
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(28,28,33,0.5)",
  font: { family: "Inter, sans-serif", color: "#A1A1AA" },
  margin: { t: 40, r: 20, b: 50, l: 60 },
  xaxis: {
    gridcolor: "rgba(46,46,56,0.6)",
    title: { text: "X", font: { size: 13, color: "#71717A" } },
    zerolinecolor: "rgba(46,46,56,0.8)",
  },
  yaxis: {
    gridcolor: "rgba(46,46,56,0.6)",
    title: { text: "y", font: { size: 13, color: "#71717A" } },
    zerolinecolor: "rgba(46,46,56,0.8)",
  },
  legend: {
    bgcolor: "rgba(28,28,33,0.9)",
    bordercolor: "rgba(46,46,56,0.5)",
    borderwidth: 1,
    font: { size: 12, color: "#A1A1AA" },
  },
};

/* ========== Component ========== */

export default function GradientDescentSection() {
  const [params, setParams] = useState<GDRequest>({
    n_samples: 100,
    noise: 10,
    learning_rate: 0.05,
    epochs: 100,
    gd_type: "batch",
    batch_size: 32,
    random_state: 42,
  });
  const [result, setResult] = useState<GDResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const train = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<GDResponse>("/regression/linear-gd", params);
      setResult(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to train model");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    train();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="clay-lg p-8">
        <div className="flex items-start gap-4">
          <div className="p-4 rounded-2xl bg-accent/10 shrink-0">
            <TrendingDown className="h-8 w-8 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-text-primary mb-2">
              Gradient Descent{" "}
              <span className="gradient-text-warm">Visualised</span>
            </h2>
            <p className="text-text-secondary font-medium text-lg">
              Watch how gradient descent iteratively finds the best-fit line by
              sliding down the loss surface. Compare it with the OLS
              closed-form solution.
            </p>
          </div>
        </div>
      </div>

      {/* Theory — 3 types of GD */}
      <TheorySection
        title="⛰️ Gradient Descent — How It Works"
        sections={gdTheory}
      />

      <TheorySection
        title="📚 Three Types of Gradient Descent"
        sections={gdTypesTheory}
      />

      {/* GD Type Selector Cards */}
      <div>
        <h3 className="text-lg font-extrabold text-text-primary mb-4">
          ⚡ Choose Gradient Descent Type
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {gdTypes.map((gd) => (
            <button
              key={gd.value}
              onClick={() => setParams((p) => ({ ...p, gd_type: gd.value }))}
              className={cn(
                "p-5 rounded-2xl text-left transition-all duration-300 border-2",
                params.gd_type === gd.value
                  ? "clay border-current shadow-[6px_6px_14px_rgba(166,140,116,0.25),-4px_-4px_10px_rgba(255,255,255,0.8)]"
                  : "clay-sm border-transparent hover:border-surface-border"
              )}
              style={{
                borderColor:
                  params.gd_type === gd.value ? gd.color : undefined,
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{gd.emoji}</span>
                <span
                  className="font-extrabold text-sm"
                  style={{
                    color: params.gd_type === gd.value ? gd.color : undefined,
                  }}
                >
                  {gd.label}
                </span>
              </div>
              <p className="text-xs text-text-secondary font-medium">
                {gd.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Controls + Visualisation */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(300px,1fr)_2fr] gap-8">
        {/* Controls */}
        <div className="space-y-4">
          <div className="clay p-6 space-y-5">
            <h3 className="text-lg font-extrabold text-text-primary">
              ⚙️ GD Parameters
            </h3>

            {/* Learning Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-text-primary">
                  Learning Rate (α)
                </label>
                <span className="text-sm font-extrabold px-3 py-1 rounded-full clay-sm text-primary">
                  {params.learning_rate}
                </span>
              </div>
              <input
                type="range"
                min={0.001}
                max={0.5}
                step={0.001}
                value={params.learning_rate}
                onChange={(e) =>
                  setParams((p) => ({
                    ...p,
                    learning_rate: parseFloat(e.target.value),
                  }))
                }
                className="w-full"
              />
            </div>

            {/* Epochs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-text-primary">
                  Epochs
                </label>
                <span className="text-sm font-extrabold px-3 py-1 rounded-full clay-sm text-primary">
                  {params.epochs}
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={500}
                step={5}
                value={params.epochs}
                onChange={(e) =>
                  setParams((p) => ({
                    ...p,
                    epochs: parseInt(e.target.value),
                  }))
                }
                className="w-full"
              />
            </div>

            {/* Samples */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-text-primary">
                  Samples
                </label>
                <span className="text-sm font-extrabold px-3 py-1 rounded-full clay-sm text-primary">
                  {params.n_samples}
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={500}
                step={10}
                value={params.n_samples}
                onChange={(e) =>
                  setParams((p) => ({
                    ...p,
                    n_samples: parseInt(e.target.value),
                  }))
                }
                className="w-full"
              />
            </div>

            {/* Noise */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-text-primary">
                  Noise
                </label>
                <span className="text-sm font-extrabold px-3 py-1 rounded-full clay-sm text-primary">
                  {params.noise}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={params.noise}
                onChange={(e) =>
                  setParams((p) => ({
                    ...p,
                    noise: parseInt(e.target.value),
                  }))
                }
                className="w-full"
              />
            </div>

            {/* Batch Size (only for mini-batch) */}
            {params.gd_type === "mini-batch" && (
              <div className="space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-text-primary">
                    Batch Size
                  </label>
                  <span className="text-sm font-extrabold px-3 py-1 rounded-full clay-sm text-primary">
                    {params.batch_size}
                  </span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={128}
                  step={4}
                  value={params.batch_size}
                  onChange={(e) =>
                    setParams((p) => ({
                      ...p,
                      batch_size: parseInt(e.target.value),
                    }))
                  }
                  className="w-full"
                />
              </div>
            )}

            {/* Train button */}
            <button
              onClick={train}
              disabled={loading}
              className={cn(
                "w-full clay-btn clay-btn-primary justify-center text-base",
                loading && "opacity-70 cursor-not-allowed"
              )}
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Training...
                </>
              ) : (
                <>🚀 Run Gradient Descent</>
              )}
            </button>
          </div>

          {/* Equations comparison */}
          {result && (
            <div className="clay-sm p-5 space-y-3 animate-bounce-in">
              <h4 className="text-sm font-extrabold text-text-muted">
                📝 Equations Comparison
              </h4>
              <div className="space-y-2">
                <div className="clay-pressed p-3 rounded-xl">
                  <p className="text-xs font-bold text-text-muted mb-1">
                    Gradient Descent
                  </p>
                  <p className="text-sm font-black text-primary">
                    {result.gd_equation}
                  </p>
                </div>
                <div className="clay-pressed p-3 rounded-xl">
                  <p className="text-xs font-bold text-text-muted mb-1">
                    OLS (Exact Solution)
                  </p>
                  <p className="text-sm font-black text-green">
                    {result.ols_equation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Plots */}
        <div className="space-y-6">
          {error && (
            <div className="clay-pressed p-4 text-error font-bold text-sm animate-fade-in">
              ❌ Error: {error}
            </div>
          )}

          {result && (
            <>
              {/* Loss Curve */}
              <div className="clay p-4">
                <Plot
                  data={[
                    {
                      x: result.loss_history.map((_, i) => i + 1),
                      y: result.loss_history,
                      mode: "lines",
                      type: "scatter",
                      name: "MSE Loss",
                      line: { color: "#DC2626", width: 2.5 },
                      fill: "tozeroy",
                      fillcolor: "rgba(185,28,28,0.1)",
                    },
                  ]}
                  layout={{
                    ...plotLayout,
                    title: {
                      text: "Loss Curve (MSE vs Epoch)",
                      font: {
                        size: 16,
                        color: "#F8FAFC",
                        family: "Cinzel, serif",
                      },
                    },
                    xaxis: {
                      ...plotLayout.xaxis,
                      title: {
                        text: "Epoch",
                        font: { size: 13, color: "#71717A" },
                      },
                    },
                    yaxis: {
                      ...plotLayout.yaxis,
                      title: {
                        text: "MSE Loss",
                        font: { size: 13, color: "#71717A" },
                      },
                    },
                    autosize: true,
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  useResizeHandler
                  style={{ width: "100%", height: "380px" }}
                />
              </div>

              {/* Parameter Convergence */}
              <div className="clay p-4">
                <Plot
                  data={[
                    {
                      x: result.param_history.map((_, i) => i + 1),
                      y: result.param_history.map((p) => p.w),
                      mode: "lines",
                      type: "scatter",
                      name: "Weight (w)",
                      line: { color: "#DC2626", width: 2 },
                    },
                    {
                      x: result.param_history.map((_, i) => i + 1),
                      y: result.param_history.map((p) => p.b),
                      mode: "lines",
                      type: "scatter",
                      name: "Bias (b)",
                      line: { color: "#FF5A1F", width: 2 },
                    },
                    {
                      x: [1, result.param_history.length],
                      y: [
                        result.final_params.ols.w / (1), // normalized — show raw converged
                        result.final_params.ols.w / (1),
                      ],
                      mode: "lines",
                      type: "scatter",
                      name: "OLS Weight (target)",
                      line: {
                        color: "#F59E0B",
                        width: 1.5,
                        dash: "dash",
                      },
                    },
                  ]}
                  layout={{
                    ...plotLayout,
                    title: {
                      text: "Parameter Convergence",
                      font: {
                        size: 16,
                        color: "#F8FAFC",
                        family: "Cinzel, serif",
                      },
                    },
                    xaxis: {
                      ...plotLayout.xaxis,
                      title: {
                        text: "Epoch",
                        font: { size: 13, color: "#71717A" },
                      },
                    },
                    yaxis: {
                      ...plotLayout.yaxis,
                      title: {
                        text: "Parameter Value",
                        font: { size: 13, color: "#71717A" },
                      },
                    },
                    autosize: true,
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  useResizeHandler
                  style={{ width: "100%", height: "380px" }}
                />
              </div>

              {/* GD vs OLS regression line comparison */}
              <div className="clay p-4">
                <Plot
                  data={[
                    {
                      x: result.plot_data.x_data,
                      y: result.plot_data.y_data,
                      mode: "markers",
                      type: "scatter",
                      name: "Data Points",
                      marker: {
                        color: "#71717A",
                        size: 7,
                        opacity: 0.5,
                        line: { width: 1, color: "rgba(0,0,0,0.3)" },
                      },
                    },
                    {
                      x: result.plot_data.x_line,
                      y: result.plot_data.y_line_gd,
                      mode: "lines",
                      type: "scatter",
                      name: "GD Fit",
                      line: { color: "#DC2626", width: 3 },
                    },
                    {
                      x: result.plot_data.x_line,
                      y: result.plot_data.y_line_ols,
                      mode: "lines",
                      type: "scatter",
                      name: "OLS Fit (exact)",
                      line: { color: "#F59E0B", width: 2, dash: "dash" },
                    },
                  ]}
                  layout={{
                    ...plotLayout,
                    title: {
                      text: "Gradient Descent vs OLS Fit",
                      font: {
                        size: 16,
                        color: "#F8FAFC",
                        family: "Cinzel, serif",
                      },
                    },
                    autosize: true,
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  useResizeHandler
                  style={{ width: "100%", height: "400px" }}
                />
              </div>
            </>
          )}

          {!result && !loading && (
            <div className="clay p-16 text-center">
              <p className="text-text-muted font-bold text-lg">
                👆 Adjust parameters and click{" "}
                <span className="text-primary">Run Gradient Descent</span>
              </p>
            </div>
          )}

          {loading && !result && (
            <div className="clay p-16 text-center">
              <div className="inline-block w-8 h-8 border-3 border-surface-border border-t-primary rounded-full animate-spin mb-4" />
              <p className="text-text-muted font-bold">
                Running gradient descent...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Metrics */}
      {result && (
        <div className="animate-slide-up">
          <h3 className="text-lg font-extrabold text-text-primary mb-4">
            📊 GD Model Metrics
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="R² Score"
              value={result.metrics.r2_score}
              icon={<Percent className="h-5 w-5" />}
              color="#F59E0B"
              description="How close GD solution is to optimal"
            />
            <MetricCard
              label="MSE"
              value={result.metrics.mse}
              icon={<Target className="h-5 w-5" />}
              color="#DC2626"
              description="Mean Squared Error of GD fit"
            />
            <MetricCard
              label="Final Loss"
              value={result.loss_history[result.loss_history.length - 1]}
              icon={<TrendingDown className="h-5 w-5" />}
              color="#FF5A1F"
              description="Loss at the last epoch"
            />
            <MetricCard
              label="Epochs Run"
              value={result.loss_history.length}
              icon={<TrendingUp className="h-5 w-5" />}
              color="#22C55E"
              description="Total training iterations"
            />
          </div>
        </div>
      )}

      {/* Parameter Explainer */}
      <ParamExplainer params={gdParamExplainer} />
    </div>
  );
}
