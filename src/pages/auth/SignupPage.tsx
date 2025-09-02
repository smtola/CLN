"use client";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hook/useAuth"; // ✅ your auth hook
import type { SignupPayload } from "../../types/auth";
import Banner from '../../../public/assets/image/banner.png'

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Regex patterns
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Inline validations
  const usernameError = username && (username.includes(" ") ? "Username cannot contain spaces" : "");
  const emailError = email && (!emailRegex.test(email) ? "Invalid email address" : "");
  const passwordError = password && (!strongPasswordRegex.test(password)
    ? "Password must be 8+ chars, with uppercase, lowercase, number & special char"
    : "");

  const passwordStrength = useMemo(() => {
    if (!password) return "";
    if (strongPasswordRegex.test(password)) return "Strong";
    if (password.length >= 6) return "Medium";
    return "Weak";
  }, [password]);

  const handleSignup = async () => {
    setError(null);

    if (!username || username.includes(" ")) return;
    if (!emailRegex.test(email)) return;
    if (!strongPasswordRegex.test(password)) return;

    setLoading(true);

    const payload: SignupPayload = { username, email, password };

    try {
      const res = await signup(payload);

      if (!res.ok) {
        setError(res.error ?? "Signup failed");
        return;
      }

      navigate("/verify-email", { state: { email } });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
        <section className="overflow-hidden flex ">
        <div className="w-[30%] p-8 md:p-12 lg:px-16 lg:py-24">
          <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
          <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
            Create an Account
          </h1>

          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

          <div className="space-y-4">
            {/* Username */}
            <div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  usernameError ? "border-red-500 focus:ring-red-400" : "focus:ring-blue-500"
                }`}
              />
              {usernameError && <p className="text-xs text-red-500 mt-1">{usernameError}</p>}
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  emailError ? "border-red-500 focus:ring-red-400" : "focus:ring-blue-500"
                }`}
              />
              {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  passwordError ? "border-red-500 focus:ring-red-400" : "focus:ring-blue-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-2 right-2 text-sm text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
              {password && (
                <p
                  className={`text-xs font-medium mt-1 ${
                    passwordStrength === "Strong"
                      ? "text-green-600"
                      : passwordStrength === "Medium"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  Password Strength: {passwordStrength}
                </p>
              )}
            </div>

            {/* Signup Button */}
            <button
              onClick={handleSignup}
              disabled={loading || !!usernameError || !!emailError || !!passwordError}
              className={`w-full py-2 rounded-lg text-white font-semibold transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Username cannot contain spaces.<br/> Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
          </p>
        </div>
        </div>
  
        <div className="w-[70%]">
        <img
          alt=""
          src={Banner}
          className="h-56 w-full object-cover sm:h-full"
        />
        </div>
      </section>
  );
}
