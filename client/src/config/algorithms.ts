import type { AlgorithmConfig } from "@/types";

export const algorithms: AlgorithmConfig[] = [
  {
    id: "linear-regression",
    name: "Linear Regression",
    slug: "linear-regression",
    category: "regression",
    description:
      "Find the best-fit straight line through data points using ordinary least squares.",
    icon: "TrendingUp",
    color: "#e8553a",
    endpoint: "/regression/linear",
  },
  {
    id: "polynomial-regression",
    name: "Polynomial Regression",
    slug: "polynomial-regression",
    category: "regression",
    description:
      "Fit a polynomial curve to data for modeling non-linear relationships.",
    icon: "Spline",
    color: "#d94e7a",
    endpoint: "/regression/polynomial",
  },
  {
    id: "ridge-regression",
    name: "Ridge Regression",
    slug: "ridge-regression",
    category: "regression",
    description:
      "Linear regression with L2 regularization to prevent overfitting.",
    icon: "Shield",
    color: "#c94430",
    endpoint: "/regression/ridge",
  },
  {
    id: "lasso-regression",
    name: "Lasso Regression",
    slug: "lasso-regression",
    category: "regression",
    description:
      "Linear regression with L1 regularization for feature selection.",
    icon: "Target",
    color: "#b83c2b",
    endpoint: "/regression/lasso",
  },
  {
    id: "elastic-net",
    name: "Elastic Net",
    slug: "elastic-net",
    category: "regression",
    description:
      "Combines L1 and L2 regularization for the best of both worlds.",
    icon: "Network",
    color: "#e06040",
    endpoint: "/regression/elastic-net",
  },
  {
    id: "logistic-regression",
    name: "Logistic Regression",
    slug: "logistic-regression",
    category: "classification",
    description:
      "Classify data into categories using the sigmoid function and log-odds.",
    icon: "GitBranch",
    color: "#f5a623",
    endpoint: "/classification/logistic",
  },
  {
    id: "knn",
    name: "K-Nearest Neighbors",
    slug: "knn",
    category: "classification",
    description:
      "Classify data points based on the majority class of their nearest neighbors.",
    icon: "Users",
    color: "#e8962e",
    endpoint: "/classification/knn",
  },
  {
    id: "decision-tree",
    name: "Decision Tree",
    slug: "decision-tree",
    category: "classification",
    description:
      "Build a tree of decisions to classify or predict outcomes.",
    icon: "GitFork",
    color: "#d18e1a",
    endpoint: "/classification/decision-tree",
  },
  {
    id: "kmeans",
    name: "K-Means Clustering",
    slug: "kmeans",
    category: "clustering",
    description:
      "Partition data into k clusters by minimizing within-cluster variance.",
    icon: "Layers",
    color: "#4caf7d",
    endpoint: "/clustering/kmeans",
  },
];

export const categoryLabels: Record<string, string> = {
  regression: "Regression",
  classification: "Classification",
  clustering: "Clustering",
};

export const categoryColors: Record<string, string> = {
  regression: "text-[#e8553a]",
  classification: "text-[#f5a623]",
  clustering: "text-[#4caf7d]",
};

export const categoryBgColors: Record<string, string> = {
  regression: "bg-[#e8553a]/10 border-[#e8553a]/20",
  classification: "bg-[#f5a623]/10 border-[#f5a623]/20",
  clustering: "bg-[#4caf7d]/10 border-[#4caf7d]/20",
};
