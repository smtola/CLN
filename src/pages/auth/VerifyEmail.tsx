import { useLocation, useNavigate } from "react-router-dom";
import Banner from '/assets/image/banner.png'

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { businessEmail?: string };
  const businessEmail = state?.businessEmail ?? "";

  return (
    <section className="overflow-hidden flex flex-col lg:flex-row w-full lg:max-w-screen-xl xl:shadow-[rgba(9,_30,_66,_0.25)_0px_4px_8px_-2px,_rgba(9,_30,_66,_0.08)_0px_0px_0px_1px] mx-auto my-[2rem] px-5 xl:px-0 xl:rounded-[20px]">
      <div className="w-full lg:w-[50%]">
        <img
          alt=""
          src={Banner}
          className="h-full object-cover object-center"
        />
      </div>
      <div className="w-full lg:w-[50%]">
        <div className="max-w-md mx-auto text-center bg-white px-4 sm:px-8 py-10">
          <div className="mb-6 flex justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="56"
              height="56"
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

          <h1 className="text-xl font-bold mb-2 text-[#4F9748]">Check Your Email</h1>

          <p className="text-[16px] text-gray-600 mb-1">
            We&apos;ve sent an activation link to
          </p>

          {businessEmail && (
            <p className="text-sm font-semibold text-gray-900 mb-4 break-all">
              {businessEmail}
            </p>
          )}

          <p className="text-sm text-gray-500 mb-8">
            Click the link in that email to activate your account. The link expires in 24 hours.
          </p>

          <button
            onClick={() => navigate("/auth/login")}
            className="w-full bg-[#4f9748] text-white py-2.5 rounded-lg font-semibold hover:bg-[#4f9748]/80 transition-all duration-200"
          >
            Go to Login
          </button>

          <p className="text-sm text-slate-500 mt-4">
            Didn&apos;t get an email? Check your spam folder, or{" "}
            <button
              type="button"
              onClick={() => navigate("/auth/sign-up")}
              className="font-medium text-[#4f9748]"
            >
              try signing up again
            </button>
            .
          </p>
        </div>
      </div>
    </section>
  );
};

export default VerifyEmail;