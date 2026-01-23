"use client";

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { resetPassword } from "../../authService"; // <-- create this in authService
import { Eye, EyeOff } from "lucide-react";
const Banner = "/assets/image/banner.png";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      Swal.fire("Error", "Invalid or missing token", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(token, newPassword, confirmPassword);
      if (res.status) {
        Swal.fire({
          icon: "success",
          title: res.message || "Password reset successful",
          timer: 2000,
          showConfirmButton: false,
        });
        navigate("/auth/login"); // Redirect to login after reset
      } else {
        Swal.fire("Error", res.message || "Failed to reset password", "error");
      }
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
    <section className="overflow-hidden flex flex-col md:flex-row w-full max-w-[400px] md:max-w-screen-md xl:max-w-screen-xl shadow-lg mx-auto my-[2rem] rounded-[20px]">
      <div className="w-full md:w-[50%]">
        <img
          alt="Banner"
          src={Banner}
          className="h-56 w-full object-cover sm:h-full"
        />
      </div>
      <div className="w-full md:w-[50%] md:p-4 lg:px-14 lg:py-24">
        <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl">
          <h1 className="text-2xl font-bold text-center mb-6 text-[#4f9748]">
            Reset Password
          </h1>

          <div className="space-y-4">
            {/* New Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-gray-200 text-black ${
                  error?.includes("Password") ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
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

            {/* Confirm Password */}
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-gray-200 text-black ${
                error?.includes("Password") ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
              }`}
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Submit Button */}
            <button
              onClick={handleReset}
              disabled={loading}
              className={`w-full py-2 rounded-lg text-white font-semibold transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#4F9848]/80 hover:bg-[#4F9848]"
              }`}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
