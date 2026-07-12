import { Link } from "react-router-dom";
import {
  Sword,
  Sparkles,
  TrendingUp,
  GitBranch,
  Layers,
  ArrowRight,
  Zap,
  BarChart3,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { algorithms } from "@/config/algorithms";

const features = [
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Forge & Refine",
    description:
      "Drag sliders, change hyperparameters, and watch models reshape in real time.",
    color: "#DC2626",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Visualise Mastery",
    description:
      "Interactive Plotly charts that make decision boundaries and regressions tangible.",
    color: "#FF5A1F",
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: "Ancient Knowledge",
    description:
      "Every algorithm comes with theory, math, and intuition — not just code.",
    color: "#F59E0B",
  },
];

const categoryStats = [
  {
    icon: <TrendingUp className="h-6 w-6" />,
    label: "Regression",
    count: algorithms.filter((a) => a.category === "regression").length,
    color: "#DC2626",
  },
  {
    icon: <GitBranch className="h-6 w-6" />,
    label: "Classification",
    count: algorithms.filter((a) => a.category === "classification").length,
    color: "#FF5A1F",
  },
  {
    icon: <Layers className="h-6 w-6" />,
    label: "Clustering",
    count: algorithms.filter((a) => a.category === "clustering").length,
    color: "#F59E0B",
  },
];

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-08 sm:py-14">
        <div className="relative max-w-4xl mx-auto text-center px-4">
          {/* Logo */}
          <h1
            className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-[0.12em] mb-6 leading-[1.05]"
            style={{ fontFamily: '"Cinzel", serif' }}
          >
            <span className="logo-shine">VALORIS</span>
          </h1>

          {/* Tagline */}
          <p
            className="text-2xl sm:text-3xl font-semibold text-text-secondary mb-4 tracking-wide"
            style={{ fontFamily: '"Cinzel", serif' }}
          >
            Forge Intelligence.
          </p>

          <p className="text-base sm:text-lg text-text-muted max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            Master Machine Learning through interactive visual exploration.
            Tune hyperparameters, watch models learn, and build real intuition
            in an elite academy.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/algorithms"
              className="clay-btn clay-btn-primary text-base"
            >
              <Sword className="h-5 w-5" />
              Enter Valoris
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/algorithms"
              className="clay-btn clay-btn-secondary text-base"
            >
              Explore Algorithms
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Category Stats */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {categoryStats.map((stat, i) => (
            <div
              key={stat.label}
              className="clay p-6 clay-hover animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="p-3 rounded-2xl"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <div style={{ color: stat.color }}>{stat.icon}</div>
                </div>
                <div>
                  <p
                    className="text-3xl font-bold"
                    style={{ color: stat.color, fontFamily: '"Cinzel", serif' }}
                  >
                    {stat.count}
                  </p>
                  <p className="text-sm text-text-muted font-semibold">
                    {stat.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-14">
          <h2
            className="text-3xl sm:text-4xl font-bold text-text-primary mb-4"
            style={{ fontFamily: '"Cinzel", serif' }}
          >
            The Path to <span className="gradient-text-warm">Mastery</span>
          </h2>
          <p className="text-text-muted max-w-xl mx-auto font-medium">
            Every warrior needs weapons. Every master needs tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="clay p-7 clay-hover animate-slide-up"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div
                className="p-3.5 rounded-2xl w-fit mb-5"
                style={{ backgroundColor: `${feature.color}12` }}
              >
                <div style={{ color: feature.color }}>{feature.icon}</div>
              </div>
              <h3
                className="text-xl font-bold text-text-primary mb-2"
                style={{ fontFamily: '"Cinzel", serif' }}
              >
                {feature.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed font-medium">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Algorithm Grid */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-14">
          <h2
            className="text-3xl sm:text-4xl font-bold text-text-primary mb-4"
            style={{ fontFamily: '"Cinzel", serif' }}
          >
            {algorithms.length} <span className="gradient-text-gold">Disciplines</span>
          </h2>
          <p className="text-text-muted max-w-xl mx-auto font-medium">
            From regression to clustering — every weapon in your arsenal.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {algorithms.map((algo, index) => (
            <Link
              key={algo.id}
              to={`/algorithms/${algo.slug}`}
              className="group clay p-5 clay-hover animate-slide-up"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="p-2.5 rounded-2xl shrink-0"
                  style={{ backgroundColor: `${algo.color}12` }}
                >
                  <Sword
                    className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
                    style={{ color: algo.color }}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary group-hover:text-primary transition-colors">
                    {algo.name}
                  </h3>
                  <p className="text-xs text-text-muted mt-1.5 line-clamp-2 font-medium leading-relaxed">
                    {algo.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
