"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { login } from "../../authService";
import { getPublicIp } from "../../utils/getIp";
import Banner from '../../../public/assets/image/banner.png'

export default function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const validateForm = () => {
    if (!username.trim()) {
      Swal.fire("Error", "Username is required", "warning");
      return false;
    }
    if (!password) {
      Swal.fire("Error", "Password is required", "warning");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    const ip = await getPublicIp();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const res = await login({ username, password, local_ip:ip });

      if (!res.msg) {
        Swal.fire("Login Failed", res.msg ?? "Invalid credentials", "error");
        return;
      }

      if (res.requiresOtp) {
        // redirect to OTP page
        navigate("/auth/verify-otp", { state: { username } });
      } else if (res.access_token) {
        Swal.fire({
          icon: "success",
          title: "Login Successful",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate("/dashboard");
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
    <>
    <section className="overflow-hidden flex ">
      <div className="w-[30%] p-8 md:p-12 lg:px-16 lg:py-24">
        <div className="w-full bg-white p-8 rounded-2xl">
          <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleLogin}
              disabled={loading}
              className={`w-full py-2 rounded-lg text-white font-semibold transition ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
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
    </>
  );
}
