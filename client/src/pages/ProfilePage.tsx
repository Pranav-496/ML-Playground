import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User, KeyRound, ShieldCheck, Check, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();

  // Profile Form State
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password Form State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setUsername(user.username);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (!firstName.trim() || !lastName.trim() || !username.trim()) {
      setProfileError("All fields are required");
      return;
    }

    setProfileLoading(true);
    try {
      await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: username.trim().toLowerCase(),
      });
      setProfileSuccess("Profile updated successfully");
      setTimeout(() => setProfileSuccess(""), 4000);
    } catch (err: any) {
      setProfileError(err?.response?.data?.detail || err.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setPasswordError("All password fields are required");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_new_password: confirmNewPassword,
      });
      setPasswordSuccess("Password updated successfully");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => setPasswordSuccess(""), 4000);
    } catch (err: any) {
      setPasswordError(err?.response?.data?.detail || err.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-border/50 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black font-royal text-[#B90E0A] tracking-wider mb-1">
            Lord's Chambers
          </h1>
          <p className="text-text-muted text-sm font-royal tracking-wide">
            Manage your allegiance details, credentials, and realm security
          </p>
        </div>
      </div>

      {/* Overview Card */}
      <div className="bg-surface-secondary/40 border border-surface-border/50 rounded-2xl p-6 sm:p-8 backdrop-blur-xl flex flex-col sm:flex-row items-center gap-6 shadow-xl">
        <div className="h-20 w-20 rounded-full bg-[#B90E0A]/15 border-2 border-[#B90E0A]/40 flex items-center justify-center text-[#B90E0A] font-royal font-black text-2xl shadow-lg">
          {user.first_name[0]}
          {user.last_name[0]}
        </div>
        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <h2 className="text-2xl font-bold font-royal text-text-primary">
              {user.first_name} {user.last_name}
            </h2>
            <span className="px-3 py-1 bg-[#B90E0A]/10 border border-[#B90E0A]/30 text-[#B90E0A] rounded-full text-xs font-royal font-bold uppercase tracking-wider">
              @{user.username}
            </span>
          </div>
          <p className="text-text-muted text-sm">{user.email}</p>
          <div className="flex items-center justify-center sm:justify-start gap-2 pt-2 text-xs text-text-muted">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Auth Method: {user.is_google_user ? "Google OAuth 2.0" : "Encrypted Password"}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Details Form */}
        <div className="bg-surface-secondary/40 border border-surface-border/50 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-surface-border/30">
              <User className="h-5 w-5 text-[#B90E0A]" />
              <h3 className="text-lg font-bold font-royal text-text-primary uppercase tracking-wider">
                Profile Info
              </h3>
            </div>

            {profileSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 font-royal">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-surface/70 border border-surface-border/40 rounded-xl text-sm text-text-primary focus:outline-none focus:border-[#B90E0A]/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 font-royal">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-surface/70 border border-surface-border/40 rounded-xl text-sm text-text-primary focus:outline-none focus:border-[#B90E0A]/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 font-royal">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2.5 bg-surface/70 border border-surface-border/40 rounded-xl text-sm text-text-primary focus:outline-none focus:border-[#B90E0A]/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 font-royal">
                  Email (Read-Only)
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2.5 bg-surface/30 border border-surface-border/20 rounded-xl text-sm text-text-muted/60 cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="w-full mt-4 py-3 bg-[#B90E0A] hover:bg-[#9a0c08] text-white font-royal font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {profileLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Profile
              </button>
            </form>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="bg-surface-secondary/40 border border-surface-border/50 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-surface-border/30">
              <KeyRound className="h-5 w-5 text-[#B90E0A]" />
              <h3 className="text-lg font-bold font-royal text-text-primary uppercase tracking-wider">
                Security Settings
              </h3>
            </div>

            {user.is_google_user ? (
              <div className="p-4 rounded-xl bg-surface-secondary/60 border border-surface-border/30 text-text-muted text-sm leading-relaxed space-y-2">
                <p className="font-semibold text-text-primary">Google Authenticated Account</p>
                <p className="text-xs">
                  Your account is secured via Google OAuth 2.0. Password changes are managed directly through your Google Account settings.
                </p>
              </div>
            ) : (
              <>
                {passwordSuccess && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                {passwordError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 font-royal">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showOldPassword ? "text" : "password"}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full px-3 py-2.5 pr-10 bg-surface/70 border border-surface-border/40 rounded-xl text-sm text-text-primary focus:outline-none focus:border-[#B90E0A]/50 transition-all"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                      >
                        {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 font-royal">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2.5 pr-10 bg-surface/70 border border-surface-border/40 rounded-xl text-sm text-text-primary focus:outline-none focus:border-[#B90E0A]/50 transition-all"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 font-royal">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full px-3 py-2.5 pr-10 bg-surface/70 border border-surface-border/40 rounded-xl text-sm text-text-primary focus:outline-none focus:border-[#B90E0A]/50 transition-all"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full mt-4 py-3 bg-[#B90E0A] hover:bg-[#9a0c08] text-white font-royal font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {passwordLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Update Password
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
