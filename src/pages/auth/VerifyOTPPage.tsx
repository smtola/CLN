"use client";

import { useState, useRef, type FormEvent, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { resendOTP, verifyOTP } from "../../authService";
import Banner from '../../../public/assets/image/banner.png'

const OTP_LENGTH = 6;

export default function VerifyOTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { username?: string };

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); 
  const username = state?.username ?? "";

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };
    // Update single OTP digit
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move focus to next
      if (value && index < OTP_LENGTH - 1) {
        inputsRef.current[index + 1]?.focus();
      }

      // Auto-submit if last digit filled
      if (newOtp.every((d) => d !== "")) {
        handleSubmit(undefined, newOtp);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        // Move back and clear previous input
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").slice(0, OTP_LENGTH);
    if (/^\d+$/.test(text)) {
      const digits = text.split("");
      const newOtp = Array(OTP_LENGTH).fill("");
      digits.forEach((d, i) => (newOtp[i] = d));
      setOtp(newOtp);
      const nextIndex = digits.length >= OTP_LENGTH ? OTP_LENGTH - 1 : digits.length;
      inputsRef.current[nextIndex]?.focus();

      if (digits.length === OTP_LENGTH) handleSubmit(undefined, newOtp);
    }
  };

  // Submit OTP
  const handleSubmit = async (e?: FormEvent, otpArray?: string[]) => {
    e?.preventDefault();
    const otpCode = (otpArray ?? otp).join("").trim();
  
    if (otpCode.length < OTP_LENGTH) {
      Swal.fire("Warning", "Please enter complete OTP", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOTP({ username, otp: otpCode });
      
      // Check if it's an error response
      if (!res.status) {
        Swal.fire("Error", res.msg, "error");
        return;
      }
      
      if (!res.access_token) {
        Swal.fire("Error", res.msg ?? "OTP verification failed", "error");
        return;
      }

      Swal.fire({ icon: "success", title: "Verified", timer: 1500, showConfirmButton: false });
      navigate("/");
    } catch (err: unknown) {
      Swal.fire("Error", err instanceof Error ? err.message : "Unknown error", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!username) return;
  
    setResending(true);
    try {
      const res = await resendOTP(username);
      if(!res.status){
        Swal.fire("error", res.msg ?? "OTP resent", "error");
      }
      Swal.fire("Success", res.msg ?? "OTP resent", "success");
      setOtp(Array(OTP_LENGTH).fill("")); // clear old OTP input
      inputsRef.current[0]?.focus();
    } catch (err: unknown) {
      Swal.fire("Error", err instanceof Error ? err.message : "Unknown error", "error");
    } finally {
      setResending(false);
    }
  };

  return (
    <section className="overflow-hidden flex flex-col md:flex-row w-full max-w-[400px] md:max-w-screen-2xl shadow-[rgba(9,_30,_66,_0.25)_0px_4px_8px_-2px,_rgba(9,_30,_66,_0.08)_0px_0px_0px_1px] mx-auto mt-[2rem] rounded-[20px]">
    <div className="w-full md:w-[50%]">
    <img
      alt=""
      src={Banner}
      className="h-56 w-full object-cover sm:h-full"
    />
    </div>
    <div className="w-full md:w-[50%] md:p-12 lg:px-16 lg:py-24">
      <div className="max-w-md mx-auto text-center px-6 py-10 rounded-xl">
        <h1 className="text-2xl font-bold mb-2 text-[#4f9748]">Two-Factor Verification</h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter the {OTP_LENGTH}-digit OTP sent to your username.
        </p>
        <p className="text-[15px] text-slate-500">
          {timeLeft > 0 ? (
            <>This code will expire in <span className="font-semibold">{formatTime(timeLeft)}</span>.</>
          ) : (
            <>⏳ This code has expired.</>
          )}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-3">
            {otp.map((value, index) => (
              <input
                key={index}
                ref={(el) => void (inputsRef.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={1}
                value={value}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className="w-12 h-12 md:w-14 md:h-14 text-center text-2xl font-extrabold text-slate-900 bg-slate-100 border rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-[#4f9748] text-white font-semibold hover:bg-indigo-700 disabled:bg-gray-400 transition"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
          <div className="text-sm text-slate-500 mt-4">
                Didn't receive code?{" "}
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="font-medium text-[#4F9748] hover:text-[#4F9748]"
                >
                  {resending ? "Resending..." : "Resend"}
                </button>
          </div>
        </form>
      </div>
    </div>
  </section>
  );
}
