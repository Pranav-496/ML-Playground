import { useEffect } from "react";
import Plot from "react-plotly.js";
import { Network, Activity, BarChart3, Percent } from "lucide-react";
import { useAlgorithm } from "@/hooks/useAlgorithm";
import { ControlPanel, MetricCard, TheorySection, ParamExplainer, CodeSection } from "@/components/shared";
import type { HyperParam } from "@/types";

interface MlpClassRequest {
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
  mesh_resolution: number;
  [key: string]: unknown;
}

interface MlpClassResponse {
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
  };
  loss_curve: number[];
  n_iter: number;
  out_activation: string;
  plot_data: {
    x: number[];
    y: number[];
    labels: number[];
    xx: number[][];
    yy: number[][];
    z: number[][];
  };
}

const hyperParams: HyperParam[] = [
  { type: "slider", label: "Samples", key: "n_samples", min: 100, max: 1000, step: 50, default: 400, description: "Number of data points" },
  { type: "slider", label: "Noise", key: "noise", min: 0.05, max: 1.0, step: 0.05, default: 0.2, description: "Noise level in data" },
  { type: "select", label: "Dataset", key: "dataset_type", options: [
      { value: "moons", label: "Half Moons" },
      { value: "circles", label: "Concentric Circles" },
      { value: "spirals", label: "Spirals" },
      { value: "xor", label: "XOR Pattern" },
    ], default: "moons", description: "Shape of the synthetic dataset" },
  { type: "select", label: "Hidden Layers", key: "hidden_layer_sizes", options: [
      { value: "50", label: "[50]" },
      { value: "100", label: "[100]" },
      { value: "50,50", label: "[50, 50]" },
      { value: "100,50", label: "[100, 50]" },
      { value: "100,100", label: "[100, 100]" },
      { value: "10,10,10", label: "[10, 10, 10]" }
    ], default: "100,50", description: "Architecture of hidden layers" },
  { type: "select", label: "Activation", key: "activation", options: [
      { value: "relu", label: "ReLU" },
      { value: "tanh", label: "Tanh" },
      { value: "logistic", label: "Logistic (Sigmoid)" },
      { value: "identity", label: "Identity" }
    ], default: "relu", description: "Activation function for hidden layers" },
  { type: "select", label: "Solver", key: "solver", options: [
      { value: "adam", label: "Adam" },
      { value: "lbfgs", label: "LBFGS (Fast for small data)" },
      { value: "sgd", label: "SGD (Stochastic Gradient Descent)" }
    ], default: "adam", description: "Weight optimization algorithm" },
  { type: "slider", label: "Learning Rate", key: "learning_rate_init", min: 0.0001, max: 0.1, step: 0.0001, default: 0.001, description: "Initial learning rate" },
  { type: "slider", label: "L2 Regularization (Alpha)", key: "alpha", min: 0.0001, max: 0.1, step: 0.0001, default: 0.0001, description: "L2 penalty parameter" },
  { type: "slider", label: "Max Iterations", key: "max_iter", min: 100, max: 2000, step: 100, default: 500, description: "Maximum number of epochs" }
];

const plotLayout = {
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(28,28,33,0.5)",
  font: { family: "Inter, sans-serif", color: "#A1A1AA" },
  margin: { t: 40, r: 20, b: 50, l: 60 },
  xaxis: { gridcolor: "rgba(46,46,56,0.6)", title: { text: "Feature 1", font: { size: 13, color: "#71717A" } }, zerolinecolor: "rgba(46,46,56,0.8)" },
  yaxis: { gridcolor: "rgba(46,46,56,0.6)", title: { text: "Feature 2", font: { size: 13, color: "#71717A" } }, zerolinecolor: "rgba(46,46,56,0.8)" },
  legend: { bgcolor: "rgba(28,28,33,0.9)", bordercolor: "rgba(46,46,56,0.5)", borderwidth: 1, font: { size: 12, color: "#A1A1AA" } },
};

