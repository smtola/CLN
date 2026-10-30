"use client";

import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { showError, showSuccess} from "../../utils/swalHelper";
import { login } from "../../authService";
import { getPublicIp } from "../../utils/getIp";
const Banner = "/assets/image/banner.png";
import { Eye, EyeOff } from "lucide-react"; // 👀 for show/hide toggle

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { businessEmail?: string };
  const [businessEmail, setBusinessEmail] = useState(state?.businessEmail ?? "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    if (!businessEmail.trim() && !password) {
      showError("Email and Password are required.");
      return false;
    }
    if (!businessEmail.trim()) {
      showError("Email is required.");
      return false;
    }
    if (!password) {
      setError("Password is required.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleLogin = async () => {
    const ip = await getPublicIp();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const res = await login({ businessEmail, password, local_ip: ip });

      if (res.requiresOtp) {
        navigate("/auth/verify-otp", { state: { businessEmail } });
        showSuccess(res.msg || "OTP sent", undefined, 1500);
      } else if (res.access_token && res.refresh_token) {
        showSuccess("Login Successful", undefined, 1500);
        localStorage.setItem("token", res.access_token);
        // localStorage.setItem("role", res.role); // "admin" or "user"

        // redirect
        if (res.access_token === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        // Login failed (wrong credentials, unverified email, etc.) — surface it as a toast, not just inline text
        const message = res.msg || "Invalid email or password. Please try again.";
        setError(message);
        showError("Login Failed", message);
      }
    } catch (err: unknown) {
      showError("Error", err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  const emailInvalid = !!error && (error.includes("Email") || error.includes("Email and"));
  const passwordInvalid = !!error && (error.includes("Password") || error.includes("Email and"));

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="overflow-hidden flex flex-col md:flex-row w-full max-w-[420px] md:max-w-screen-md xl:max-w-screen-xl rounded-[28px] bg-white shadow-[0_1px_2px_rgba(9,30,66,0.08),0_24px_48px_-24px_rgba(9,30,66,0.25)] mx-auto">
        <div className="w-full md:w-[50%] relative min-h-[220px] md:min-h-0 overflow-hidden">
          <img alt="" src={Banner} className="absolute inset-0 h-full w-full object-cover" />
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
                Your trade operations, in one login
              </h2>
              <p className="mt-2.5 text-[14px] text-white/75 max-w-xs">
                Track shipments, manage documents, and coordinate with partners.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-[50%] flex items-center">
          <div className="w-full max-w-md mx-auto px-6 py-10 sm:px-10 sm:py-14">
            <div className="mb-8 text-center">
              <h1 className="text-[26px] font-bold text-[#4f9748] tracking-tight">Welcome back</h1>
              <p className="mt-1.5 text-sm text-slate-500">Sign in to your account to continue</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="businessEmail" className="text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="businessEmail"
                  type="text"
                  placeholder="you@company.com"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-[15px] text-slate-900
                    placeholder:text-slate-400 outline-none transition-colors
                    focus:ring-2 focus:ring-[#4f9748]/30 focus:border-[#4f9748]
                    ${emailInvalid ? "border-red-400" : "border-slate-200"}`}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <NavLink
                    to="/auth/forget-password"
                    className="text-xs font-medium text-[#4f9748] hover:underline"
                  >
                    Forgot password?
                  </NavLink>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={`w-full rounded-xl border bg-slate-50 px-4 py-3 pr-11 text-[15px] text-slate-900
                      placeholder:text-slate-400 outline-none transition-colors
                      focus:ring-2 focus:ring-[#4f9748]/30 focus:border-[#4f9748]
                      ${passwordInvalid ? "border-red-400" : "border-slate-200"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-[#4f9748] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && <p className="text-[13px] text-red-500">{error}</p>}

              <button
                onClick={handleLogin}
                disabled={loading}
                className={`w-full py-3 rounded-xl text-white text-[15px] font-semibold shadow-sm transition-all
                  ${loading ? "bg-slate-300 cursor-not-allowed" : "bg-[#4f9748] hover:bg-[#437d3d] active:scale-[0.99]"}`}
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <p className="text-center text-sm text-slate-500 pt-2">
                Don&apos;t have an account?{" "}
                <NavLink to="/auth/sign-up" className="font-medium text-[#4f9748] hover:underline">
                  Sign Up
                </NavLink>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}