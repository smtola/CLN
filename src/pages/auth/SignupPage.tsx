"use client";

import { useEffect, useRef, useState } from "react";
import type { ExtractedDocumentFields, SignupPayload } from "../../types/auth";
import { getPublicIp } from "../../utils/getIp";
import { extractDocument, signup, uploadDocument } from "../../authService";
import { showError, showSuccess } from "../../utils/swalHelper";
import { useNavigate } from "react-router-dom";
import PasswordStrengthInput from "../../components/PasswordStrengthInput"; // adjust path to match your project

const ALLOWED_DOCUMENT_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const Banner = "/assets/image/banner.png";

// country
const countries = [
  { code: "AF", name: "Afghanistan" },
  { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" },
  { code: "AR", name: "Argentina" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "BD", name: "Bangladesh" },
  { code: "BE", name: "Belgium" },
  { code: "BR", name: "Brazil" },
  { code: "CA", name: "Canada" },
  { code: "CN", name: "China" },
  { code: "DK", name: "Denmark" },
  { code: "EG", name: "Egypt" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "HK", name: "Hong Kong" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "KH", name: "Cambodia" },
  { code: "LA", name: "Laos" },
  { code: "MY", name: "Malaysia" },
  { code: "MM", name: "Myanmar" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "PH", name: "Philippines" },
  { code: "SG", name: "Singapore" },
  { code: "TH", name: "Thailand" },
  { code: "UK", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "VN", name: "Vietnam" },
  { code: "ZA", name: "South Africa" },
];

// department
const departments = [
  { name: "Sales and Marketing" },
  { name: "Procurement" },
  { name: "Logistics & Operations" },
  { name: "Documentation" },
  { name: "Customer Service" },
  { name: "Finance" },
  { name: "IT & eCommerce" },
  { name: "HR & Legal" },
  { name: "Sustainability" },
];

// trade
const trades = [
  { name: "Export" },
  { name: "Import" },
  { name: "Export & Import" },
];

const defaultFormData = {
  uai: {
    firstName: "",
    lastName: "",
    jobTitle: "",
    phoneNumber: "",
    businessEmail: "",
    userId: "",
    pwd: "",
    cpwd: "",
  },
  ci: {
    companyName: "",
    companyRegisterNumber: "",
    localLang: "",
    tradeName: "",
    SPT: "",
    CBT: "",
    address: "",
    city: "",
    country: "",
    zipCode: "",
    department: "",
    trade: "",
  },
  ai: {
    contact: "",
    comment: "",
  },
  document: {
    fileName: "",
    url: "",
    extracted: {} as ExtractedDocumentFields,
    isVerified: false,
  },
};

/* ---------------- Shared premium styling tokens ---------------- */
const inputCls =
  "input input-bordered w-full mt-2 rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-[15px] text-slate-900 " +
  "placeholder:text-slate-400 outline-none transition-colors focus:ring-2 focus:ring-[#4f9748]/30 focus:border-[#4f9748] " +
  "disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed";
const selectCls =
  "select select-bordered w-full mt-2 rounded-xl border-slate-200 bg-slate-50 px-4text-[15px] text-slate-900 " +
  "outline-none transition-colors focus:ring-2 focus:ring-[#4f9748]/30 focus:border-[#4f9748]";
const labelCls = "text-sm font-medium text-slate-700";
const errorCls = "text-red-600 font-light text-[11px] mt-1";
const sectionTitleCls = "text-slate-500 text-[13px] font-semibold uppercase tracking-wide";
const primaryBtnCls =
  "px-5 py-2.5 text-[15px] rounded-xl bg-[#4f9748] text-white font-semibold shadow-sm hover:bg-[#437d3d] " +
  "active:scale-[0.99] transition-all disabled:bg-slate-300 disabled:cursor-not-allowed disabled:active:scale-100";
const secondaryBtnCls =
  "px-5 py-2.5 text-[15px] rounded-xl text-[#ee3a23] font-medium hover:bg-red-50 transition-colors";

export default function SignupPage() {
  /* ---------------- ACTIVE STEP ---------------- */
  const [activeTab, setActiveTab] = useState<number>(() => {
    const saved = localStorage.getItem("activeTab");
    return saved ? Number(saved) : 1;
  });
  /* ---------------- COMPLETED STEPS ---------------- */
  const [completedSteps, setCompletedSteps] = useState<number[]>(() => {
    const saved = localStorage.getItem("completedSteps");
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* ---------------- DOCUMENT UPLOAD (Step 2) ---------------- */
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [verifyingDocument, setVerifyingDocument] = useState(false);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const savedData = localStorage.getItem("user_information");
  const navigate = useNavigate();

  useEffect(() => {
    const savedTab = localStorage.getItem("activeTab");
    const savedSteps = localStorage.getItem("completedSteps");
    const saved = localStorage.getItem("user_information");

    if (saved) {
      setFormData({
        ...defaultFormData,
        ...JSON.parse(saved),
      });
    }
    if (savedTab) setActiveTab(Number(savedTab));
    if (savedSteps) setCompletedSteps(JSON.parse(savedSteps));
  }, []);

  const userInformation = savedData ? JSON.parse(savedData) : null;
  /* ---------------- FORM DATA ---------------- */
  const [formData, setFormData] = useState(defaultFormData);

  /* ---------------- PASSWORD VALIDATION ---------------- */
  const validatePassword = (pwd: string): string | null => {
    if (!pwd) return "Password is invalid. Please check the following policies.";
    if (pwd.length < 8 || pwd.length > 32) return "Password must be between 8-32 characters.";
    if (!/[a-z]/.test(pwd)) return "Password must contain at least one lowercase letter.";
    if (!/[A-Z]/.test(pwd)) return "Password must contain at least one uppercase letter.";
    if (!/[0-9]/.test(pwd)) return "Password must contain at least one number.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return "Password must contain at least one special character.";
    const forbidden = [formData.uai.firstName, formData.uai.userId, formData.uai.businessEmail].filter(Boolean);
    for (const item of forbidden) {
      if (item && pwd.toLowerCase().includes(item.toLowerCase())) {
        return "Password must not contain first name, user ID, or email.";
      }
    }
    return null;
  };

  /* ---------------- VALIDATION ---------------- */
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (step === 1) {
      if (!formData.uai.firstName) newErrors.firstName = "First Name is required.";
      if (!formData.uai.lastName) newErrors.lastName = "Last Name is required.";
      if (!formData.uai.jobTitle) newErrors.jobTitle = "Job Title is required.";
      if (!formData.uai.phoneNumber) {
        newErrors.phoneNumber = "Phone Number is required.";
      } else if (!/^\+?[1-9]\d{6,14}$/.test(formData.uai.phoneNumber)) {
        newErrors.phoneNumber = "Phone Number is invalid. Must be a valid international number with country code.";
      }

      if (!formData.uai.businessEmail) newErrors.businessEmail = "Business Email is required.";
      else if (!emailPattern.test(formData.uai.businessEmail))
        newErrors.businessEmail = "Email must start with 'example@123.com' and be valid.";

      if (!formData.uai.userId) {
        newErrors.userId = "User ID is required.";
      } else if (!/^\d{9}$/.test(formData.uai.userId)) {
        newErrors.userId = "User ID must be exactly 9 digits.";
      }

      // Password rules
      const pwdError = validatePassword(formData.uai.pwd);
      if (pwdError) newErrors.pwd = pwdError;

      if (!formData.uai.cpwd) newErrors.cpwd = "Please confirm your password.";
      else if (formData.uai.pwd !== formData.uai.cpwd) newErrors.cpwd = "Passwords do not match.";
    }

    if (step === 2) {
      const VAT_TIN_PATTERNS: Record<string, RegExp> = {
        Cambodia: /^[A-Z]\d{3}-\d{9}$/, // Cambodia TIN, e.g. K001-901204066
        "United States": /^\d{2}-\d{7}$/, // Example EIN
        India: /^[A-Z]{5}\d{4}[A-Z]$/, // India PAN
        "United Kingdom": /^[A-Z]{2}\d{6}[A-D]$/, // UK NINO
      };

      const isValidTINorVAT = (country: string, number: string) => {
        const pattern = VAT_TIN_PATTERNS[country];
        if (!pattern) return true; // if no rule for country, skip validation
        return pattern.test(number);
      };

      if (!formData.ci.companyName) newErrors.companyName = "Company Name is required.";
      if (!formData.ci.companyRegisterNumber) {
        newErrors.companyRegisterNumber = "Company Registration Number is required.";
      } else if (!isValidTINorVAT(formData.ci.country, formData.ci.companyRegisterNumber)) {
        newErrors.companyRegisterNumber = "Invalid VAT/TIN number.";
      }
      if (!formData.ci.tradeName) newErrors.tradeName = "Trade Name is required.";
      if (!formData.ci.SPT) newErrors.SPT = "Shipping Party Type is required.";
      if (!formData.ci.CBT) newErrors.CBT = "Company Business Type is required.";
      if (!formData.ci.address) newErrors.address = "Address is required.";
      if (!formData.ci.city) newErrors.city = "City is required.";
      if (!formData.ci.country) newErrors.country = "Country is required.";
      if (!formData.ci.department) newErrors.department = "Department is required.";
      if (!formData.ci.trade) newErrors.trade = "Trade is required.";

      // Business registration / TIN document
      if (!formData.document.url) {
        newErrors.document = documentFile
          ? "Please verify the document before continuing."
          : "Please upload your business registration / TIN document.";
      }
    }

    if (step === 3) {
      if (!formData.ai.contact) newErrors.contact = "Contact is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- ACTIONS ---------------- */
  const markCompleted = (step: number) => {
    setCompletedSteps((prev) => (prev.includes(step) ? prev : [...prev, step]));
  };

  const handleNext = () => {
    if (!validateStep(activeTab)) return;

    markCompleted(activeTab);
    setActiveTab((prev) => Math.min(prev + 1, 4));
    localStorage.setItem("user_information", JSON.stringify(formData));
  };

  const handlePrevious = () => {
    setActiveTab((prev) => Math.max(prev - 1, 1));
  };

  const handleTabClick = (tab: number) => {
    // Cannot jump forward without validation
    if (tab > activeTab && !validateStep(activeTab)) return;

    // Mark current step as completed if moving forward
    if (tab > activeTab) {
      markCompleted(activeTab);
    }

    setActiveTab(tab);
  };

  /* ---------------- DOCUMENT UPLOAD + OCR VALIDATION ---------------- */
  const handleDocumentSelect = (file: File | null) => {
    setErrors((prev) => ({ ...prev, document: "" }));

    // Reset any previously verified document — a new file needs re-verification.
    setFormData((prev) => ({
      ...prev,
      document: { fileName: "", url: "", extracted: {}, isVerified: false },
    }));

    if (!file) {
      setDocumentFile(null);
      return;
    }

    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, document: "Unsupported file type. Please upload a PDF, JPG, or PNG." }));
      setDocumentFile(null);
      if (documentInputRef.current) documentInputRef.current.value = "";
      return;
    }

    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      setErrors((prev) => ({ ...prev, document: "File is too large. Maximum size is 10MB." }));
      setDocumentFile(null);
      if (documentInputRef.current) documentInputRef.current.value = "";
      return;
    }

    setDocumentFile(file);
  };

  const handleRemoveDocument = () => {
    setDocumentFile(null);
    setFormData((prev) => ({
      ...prev,
      document: { fileName: "", url: "", extracted: {}, isVerified: false },
    }));
    setErrors((prev) => ({ ...prev, document: "" }));
    if (documentInputRef.current) documentInputRef.current.value = "";
  };

  // Runs OCR on the backend, auto-fills company fields from the result, then
  // uploads the file to storage so its URL can be submitted with signup.
  const handleVerifyDocument = async () => {
    if (!documentFile) {
      setErrors((prev) => ({ ...prev, document: "Please choose a document first." }));
      return;
    }

    setVerifyingDocument(true);
    setErrors((prev) => ({ ...prev, document: "" }));

    // Step 1: OCR. extractDocument() catches its own errors and always
    // resolves with { status, msg, data } rather than throwing, but we
    // still guard defensively in case something upstream misbehaves.
    let ocrRes;
    try {
      ocrRes = await extractDocument(documentFile);
    } catch (err) {
      console.error("[handleVerifyDocument] extractDocument threw unexpectedly:", err);
      setErrors((prev) => ({
        ...prev,
        document: "Could not reach the document scanning service. Please check your connection and try again.",
      }));
      setVerifyingDocument(false);
      return;
    }

    if (!ocrRes.status) {
      setErrors((prev) => ({
        ...prev,
        document: ocrRes.msg || "Could not verify this document. Please try a clearer scan.",
      }));
      setVerifyingDocument(false);
      return;
    }

    const extracted = ocrRes.data || {};

    // Step 2: upload the verified document to storage, kept in its own
    // try/catch so an upload failure is reported distinctly from an OCR
    // failure, with the real error message instead of a generic one.
    // This goes through the backend (server-to-server to R2) rather than
    // the browser talking to R2 directly, so R2 CORS doesn't come into play.
    const uploadRes = await uploadDocument(documentFile);

    if (!uploadRes.status || !uploadRes.url) {
      setErrors((prev) => ({
        ...prev,
        document: `The document was scanned, but we couldn't save it: ${uploadRes.msg || "Unknown upload error."}`,
      }));
      setVerifyingDocument(false);
      return;
    }

    const url = uploadRes.url;

    setFormData((prev) => ({
      ...prev,
      ci: {
        ...prev.ci,
        companyRegisterNumber: prev.ci.companyRegisterNumber || extracted.tin || "",
        companyName: prev.ci.companyName || extracted.companyName || "",
      },
      document: {
        fileName: documentFile.name,
        url,
        extracted,
        isVerified: true,
      },
    }));

    showSuccess("Document verified. We've pre-filled what we could read from it — please double-check the fields.");
    setVerifyingDocument(false);
  };

  /* ---------------- Submit ------------- */
  const handleSubmit = async () => {
    setLoading(true);
    const ip = await getPublicIp();

    const payload: SignupPayload = {
      uai: formData.uai,
      ci: formData.ci,
      ai: formData.ai,
      document: {
        fileName: formData.document.fileName,
        url: formData.document.url,
        extracted: formData.document.extracted,
        is_ocr_verified: formData.document.isVerified,
      },
      local_ip: ip,
      role: "USER",
    };

    const res = await signup(payload);

    setLoading(false);

    // ❌ Error case: httpStatus not 2xx
    if (!res || (res.httpStatus && res.httpStatus >= 400)) {
      showError("Error", res?.msg || "Signup failed");
      return;
    }

    showSuccess(res.msg || "Signup successful");

    localStorage.removeItem("user_information");
    localStorage.removeItem("activeTab");
    localStorage.removeItem("completedSteps");

    // ✅ Redirect to verify-email page
    navigate("/auth/verify-email", {
      state: { businessEmail: formData.uai.businessEmail },
    });

    setFormData(defaultFormData);
    setActiveTab(1);
    setCompletedSteps([]);
  };

  /* ---------------- CONTENT ---------------- */
  const renderContent = () => {
    switch (activeTab) {
      case 1:
        return (
          <>
            <h2 className="text-center text-[24px] font-bold text-[#4f9748] mb-6 tracking-tight">
              User &amp; Account Information
            </h2>

            <form className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              <div className="sm:border-r sm:border-slate-200 sm:pe-8 space-y-4">
                <h1 className={sectionTitleCls}>User Information</h1>
                <div className="space-y-1">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="firstName" className={labelCls}>First Name</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <input
                    className={inputCls}
                    placeholder="Enter First Name"
                    value={formData.uai.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, uai: { ...formData.uai, firstName: e.target.value } })
                    }
                  />
                  {errors.firstName && <p className={errorCls}>{errors.firstName}</p>}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="lastName" className={labelCls}>Last Name</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <input
                    className={inputCls}
                    placeholder="Enter Last Name"
                    value={formData.uai.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, uai: { ...formData.uai, lastName: e.target.value } })
                    }
                  />
                  {errors.lastName && <p className={errorCls}>{errors.lastName}</p>}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="jobTitle" className={labelCls}>Job Title</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <select
                    defaultValue={formData.uai.jobTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, uai: { ...formData.uai, jobTitle: e.target.value } })
                    }
                    className={selectCls}
                  >
                    <option defaultValue="" disabled selected>
                      Job Title
                    </option>
                    <option defaultValue="Top Management">Top Management</option>
                    <option defaultValue="Middle Management">Middle Management</option>
                    <option defaultValue="Operative Management">Operative Management</option>
                    <option defaultValue="Non-Managerial">Non-Managerial</option>
                  </select>

                  {errors.jobTitle && <p className={errorCls}>{errors.jobTitle}</p>}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="lastName" className={labelCls}>Phone Number</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <input
                    className={inputCls}
                    placeholder="Enter Phone Number"
                    value={formData.uai.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, uai: { ...formData.uai, phoneNumber: e.target.value } })
                    }
                  />
                  {errors.phoneNumber && <p className={errorCls}>{errors.phoneNumber}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <h1 className={sectionTitleCls}>Account Information</h1>
                <div className="space-y-1">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="businessEmail" className={labelCls}>Business Email</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <input
                    className={inputCls}
                    placeholder="Enter Business Email"
                    value={formData.uai.businessEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, uai: { ...formData.uai, businessEmail: e.target.value } })
                    }
                  />
                  {errors.businessEmail && <p className={errorCls}>{errors.businessEmail}</p>}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="userId" className={labelCls}>User ID</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <input
                    className={inputCls}
                    placeholder="Enter User ID"
                    value={formData.uai.userId}
                    onChange={(e) =>
                      setFormData({ ...formData, uai: { ...formData.uai, userId: e.target.value } })
                    }
                  />
                  {errors.userId && <p className={errorCls}>{errors.userId}</p>}
                </div>

                <PasswordStrengthInput
                  id="pwd"
                  label="Password"
                  required
                  value={formData.uai.pwd}
                  onChange={(v) => setFormData({ ...formData, uai: { ...formData.uai, pwd: v } })}
                  disallowedValues={[formData.uai.firstName, formData.uai.userId, formData.uai.businessEmail]}
                  error={errors.pwd}
                />

                <div className="space-y-1">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="cpwd" className={labelCls}>Confirm Password</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <input
                    type="password"
                    className={inputCls}
                    placeholder="Enter Confirm Password"
                    value={formData.uai.cpwd}
                    onChange={(e) =>
                      setFormData({ ...formData, uai: { ...formData.uai, cpwd: e.target.value } })
                    }
                  />
                  {errors.cpwd && <p className={errorCls}>{errors.cpwd}</p>}
                </div>
              </div>
            </form>
          </>
        );

      case 2:
        return (
          <>
            <h2 className="text-center text-[24px] font-bold text-[#4f9748] mb-6 tracking-tight">
              Company Information
            </h2>

            <form className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                            {/* ---------------- Business Document Upload + OCR ---------------- */}
                            <div className="sm:col-span-2 mt-2 space-y-3 border-t border-slate-200 pt-5">
                <div className="flex flex-row gap-1">
                  <label htmlFor="document" className={labelCls}>Business Registration / TIN Document</label>
                  <span className="text-red-600">*</span>
                </div>
                <p className="text-slate-500 text-[12px]">
                  Upload a clear photo or PDF of your company's registration certificate or TIN certificate.
                  We'll scan it to help pre-fill the fields above — please double-check them afterwards.
                </p>

                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <input
                    ref={documentInputRef}
                    id="document"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
                    className="file-input file-input-bordered w-full sm:w-auto rounded-xl border-slate-200 bg-slate-50"
                    onChange={(e) => handleDocumentSelect(e.target.files ? e.target.files[0] : null)}
                    disabled={verifyingDocument}
                  />

                  <button
                    type="button"
                    onClick={handleVerifyDocument}
                    disabled={!documentFile || verifyingDocument || formData.document.isVerified}
                    className={`${primaryBtnCls} whitespace-nowrap`}
                  >
                    {verifyingDocument
                      ? "Verifying..."
                      : formData.document.isVerified
                      ? "Verified ✓"
                      : "Verify Document"}
                  </button>

                  {(documentFile || formData.document.fileName) && (
                    <button
                      type="button"
                      onClick={handleRemoveDocument}
                      disabled={verifyingDocument}
                      className={`${secondaryBtnCls} whitespace-nowrap`}
                    >
                      Remove
                    </button>
                  )}
                </div>

                {documentFile && (
                  <p className="text-slate-600 text-[12px]">
                    Selected: {documentFile.name} ({Math.round(documentFile.size / 1024)} KB)
                  </p>
                )}

                {formData.document.isVerified && (
                  <div className="bg-[#4f9748]/5 border border-[#4f9748]/20 rounded-xl p-3 text-[12px] text-slate-700 space-y-1">
                    <p className="font-semibold text-[#4f9748]">Document verified — detected fields:</p>
                    <ul className="list-disc list-inside">
                      {formData.document.extracted?.tin && <li>TIN: {formData.document.extracted.tin}</li>}
                      {formData.document.extracted?.companyName && (
                        <li>Company Name: {formData.document.extracted.companyName}</li>
                      )}
                      {!formData.document.extracted?.tin && !formData.document.extracted?.companyName && (
                        <li>No fields could be auto-detected — please fill them in manually above.</li>
                      )}
                    </ul>
                  </div>
                )}

                {errors.document && <p className={errorCls}>{errors.document}</p>}
              </div>

              <div className="sm:border-r sm:border-slate-200 sm:pe-8 space-y-4">
                <div className="space-y-1">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="companyName" className={labelCls}>Company Name</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <input
                    className={inputCls}
                    placeholder="Enter Company Name"
                    value={formData.ci.companyName}
                    disabled
                    onChange={(e) =>
                      setFormData({ ...formData, ci: { ...formData.ci, companyName: e.target.value } })
                    }
                  />
                  {errors.companyName && <p className={errorCls}>{errors.companyName}</p>}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="companyRegisterNumber" className={labelCls}>Company Register Number</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <input
                    className={inputCls}
                    placeholder="Enter Company Register Number"
                    value={formData.ci.companyRegisterNumber}
                    disabled
                    onChange={(e) =>
                      setFormData({ ...formData, ci: { ...formData.ci, companyRegisterNumber: e.target.value } })
                    }
                  />
                  {errors.companyRegisterNumber && <p className={errorCls}>{errors.companyRegisterNumber}</p>}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="localLang" className={labelCls}>Local Language</label>
                    <span className="text-slate-400 text-xs self-center">(Optional)</span>
                  </div>
                  <input
                    className={inputCls}
                    placeholder="Enter Local Language"
                    value={formData.ci.localLang}
                    onChange={(e) =>
                      setFormData({ ...formData, ci: { ...formData.ci, localLang: e.target.value } })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="tradeName" className={labelCls}>Trade Name</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <input
                    className={inputCls}
                    placeholder="Enter Trade Name"
                    value={formData.ci.tradeName}
                    onChange={(e) =>
                      setFormData({ ...formData, ci: { ...formData.ci, tradeName: e.target.value } })
                    }
                  />
                  {errors.tradeName && <p className={errorCls}>{errors.tradeName}</p>}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="SPT" className={labelCls}>Shipping Party Type</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <select
                    value={formData.ci.SPT}
                    onChange={(e) =>
                      setFormData({ ...formData, ci: { ...formData.ci, SPT: e.target.value } })
                    }
                    className={selectCls}
                  >
                    <option value="" disabled selected>
                      Shipping Party Type
                    </option>
                    <option value="Shipper">
                      <span>Shipper</span>
                    </option>
                    <option value="Consignee">Consignee</option>
                    <option value="Freight Forwarder">Freight Forwarder</option>
                    <option value="Customs/Agent">Customs/Agent</option>
                  </select>

                  {errors.SPT && <p className={errorCls}>{errors.SPT}</p>}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="CBT" className={labelCls}>Company Business Type</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <select
                    value={formData.ci.CBT}
                    onChange={(e) =>
                      setFormData({ ...formData, ci: { ...formData.ci, CBT: e.target.value } })
                    }
                    className={selectCls}
                  >
                    <option value="" disabled selected>
                      Company Business Type
                    </option>
                    <option value="BCO">BCO</option>
                    <option value="NVOCC/OTI">NVOCC/OTI</option>
                    <option value="Logistics Service Providers">Logistics Service Providers</option>
                    <option value="Freight Management/Procurement">Freight Management/Procurement</option>
                  </select>

                  {errors.CBT && <p className={errorCls}>{errors.CBT}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="address" className={labelCls}>Address</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <input
                    className={inputCls}
                    placeholder="Enter Address"
                    value={formData.ci.address}
                    onChange={(e) =>
                      setFormData({ ...formData, ci: { ...formData.ci, address: e.target.value } })
                    }
                  />
                  {errors.address && <p className={errorCls}>{errors.address}</p>}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="city" className={labelCls}>City</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <input
                    className={inputCls}
                    placeholder="Enter City"
                    value={formData.ci.city}
                    onChange={(e) =>
                      setFormData({ ...formData, ci: { ...formData.ci, city: e.target.value } })
                    }
                  />
                  {errors.city && <p className={errorCls}>{errors.city}</p>}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="country" className={labelCls}>Country</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <select
                    value={formData.ci.country}
                    onChange={(e) =>
                      setFormData({ ...formData, ci: { ...formData.ci, country: e.target.value } })
                    }
                    className={selectCls}
                  >
                    <option value="" disabled selected>
                      Country
                    </option>
                    {countries.map((ct) => (
                      <option key={ct.code} value={ct.name}>
                        {ct.name}
                      </option>
                    ))}
                  </select>

                  {errors.country && <p className={errorCls}>{errors.country}</p>}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="zipCode" className={labelCls}>Zip Code</label>
                    <span className="text-slate-400 text-xs self-center">(Optional)</span>
                  </div>
                  <input
                    className={inputCls}
                    placeholder="Enter Zip Code"
                    value={formData.ci.zipCode}
                    onChange={(e) =>
                      setFormData({ ...formData, ci: { ...formData.ci, zipCode: e.target.value } })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="department" className={labelCls}>Department</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <select
                    value={formData.ci.department}
                    onChange={(e) =>
                      setFormData({ ...formData, ci: { ...formData.ci, department: e.target.value } })
                    }
                    className={selectCls}
                  >
                    <option value="" disabled selected>
                      Department
                    </option>
                    {departments.map((dp, idx) => (
                      <option key={idx} value={dp.name}>
                        {dp.name}
                      </option>
                    ))}
                  </select>

                  {errors.department && <p className={errorCls}>{errors.department}</p>}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="trade" className={labelCls}>Trade</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <select
                    value={formData.ci.trade}
                    onChange={(e) =>
                      setFormData({ ...formData, ci: { ...formData.ci, trade: e.target.value } })
                    }
                    className={selectCls}
                  >
                    <option value="" disabled selected>
                      Trade
                    </option>
                    {trades.map((td, idx) => (
                      <option key={idx} value={td.name}>
                        {td.name}
                      </option>
                    ))}
                  </select>

                  {errors.trade && <p className={errorCls}>{errors.trade}</p>}
                </div>
              </div>
            </form>
          </>
        );

      case 3:
        return (
          <>
            <h2 className="text-center text-[24px] font-bold text-[#4f9748] mb-6 tracking-tight">
              Additional Information
            </h2>

            <form className="space-y-4">
              <div className="space-y-1">
                <div className="flex flex-row gap-1">
                  <label htmlFor="contact" className={labelCls}>Contact CLN (Cambodia) Co., Ltd.</label>
                  <span className="text-red-600">*</span>
                </div>
                <select
                  value={formData.ai.contact}
                  onChange={(e) =>
                    setFormData({ ...formData, ai: { ...formData.ai, contact: e.target.value } })
                  }
                  className={selectCls}
                >
                  <option value="" disabled selected>
                    Contact
                  </option>
                  <option value="Contact CLN (CAMBODIA) CO., LTD.">
                    <span>Contact CLN (CAMBODIA) CO., LTD.</span>
                  </option>
                </select>

                {errors.contact && <p className={errorCls}>{errors.contact}</p>}
              </div>

              <div className="space-y-1">
                <div className="flex flex-row gap-1">
                  <label htmlFor="comment" className={labelCls}>Comment</label>
                  <span className="text-slate-400 text-xs self-center">(Optional)</span>
                </div>
                <textarea
                  className={`${inputCls} min-h-[110px]`}
                  value={formData.ai.comment}
                  onChange={(e) =>
                    setFormData({ ...formData, ai: { ...formData.ai, comment: e.target.value } })
                  }
                ></textarea>
              </div>
            </form>
          </>
        );

      case 4:
        return (
          <>
            <h2 className="text-center text-[24px] font-bold text-[#4f9748] mb-6 tracking-tight">
              Review Registration
            </h2>

            <div className="space-y-3 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:space-y-0">
              <div className="bg-white p-4 rounded-2xl text-sm border border-slate-200 shadow-[0_1px_2px_rgba(9,30,66,0.06)]">
                <div>
                  <div className="flex justify-between items-center">
                    <h1 className="font-semibold text-[15px] mb-2 text-slate-800">User Information</h1>
                    <button onClick={() => handleTabClick(1)} className="p-1.5 bg-[#4f9748]/10 rounded-lg hover:bg-[#4f9748]/20 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f9748" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" /><path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415" /><path d="M16 5l3 3" /></svg>
                    </button>
                  </div>
                  <table className="table table-xs sm:table-md">
                    <thead>
                      <tr>
                        <th className="text-start text-slate-400 font-medium">User Name</th>
                        <th className="text-end text-slate-400 font-medium">Job Title</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{userInformation.uai.firstName + " " + userInformation.uai.lastName}</td>
                        <td className="text-end">{userInformation.uai.jobTitle}</td>
                      </tr>
                    </tbody>
                  </table>
                  <table className="table table-xs sm:table-md">
                    <thead>
                      <tr>
                        <th className="text-start text-slate-400 font-medium">Phone Number</th>
                        <th className="text-start"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{userInformation.uai.phoneNumber}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                  <h1 className="font-semibold text-[15px] my-2 text-slate-800">Account Information</h1>
                  <table className="table table-xs sm:table-md">
                    <thead>
                      <tr>
                        <th className="text-start text-slate-400 font-medium">Business</th>
                        <th className="text-end text-slate-400 font-medium">User ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{userInformation.uai.businessEmail}</td>
                        <td className="text-end">{userInformation.uai.userId}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl text-sm border border-slate-200 shadow-[0_1px_2px_rgba(9,30,66,0.06)]">
                <div>
                  <div className="flex justify-between items-center">
                    <h1 className="font-semibold text-[15px] mb-2 text-slate-800">Company Information</h1>
                    <button onClick={() => handleTabClick(2)} className="p-1.5 bg-[#4f9748]/10 rounded-lg hover:bg-[#4f9748]/20 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f9748" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" /><path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415" /><path d="M16 5l3 3" /></svg>
                    </button>
                  </div>

                  <table className="table table-xs sm:table-md">
                    <thead>
                      <tr>
                        <th className="text-start text-slate-400 font-medium">Company Name</th>
                        <th className="text-end text-slate-400 font-medium">Local Language</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{userInformation.ci.companyName}</td>
                        <td className="text-end">{userInformation.ci.localLange || "N/A"}</td>
                      </tr>
                    </tbody>
                  </table>

                  <table className="table table-xs sm:table-md">
                    <thead>
                      <tr>
                        <th className="text-start text-slate-400 font-medium">Trade Name</th>
                        <th className="text-end text-slate-400 font-medium">Shipping Party Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{userInformation.ci.tradeName}</td>
                        <td className="text-end">{userInformation.ci.SPT}</td>
                      </tr>
                    </tbody>
                  </table>

                  <table className="table table-xs sm:table-md">
                    <thead>
                      <tr>
                        <th className="text-start text-slate-400 font-medium">Company Business Type</th>
                        <th className="text-end text-slate-400 font-medium">Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{userInformation.ci.CBT}</td>
                        <td className="text-end">{userInformation.ci.address}</td>
                      </tr>
                    </tbody>
                  </table>

                  <table className="table table-xs sm:table-md">
                    <thead>
                      <tr>
                        <th className="text-start text-slate-400 font-medium">Address</th>
                        <th className="text-end text-slate-400 font-medium">City</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{userInformation.ci.address}</td>
                        <td className="text-end">{userInformation.ci.city}</td>
                      </tr>
                    </tbody>
                  </table>

                  <table className="table table-xs sm:table-md">
                    <thead>
                      <tr>
                        <th className="text-start text-slate-400 font-medium">Country</th>
                        <th className="text-end text-slate-400 font-medium">Zip Code</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{userInformation.ci.country}</td>
                        <td className="text-end">{userInformation.ci.zipCode}</td>
                      </tr>
                    </tbody>
                  </table>

                  <table className="table table-xs sm:table-md">
                    <thead>
                      <tr>
                        <th className="text-start text-slate-400 font-medium">Department</th>
                        <th className="text-end text-slate-400 font-medium">Trade</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{userInformation.ci.department}</td>
                        <td className="text-end">{userInformation.ci.trade}</td>
                      </tr>
                    </tbody>
                  </table>

                  <table className="table table-xs sm:table-md">
                    <thead>
                      <tr>
                        <th className="text-start text-slate-400 font-medium">Business Document</th>
                        <th className="text-end text-slate-400 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{userInformation.document?.fileName || "N/A"}</td>
                        <td className="text-end">
                          {userInformation.document?.isVerified ? (
                            <span className="text-[#4fb748] font-semibold">Verified ✓</span>
                          ) : (
                            <span className="text-[#ee3a23] font-semibold">Not verified</span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white p-4 rounded-2xl text-sm border border-slate-200 shadow-[0_1px_2px_rgba(9,30,66,0.06)]">
                <div>
                  <div className="flex justify-between items-center">
                    <h1 className="font-semibold text-[15px] mb-2 text-slate-800">Additional Information</h1>
                    <button onClick={() => handleTabClick(3)} className="p-1.5 bg-[#4f9748]/10 rounded-lg hover:bg-[#4f9748]/20 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f9748" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" /><path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415" /><path d="M16 5l3 3" /></svg>
                    </button>
                  </div>
                  <table className="table table-xs sm:table-md">
                    <thead>
                      <tr>
                        <th className="text-start text-slate-400 font-medium">Contact CLN (Cambodia) Co., Ltd.</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{userInformation.ai.contact}</td>
                      </tr>
                    </tbody>
                  </table>
                  {userInformation.comment && (
                    <table className="table table-xs sm:table-md">
                      <thead>
                        <tr>
                          <th className="text-start text-slate-400 font-medium">Comment</th>
                          <th className="text-start"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{userInformation.ai.comment}</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full flex flex-row gap-2 justify-end overflow-hidden">
              <button onClick={handlePrevious} className={`${secondaryBtnCls} mt-4`}>
                Previous
              </button>
              <button disabled={loading} onClick={handleSubmit} className={`${primaryBtnCls} mt-4`}>
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const stepDefs = [
    { id: 1, name: "User & Account Info" },
    { id: 2, name: "Company Info" },
    { id: 3, name: "Additional Info" },
    { id: 4, name: "Review Registration" },
  ];

  const heroHighlights = [
    {
      title: "Verified in minutes",
      desc: "OCR-assisted document check pre-fills your company details.",
      icon: (
        <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      ),
    },
    {
      title: "Built for global trade",
      desc: "Shippers, forwarders, and customs agents, all in one network.",
      icon: (
        <>
          <path d="M2.25 12h19.5" />
          <path d="M12 2.25a15.3 15.3 0 0 1 3.5 9.75 15.3 15.3 0 0 1-3.5 9.75 15.3 15.3 0 0 1-3.5-9.75A15.3 15.3 0 0 1 12 2.25Z" />
        </>
      ),
    },
    {
      title: "Your data, protected",
      desc: "Encrypted storage and two-factor sign-in on every account.",
      icon: (
        <path d="M12 2.75 4.5 6v6c0 5 3.2 8.4 7.5 9.25 4.3-.85 7.5-4.25 7.5-9.25V6L12 2.75Z" />
      ),
    },
  ];

  /* ---------------- UI ---------------- */
  return (
    <section className="min-h-[90vh] flex items-center justify-center px-4 py-8">
      <div className="overflow-hidden flex flex-col lg:flex-row w-full max-w-[720px] lg:max-w-[1450px] rounded-[28px] bg-white shadow-[0_1px_2px_rgba(9,30,66,0.08),0_24px_48px_-24px_rgba(9,30,66,0.25)] mx-auto">
        {/* ---------------- HERO ---------------- */}
        <div className="lg:w-1/2 relative min-h-[280px] lg:min-h-0 overflow-hidden">
          <img src={Banner} alt="" className="absolute inset-0 h-full w-full object-cover" />

          {/* layered overlays for depth + legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#173318]/60 via-transparent to-transparent" />
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#4f9748]/30 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />

          <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-10 lg:p-12 text-white">
            {/* wordmark */}
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 text-[13px] font-bold tracking-tight">
                CLN
              </span>
              <span className="text-sm font-medium text-white/80">CLN (Cambodia) Co., Ltd.</span>
            </div>

            {/* headline */}
            <div className="mt-8 lg:mt-0">
              <h1 className="text-[28px] sm:text-[34px] font-bold tracking-tight leading-[1.15]">
                Welcome to the CLN trade network
              </h1>
              <p className="mt-3 text-[15px] text-white/75 max-w-sm">
                Create your business account to manage shipments, documents, and partners in one place.
              </p>
            </div>

            {/* feature highlights */}
            <ul className="mt-8 space-y-4 hidden sm:block">
              {heroHighlights.map((item) => (
                <li key={item.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 border border-white/15">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      {item.icon}
                    </svg>
                  </span>
                  <div>
                    <p className="text-[14px] font-semibold text-white">{item.title}</p>
                    <p className="text-[13px] text-white/65 leading-snug">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:w-1/2 p-5 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create your account</h2>
            <p className="text-sm text-slate-500 mt-1">Step {activeTab} of 4</p>
          </div>

          {/* CUSTOM PREMIUM STEP INDICATOR */}
          <ol className="flex items-start w-full mb-8">
            {stepDefs.map((step, idx) => {
              const isCompleted = completedSteps.includes(step.id);
              const isActive = activeTab === step.id;
              return (
                <li key={step.id} className="flex-1 flex items-center last:flex-none">
                  <button
                    type="button"
                    onClick={() => handleTabClick(step.id)}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <span
                      className={`flex items-center justify-center h-8 w-8 rounded-full text-[13px] font-semibold border-2 transition-colors
                        ${
                          isCompleted
                            ? "bg-[#4f9748] border-[#4f9748] text-white"
                            : isActive
                            ? "border-[#4f9748] text-[#4f9748] bg-white"
                            : "border-slate-200 text-slate-400 bg-white group-hover:border-slate-300"
                        }`}
                    >
                      {isCompleted ? "✓" : step.id}
                    </span>
                    <span
                      className={`hidden sm:block text-[11px] text-center max-w-[86px] leading-tight
                        ${isActive || isCompleted ? "text-slate-700 font-medium" : "text-slate-400"}`}
                    >
                      {step.name}
                    </span>
                  </button>
                  {idx < stepDefs.length - 1 && (
                    <span
                      className={`flex-1 h-[2px] mx-2 mb-5 sm:mb-6 rounded-full transition-colors ${
                        completedSteps.includes(stepDefs[idx + 1].id) || isCompleted
                          ? "bg-[#4f9748]"
                          : "bg-slate-200"
                      }`}
                    />
                  )}
                </li>
              );
            })}
          </ol>

          {/* CONTENT */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/40 px-4 pt-5 pb-6 sm:px-6">
            {renderContent()}
          </div>

          {/* NEXT */}
          {activeTab < 4 && (
            <div className="w-full flex flex-row gap-2 justify-end overflow-hidden">
              {activeTab > 2 && (
                <button onClick={handlePrevious} className={`${secondaryBtnCls} mt-4`}>
                  Previous
                </button>
              )}
              <button onClick={handleNext} className={`${primaryBtnCls} mt-4`}>
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}