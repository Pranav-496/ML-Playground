import { Link } from "react-router-dom";
import {
  Shield,
  Crown,
  Flame,
  ArrowRight,
  Zap,
  BarChart3,
  BookOpen,
  Landmark,
} from "lucide-react";
import { algorithms } from "@/config/algorithms";

const features = [
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Forge & Refine",
    description:
      "Drag sliders, alter parameters of the Small Council, and forge models like Valyrian steel.",
    color: "#B91C1C",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Borders of the Realm",
    description:
      "Interactive Plotly visualizer mapping boundaries, residual aftermaths, and war metrics.",
    color: "#FF5A1F",
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: "Grand Maester's Wisdom",
    description:
      "Deep mathematical lore, strengths, and weaknesses for every Great House in Machine Learning.",
    color: "#F59E0B",
  },
];

const categoryStats = [
  {
    icon: <Shield className="h-6 w-6" />,
    label: "House Stark",
    subtitle: "Regression",
    count: algorithms.filter((a) => a.category === "regression").length,
    color: "#E11D48",
  },
  {
    icon: <Crown className="h-6 w-6" />,
    label: "House Lannister",
    subtitle: "Classification",
    count: algorithms.filter((a) => a.category === "classification").length,
    color: "#F59E0B",
  },
  {
    icon: <Flame className="h-6 w-6" />,
    label: "House Targaryen",
    subtitle: "Clustering & Ensembles",
    count: algorithms.filter((a) => a.category === "clustering").length,
    color: "#EF4444",
  },
];

export default function HomePage() {
  return (
    <div className="animate-fade-in relative bg-dragon-scale">
      {/* Background Ash & Ember Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="ember-particle w-2 h-2 top-[20%] left-[15%] animation-delay-1000" />
        <div className="ember-particle w-3 h-3 top-[40%] left-[80%] animation-delay-2000" />
        <div className="ember-particle w-2.5 h-2.5 top-[70%] left-[25%] animation-delay-500" />
        <div className="ember-particle w-3 h-3 top-[85%] left-[70%] animation-delay-3000" />
        <div className="ember-particle w-1.5 h-1.5 top-[15%] left-[60%]" />
      </div>

      {/* Hero Section with Iron Throne Silhouette */}
      <section className="relative overflow-hidden py-12 sm:py-20 z-10">
        <div className="relative max-w-5xl mx-auto text-center px-4">

          {/* Logo */}
          <h1
            className="text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-[0.2em] mb-4 leading-[1.05]"
            style={{ fontFamily: '"Cinzel", serif' }}
          >
            <span className="logo-shine">VALORIS</span>
          </h1>

          {/* Tagline */}
          <p
            className="text-2xl sm:text-3xl font-bold text-gold-light mb-6 tracking-widest uppercase font-royal"
          >
            Knowledge is power
          </p>

          <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Step into the Seven Kingdoms of Machine Learning. Command Great Houses,
            forge Valyrian models, and conquer hyperparameter councils across Westeros.
          </p>

          {/* Primary & Secondary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link
              to="/algorithms"
              className="clay-btn clay-btn-primary text-lg font-bold border-valyrian px-8 py-3.5"
            >
              🐉 Dracarys
              <ArrowRight className="h-5 w-5 ml-1" />
            </Link>
            <Link
              to="/algorithms"
              className="clay-btn clay-btn-secondary text-lg font-bold border-gold-royal px-8 py-3.5 text-gold-light"
            >
              <Landmark className="h-5 w-5 text-gold" />
              Take the Iron Throne
            </Link>
          </div>
        </div>
      </section>

      {/* Category Stats - The Great Houses */}
      <section className="max-w-5xl mx-auto px-4 py-8 z-10 relative">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {categoryStats.map((stat, i) => (
            <div
              key={stat.label}
              className="clay p-6 clay-hover border-iron animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="p-3 rounded-2xl border border-surface-border"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <div style={{ color: stat.color }}>{stat.icon}</div>
                </div>
                <div>
                  <p
                    className="text-2xl font-bold text-gold-light font-royal"
                  >
                    {stat.count} Disciplines
                  </p>
                  <p className="text-sm text-text-primary font-extrabold font-royal">
                    {stat.label}
                  </p>
                  <p className="text-xs text-text-muted font-medium">
                    {stat.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features - The Path to Conquest */}
      <section className="max-w-5xl mx-auto px-4 py-14 z-10 relative">
        <div className="text-center mb-12">
          <h2
            className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-3 font-royal"
          >
            The Path to <span className="gradient-text-gold">Conquest</span>
          </h2>
          <p className="text-text-muted max-w-xl mx-auto font-medium">
            Machine Learning treated like warfare and ancient knowledge.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="clay p-7 clay-hover border-iron animate-slide-up"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div
                className="p-3.5 rounded-2xl w-fit mb-5 border border-surface-border"
                style={{ backgroundColor: `${feature.color}15` }}
              >
                <div style={{ color: feature.color }}>{feature.icon}</div>
              </div>
              <h3
                className="text-lg font-bold text-text-primary mb-2 font-royal"
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

      {/* The Great Houses Grid */}
      <section className="max-w-5xl mx-auto px-4 py-12 z-10 relative">
        <div className="text-center mb-12">
          <h2
            className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-3 font-royal"
          >
            {algorithms.length} <span className="gradient-text-gold">Disciplines of Westeros</span>
          </h2>
          <p className="text-text-muted max-w-xl mx-auto font-medium">
            From House Stark regression lines to House Targaryen trees — master every discipline.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {algorithms.map((algo, index) => (
            <Link
              key={algo.id}
              to={`/algorithms/${algo.slug}`}
              className="group clay p-5 clay-hover border-iron animate-slide-up"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="p-2.5 rounded-2xl shrink-0 border border-surface-border"
                  style={{ backgroundColor: `${algo.color}15` }}
                >
                  <Crown
                    className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
                    style={{ color: algo.color }}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary group-hover:text-gold-light transition-colors font-royal text-sm">
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
