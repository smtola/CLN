import React, { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";

// ── Config ──────────────────────────────────────────────────────────
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string; // put in .env
const CONTACT_API_URL = "/api/contact"; // adjust to your actual endpoint
const MIN_SUBMIT_TIME_MS = 2500; // submissions faster than this are treated as bots

// ── Types ───────────────────────────────────────────────────────────
interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

const initialFormData: FormData = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// crude link-spam heuristic: many contact-form bots stuff the message
// with multiple URLs
const LINK_SPAM_REGEX = /(https?:\/\/|www\.)/gi;
const MAX_LINKS_ALLOWED = 1;

const ContactUsForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [honeypot, setHoneypot] = useState(""); // bots fill this, humans never see it
  const [formLoadedAt] = useState(() => Date.now()); // time-trap baseline
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const next: FormErrors = {};

    if (!formData.name.trim()) {
      next.name = "Please enter your name.";
    } else if (formData.name.trim().length < 2) {
      next.name = "Name looks too short.";
    }

    if (!formData.email.trim()) {
      next.email = "Please enter your email.";
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      next.email = "Please enter a valid email address.";
    }

    if (formData.phone && !/^[+\d][\d\s().-]{6,}$/.test(formData.phone.trim())) {
      next.phone = "Please enter a valid phone number.";
    }

    if (!formData.message.trim()) {
      next.message = "Please enter a message.";
    } else if (formData.message.trim().length < 10) {
      next.message = "Message is too short — please add a few more details.";
    } else {
      const linkCount = (formData.message.match(LINK_SPAM_REGEX) || []).length;
      if (linkCount > MAX_LINKS_ALLOWED) {
        next.message = "Please remove links from your message.";
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus("idle");
    setSubmitMessage("");

    // ── Bot trap 1: honeypot ──
    // A real user never sees or fills this field. If it has a value,
    // silently pretend success so bots don't learn to look for a real error.
    if (honeypot) {
      setSubmitStatus("success");
      setSubmitMessage("Thank you! Your message has been sent.");
      return;
    }

    // ── Bot trap 2: submitted too fast ──
    if (Date.now() - formLoadedAt < MIN_SUBMIT_TIME_MS) {
      setSubmitStatus("error");
      setSubmitMessage("Please try again in a moment.");
      return;
    }

    if (!validate()) return;

    // ── Bot trap 3: Turnstile challenge must be solved ──
    if (!captchaToken) {
      setCaptchaError(true);
      setSubmitStatus("error");
      setSubmitMessage("Please complete the verification below.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(CONTACT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          captchaToken, // your backend MUST verify this with Cloudflare before sending mail
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Something went wrong. Please try again.");
      }

      setSubmitStatus("success");
      setSubmitMessage("Thank you! Your message has been sent — we'll be in touch soon.");
      setFormData(initialFormData);
      setCaptchaToken(null);
    } catch (err) {
      setSubmitStatus("error");
      setSubmitMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-white rounded-2xl shadow-[0_12px_40px_-12px_rgba(9,30,66,0.25)] p-6 md:p-10 space-y-5"
    >
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Get in touch</h2>
        <p className="text-slate-500 text-sm mt-1">
          Fill out the form below and our team will get back to you shortly.
        </p>
      </div>

      {/* ── Honeypot field — hidden from real users, catches bots ── */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }} aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          type="text"
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
            Full Name <span className="text-[#EE3A23]">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-800 outline-none transition-colors
              ${errors.name ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-[#4F9848]"}`}
            placeholder="Your name"
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
            Email <span className="text-[#EE3A23]">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-800 outline-none transition-colors
              ${errors.email ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-[#4F9848]"}`}
            placeholder="you@example.com"
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-800 outline-none transition-colors
              ${errors.phone ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-[#4F9848]"}`}
            placeholder="+855 ..."
          />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-[#4F9848] transition-colors"
            placeholder="How can we help?"
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
          Message <span className="text-[#EE3A23]">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={formData.message}
          onChange={handleChange}
          className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-800 outline-none transition-colors resize-none
            ${errors.message ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-[#4F9848]"}`}
          placeholder="Tell us about your shipment or question..."
        />
        {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
      </div>

      {/* ── Turnstile challenge ── */}
      <div>
        <Turnstile
          siteKey={TURNSTILE_SITE_KEY}
          onSuccess={(token) => {
            setCaptchaToken(token);
            setCaptchaError(false);
          }}
          onExpire={() => setCaptchaToken(null)}
          onError={() => setCaptchaToken(null)}
        />
        {captchaError && (
          <p className="text-xs text-red-500 mt-1">Please complete the verification.</p>
        )}
      </div>

      {submitStatus !== "idle" && (
        <div
          className={`text-sm px-4 py-2.5 rounded-xl ${
            submitStatus === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}
        >
          {submitMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full md:w-auto px-8 py-3 rounded-xl bg-[#4F9848] hover:bg-[#437d3d] text-white text-sm font-semibold uppercase tracking-wide transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
};

export default ContactUsForm;