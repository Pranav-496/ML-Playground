import { Link, useLocation } from "react-router-dom";
import {
  Brain,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/algorithms", label: "Algorithms" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-surface-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative p-2 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-[3px_3px_8px_rgba(166,140,116,0.15),-2px_-2px_6px_rgba(255,255,255,0.6)] group-hover:shadow-[5px_5px_12px_rgba(166,140,116,0.2),-3px_-3px_8px_rgba(255,255,255,0.7)] transition-all duration-300">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-extrabold gradient-text-warm tracking-tight">
              ML Playground
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-bold transition-all duration-300",
                  location.pathname === link.to
                    ? "clay-sm text-primary bg-surface-card"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-warm"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="ml-3 p-2 rounded-full clay-sm text-accent">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-2xl clay-sm text-text-secondary hover:text-text-primary transition-all"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-surface-border/50 bg-surface-card/90 backdrop-blur-md animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block px-5 py-2.5 rounded-2xl text-sm font-bold transition-all",
                  location.pathname === link.to
                    ? "clay-sm text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-warm"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
