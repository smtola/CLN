"use client";

import { useState, useRef, type FormEvent, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { resendOTP, verifyOTP } from "../../authService";
import Banner from "/assets/image/banner.png";

const OTP_LENGTH = 6;
const OTP_EXPIRE_SECONDS = 300; // 5 min OTP

export default function VerifyOTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { businessEmail?: string };
  const businessEmail = state?.businessEmail ?? "";

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [shake, setShake] = useState(false);

  // OTP expiration timer
  const [otpTimeLeft, setOtpTimeLeft] = useState(OTP_EXPIRE_SECONDS);

  // Attempts tracking
  const [attempts, setAttempts] = useState(() => {
    const saved = localStorage.getItem("otpAttempts");
    return saved ? Number(saved) : 0;
  });

  // Attempt cooldown end timestamp (ms)
  const [attemptCooldownEnd, setAttemptCooldownEnd] = useState(() => {
    const saved = localStorage.getItem("otpCooldownEnd");
    return saved ? Number(saved) : 0;
  });

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  /* ---------------- Persist attempts ---------------- */
  useEffect(() => {
    localStorage.setItem("otpAttempts", attempts.toString());
  }, [attempts]);

  useEffect(() => {
    localStorage.setItem("otpCooldownEnd", attemptCooldownEnd.toString());
  }, [attemptCooldownEnd]);

  /* ---------------- Auto-focus first input ---------------- */
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  /* ---------------- OTP expiration countdown ---------------- */
  useEffect(() => {
    const storedEnd = localStorage.getItem("otpEndTime");
    const endTime =
      storedEnd && Number(storedEnd) > Date.now()
        ? Number(storedEnd)
        : Date.now() + OTP_EXPIRE_SECONDS * 1000;

    if (!storedEnd) localStorage.setItem("otpEndTime", endTime.toString());

    const interval = setInterval(() => {
      const secondsLeft = Math.max(Math.floor((endTime - Date.now()) / 1000), 0);
      setOtpTimeLeft(secondsLeft);
      if (secondsLeft <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /* ---------------- Attempt cooldown countdown ---------------- */
  useEffect(() => {
    if (!attemptCooldownEnd) return;

    const interval = setInterval(() => {
      const secondsLeft = Math.max(Math.floor((attemptCooldownEnd - Date.now()) / 1000), 0);
      if (secondsLeft <= 0) {
        clearInterval(interval);
        setAttempts(0);
        setAttemptCooldownEnd(0);
        localStorage.removeItem("otpAttempts");
        localStorage.removeItem("otpCooldownEnd");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [attemptCooldownEnd]);

  /* ---------------- Dynamic cooldown by attempt ---------------- */
  const getCooldownByAttempt = (attempt: number) => {
    if (attempt >= 6) return 60 * 60; // 1h
    if (attempt === 5) return 30 * 60; // 30min
    if (attempt === 4) return 10 * 60; // 10min
    if (attempt === 3) return 5 * 60; // 5min
    return 0;
  };

  /* ---------------- OTP input handlers ---------------- */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();

    if (newOtp.every((d) => d !== "")) handleSubmit(undefined, newOtp);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key !== "Backspace") return;
    const newOtp = [...otp];
    if (newOtp[index]) newOtp[index] = "";
    else if (index > 0) {
      newOtp[index - 1] = "";
      inputsRef.current[index - 1]?.focus();
    }
    setOtp(newOtp);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").slice(0, OTP_LENGTH);
    if (!/^\d+$/.test(text)) return;

    const newOtp = Array(OTP_LENGTH).fill("");
    text.split("").forEach((d, i) => (newOtp[i] = d));
    setOtp(newOtp);
    handleSubmit(undefined, newOtp);
  };

  /* ---------------- Format seconds to MM:SS ---------------- */
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  /* ---------------- Submit OTP ---------------- */
  const handleSubmit = async (e?: FormEvent, otpArray?: string[]) => {
    e?.preventDefault();

    const now = Date.now();
    if (attemptCooldownEnd > now) {
      Swal.fire("Error", `You have exceeded the maximum OTP attempts. Try again later!`, "error");
      return;
    }

    const otpCode = (otpArray ?? otp).join("");
    if (otpCode.length < OTP_LENGTH) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      Swal.fire("Warning", "Please enter complete OTP", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOTP({ businessEmail, otp: otpCode });
      if (!res.status || !res.access_token) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        const cooldownSec = getCooldownByAttempt(newAttempts);
        if (cooldownSec > 0) {
          setAttemptCooldownEnd(Date.now() + cooldownSec * 1000);
        }

        const remainingAttempts = Math.max(3 - newAttempts, 0); // first 3 attempts
        // Priority: show backend message first (e.g., OTP expired)
        let errorMessage = res?.msg;

        // If backend does not send specific message, fallback to attempt logic
        if (!errorMessage) {
          errorMessage =
            remainingAttempts > 0
              ? `Invalid OTP. You have ${remainingAttempts} attempt(s) left.`
              : `You have exceeded the maximum OTP attempts. Wait ${formatTime(cooldownSec)} to try again.`;
        }

        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage,
        });
        return;
      }

      Swal.fire({ icon: "success", title: "Verified", timer: 1500, showConfirmButton: false });
      localStorage.removeItem("otpAttempts");
      localStorage.removeItem("otpCooldownEnd");
      localStorage.removeItem("otpEndTime");

      navigate("/");
    } catch (err: unknown) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      const cooldownSec = getCooldownByAttempt(newAttempts);
      if (cooldownSec > 0) {
        setAttemptCooldownEnd(Date.now() + cooldownSec * 1000);
      }
      Swal.fire("Error", err instanceof Error ? err.message : "Unknown error", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Resend OTP ---------------- */
  const handleResend = async () => {
    if (!businessEmail) return;

    setAttempts(0);
    setAttemptCooldownEnd(0);
    localStorage.removeItem("otpAttempts");
    localStorage.removeItem("otpCooldownEnd");

    setResending(true);
    try {
      const res = await resendOTP(businessEmail);
      if (!res.status) {
        Swal.fire("Error", res.msg ?? "Resend failed", "error");
        return;
      }

      Swal.fire("Success", res.msg ?? "OTP resent", "success");
      setOtp(Array(OTP_LENGTH).fill(""));
      localStorage.setItem("otpEndTime", (Date.now() + OTP_EXPIRE_SECONDS * 1000).toString());
      setOtpTimeLeft(OTP_EXPIRE_SECONDS);
      inputsRef.current[0]?.focus();
    } finally {
      setResending(false);
    }
  };

  const isOtpComplete = otp.every((d) => d !== "");
  const cooldownActive = attemptCooldownEnd > Date.now();

  /* ---------------- UI ---------------- */
  return (
    <section className="overflow-hidden flex flex-col lg:flex-row w-full lg:max-w-screen-xl xl:shadow-[rgba(9,_30,_66,_0.25)_0px_4px_8px_-2px,_rgba(9,_30,_66,_0.08)_0px_0px_0px_1px] mx-auto my-[2rem] px-5 xl:px-0 xl:rounded-[20px]">
      <div className="md:w-1/2">
        <img src={Banner} alt="" className="w-full h-56 md:h-full object-cover" />
      </div>

      <div className="md:w-1/2 p-10 text-center">
        <h1 className="text-2xl font-bold text-[#4f9748] mb-2">Two-Factor Verification</h1>

        <p className="text-sm text-gray-500 mb-4">Enter the {OTP_LENGTH}-digit OTP sent to your email</p>
        {!cooldownActive &&
          <p className="text-sm text-slate-500 mb-2">
            {otpTimeLeft > 0 ? <>Code expires in <b>{formatTime(otpTimeLeft)}</b></> : <>⏳ Code expired</>}
          </p>
        }

        {cooldownActive && (
          <p className="text-sm text-red-500 mb-2">
            You have exceeded the maximum OTP attempts. Wait {formatTime(Math.floor((attemptCooldownEnd - Date.now()) / 1000))} to try again.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className={`flex justify-center gap-3 ${shake ? "animate-shake" : ""}`}>
            {otp.map((value, index) => (
              <input
                key={index}
                ref={(el) => void (inputsRef.current[index] = el)}
                value={value}
                maxLength={1}
                inputMode="numeric"
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                disabled={loading || cooldownActive}
                className={`w-12 h-12 md:w-14 md:h-14 text-center text-2xl font-bold rounded border outline-none
                  ${shake ? "border-red-500 ring-2 ring-red-200 bg-red-50" : "border-slate-300 bg-slate-100"}
                  focus:ring-2 focus:ring-indigo-200`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={!isOtpComplete || loading || cooldownActive}
            className="w-full bg-[#4f9748] text-white py-2.5 rounded-lg font-semibold disabled:bg-gray-400"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <p className="text-sm text-slate-500">
            Didn’t receive code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="font-medium text-[#4f9748] disabled:text-gray-400"
            >
              {resending ? "Resending..." : "Resend"}
            </button>
          </p>
        </form>
      </div>

      {/* Shake animation */}
      <style>
        {`
          @keyframes shake {
            0% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            50% { transform: translateX(5px); }
            75% { transform: translateX(-5px); }
            100% { transform: translateX(0); }
          }
          .animate-shake {
            animation: shake 0.35s;
          }
        `}
      </style>
    </section>
  );
}