export default function MlpClassifierPage() {
  const { params, setParam, result, loading, error, train } = useAlgorithm<MlpClassRequest, MlpClassResponse>({
    endpoint: "/deep-learning/mlp-classifier",
    defaultParams: {
      n_samples: 400,
      noise: 0.2,
      dataset_type: "moons",
      hidden_layer_sizes: "100,50",
      activation: "relu",
      solver: "adam",
      alpha: 0.0001,
      learning_rate_init: 0.001,
      max_iter: 500,
      random_state: 42,
      mesh_resolution: 50,
    },
    // We intercept to parse the hidden_layer_sizes string into an array of ints for the backend
    transformParams: (p) => {
      const parsedLayers = p.hidden_layer_sizes.split(',').map(s => parseInt(s.trim()));
      return { ...p, hidden_layer_sizes: parsedLayers };
    }
  });

  useEffect(() => { train(); }, []); // eslint-disable-line

  const getClassData = (X: number[], Y: number[], labels: number[], targetClass: number) => {
    const x: number[] = [];
    const y: number[] = [];
    labels.forEach((val, idx) => {
      if (val === targetClass) {
        x.push(X[idx]);
        y.push(Y[idx]);
      }
    });
    return { x, y };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <TheorySection title="📚 Multi-Layer Perceptron (MLP)" sections={[
        { heading: "What is an MLP?", emoji: "🧠", content: "An MLP is a feedforward artificial neural network. It consists of at least three layers of nodes: an input layer, a hidden layer and an output layer." },
        { heading: "Non-linear capability", emoji: "🌊", content: "Except for the input nodes, each node uses a nonlinear activation function (like ReLU or Tanh). This allows the network to learn extremely complex decision boundaries." },
        { heading: "Backpropagation", emoji: "🔄", content: "MLPs utilize a supervised learning technique called backpropagation for training, constantly adjusting weights to minimize the loss function." },
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
                    z: result.plot_data.z,
                    x: result.plot_data.xx[0],
                    y: result.plot_data.yy.map((row: any) => row[0]),
                    type: "contour",
                    colorscale: [[0, "rgba(59, 130, 246, 0.2)"], [1, "rgba(239, 68, 68, 0.2)"]],
                    showscale: false, hoverinfo: "skip",
                    line: { width: 2, color: "rgba(255,255,255,0.5)" },
                    contours: { start: 0.5, end: 0.5, size: 1 }
                  } as any,
                  {
                    ...getClassData(result.plot_data.x, result.plot_data.y, result.plot_data.labels, 0),
                    mode: "markers", type: "scatter", name: "Class 0",
                    marker: { color: "#3B82F6", size: 8, opacity: 0.8, line: { width: 1, color: "rgba(0,0,0,0.5)" } },
                  },
                  {
                    ...getClassData(result.plot_data.x, result.plot_data.y, result.plot_data.labels, 1),
                    mode: "markers", type: "scatter", name: "Class 1",
                    marker: { color: "#EF4444", size: 8, opacity: 0.8, line: { width: 1, color: "rgba(0,0,0,0.5)" } },
                  }
                ]}
                layout={{ ...plotLayout, title: { text: "Neural Network Decision Boundary", font: { size: 16, color: "#F8FAFC" } }, autosize: true }}
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
          <h3 className="text-lg font-extrabold text-text-primary mb-4">📊 Model Metrics</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Accuracy" value={result.metrics.accuracy} icon={<Percent className="h-5 w-5"/>} color="#22C55E" />
            <MetricCard label="Precision" value={result.metrics.precision} icon={<Network className="h-5 w-5"/>} color="#3B82F6" />
            <MetricCard label="Recall" value={result.metrics.recall} icon={<BarChart3 className="h-5 w-5"/>} color="#F59E0B" />
            <MetricCard label="F1 Score" value={result.metrics.f1_score} icon={<Activity className="h-5 w-5"/>} color="#A855F7" />
          </div>
        </div>
      )}
    </div>
  );
}
