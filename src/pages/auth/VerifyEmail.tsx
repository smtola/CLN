import { useLocation, useNavigate } from "react-router-dom";
import Banner from '/assets/image/banner.png'

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { businessEmail?: string };
  const businessEmail = state?.businessEmail ?? "";

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="overflow-hidden flex flex-col lg:flex-row w-full max-w-[440px] lg:max-w-screen-xl rounded-[28px] bg-white shadow-[0_1px_2px_rgba(9,30,66,0.08),0_24px_48px_-24px_rgba(9,30,66,0.25)] mx-auto">
        <div className="w-full lg:w-[50%] relative min-h-[220px] lg:min-h-0 overflow-hidden">
          <img alt="" src={Banner} className="absolute inset-0 h-full w-full object-cover object-center" />
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
                You're almost in
              </h2>
              <p className="mt-2.5 text-[14px] text-white/75 max-w-xs">
                Confirm your email to activate your business account.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[50%] flex items-center">
          <div className="w-full max-w-md mx-auto text-center px-6 py-10 sm:px-10 sm:py-14">
            <div className="mb-6 flex justify-center">
              <div className="h-14 w-14 rounded-2xl bg-[#4f9748]/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4f9748"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 7l9 6 9-6" />
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                </svg>
              </div>
            </div>

            <h1 className="text-[26px] font-bold mb-1.5 text-[#4f9748] tracking-tight">Check Your Email</h1>

            <p className="text-[15px] text-slate-600 mb-1">
              We&apos;ve sent an activation link to
            </p>

            {businessEmail && (
              <p className="text-sm font-semibold text-slate-900 mb-4 break-all">
                {businessEmail}
              </p>
            )}

            <p className="text-sm text-slate-500 mb-8">
              Click the link in that email to activate your account. The link expires in 24 hours.
            </p>

            <button
              onClick={() => navigate("/auth/login")}
              className="w-full bg-[#4f9748] text-white py-3 rounded-xl font-semibold shadow-sm hover:bg-[#437d3d] active:scale-[0.99] transition-all"
            >
              Go to Login
            </button>

            <p className="text-sm text-slate-500 mt-4">
              Didn&apos;t get an email? Check your spam folder, or{" "}
              <button
                type="button"
                onClick={() => navigate("/auth/sign-up")}
                className="font-semibold text-[#4f9748] hover:underline"
              >
                try signing up again
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VerifyEmail;