import { useState, useRef } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyEmail } from "../../authService";
import type { VerifyEmailPayload } from "../../types/auth";
import Swal from "sweetalert2";
import Banner from '../../../public/assets/image/banner.png'

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

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

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
    const otpCode =  (otpArray ?? otp).join("").trim();;
    console.log(otpCode)
    if (otpCode.length < OTP_LENGTH) return setError("Please enter complete OTP");

    setLoading(true);
    setError(null);
    setMessage(null);

    const payload: VerifyEmailPayload = { email, otp: otpCode };

    try {
      const res = await verifyEmail(payload);

          // ✅ check API response using `msg`
    if (!res.msg || res.msg.toLowerCase().includes("fail")) {
        setError(res.msg ?? "Verification failed");
        Swal.fire({
            icon: "error",
            title: "Verification Failed",
            text: res.msg ?? "Verification failed",
            confirmButtonColor: "#d33",
          });
        return;
      }
      
      setMessage(res.msg); // e.g., "Verify Success"
      Swal.fire({
        icon: "success",
        title: "Verification succuessful!",
        text: res.msg,
        confirmButtonColor: "#3085d6",
      });
      navigate("/login", { state: { email } });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
        <section className="overflow-hidden flex ">
        <div className="w-[30%] p-8 md:p-12 lg:px-16 lg:py-24">
            <div className="max-w-md mx-auto text-center bg-white px-4 sm:px-8 py-10 rounded-xl shadow">
          <header className="mb-8">
            <h1 className="text-2xl font-bold mb-1 text-[#4F9748]">Email Verification</h1>
            <p className="text-[15px] text-slate-500">
              Enter the {OTP_LENGTH}-digit verification code sent to your email.
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
                  className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 bg-slate-100 border border-transparent hover:border-slate-200 rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
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
              className="font-medium text-[#4F9748] hover:text-[#4F9748]"
              onClick={() => alert("Resend OTP functionality")}
            >
              Resend
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
  );
};

export default VerifyEmail;
