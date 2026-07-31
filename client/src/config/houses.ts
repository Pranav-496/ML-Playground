/* =====================================================
   VALORIS — Great Houses of Westeros
   Algorithms grouped by House personality
   ===================================================== */

export interface HouseConfig {
  id: string;
  name: string;
  slug: string;
  motto: string;
  description: string;
  color: string;         // Primary accent color
  colorDark: string;     // Darker shade
  algorithms: string[];  // Algorithm slugs
  implemented: boolean;  // Has any implemented algorithms
}

export const houses: HouseConfig[] = [
  {
    id: "stark",
    name: "House Stark",
    slug: "stark",
    motto: "Winter Is Coming",
    description:
      "Simple, honest, foundational, reliable. The bedrock of all Machine Learning — linear models that find truth in data with unwavering integrity.",
    color: "#6B8CAE",
    colorDark: "#4A6A8A",
    algorithms: [
      "linear-regression",
      "polynomial-regression",
      "ridge-regression",
      "lasso-regression",
      "elastic-net",
      "logistic-regression",
    ],
    implemented: true,
  },
  {
    id: "baratheon",
    name: "House Baratheon",
    slug: "baratheon",
    motto: "Ours Is the Fury",
    description:
      "Aggressive splitting and brute-force decisions. Decision trees that cleave through data with raw power, partitioning the realm into clear dominions.",
    color: "#D4A017",
    colorDark: "#B08A10",
    algorithms: ["decision-tree"],
    implemented: true,
  },
  {
    id: "tyrell",
    name: "House Tyrell",
    slug: "tyrell",
    motto: "Growing Strong",
    description:
      "Growth through local neighborhoods and gradual learning. KNN algorithms that build strength from the bonds of their closest allies.",
    color: "#4CAF50",
    colorDark: "#388E3C",
    algorithms: ["knn"],
    implemented: true,
  },
  {
    id: "greyjoy",
    name: "House Greyjoy",
    slug: "greyjoy",
    motto: "What Is Dead May Never Die",
    description:
      "Probability, faith, simple yet surprisingly effective. Naive Bayes classifiers that rise from uncertain seas with ironborn resilience.",
    color: "#78909C",
    colorDark: "#455A64",
    algorithms: ["gaussian-nb", "bernoulli-nb", "multinomial-nb"],
    implemented: true,
  },
  {
    id: "arryn",
    name: "House Arryn",
    slug: "arryn",
    motto: "As High as Honor",
    description:
      "Elegant, mathematical, maximal margin. Support Vector Machines that soar above the noise, finding hyperplanes of perfect separation.",
    color: "#7986CB",
    colorDark: "#5C6BC0",
    algorithms: ["svm"],
    implemented: true,
  },
  {
    id: "targaryen",
    name: "House Targaryen",
    slug: "targaryen",
    motto: "Fire and Blood",
    description:
      "Powerful, dominant, overwhelming. Ensemble methods that combine many weak learners into an unstoppable force — dragons forged from fire itself.",
    color: "#B91C1C",
    colorDark: "#991B1B",
    algorithms: ["kmeans", "random-forest", "gradient-boosting"],
    implemented: true,
  },
  {
    id: "martell",
    name: "House Martell",
    slug: "martell",
    motto: "Unbowed, Unbent, Unbroken",
    description:
      "Flexible, adaptive, handles difficult boundaries. Kernel methods that bend without breaking, transforming impossible problems into solvable ones.",
    color: "#FF6F00",
    colorDark: "#E65100",
    algorithms: ["pca", "dbscan"],
    implemented: true,
  },
  {
    id: "velaryon",
    name: "House Velaryon",
    slug: "velaryon",
    motto: "The Old, the True, the Brave",
    description:
      "Naval mastery — navigating complex feature spaces. Neural networks that chart courses through deep, uncharted waters of high-dimensional data.",
    color: "#00897B",
    colorDark: "#00695C",
    algorithms: [],
    implemented: false,
  },
  {
    id: "blackfyre",
    name: "House Blackfyre",
    slug: "blackfyre",
    motto: "No Official Motto",
    description:
      "Rebellious, next-generation intelligence. Transformers and Large Language Models that overthrew all tradition and reshaped the realm of AI forever.",
    color: "#7B1FA2",
    colorDark: "#6A1B9A",
    algorithms: [],
    implemented: false,
  },
];

/** Get a house config by slug */
export function getHouseBySlug(slug: string): HouseConfig | undefined {
  return houses.find((h) => h.slug === slug);
}

/** Get the house that owns a given algorithm slug */
export function getHouseForAlgorithm(algoSlug: string): HouseConfig | undefined {
  return houses.find((h) => h.algorithms.includes(algoSlug));
}
