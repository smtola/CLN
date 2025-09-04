"use client";

import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { login } from "../../authService";
import { getPublicIp } from "../../utils/getIp";
import Banner from "../../../public/assets/image/banner.png";
import { Eye, EyeOff } from "lucide-react"; // 👀 for show/hide toggle

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { username?: string };
  const [username, setUsername] = useState(state?.username ?? "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const validateForm = () => {
    if (!username.trim() && !password) {
      setError("Username and Password are required");
      return false;
    }
    if (!username.trim()) {
      setError("Username is required");
      return false;
    }
    if (!password) {
      setError("Password is required");
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
      const res = await login({ username, password, local_ip: ip });
      if (res.requiresOtp) {
        navigate("/auth/verify-otp", { state: { username } });
        Swal.fire({
          icon: "success",
          title: res.msg,
          timer: 1500,
          showConfirmButton: false,
        });
      } else if (res.access_token && res.refresh_token) {
        Swal.fire({
          icon: "success",
          title: "Login Successful",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate("/");
      }
      setError(res.msg!)
    } catch (err: unknown) {
      Swal.fire(
        "Error",
        err instanceof Error ? err.message : "Unknown error occurred",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="overflow-hidden flex flex-col md:flex-row w-full max-w-[400px] md:max-w-screen-2xl shadow-[rgba(9,_30,_66,_0.25)_0px_4px_8px_-2px,_rgba(9,_30,_66,_0.08)_0px_0px_0px_1px] mx-auto mt-[2rem] rounded-[20px]">
      <div className="w-full md:w-[50%]">
        <img
          alt="Banner"
          src={Banner}
          className="h-56 w-full object-cover sm:h-full"
        />
      </div>
      <div className="w-full md:w-[50%]  md:p-12 lg:px-16 lg:py-24">
        <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl">
          <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

          <div className="space-y-4">
            {/* Username */}
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                error?.includes("Username") || error?.includes("Username and")
                  ? "border-red-500 focus:ring-red-500"
                  : "focus:ring-blue-500"
              }`}
            />

            {/* Password with toggle */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  error?.includes("Password") || error?.includes("Username and")
                    ? "border-red-500 focus:ring-red-500"
                    : "focus:ring-blue-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}
            {/* Login button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className={`w-full py-2 rounded-lg text-white font-semibold transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#4F9848]/80 hover:bg-[#4F9848]"
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
            <span className="text-sm text-gray-600">
              Don’t have an account?{" "}
              <NavLink to="/auth/sign-up" className="text-blue-600 hover:underline">
                Sign Up
              </NavLink>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
