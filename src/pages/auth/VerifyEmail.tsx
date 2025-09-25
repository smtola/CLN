import { useState, useRef, useEffect } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { resendOTP, verifyEmail } from "../../authService";
import type { VerifyEmailPayload } from "../../types/auth";
import Swal from "sweetalert2";
import Banner from '/assets/image/banner.png'

const OTP_LENGTH = 6;

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { email?: string };
  const [email, setEmail] = useState(state?.email ?? "");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); 
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

  const handleSubmit = async (e?: FormEvent, otpArray?: string[]) => {
    e?.preventDefault();
    const otpCode =  (otpArray ?? otp).join("").trim();
    if (otpCode.length < OTP_LENGTH) return setError("Please enter complete OTP");

    setLoading(true);
    setError(null);
    setMessage(null);

    const payload: VerifyEmailPayload = { email, otp: otpCode };

    try {
      const res = await verifyEmail(payload);
      if (!res.status) {
          setError(res.msg ?? "Verification failed");
          Swal.fire({
              icon: "error",
              title: "Verification Failed",
              text: res.msg ?? "Verification failed",
              confirmButtonColor: "#d33",
            });
          return;
      }else{
        setMessage(res.msg!);
        Swal.fire({
          icon: "success",
          title: "Verification succuessful!",
          text: res.msg,
          confirmButtonColor: "#3085d6",
        });
        navigate("/auth/login", { state: {username: res.user?.username}  });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
  
    setResending(true);
    try {
      const res = await resendOTP(email);

      if(res.status){
        Swal.fire("Success", res.msg ?? "OTP resent", "success");
        setOtp(Array(OTP_LENGTH).fill("")); // clear old OTP input
        inputsRef.current[0]?.focus();
      }
      Swal.fire("Error", res.msg ?? "OTP Faild", "error");
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
        <div className="w-full md:w-[50%]  md:p-12 lg:px-16 lg:py-24">
            <div className="max-w-md mx-auto text-center bg-white px-4 sm:px-8 py-10">
              <header className="mb-8">
                <h1 className="text-2xl font-bold mb-1 text-[#4F9748]">Email Verification</h1>
                <p className="text-[15px] text-slate-500">
                  Enter the {OTP_LENGTH}-digit verification code sent to your email.
                </p>
                <p className="text-[15px] text-slate-500">
                  {timeLeft > 0 ? (
                    <>This code will expire in <span className="font-semibold">{formatTime(timeLeft)}</span>.</>
                  ) : (
                    <>⏳ This code has expired.</>
                  )}
                </p>
              </header>

              {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
              {message && <p className="mb-4 text-sm text-green-600">{message}</p>}

              <form onSubmit={handleSubmit} id="otp-form" className="space-y-6">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="hidden"
                />

                <div className="flex items-center justify-center gap-3">
                  {otp.map((value, index) => (
                    <input
                      key={index}
                      ref={el => void (inputsRef.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      maxLength={1}
                      value={value}
                      onChange={(e) => handleChange(e, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onPaste={handlePaste}
                      className="w-12 h-12 md:w-14 md:h-14 text-center text-2xl font-extrabold text-slate-900 bg-slate-100 border border-transparent hover:border-slate-200 rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex justify-center whitespace-nowrap rounded-lg bg-[#4F9748] px-3.5 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-950/10 hover:bg-[#4F9748] focus:outline-none focus:ring focus:ring-indigo-300 transition-colors duration-150 disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify Account"}
                </button>
              </form>

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
            </div>
        </div>
      </section>
  );
};

export default VerifyEmail;
