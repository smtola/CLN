"use client";

import { useState, useRef, type FormEvent, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { showSuccess, showError, showWarning } from "../../utils/swalHelper";
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
      showError("Error", `You have exceeded the maximum OTP attempts. Try again later!`);
      return;
    }

    const otpCode = (otpArray ?? otp).join("");
    if (otpCode.length < OTP_LENGTH) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      showWarning("Warning", "Please enter complete OTP");
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

        showError("Error", errorMessage);
        return;
      }

      showSuccess("Verified", undefined, 1500);
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
      showError("Error", err instanceof Error ? err.message : "Unknown error");
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
        showError("Error", res.msg ?? "Resend failed");
        return;
      }

      showSuccess(res.msg ?? "OTP resent");
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
    <section className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="overflow-hidden flex flex-col lg:flex-row w-full max-w-[440px] lg:max-w-screen-xl rounded-[28px] bg-white shadow-[0_1px_2px_rgba(9,30,66,0.08),0_24px_48px_-24px_rgba(9,30,66,0.25)] mx-auto">
        <div className="lg:w-1/2 relative min-h-[220px] lg:min-h-0 overflow-hidden">
          <img src={Banner} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#173318]/60 via-transparent to-transparent" />
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#4f9748]/30 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />

          <div className="relative z-10 flex h-full flex-col justify-between p-6 lg:p-10 text-white">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 text-[13px] font-bold tracking-tight">
                CLN
              </span>
              <span className="text-sm font-medium text-white/80">CLN (Cambodia) Co., Ltd.</span>
            </div>

            <div className="mt-8 lg:mt-0">
              <h2 className="text-[26px] lg:text-[30px] font-bold tracking-tight leading-[1.15]">
                One more step
              </h2>
              <p className="mt-2.5 text-[14px] text-white/75 max-w-xs">
                A quick code keeps your business account secure.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:w-1/2 flex items-center">
          <div className="w-full max-w-md mx-auto px-6 py-10 sm:px-10 sm:py-14 text-center">
            <div className="mb-2 flex justify-center">
              <div className="h-14 w-14 rounded-2xl bg-[#4f9748]/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4f9748" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            </div>

            <h1 className="text-[26px] font-bold text-[#4f9748] tracking-tight mb-1.5">Two-Factor Verification</h1>
            <p className="text-sm text-slate-500 mb-5">Enter the {OTP_LENGTH}-digit code sent to your email</p>

            {!cooldownActive && (
              <p className="text-sm text-slate-500 mb-4">
                {otpTimeLeft > 0 ? (
                  <>Code expires in <span className="font-semibold text-slate-700">{formatTime(otpTimeLeft)}</span></>
                ) : (
                  <>⏳ Code expired</>
                )}
              </p>
            )}

            {cooldownActive && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-3 py-2.5 text-sm text-red-600">
                You&apos;ve exceeded the maximum OTP attempts. Wait{" "}
                <span className="font-semibold">
                  {formatTime(Math.floor((attemptCooldownEnd - Date.now()) / 1000))}
                </span>{" "}
                to try again.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className={`flex justify-center gap-2.5 ${shake ? "animate-shake" : ""}`}>
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
                    className={`w-11 h-12 md:w-13 md:h-14 text-center text-xl font-semibold rounded-xl border outline-none transition-colors
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${shake ? "border-red-400 ring-2 ring-red-100 bg-red-50" : "border-slate-200 bg-slate-50"}
                      focus:ring-2 focus:ring-[#4f9748]/30 focus:border-[#4f9748]`}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={!isOtpComplete || loading || cooldownActive}
                className="w-full py-3 rounded-xl text-white text-[15px] font-semibold shadow-sm transition-all
                  bg-[#4f9748] hover:bg-[#437d3d] active:scale-[0.99] disabled:bg-slate-300 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <p className="text-sm text-slate-500">
                Didn&apos;t receive code?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="font-semibold text-[#4f9748] hover:underline disabled:text-slate-400"
                >
                  {resending ? "Resending..." : "Resend"}
                </button>
              </p>
            </form>
          </div>
        </div>
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