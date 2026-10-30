import { Building2, Check, Eye, EyeOff, ShieldCheck, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { changePassword, checkPassword, fetchProfile } from "../../authService";
import type { Profile } from "../../types/auth";
import { showError, showSuccess } from "../../admin/utils/swalHelper";
// Adjust this path to wherever PasswordStrengthInput.tsx actually lives in your project
import PasswordStrengthInput from "../PasswordStrengthInput";

interface ShowPassword {
  current: boolean;
  new: boolean;
  confirm: boolean;
}

/** Simple slate-styled password field (no strength meter) — used for Current/Confirm */
function SimplePasswordField({
  id,
  label,
  value,
  onChange,
  error,
  show,
  onToggleShow,
  matchOk,
  matchLabel = "Passwords match",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  show: boolean;
  onToggleShow: () => void;
  /** Optional: show a green check when the value is non-empty and valid (e.g. passwords match, password verified) */
  matchOk?: boolean;
  /** Accessible label for the check icon; defaults to "Passwords match" */
  matchLabel?: string;
}) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="mb-2 block text-sm text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          placeholder={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-xl border bg-slate-50 px-4 py-3 pr-16 text-base text-slate-900
            outline-none transition-colors placeholder:text-slate-400
            focus:border-[#4f9748] focus:ring-2 focus:ring-[#4f9748]/30
            ${error ? "border-red-400" : "border-slate-200"}`}
        />
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
          {matchOk && (
            <Check className="h-4 w-4 text-[#4f9748]" aria-label={matchLabel} />
          )}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleShow();
            }}
            aria-label={show ? "Hide password" : "Show password"}
            className="text-slate-400 transition-transform transition-colors duration-150 hover:text-[#4f9748] active:scale-90"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      {error && <p className="mt-1.5 text-[11px] font-light text-red-600">{error}</p>}
    </div>
  );
}

const defaultData = {
  uai: {
    current_password: "",
    new_password: "",
    confirm_password: "",
  },
};

/** Small presentational helper — keeps the label/value pairing consistent everywhere */
function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <h1 className="text-md font-semibold text-gray-400">{label}</h1>
      <p className="text-md font-light text-gray-900">{value || "—"}</p>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
      <span className="text-gray-400">{icon}</span>
      <h2 className="text-sm font-semibold text-gray-500">{title}</h2>
    </div>
  );
}

const Profiles = () => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [showPassword, setShowPassword] = useState<ShowPassword>({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordValid, setPasswordValid] = useState<boolean | null>(null);
  const [formData, setFormData] = useState(defaultData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [users, setUsers] = useState<Profile>();

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetchProfile();
      setUsers(res.data);
    };
    fetchUser();
  }, []);

  /* ---------------- PASSWORD VALIDATION ---------------- */
  const validatePassword = (pwd: string) => {
    if (!pwd) return "Password is required.";
    if (pwd.length < 8 || pwd.length > 32)
      return "Password must be 8-32 characters.";
    if (!/[A-Z]/.test(pwd)) return "Password must contain an uppercase letter.";
    if (!/[a-z]/.test(pwd)) return "Password must contain a lowercase letter.";
    if (!/[0-9]/.test(pwd)) return "Password must contain a number.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd))
      return "Password must contain a special character.";
    return null;
  };

  const validation = () => {
    const newErrors: Record<string, string> = {};
    const pwdError = validatePassword(formData.uai.new_password);
    if (pwdError) newErrors.new_password = pwdError;

    if (!formData.uai.confirm_password)
      newErrors.confirm_password = "Please confirm your password.";
    else if (formData.uai.new_password !== formData.uai.confirm_password)
      newErrors.confirm_password = "Passwords do not match.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- HANDLE SUBMIT ---------------- */
  const handleSubmit = async () => {
    // Reset current password error
    setErrors((prev) => ({ ...prev, current_password: "" }));
    setPasswordValid(null);

    setLoading(true);
    try {
      const checkResult = await checkPassword(formData.uai.current_password);

      if ("valid" in checkResult && checkResult.valid) {
        if (!validation()) return;
        setPasswordValid(true);

        const changeResult = await changePassword(
          formData.uai.current_password,
          formData.uai.new_password,
          formData.uai.confirm_password
        );

        if (changeResult.status) {
          showSuccess("Password changed successfully!");
          setFormData(defaultData);
        } else {
          showError(changeResult.msg || "Failed to change password");
        }
      } else {
        setPasswordValid(false);
        setErrors((prev) => ({
          ...prev,
          current_password: "Current password is incorrect",
        }));
      }
    } catch (err) {
      console.error(err);
      setPasswordValid(false);
      setErrors((prev) => ({
        ...prev,
        current_password: "Something went wrong. Please try again",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        className="flex w-full items-center gap-2.5 rounded-lg px-4 py-2 text-left text-sm font-medium text-blue-700 transition-colors duration-150 hover:bg-blue-100"
        onClick={() => modalRef.current?.showModal()}
      >
        <User className="h-4 w-4" />
        Profile
      </button>

      <style>{`
        dialog.profile-modal[open] {
          animation: profileModalIn 0.18s ease-out;
        }
        dialog.profile-modal[open]::backdrop {
          animation: profileBackdropIn 0.18s ease-out;
        }
        @keyframes profileModalIn {
          from { opacity: 0; transform: scale(0.97) translateY(6px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes profileBackdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <dialog
        ref={modalRef}
        className="modal profile-modal rounded backdrop:bg-black/40 backdrop:backdrop-blur-sm"
      >
        <div className="modal-box w-11/12 max-w-5xl rounded-2xl p-0">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                User &amp; Account Information
              </h3>
              <p className="text-sm text-gray-400">
                Review your details and manage your password
              </p>
            </div>
            <form method="dialog">
              <button
                aria-label="Close"
                className="rounded-full p-1.5 text-gray-400 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </form>
          </div>

          {/* Body */}
          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
            {/* User & Account Information */}
            <div className="rounded-xl border border-gray-100 p-4 shadow-[rgba(9,_30,_66,_0.25)_0px_4px_8px_-2px,_rgba(9,_30,_66,_0.08)_0px_0px_0px_1px]">
              <SectionHeader icon={<User className="h-4 w-4" />} title="Personal Details" />
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="First Name" value={users?.uai.firstName} />
                  <Field label="Last Name" value={users?.uai.lastName} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Job Title" value={users?.uai.jobTitle} />
                  <Field label="Phone Number" value={users?.uai.phoneNumber} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Business Email" value={users?.uai.businessEmail} />
                  <Field label="User ID" value={users?.uai.userId} />
                </div>
              </div>
            </div>

            {/* Security / Password */}
            <div className="rounded-xl border border-gray-100 p-4 shadow-[rgba(9,_30,_66,_0.25)_0px_4px_8px_-2px,_rgba(9,_30,_66,_0.08)_0px_0px_0px_1px]">
              <SectionHeader icon={<ShieldCheck className="h-4 w-4" />} title="Security" />
              <form className="space-y-4">
                <SimplePasswordField
                  id="current_password"
                  label="Current Password"
                  value={formData.uai.current_password}
                  onChange={(v) =>
                    setFormData({
                      ...formData,
                      uai: { ...formData.uai, current_password: v },
                    })
                  }
                  error={errors.current_password}
                  show={showPassword.current}
                  onToggleShow={() =>
                    setShowPassword((prev) => ({ ...prev, current: !prev.current }))
                  }
                  matchOk={passwordValid === true}
                  matchLabel="Password verified"
                />

                <PasswordStrengthInput
                  id="new_password"
                  label="New Password"
                  value={formData.uai.new_password}
                  onChange={(v) =>
                    setFormData({
                      ...formData,
                      uai: { ...formData.uai, new_password: v },
                    })
                  }
                  error={errors.new_password}
                  disallowedValues={[
                    users?.uai.firstName,
                    users?.uai.lastName,
                    users?.uai.userId,
                    users?.uai.businessEmail,
                  ]
                    .filter(Boolean)
                    .map((v) => String(v))}
                />

                <SimplePasswordField
                  id="confirm_password"
                  label="Confirm Password"
                  value={formData.uai.confirm_password}
                  onChange={(v) =>
                    setFormData({
                      ...formData,
                      uai: { ...formData.uai, confirm_password: v },
                    })
                  }
                  error={errors.confirm_password}
                  show={showPassword.confirm}
                  onToggleShow={() =>
                    setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))
                  }
                  matchOk={
                    formData.uai.confirm_password.length > 0 &&
                    formData.uai.confirm_password === formData.uai.new_password
                  }
                />

                {/* ---------------- Submit Button ---------------- */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubmit();
                  }}
                  disabled={loading}
                  className={`my-2 w-full rounded-xl py-2.5 font-semibold text-white transition-colors duration-150 ${
                    loading
                      ? "cursor-not-allowed bg-gray-400"
                      : "bg-[#4F9848]/80 hover:bg-[#4F9848]"
                  }`}
                >
                  {loading ? "Processing..." : "Change"}
                </button>
              </form>
            </div>

            {/* Company Information */}
            <div className="rounded-xl border border-gray-100 p-4 shadow-[rgba(9,_30,_66,_0.25)_0px_4px_8px_-2px,_rgba(9,_30,_66,_0.08)_0px_0px_0px_1px] md:col-span-2">
              <SectionHeader icon={<Building2 className="h-4 w-4" />} title="Company Information" />
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Company Name" value={users?.ci.companyName} />
                  <Field label="Local Language" value={users?.ci.localLang} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Trade Name" value={users?.ci.tradeName} />
                  <Field label="Shipping Party Type" value={users?.ci.SPT} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Company Business Type" value={users?.ci.CBT} />
                  <Field label="Address" value={users?.ci.address} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="City" value={users?.ci.city} />
                  <Field label="Country" value={users?.ci.country} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Zip Code" value={users?.ci.zipCode} />
                  <Field label="Department" value={users?.ci.department} />
                </div>
                <div>
                  <Field label="Trade" value={users?.ci.trade} />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-action border-t border-gray-100 px-6 py-3">
            <form method="dialog">
              <button className="btn btn-sm rounded">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default Profiles;