/* ===== Algorithm Types ===== */

export type AlgorithmCategory = "regression" | "classification" | "clustering";

export interface AlgorithmConfig {
  id: string;
  name: string;
  slug: string;
  category: AlgorithmCategory;
  description: string;
  icon: string;
  color: string;
  endpoint: string;
}

/* ===== API Types ===== */

export interface RegressionMetrics {
  r2_score: number;
  mse: number;
  rmse: number;
  mae: number;
}

export interface ClassificationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  confusion_matrix: number[][];
}

export interface ClusteringMetrics {
  silhouette_score: number;
  inertia: number;
  n_clusters: number;
}

export interface PlotData {
  x_train: number[];
  y_train: number[];
  x_test: number[];
  y_test: number[];
  x_line: number[];
  y_line: number[];
}

export interface RegressionResponse {
  metrics: RegressionMetrics;
  plot_data: PlotData;
  equation?: string;
  coefficients?: number[];
  intercept?: number;
  model_params?: Record<string, unknown>;
}

/* ===== Hyperparameter Control Types ===== */

export interface SliderParam {
  type: "slider";
  label: string;
  key: string;
  min: number;
  max: number;
  step: number;
  default: number;
  description: string;
}

export interface SelectParam {
  type: "select";
  label: string;
  key: string;
  options: { value: string; label: string }[];
  default: string;
  description: string;
}

export type HyperParam = SliderParam | SelectParam;
