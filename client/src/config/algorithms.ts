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
    color: "#DC2626",
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
    color: "#E04040",
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
    color: "#B91C1C",
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
    color: "#991B1B",
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
    color: "#CC3333",
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
    color: "#FF5A1F",
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
    color: "#FF7A45",
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
    color: "#E06020",
    endpoint: "/classification/decision-tree",
  },
  {
    id: "svm",
    name: "Support Vector Machine",
    slug: "svm",
    category: "classification",
    description:
      "Find the optimal hyperplane that maximizes the margin between classes.",
    icon: "Swords",
    color: "#7C3AED",
    endpoint: "/classification/svm",
  },
  {
    id: "gaussian-nb",
    name: "Gaussian Naive Bayes",
    slug: "gaussian-nb",
    category: "classification",
    description:
      "A probabilistic classifier that assumes continuous features follow a normal distribution.",
    icon: "Bell",
    color: "#F59E0B",
    endpoint: "/classification/gaussian-nb",
  },
  {
    id: "bernoulli-nb",
    name: "Bernoulli Naive Bayes",
    slug: "bernoulli-nb",
    category: "classification",
    description:
      "A probabilistic classifier designed for binary/boolean features. Creates blocky boundaries.",
    icon: "Grid",
    color: "#3B82F6",
    endpoint: "/classification/bernoulli-nb",
  },
  {
    id: "multinomial-nb",
    name: "Multinomial Naive Bayes",
    slug: "multinomial-nb",
    category: "classification",
    description:
      "A probabilistic classifier for discrete counts (e.g. word frequencies in text).",
    icon: "BarChart",
    color: "#10B981",
    endpoint: "/classification/multinomial-nb",
  },
  {
    id: "kmeans",
    name: "K-Means Clustering",
    slug: "kmeans",
    category: "clustering",
    description:
      "Partition data into k clusters by minimizing within-cluster variance.",
    icon: "Layers",
    color: "#F59E0B",
    endpoint: "/unsupervised/kmeans",
  },
  {
    id: "random-forest",
    name: "Random Forest",
    slug: "random-forest",
    category: "classification",
    description:
      "An ensemble of decorrelated decision trees that vote together for unbeatable robustness.",
    icon: "Trees",
    color: "#059669",
    endpoint: "/ensemble/random-forest/classify",
  },

  {
    id: "gradient-boosting",
    name: "Gradient Boosting",
    slug: "gradient-boosting",
    category: "classification",
    description:
      "Sequential ensemble that builds trees to correct the errors of previous trees — fire and blood.",
    icon: "Flame",
    color: "#EA580C",
    endpoint: "/ensemble/gradient-boosting/classify",
  },
  {
    id: "pca",
    name: "Principal Component Analysis",
    slug: "pca",
    category: "clustering",
    description:
      "Reduce high-dimensional data to its most informative axes — the ultimate compression.",
    icon: "Shrink",
    color: "#7C3AED",
    endpoint: "/unsupervised/pca",
  },
  {
    id: "dbscan",
    name: "DBSCAN",
    slug: "dbscan",
    category: "clustering",
    description:
      "Density-based clustering that discovers arbitrary-shaped clusters and detects outliers.",
    icon: "Radar",
    color: "#F97316",
    endpoint: "/unsupervised/dbscan",
  },
];

export const categoryLabels: Record<string, string> = {
  regression: "House Stark",
  classification: "House Lannister",
  clustering: "House Targaryen",
};

export const categoryColors: Record<string, string> = {
  regression: "text-[#DC2626]",
  classification: "text-[#FF5A1F]",
  clustering: "text-[#F59E0B]",
};

export const categoryBgColors: Record<string, string> = {
  regression: "bg-[#DC2626]/10 border-[#DC2626]/20",
  classification: "bg-[#FF5A1F]/10 border-[#FF5A1F]/20",
  clustering: "bg-[#F59E0B]/10 border-[#F59E0B]/20",
};
