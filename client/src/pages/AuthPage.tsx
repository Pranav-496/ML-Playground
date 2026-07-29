import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ValorisLogoIcon from "@/components/shared/ValorisLogoIcon";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "register";

interface FormErrors {
  [key: string]: string;
}

export default function AuthPage() {
  const { login, register, googleAuth } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const clearForm = useCallback(() => {
    setFirstName("");
    setLastName("");
    setUsername("");
    setEmail("");
    setIdentifier("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setErrors({});
  }, []);

  const switchMode = useCallback((newMode: AuthMode) => {
    setMode(newMode);
    clearForm();
  }, [clearForm]);

  const validateRegister = (): boolean => {
    const newErrors: FormErrors = {};

    if (firstName.trim().length < 1) newErrors.firstName = "First name is required";
    if (lastName.trim().length < 1) newErrors.lastName = "Last name is required";
    if (username.length < 3) newErrors.username = "Username must be at least 3 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(username)) newErrors.username = "Only letters, numbers, and underscores";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Invalid email address";
    if (password.length < 8) newErrors.password = "At least 8 characters";
    else if (!/[A-Z]/.test(password)) newErrors.password = "Must include an uppercase letter";
    else if (!/[a-z]/.test(password)) newErrors.password = "Must include a lowercase letter";
    else if (!/[0-9]/.test(password)) newErrors.password = "Must include a digit";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setErrors({});

    if (mode === "register" && !validateRegister()) return;

    setIsLoading(true);
    try {
      if (mode === "login") {
        await login(identifier, password);
      } else {
        await register({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          username: username.toLowerCase(),
          email: email.toLowerCase(),
          password,
          confirm_password: confirmPassword,
        });
      }
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (Array.isArray(detail)) {
        // Pydantic validation errors
        setError(detail.map((d: any) => d.msg).join(". "));
      } else {
        setError(detail || err.message || "Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = useCallback(async () => {
    // Google Identity Services — initialize and prompt
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError("Google login is not configured yet");
      return;
    }

    try {
      // @ts-ignore — Google Identity Services global
      if (!window.google?.accounts?.id) {
        setError("Google Sign-In is loading, please try again");
        return;
      }

      // @ts-ignore
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          setIsLoading(true);
          setError("");
          try {
            await googleAuth(response.credential);
          } catch (err: any) {
            setError(err?.response?.data?.detail || "Google sign-in failed");
          } finally {
            setIsLoading(false);
          }
        },
      });

      // @ts-ignore
      window.google.accounts.id.prompt();
    } catch {
      setError("Failed to initialize Google Sign-In");
    }
  }, [googleAuth]);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#030303] overflow-y-auto py-6">
      {/* Background embers (subtle) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(185,14,10,0.08)_0%,transparent_70%)]" />

      <div className="relative z-10 w-full max-w-md mx-4 my-auto">
        {/* Logo & Title */}
        <div className="text-center mb-4">
          <div className="flex justify-center mb-2">
            <ValorisLogoIcon className="h-12 w-12 sm:h-14 sm:w-14" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-[0.15em] font-royal text-[#B90E0A] mb-1">
            VALORIS
          </h1>
          <p className="text-text-muted text-xs tracking-wider uppercase font-royal">
            {mode === "login" ? "Welcome back, my Lord" : "Pledge your allegiance"}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-surface/60 backdrop-blur-xl border border-surface-border/50 rounded-2xl p-5 sm:p-6 shadow-2xl">
          {/* Tab Switcher */}
          <div className="flex mb-4 bg-surface-secondary/50 rounded-xl p-1">
            <button
              onClick={() => switchMode("login")}
              className={cn(
                "flex-1 py-2.5 text-sm font-bold font-royal tracking-wider rounded-lg transition-all duration-300 uppercase",
                mode === "login"
                  ? "bg-[#B90E0A]/15 text-[#B90E0A] shadow-sm border border-[#B90E0A]/20"
                  : "text-text-muted hover:text-text-secondary"
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => switchMode("register")}
              className={cn(
                "flex-1 py-2.5 text-sm font-bold font-royal tracking-wider rounded-lg transition-all duration-300 uppercase",
                mode === "register"
                  ? "bg-[#B90E0A]/15 text-[#B90E0A] shadow-sm border border-[#B90E0A]/20"
                  : "text-text-muted hover:text-text-secondary"
              )}
            >
              Join the Realm
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "register" && (
              <>
                {/* Name Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 font-royal">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={cn(
                        "w-full px-3 py-2.5 bg-surface-secondary/70 border rounded-xl text-sm text-text-primary placeholder-text-muted/40 focus:outline-none focus:border-[#B90E0A]/50 focus:ring-1 focus:ring-[#B90E0A]/20 transition-all",
                        errors.firstName ? "border-red-500/50" : "border-surface-border/30"
                      )}
                      placeholder="Tyrion"
                    />
                    {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 font-royal">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={cn(
                        "w-full px-3 py-2.5 bg-surface-secondary/70 border rounded-xl text-sm text-text-primary placeholder-text-muted/40 focus:outline-none focus:border-[#B90E0A]/50 focus:ring-1 focus:ring-[#B90E0A]/20 transition-all",
                        errors.lastName ? "border-red-500/50" : "border-surface-border/30"
                      )}
                      placeholder="Lannister"
                    />
                    {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 font-royal">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={cn(
                      "w-full px-3 py-2.5 bg-surface-secondary/70 border rounded-xl text-sm text-text-primary placeholder-text-muted/40 focus:outline-none focus:border-[#B90E0A]/50 focus:ring-1 focus:ring-[#B90E0A]/20 transition-all",
                      errors.username ? "border-red-500/50" : "border-surface-border/30"
                    )}
                    placeholder="the_imp"
                  />
                  {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 font-royal">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cn(
                      "w-full px-3 py-2.5 bg-surface-secondary/70 border rounded-xl text-sm text-text-primary placeholder-text-muted/40 focus:outline-none focus:border-[#B90E0A]/50 focus:ring-1 focus:ring-[#B90E0A]/20 transition-all",
                      errors.email ? "border-red-500/50" : "border-surface-border/30"
                    )}
                    placeholder="tyrion@westeros.com"
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>
              </>
            )}

            {/* Login identifier */}
            {mode === "login" && (
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 font-royal">
                  Username or Email
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-secondary/70 border border-surface-border/30 rounded-xl text-sm text-text-primary placeholder-text-muted/40 focus:outline-none focus:border-[#B90E0A]/50 focus:ring-1 focus:ring-[#B90E0A]/20 transition-all"
                  placeholder="Username or email"
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 font-royal">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    "w-full px-3 py-2.5 pr-12 bg-surface-secondary/70 border rounded-xl text-sm text-text-primary placeholder-text-muted/40 focus:outline-none focus:border-[#B90E0A]/50 focus:ring-1 focus:ring-[#B90E0A]/20 transition-all",
                    errors.password ? "border-red-500/50" : "border-surface-border/30"
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password (register only) */}
            {mode === "register" && (
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 font-royal">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={cn(
                      "w-full px-3 py-2.5 pr-12 bg-surface-secondary/70 border rounded-xl text-sm text-text-primary placeholder-text-muted/40 focus:outline-none focus:border-[#B90E0A]/50 focus:ring-1 focus:ring-[#B90E0A]/20 transition-all",
                      errors.confirmPassword ? "border-red-500/50" : "border-surface-border/30"
                    )}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#B90E0A] hover:bg-[#9a0c08] text-white font-royal font-bold text-sm uppercase tracking-[0.15em] rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-[0_0_25px_rgba(185,14,10,0.4)] flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "login" ? "Enter the Realm" : "Pledge Allegiance"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-surface-border/30" />
            <span className="text-text-muted/50 text-xs uppercase tracking-wider font-royal">or</span>
            <div className="flex-1 h-px bg-surface-border/30" />
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3 bg-surface-secondary/70 border border-surface-border/30 hover:border-surface-border/60 text-text-secondary hover:text-text-primary rounded-xl transition-all duration-300 flex items-center justify-center gap-3 text-sm font-semibold disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-text-muted/40 text-xs mt-4 font-royal tracking-wider">
          Valar Morghulis — All men must learn
        </p>
      </div>
    </div>
  );
}
