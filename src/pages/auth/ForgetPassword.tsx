"use client";

import { useState } from "react";
import { NavLink } from "react-router-dom";
import { showSuccess, showError } from "../../utils/swalHelper";
import { forgotPassword } from "../../authService"; // import the service
const Banner = "/assets/image/banner.png";

export default function ForgetPassword() {
  const [businessEmail, setBusinessEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    if (!businessEmail.trim()) {
      setError("Email is required.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleForgot = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await forgotPassword(businessEmail);
      if (res.status) {
        showSuccess(res.message || "Password reset link sent!", "Check your email for instructions.", 2500);
        setBusinessEmail(""); // clear input
      } else {
        setError(res.message || "Something went wrong.");
      }
    } catch (err: unknown) {
      showError("Error", err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleForgot();
  };

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="overflow-hidden flex flex-col md:flex-row w-full max-w-[420px] md:max-w-screen-md xl:max-w-screen-xl rounded-[28px] bg-white shadow-[0_1px_2px_rgba(9,30,66,0.08),0_24px_48px_-24px_rgba(9,30,66,0.25)] mx-auto">
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
                Locked out happens
              </h2>
              <p className="mt-2.5 text-[14px] text-white/75 max-w-xs">
                We'll get you a secure reset link in seconds.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-[50%] flex items-center">
          <div className="w-full max-w-md mx-auto px-6 py-10 sm:px-10 sm:py-14">
            <div className="mb-8 text-center">
              <h1 className="text-[26px] font-bold text-[#4f9748] tracking-tight">Forgot password?</h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Enter the email on your account and we&apos;ll send a reset link.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="forgotEmail" className="text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="forgotEmail"
                  type="email"
                  placeholder="you@company.com"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-[15px] text-slate-900
                    placeholder:text-slate-400 outline-none transition-colors
                    focus:ring-2 focus:ring-[#4f9748]/30 focus:border-[#4f9748]
                    ${error?.includes("Email") ? "border-red-400" : "border-slate-200"}`}
                />
                {error && <p className="text-[13px] text-red-500">{error}</p>}
              </div>

              <button
                onClick={handleForgot}
                disabled={loading}
                className={`w-full py-3 rounded-xl text-white text-[15px] font-semibold shadow-sm transition-all
                  ${loading ? "bg-slate-300 cursor-not-allowed" : "bg-[#4f9748] hover:bg-[#437d3d] active:scale-[0.99]"}`}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <p className="text-center text-sm text-slate-500 pt-2">
                Remember your password?{" "}
                <NavLink to="/auth/login" className="font-medium text-[#4f9748] hover:underline">
                  Login
                </NavLink>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}