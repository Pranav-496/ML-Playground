import { Link } from "react-router-dom";
import {
  Brain,
  Sparkles,
  TrendingUp,
  GitBranch,
  Layers,
  ArrowRight,
  Zap,
  BarChart3,
  BookOpen,
  Play,
} from "lucide-react";
import { algorithms } from "@/config/algorithms";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Tweak & Learn",
    description:
      "Drag sliders, change hyperparameters, and watch models reshape in real time.",
    color: "#e8553a",
    bg: "bg-[#e8553a]/10",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "See It Click",
    description:
      "Interactive Plotly charts that make decision boundaries and regressions tangible.",
    color: "#f5a623",
    bg: "bg-[#f5a623]/10",
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: "Get the Why",
    description:
      "Every algorithm comes with theory, math, and intuition — not just code.",
    color: "#4caf7d",
    bg: "bg-[#4caf7d]/10",
  },
];

const categoryStats = [
  {
    icon: <TrendingUp className="h-6 w-6" />,
    label: "Regression",
    count: algorithms.filter((a) => a.category === "regression").length,
    color: "#e8553a",
    emoji: "📈",
  },
  {
    icon: <GitBranch className="h-6 w-6" />,
    label: "Classification",
    count: algorithms.filter((a) => a.category === "classification").length,
    color: "#f5a623",
    emoji: "🔀",
  },
  {
    icon: <Layers className="h-6 w-6" />,
    label: "Clustering",
    count: algorithms.filter((a) => a.category === "clustering").length,
    color: "#4caf7d",
    emoji: "🧩",
  },
];

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        {/* Decorative blobs */}
        <div className="blob w-72 h-72 bg-primary/8 -top-20 -right-20 animate-float" />
        <div
          className="blob w-56 h-56 bg-accent/8 -bottom-10 -left-10 animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="blob w-40 h-40 bg-green/8 top-1/2 right-1/4 animate-float"
          style={{ animationDelay: "4s" }}
        />

        <div className="relative max-w-4xl mx-auto text-center px-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 pill bg-surface-card text-primary mb-8 animate-bounce-in">
            <Sparkles className="h-4 w-4" />
            <span>Interactive ML — Learn by Doing</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.1]">
            <span className="text-text-primary">Machine Learning</span>
            <br />
            <span className="gradient-text">Made Playful</span>
            <span className="inline-block ml-3 animate-wiggle">🧪</span>
          </h1>

          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Stop reading about ML — start <em>playing</em> with it. Tune
            hyperparameters, watch models learn, and build real intuition
            through interactive visualizations.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/algorithms"
              className="clay-btn clay-btn-primary text-base"
            >
              <Play className="h-5 w-5" />
              Start Exploring
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/algorithms/linear-regression"
              className="clay-btn clay-btn-secondary text-base"
            >
              Try Linear Regression
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
                <span className="text-3xl">{stat.emoji}</span>
                <div>
                  <p
                    className="text-3xl font-black"
                    style={{ color: stat.color }}
                  >
                    {stat.count}
                  </p>
                  <p className="text-sm text-text-muted font-bold">
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
          <h2 className="text-3xl sm:text-4xl font-black text-text-primary mb-4">
            Why You'll Love This <span className="gradient-text-warm">Playground</span>
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto font-medium">
            The fastest way to build intuition for machine learning algorithms.
            No textbooks needed.
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
                className={cn("p-3.5 rounded-2xl w-fit mb-5", feature.bg)}
              >
                <div style={{ color: feature.color }}>{feature.icon}</div>
              </div>
              <h3 className="text-xl font-extrabold text-text-primary mb-2">
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
          <h2 className="text-3xl sm:text-4xl font-black text-text-primary mb-4">
            {algorithms.length} Algorithms
            <span className="inline-block ml-2 animate-wiggle">🎯</span>
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto font-medium">
            From linear regression to clustering — every foundation you need.
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
                  style={{ backgroundColor: `${algo.color}18` }}
                >
                  <Brain
                    className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
                    style={{ color: algo.color }}
                  />
                </div>
                <div>
                  <h3 className="font-extrabold text-text-primary group-hover:gradient-text-warm transition-all">
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
