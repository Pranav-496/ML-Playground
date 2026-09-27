import { useEffect } from "react";
import Plot from "react-plotly.js";
import { Activity, Hash, Layers, Percent } from "lucide-react";
import { useAlgorithm } from "@/hooks/useAlgorithm";
import { ControlPanel, MetricCard, TheorySection } from "@/components/shared";
import type { HyperParam } from "@/types";

interface MlpRegRequest {
  n_samples: number;
  noise: number;
  dataset_type: string;
  hidden_layer_sizes: string;
  activation: string;
  solver: string;
  alpha: number;
  learning_rate_init: number;
  max_iter: number;
  random_state: number;
  [key: string]: unknown;
}

interface MlpRegResponse {
  metrics: {
    r2_score: number;
    mse: number;
    rmse: number;
    mae: number;
  };
  loss_curve: number[];
  n_iter: number;
  plot_data: {
    x: number[];
    y: number[];
    line_x: number[];
    line_y: number[];
  };
}

const hyperParams: HyperParam[] = [
  { type: "slider", label: "Samples", key: "n_samples", min: 50, max: 500, step: 50, default: 200, description: "Number of data points" },
  { type: "slider", label: "Noise", key: "noise", min: 0.1, max: 20.0, step: 0.5, default: 5.0, description: "Noise level in data" },
  { type: "select", label: "Dataset", key: "dataset_type", options: [
      { value: "sine", label: "Sine Wave" },
      { value: "polynomial", label: "Polynomial" },
      { value: "exponential", label: "Exponential" }
    ], default: "sine", description: "Underlying true function" },
  { type: "select", label: "Hidden Layers", key: "hidden_layer_sizes", options: [
      { value: "50", label: "[50]" },
      { value: "100", label: "[100]" },
      { value: "100,50", label: "[100, 50]" },
      { value: "100,100,50", label: "[100, 100, 50]" }
    ], default: "100,50", description: "Architecture of hidden layers" },
  { type: "select", label: "Activation", key: "activation", options: [
      { value: "relu", label: "ReLU" },
      { value: "tanh", label: "Tanh" },
      { value: "logistic", label: "Logistic" }
    ], default: "relu", description: "Activation function" },
  { type: "slider", label: "Learning Rate", key: "learning_rate_init", min: 0.001, max: 0.1, step: 0.001, default: 0.01, description: "Initial learning rate" },
  { type: "slider", label: "Max Iterations", key: "max_iter", min: 100, max: 3000, step: 100, default: 1000, description: "Maximum number of epochs" }
];

const plotLayout = {
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(28,28,33,0.5)",
  font: { family: "Inter, sans-serif", color: "#A1A1AA" },
  margin: { t: 40, r: 20, b: 50, l: 60 },
  xaxis: { gridcolor: "rgba(46,46,56,0.6)", title: { text: "Input (X)", font: { size: 13, color: "#71717A" } }, zerolinecolor: "rgba(46,46,56,0.8)" },
  yaxis: { gridcolor: "rgba(46,46,56,0.6)", title: { text: "Target (y)", font: { size: 13, color: "#71717A" } }, zerolinecolor: "rgba(46,46,56,0.8)" },
  legend: { bgcolor: "rgba(28,28,33,0.9)", bordercolor: "rgba(46,46,56,0.5)", borderwidth: 1, font: { size: 12, color: "#A1A1AA" } },
};

export default function MlpRegressorPage() {
  const { params, setParam, result, loading, error, train } = useAlgorithm<MlpRegRequest, MlpRegResponse>({
    endpoint: "/deep-learning/mlp-regressor",
    defaultParams: {
      n_samples: 200,
      noise: 5.0,
      dataset_type: "sine",
      hidden_layer_sizes: "100,50",
      activation: "relu",
      solver: "adam",
      alpha: 0.0001,
      learning_rate_init: 0.01,
      max_iter: 1000,
      random_state: 42,
    },
    transformParams: (p) => {
      const parsedLayers = p.hidden_layer_sizes.split(',').map(s => parseInt(s.trim()));
      return { ...p, hidden_layer_sizes: parsedLayers };
    }
  });

  useEffect(() => { train(); }, []); // eslint-disable-line

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <TheorySection title="📚 MLP Regressor" sections={[
        { heading: "Universal Function Approximators", emoji: "📉", content: "While linear regression fits straight lines and polynomial fits curves, an MLP Regressor can approximate virtually ANY continuous mathematical function given enough neurons and layers." },
        { heading: "No Output Activation", emoji: "⚡", content: "Unlike classifiers which use Sigmoid or Softmax to output probabilities, the output layer of an MLP Regressor uses an Identity function so it can predict continuous values." },
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(300px,1fr)_2fr] gap-8">
        <ControlPanel params={hyperParams} values={params as any} onChange={setParam} onRun={train} loading={loading} />

        <div className="space-y-6">
          {error && <div className="clay-pressed p-4 text-error font-bold text-sm">❌ Error: {error}</div>}
          
          {result && (
            <div className="clay p-4 space-y-6">
              <Plot
                data={[
                  {
                    x: result.plot_data.x,
                    y: result.plot_data.y,
                    mode: "markers",
                    type: "scatter",
                    name: "Data Points",
                    marker: { color: "rgba(255, 255, 255, 0.4)", size: 6, line: { color: "#fff", width: 1 } },
                  },
                  {
                    x: result.plot_data.line_x,
                    y: result.plot_data.line_y,
                    mode: "lines",
                    type: "scatter",
                    name: "MLP Prediction",
                    line: { color: "#00897B", width: 4 },
                  }
                ]}
                layout={{ ...plotLayout, title: { text: "Neural Network Function Approximation", font: { size: 16, color: "#F8FAFC" } }, autosize: true }}
                config={{ responsive: true, displayModeBar: false }}
                useResizeHandler style={{ width: "100%", height: "420px" }}
              />

              {/* Loss Curve */}
              {result.loss_curve && result.loss_curve.length > 0 && (
                <div className="pt-4 border-t border-surface-border">
                  <Plot
                    data={[
                      {
                        y: result.loss_curve,
                        type: "scatter", mode: "lines", name: "Training Loss",
                        line: { color: "#10B981", width: 2 }
                      }
                    ]}
                    layout={{
                      ...plotLayout,
                      title: { text: "Training Loss Curve", font: { size: 16, color: "#F8FAFC" } },
                      margin: { t: 40, r: 20, b: 40, l: 50 },
                      xaxis: { ...plotLayout.xaxis, title: { text: "Epoch (Iteration)" } },
                      yaxis: { ...plotLayout.yaxis, title: { text: "Loss" } }
                    }}
                    config={{ responsive: true, displayModeBar: false }}
                    useResizeHandler style={{ width: "100%", height: "250px" }}
                  />
                  <p className="text-xs text-text-muted mt-2 text-center">Converged in {result.n_iter} iterations.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {result && (
        <div className="animate-slide-up">
          <h3 className="text-lg font-extrabold text-text-primary mb-4">📊 Regression Metrics</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="R² Score" value={result.metrics.r2_score} icon={<Percent className="h-5 w-5"/>} color="#22C55E" />
            <MetricCard label="MSE" value={result.metrics.mse} icon={<Activity className="h-5 w-5"/>} color="#EF4444" />
            <MetricCard label="RMSE" value={result.metrics.rmse} icon={<Layers className="h-5 w-5"/>} color="#F59E0B" />
            <MetricCard label="MAE" value={result.metrics.mae} icon={<Hash className="h-5 w-5"/>} color="#3B82F6" />
          </div>
        </div>
      )}
    </div>
  );
}
