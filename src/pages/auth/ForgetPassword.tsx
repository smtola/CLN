"use client";

import { useState } from "react";
import { NavLink } from "react-router-dom";
import Swal from "sweetalert2";
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
        Swal.fire({
          icon: "success",
          title: res.message || "Password reset link sent!",
          text: "Check your email for instructions.",
          timer: 2500,
          showConfirmButton: false,
        });
        setBusinessEmail(""); // clear input
      } else {
        setError(res.message || "Something went wrong.");
      }
    } catch (err: unknown) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err instanceof Error ? err.message : "Unknown error occurred",
      });
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
            Forgot Password
          </h1>

          <div className="space-y-4">
            {/* Email Input */}
            <input
              type="email"
              placeholder="Enter your email"
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-gray-200 text-black ${
                error?.includes("Email") ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
              }`}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Submit Button */}
            <button
              onClick={handleForgot}
              disabled={loading}
              className={`w-full py-2 rounded-lg text-white font-semibold transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#4F9848]/80 hover:bg-[#4F9848]"
              }`}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <span className="text-sm text-gray-600">
              Remember your password?{" "}
              <NavLink to="/auth/login" className="text-blue-600 hover:underline">
                Login
              </NavLink>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
