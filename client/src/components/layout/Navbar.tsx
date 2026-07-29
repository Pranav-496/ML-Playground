import { Link, useLocation } from "react-router-dom";
import { Menu, X, Music, Pause, LogOut, User as UserIcon } from "lucide-react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import ValorisLogoIcon from "@/components/shared/ValorisLogoIcon";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const location = useLocation();
  const audioRef = useRef<HTMLAudioElement>(null);
  const { user, logout } = useAuth();

  const navLinks = [
    { to: "/", label: "King's Landing" },
    { to: "/algorithms", label: "The Great Houses" },
  ];

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.volume = 1.0;
        audioRef.current.play().catch(err => console.error("Audio playback failed:", err));
      }
      setIsPlaying(!isPlaying);
    }
  };

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

          <div className="flex items-center gap-2 sm:gap-4">
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

            {/* Music Toggle */}
            <button
              onClick={toggleMusic}
              className={cn(
                "p-2.5 rounded-full transition-all duration-300 border flex items-center justify-center",
                isPlaying
                  ? "bg-primary/10 text-primary border-primary/30 shadow-[0_0_15px_rgba(185,14,10,0.2)]"
                  : "bg-surface-hover text-text-muted border-transparent hover:text-text-primary hover:bg-surface-border"
              )}
              title="Play Theme"
            >
              {/* Note: User must place got-theme.mp3 in the public folder */}
              <audio ref={audioRef} src="/got-theme.mp3" loop />
              {isPlaying ? <Pause className="h-4 w-4" /> : <Music className="h-4 w-4" />}
            </button>

            {/* User Profile & Logout */}
            {user && (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/profile"
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold font-royal tracking-wider transition-all duration-300 border",
                    location.pathname === "/profile"
                      ? "bg-[#B90E0A]/15 text-[#B90E0A] border-[#B90E0A]/40"
                      : "bg-surface-hover/80 text-text-secondary border-surface-border/30 hover:text-text-primary hover:bg-surface-border"
                  )}
                  title="Lord's Chambers (Profile & Settings)"
                >
                  <UserIcon className="h-3.5 w-3.5 text-[#B90E0A]" />
                  <span>{user.first_name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-full bg-surface-hover text-text-muted border-transparent hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}

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
            {/* Mobile Profile & Logout */}
            {user && (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all",
                    location.pathname === "/profile"
                      ? "clay-sm text-primary"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                  )}
                >
                  <UserIcon className="h-4 w-4 text-[#B90E0A]" />
                  Profile & Settings ({user.first_name})
                </Link>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full text-left px-5 py-2.5 rounded-2xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
