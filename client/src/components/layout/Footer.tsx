import { Brain, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-surface-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-text-secondary">
            <div className="p-1.5 rounded-xl bg-gradient-to-br from-primary to-accent">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold">
              ML Playground — Learn Machine Learning Visually
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-text-muted font-medium">
            Made with <Heart className="h-4 w-4 text-primary fill-primary" /> using
            React, FastAPI & Scikit-learn
          </div>
        </div>
      </div>
    </footer>
  );
}
