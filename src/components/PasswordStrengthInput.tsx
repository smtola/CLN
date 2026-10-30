"use client";

import { useMemo, useState } from "react";

/**
 * Premium password input:
 *  - single input with a show/hide eye toggle
 *  - animated strength meter (Weak / Fair / Good / Strong)
 *  - five requirement pills that light up as each rule is met
 *
 * Drop-in replacement for the long green/red checklist currently used on
 * the Sign Up page. Rules mirror the existing `validatePassword` logic in
 * SignupPage.tsx: length 8-32, upper, lower, number, special char, and
 * (optionally) "must not contain name/userId/email".
 */

export interface PasswordStrengthInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Values that the password must NOT contain (first name, user ID, email, etc). */
  disallowedValues?: string[];
  /** Shown under the label, e.g. "Password" / "New Password". */
  label?: string;
  required?: boolean;
  error?: string;
  id?: string;
  autoComplete?: string;
}

type Rule = {
  key: string;
  label: string;
  test: (pwd: string, disallowed: string[]) => boolean;
};

const RULES: Rule[] = [
  { key: "length", label: "8 Chars", test: (pwd) => pwd.length >= 8 && pwd.length <= 32 },
  { key: "upper", label: "A-Z", test: (pwd) => /[A-Z]/.test(pwd) },
  { key: "lower", label: "a-z", test: (pwd) => /[a-z]/.test(pwd) },
  { key: "number", label: "123", test: (pwd) => /[0-9]/.test(pwd) },
  { key: "special", label: "@#$", test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
];

function getDisallowedOk(pwd: string, disallowed: string[]) {
  const lower = pwd.toLowerCase();
  return disallowed
    .filter(Boolean)
    .every((v) => !lower.includes(v.toLowerCase()));
}

function useStrength(pwd: string, disallowed: string[]) {
  return useMemo(() => {
    const passed = RULES.filter((r) => r.test(pwd, disallowed)).length;
    const disallowedOk = getDisallowedOk(pwd, disallowed);
    const score = pwd.length === 0 ? 0 : passed + (disallowedOk ? 1 : 0);
    const max = RULES.length + 1;

    let label = "Weak";
    let color = "#ee3a23"; // red
    if (pwd.length === 0) {
      label = "Weak";
      color = "#cbd5e1"; // slate-300, neutral/empty state
    } else if (score <= 2) {
      label = "Weak";
      color = "#ee3a23";
    } else if (score <= 4) {
      label = "Fair";
      color = "#f59e0b"; // amber
    } else if (score === 5) {
      label = "Good";
      color = "#4fb748";
    } else {
      label = "Strong";
      color = "#4f9748";
    }

    return { passed, disallowedOk, score, max, label, color };
  }, [pwd, disallowed]);
}

export default function PasswordStrengthInput({
  value,
  onChange,
  placeholder = "Password",
  disallowedValues = [],
  label,
  required = false,
  error,
  id = "password",
  autoComplete = "new-password",
}: PasswordStrengthInputProps) {
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState(false);
  const {disallowedOk, score, max, label: strengthLabel, color } = useStrength(
    value,
    disallowedValues
  );

  const fillPct = value.length === 0 ? 0 : Math.round((score / max) * 100);

  return (
    <div className="w-full">
      {label && (
        <div className="flex flex-row gap-1 mb-2">
          <label htmlFor={id} className="text-sm text-gray-700">
            {label}
          </label>
          {required && <span className="text-red-600">*</span>}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
        {/* Input row */}
        <div className="relative">
          <input
            id={id}
            name={id}
            type={show ? "text" : "password"}
            value={value}
            placeholder={placeholder}
            autoComplete={autoComplete}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => setTouched(true)}
            className={`w-full rounded-xl border bg-slate-50 px-4 py-3 pr-11 text-base text-slate-900
              outline-none transition-colors placeholder:text-slate-400
              focus:ring-2 focus:ring-[#4f9748]/30 focus:border-[#4f9748]
              ${touched && error ? "border-red-400" : "border-slate-200"}`}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#4f9748] transition-colors"
          >
            {show ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" /><path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87" /><path d="M3 3l18 18" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" /></svg>
            )}
          </button>
        </div>

        {/* Strength row */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-slate-500">Password Strength</span>
          <span className="font-semibold" style={{ color }}>
            {strengthLabel}
          </span>
        </div>

        <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${fillPct}%`, backgroundColor: color }}
          />
        </div>

        {/* Requirement pills */}
        <div className="mt-3 flex flex-wrap gap-2">
          {RULES.map((rule) => {
            const ok = rule.test(value, disallowedValues);
            return (
              <span
                key={rule.key}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors
                  ${ok ? "bg-[#4f9748]/10 text-[#4f9748]" : "bg-slate-100 text-slate-400"}`}
              >
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full ${ok ? "bg-[#4f9748]" : "bg-slate-300"}`}
                />
                {rule.label}
              </span>
            );
          })}
          {disallowedValues.filter(Boolean).length > 0 && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors
                ${disallowedOk ? "bg-[#4f9748]/10 text-[#4f9748]" : "bg-slate-100 text-slate-400"}`}
            >
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${disallowedOk ? "bg-[#4f9748]" : "bg-slate-300"}`}
              />
              No name/ID/email
            </span>
          )}
        </div>
      </div>

      {touched && error && (
        <p className="mt-1.5 text-[11px] font-light text-red-600">{error}</p>
      )}
    </div>
  );
}