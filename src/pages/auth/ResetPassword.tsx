"use client";

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../../utils/swalHelper";
import { resetPassword } from "../../authService"; // <-- create this in authService
import PasswordStrengthInput from "../../components/PasswordStrengthInput"; // adjust path to match your project
const Banner = "/assets/image/banner.png";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Extract token from URL query
    const params = new URLSearchParams(location.search);
    const t = params.get("token");
    setToken(t);

    console.log("Reset token:", t);
  }, [location.search]);

  const validateForm = () => {
    if (!newPassword || !confirmPassword) {
      setError("Both password fields are required");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    setError(null);
    return true;
  };

  const handleReset = async () => {
    if (!validateForm()) return;
    if (!token) {
      showError("Error", "Invalid or missing token");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(token, newPassword, confirmPassword);
      if (res.status) {
        showSuccess(res.message || "Password reset successful", undefined, 2000);
        navigate("/auth/login"); // Redirect to login after reset
      } else {
        showError("Error", res.message || "Failed to reset password");
      }
    } catch (err: unknown) {
      showError("Error", err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="overflow-hidden flex flex-col md:flex-row w-full max-w-[440px] md:max-w-screen-md xl:max-w-screen-xl rounded-[28px] bg-white shadow-[0_1px_2px_rgba(9,30,66,0.08),0_24px_48px_-24px_rgba(9,30,66,0.25)] mx-auto">
        <div className="w-full md:w-[50%] relative min-h-[220px] md:min-h-0 overflow-hidden">
          <img alt="Banner" src={Banner} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#173318]/60 via-transparent to-transparent" />
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#4f9748]/30 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />

          <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-10 text-white">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 text-[13px] font-bold tracking-tight">
                CLN
              </span>
              <span className="text-sm font-medium text-white/80">CLN (Cambodia) Co., Ltd.</span>
            </div>

            <div className="mt-8 md:mt-0">
              <h2 className="text-[26px] md:text-[30px] font-bold tracking-tight leading-[1.15]">
                Almost there
              </h2>
              <p className="mt-2.5 text-[14px] text-white/75 max-w-xs">
                Set a new password to get back into your account.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-[50%] flex items-center">
          <div className="w-full max-w-md mx-auto px-6 py-10 sm:px-10 sm:py-14">
            <div className="mb-8 text-center">
              <h1 className="text-[26px] font-bold text-[#4f9748] tracking-tight">Reset password</h1>
              <p className="mt-1.5 text-sm text-slate-500">Choose a new password for your account.</p>
            </div>

            <div className="space-y-4">
              <PasswordStrengthInput
                id="newPassword"
                label="New Password"
                required
                value={newPassword}
                onChange={setNewPassword}
                placeholder="Enter new password"
              />

              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full rounded-xl border bg-slate-50 px-4 py-3 pr-11 text-[15px] text-slate-900
                      placeholder:text-slate-400 outline-none transition-colors
                      focus:ring-2 focus:ring-[#4f9748]/30 focus:border-[#4f9748]
                      ${error?.includes("match") || error?.includes("required") ? "border-red-400" : "border-slate-200"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-[#4f9748] transition-colors"
                  >
                    {showConfirm ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" /><path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87" /><path d="M3 3l18 18" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" /></svg>
                    )}
                  </button>
                </div>
              </div>

              {error && <p className="text-[13px] text-red-500">{error}</p>}

              <button
                onClick={handleReset}
                disabled={loading}
                className={`w-full py-3 rounded-xl text-white text-[15px] font-semibold shadow-sm transition-all
                  ${loading ? "bg-slate-300 cursor-not-allowed" : "bg-[#4f9748] hover:bg-[#437d3d] active:scale-[0.99]"}`}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}