import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import ValorisLogoIcon from "@/components/shared/ValorisLogoIcon";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "King's Landing" },
    { to: "/algorithms", label: "The Great Houses" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-surface-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative transition-all duration-300 group-hover:scale-105">
              <ValorisLogoIcon className="h-8 w-8" />
            </div>
            <span className="text-xl font-bold tracking-[0.15em] gradient-text font-royal">
              VALORIS
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300",
                  location.pathname === link.to
                    ? "clay-sm text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                )}
              >
                {link.label}
              </Link>
            ))}
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
        <div className="md:hidden border-t border-surface-border/50 bg-surface-secondary/95 backdrop-blur-xl animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all",
                  location.pathname === link.to
                    ? "clay-sm text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
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
