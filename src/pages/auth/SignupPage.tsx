"use client";

import { useEffect, useState } from "react";
import type { SignupPayload } from "../../types/auth";
import { getPublicIp } from "../../utils/getIp";
import { signup } from "../../authService";
import { showError, showSuccess } from "../../admin/utils/swalHelper";
import { useNavigate } from "react-router-dom";

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
  {name: "Sales and Marketing" },
  {name: "Procurement" },
  {name: "Logistics & Operations" },
  {name: "Documentation" },
  {name: "Customer Service" },
  {name: "Finance" },
  {name: "IT & eCommerce" },
  {name: "HR & Legal" },
  {name: "Sustainability" },
];

// trade
const trades = [
  {name: "Export" },
  {name: "Import" },
  {name: "Export & Import" },
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
};

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const userInformation = savedData
    ? JSON.parse(savedData)
    : null;
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
        KH: /^[A-Z]{1}\d[0-9]{9}$/,             // Cambodia
        US: /^\d{2}-\d{7}$/,          // Example EIN
        IN: /^[A-Z]{5}\d{4}[A-Z]$/,   // India PAN
        UK: /^[A-Z]{2}\d{6}[A-D]$/,   // UK NINO
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
    }

    if (step === 3) {
      if (!formData.ai.contact) newErrors.contact = "Contact is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- ACTIONS ---------------- */
  const markCompleted = (step: number) => {
    setCompletedSteps((prev) =>
      prev.includes(step) ? prev : [...prev, step]
    );
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
  /* ---------------- Submit ------------- */
  const handleSubmit = async () => {
    setLoading(true);
    const ip = await getPublicIp();

    const payload: SignupPayload = {
      uai: formData.uai,
      ci: formData.ci,
      ai: formData.ai,
      local_ip: ip,
      role: "USER"
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
            <h2 className="text-center text-[24px] font-semibold text-[#4f9748] mb-4">
              User & Account Information
            </h2>

            <form className="flex flex-col sm:flex-row sm:justify-center sm:gap-2 space-y-2 sm:space-y-0">
              <div className="sm:w-[48%] border-r-0  sm:border-b-0 sm:border-r-2 sm:pe-2 space-y-2">
                <h1 className="text-gray-500 text-[16px] font-semibold capitalize">User Information</h1>
                <div className="space-y-2">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="firstName">First Name</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <input
                    className="input input-bordered w-full mt-2 rounded"
                    placeholder="Enter First Name"
                    value={formData.uai.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData,     
                        uai: {
                        ...formData.uai,
                        firstName: e.target.value,
                      }, })
                    }
                  />
                  {errors.firstName && <p className="text-red-600 font-light text-[11px]">{errors.firstName}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="lastName">Last Name</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <input
                    className="input input-bordered w-full mt-2 rounded"
                    placeholder="Enter Last Name"
                    value={formData.uai.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData,     
                        uai: {
                        ...formData.uai,
                        lastName: e.target.value,
                      }})
                    }
                  />
                  {errors.lastName && <p className="text-red-600 font-light text-[11px]">{errors.lastName}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="jobTitle">Job Title</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <select
                    value={formData.uai.jobTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, uai: {
                        ...formData.uai,
                        jobTitle: e.target.value,
                      } })
                    }
                    className="select select-bordered w-full mt-2 rounded text-[16px]"
                  >
                    <option value="" disabled selected>
                      Job Title
                    </option>
                    <option value="Top Management">Top Management</option>
                    <option value="Middle Management">Middle Management</option>
                    <option value="Operative Management">Operative Management</option>
                    <option value="Non-Managerial">Non-Managerial</option>
                  </select>

                  {errors.jobTitle && <p className="text-red-600 font-light text-[11px]">{errors.jobTitle}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="lastName">Phone Number</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <input
                    className="input input-bordered w-full mt-2 rounded"
                    placeholder="Enter Phone Number"
                    value={formData.uai.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, uai: {
                        ...formData.uai,
                        phoneNumber: e.target.value,
                      } })
                    }
                  />
                  {errors.phoneNumber && <p className="text-red-600 font-light text-[11px]">{errors.phoneNumber}</p>}
                </div>

              </div>

              <div className="sm:w-[48%] space-y-2">
                <h1 className="text-gray-500 text-[16px] font-semibold capitalize">Account Information</h1>
                <div className="space-y-2">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="businessEmail">Business Email</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <input
                    className="input input-bordered w-full mt-2 rounded"
                    placeholder="Enter Business Email"
                    value={formData.uai.businessEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, uai: {
                        ...formData.uai,
                        businessEmail: e.target.value,
                      } })
                    }
                  />
                  {errors.businessEmail && <p className="text-red-600 font-light text-[11px]">{errors.businessEmail}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="userId">User ID</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <input
                    className="input input-bordered w-full mt-2 rounded"
                    placeholder="Enter User ID"
                    value={formData.uai.userId}
                    onChange={(e) =>
                      setFormData({ ...formData, uai: {
                        ...formData.uai,
                        userId: e.target.value,
                      } })
                    }
                  />
                  {errors.userId && <p className="text-red-600 font-light text-[11px]">{errors.userId}</p>}
                </div>

                <div>
                  <div className="flex flex-row gap-1">
                    <label htmlFor="pwd">Password</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <div className="relative">
                    <input
                      className="input input-bordered w-full mt-2 rounded"
                      placeholder="Enter Password"
                      value={formData.uai.pwd}
                      type={showPassword ? "text" : "password"}
                      onChange={(e) =>
                        setFormData({ ...formData, uai: {
                          ...formData.uai,
                          pwd: e.target.value,
                        } })
                      }
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-[30%] text-gray-500"
                    >
                      {showPassword ? (
                        // 👁️ Eye Off
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-eye-off"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" /><path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87" /><path d="M3 3l18 18" /></svg>
                      ) : (
                        // 👁️ Eye
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-eye"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" /></svg>
                      )}
                    </button>
                  </div>

                  {errors.pwd && 
                    <div>
                      <p className="text-red-600 font-light text-[11px]">{errors.pwd}</p>
                      <ul className="font-light text-[11px]">
                        <li >
                          {formData.uai.pwd.length >= 8 && formData.uai.pwd.length <= 32 ? (
                            <div className="flex items-center gap-2">
                              <span className="text-green-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-circle-check"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z" /></svg>
                              </span>
                              <span className="text-green-600">
                                Password must be 8-32 characters.
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-red-600">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-info-circle"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M12 9h.01" /><path d="M11 12h1v4h1" /></svg>
                              </span>
                              <span className="text-red-600">
                                Password must be 8-32 characters.
                              </span>
                            </div>
                          )}
                        </li>
                        <li className="flex items-center gap-2">
                          {/[A-Z]/.test(formData.uai.pwd) ? (
                              <div className="flex items-center gap-2">
                              <span className="text-green-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-circle-check"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z" /></svg>
                              </span>
                              <span className="text-green-600">
                              One uppercase character.
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-red-600">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-info-circle"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M12 9h.01" /><path d="M11 12h1v4h1" /></svg>
                              </span>
                              <span className="text-red-600">
                              One uppercase character.
                              </span>
                            </div>
                          )}
                        </li>
                        <li className="flex items-center gap-2">
                          {/[a-z]/.test(formData.uai.pwd) ? (
                              <div className="flex items-center gap-2">
                              <span className="text-green-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-circle-check"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z" /></svg>
                              </span>
                              <span className="text-green-600">
                              One lowercase character.
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-red-600">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-info-circle"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M12 9h.01" /><path d="M11 12h1v4h1" /></svg>
                              </span>
                              <span className="text-red-600">
                              One lowercase character.
                              </span>
                            </div>
                          )}
                        </li>
                        <li className="flex items-center gap-2">
                          {/[!@#$%^&*(),.?":{}|<>]/.test(formData.uai.pwd) ? (
                              <div className="flex items-center gap-2">
                              <span className="text-green-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-circle-check"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z" /></svg>
                              </span>
                              <span className="text-green-600">
                              One special character.
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-red-600">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-info-circle"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M12 9h.01" /><path d="M11 12h1v4h1" /></svg>
                              </span>
                              <span className="text-red-600">
                              One special character.
                              </span>
                            </div>
                          )}
                        </li>
                        <li className="flex items-center gap-2">
                          {/[0-9]/.test(formData.uai.pwd) ? (
                            <div className="flex items-center gap-2">
                            <span className="text-green-600">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-circle-check"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z" /></svg>
                            </span>
                            <span className="text-green-600">
                            Number (0-9)
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-red-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-info-circle"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M12 9h.01" /><path d="M11 12h1v4h1" /></svg>
                            </span>
                            <span className="text-red-600">
                            Number (0-9)
                            </span>
                          </div>
                          )}
                        </li>
                        <li className="flex items-center gap-2">
                          {!(formData.uai.pwd.toLowerCase().includes(formData.uai.firstName.toLowerCase()) ||
                            formData.uai.pwd.toLowerCase().includes(formData.uai.userId.toLowerCase()) ||
                            formData.uai.pwd.toLowerCase().includes(formData.uai.businessEmail.toLowerCase()))
                            ? (
                              <div className="flex items-center gap-2">
                              <span className="text-green-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-circle-check"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z" /></svg>
                              </span>
                              <span className="text-green-600">
                              Must not contain user name or user ID, or email address.
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-red-600">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-info-circle"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M12 9h.01" /><path d="M11 12h1v4h1" /></svg>
                              </span>
                              <span className="text-red-600">
                              Must not contain user name or user ID, or email address.
                              </span>
                            </div>
                            )}
                        </li>
                      </ul>
                    </div>
                  }
                </div>

                <div className="space-y-2">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="cpwd">Confirm Password</label>
                    <span className="text-red-600">*</span>
                  </div>
                <div className="relative">
                  <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="input input-bordered w-full rounded"
                      placeholder="Enter Confirm Password"
                      value={formData.uai.cpwd}
                      onChange={(e) =>
                        setFormData({ ...formData, uai: {
                          ...formData.uai,
                          cpwd: e.target.value,
                        } })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-[30%] text-gray-500"
                    >
                      {showConfirmPassword ? (
                        // 👁️ Eye Off
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-eye-off"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" /><path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87" /><path d="M3 3l18 18" /></svg>
                      ) : (
                        // 👁️ Eye
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-eye"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" /></svg>
                      )}
                    </button>
                </div>
                  {errors.cpwd && <p className="text-red-600 font-light text-[11px]">{errors.cpwd}</p>}
                </div>

              </div>
            </form>
          </>
        );

      case 2:
        return (
          <>
            <h2 className="text-center text-[24px] font-semibold text-[#4f9748] mb-4">
              Company Information
            </h2>

            <form className="flex flex-col sm:flex-row sm:justify-center sm:gap-2 space-y-2 sm:space-y-0">
              <div className="sm:w-[48%] border-r-0 sm:border-b-0 sm:border-r-2 sm:pe-2 space-y-2">
                <div className="space-y-2">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="companyName">Company Name</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <input
                    className="input input-bordered w-full mt-2 rounded"
                    placeholder="Enter Company Name"
                    value={formData.ci.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, ci: {
                        ...formData.ci,
                        companyName: e.target.value,
                      }})
                    }
                  />
                  {errors.companyName && <p className="text-red-600 font-light text-[11px]">{errors.companyName}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="companyRegisterNumber">Company Register Number</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <input
                    className="input input-bordered w-full mt-2 rounded"
                    placeholder="Enter Company Register Number"
                    value={formData.ci.companyRegisterNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, ci: {
                        ...formData.ci,
                        companyRegisterNumber: e.target.value,
                      } })
                    }
                  />
                  {errors.companyRegisterNumber && <p className="text-red-600 font-light text-[11px]">{errors.companyRegisterNumber}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="localLang">Local Language</label>
                    <span className="text-gray-600">(Optional)</span>
                  </div>
                  <input
                    className="input input-bordered w-full mt-2 rounded"
                    placeholder="Enter Local Language"
                    value={formData.ci.localLang}
                    onChange={(e) =>
                      setFormData({ ...formData, ci: {
                        ...formData.ci,
                        localLang: e.target.value,
                      } })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="tradeName">Trade Name</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <input
                    className="input input-bordered w-full mt-2 rounded"
                    placeholder="Enter Trade Name"
                    value={formData.ci.tradeName}
                    onChange={(e) =>
                      setFormData({ ...formData, ci: {
                        ...formData.ci,
                        tradeName: e.target.value,
                      } })
                    }
                  />
                  {errors.tradeName && <p className="text-red-600 font-light text-[11px]">{errors.tradeName}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="SPT">Shipping Party Type</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <select
                    value={formData.ci.SPT}
                    onChange={(e) =>
                      setFormData({ ...formData, ci: {
                        ...formData.ci,
                        SPT: e.target.value,
                      } })
                    }
                    className="select select-bordered w-full mt-2 rounded text-[16px]"
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

                  {errors.SPT && <p className="text-red-600 font-light text-[11px]">{errors.SPT}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="CBT">Company Business Type</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <select
                    value={formData.ci.CBT}
                    onChange={(e) =>
                      setFormData({ ...formData, ci: {
                        ...formData.ci,
                        CBT: e.target.value,
                      } })
                    }
                    className="select select-bordered w-full mt-2 rounded text-[16px]"
                  >
                    <option value="" disabled selected>
                      Company Business Type
                    </option>
                    <option value="BCO">BCO</option>
                    <option value="NVOCC/OTI">NVOCC/OTI</option>
                    <option value="Logistics Service Providers">Logistics Service Providers</option>
                    <option value="Freight Management/Procurement">Freight Management/Procurement</option>
                  </select>

                  {errors.CBT && <p className="text-red-600 font-light text-[11px]">{errors.CBT}</p>}
                </div>
              </div>

              <div className="sm:w-[48%] space-y-2">
                <div className="space-y-2">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="address">Address</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <input
                    className="input input-bordered w-full mt-2 rounded"
                    placeholder="Enter Address"
                    value={formData.ci.address}
                    onChange={(e) =>
                      setFormData({ ...formData, ci: {
                        ...formData.ci,
                        address: e.target.value,
                      } })
                    }
                  />
                  {errors.address && <p className="text-red-600 font-light text-[11px]">{errors.address}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="city">City</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <input
                    className="input input-bordered w-full mt-2 rounded"
                    placeholder="Enter City"
                    value={formData.ci.city}
                    onChange={(e) =>
                      setFormData({ ...formData, ci: {
                        ...formData.ci,
                        city: e.target.value,
                      } })
                    }
                  />
                  {errors.city && <p className="text-red-600 font-light text-[11px]">{errors.city}</p>}
                </div>
                
                <div className="space-y-2">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="country">Country</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <select
                    value={formData.ci.country}
                    onChange={(e) =>
                      setFormData({ ...formData, ci: {
                        ...formData.ci,
                        country: e.target.value,
                      } })
                    }
                    className="select select-bordered w-full mt-2 rounded text-[16px]"
                  >
                    <option value="" disabled selected>
                      Country
                    </option>
                    {countries.map((ct) => 
                      <option key={ct.code} value={ct.name}>{ct.name}</option>
                    )}
                  </select>

                  {errors.country && <p className="text-red-600 font-light text-[11px]">{errors.country}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="zipCode">Zip Code</label>
                    <span className="text-gray-600">(Optional)</span>
                  </div>
                  <input
                    className="input input-bordered w-full mt-2 rounded"
                    placeholder="Enter Zip Code"
                    value={formData.ci.zipCode}
                    onChange={(e) =>
                      setFormData({ ...formData, ci: {
                        ...formData.ci,
                        zipCode: e.target.value,
                      } })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="department">Department</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <select
                    value={formData.ci.department}
                    onChange={(e) =>
                      setFormData({ ...formData, ci: {
                        ...formData.ci,
                        department: e.target.value,
                      } })
                    }
                    className="select select-bordered w-full mt-2 rounded text-[16px]"
                  >
                    <option value="" disabled selected>
                      Department
                    </option>
                    {departments.map((dp,idx) => 
                      <option key={idx} value={dp.name}>{dp.name}</option>
                    )}
                  </select>

                  {errors.department && <p className="text-red-600 font-light text-[11px]">{errors.department}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="trade">Trade</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <select
                    value={formData.ci.trade}
                    onChange={(e) =>
                      setFormData({ ...formData, ci: {
                        ...formData.ci,
                        trade: e.target.value,
                      } })
                    }
                    className="select select-bordered w-full mt-2 rounded text-[16px]"
                  >
                    <option value="" disabled selected>
                      Trade
                    </option>
                    {trades.map((td,idx) => 
                      <option key={idx} value={td.name}>{td.name}</option>
                    )}
                  </select>

                  {errors.trade && <p className="text-red-600 font-light text-[11px]">{errors.trade}</p>}
                </div>
              </div>
            </form>
          </>
        );

      case 3:
        return (
          <>
            <h2 className="text-center text-[24px] font-semibold text-[#4f9748] mb-4">
              Additional Information
            </h2>

            <form className="space-y-2 sm:space-y-0">
              <div className="space-y-2">
              <div className="space-y-2">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="contact">Contact CLN (Cambodia) Co., Ltd.</label>
                    <span className="text-red-600">*</span>
                  </div>
                  <select
                    value={formData.ai.contact}
                    onChange={(e) =>
                      setFormData({ ...formData, ai: {
                        ...formData.ai,
                        contact: e.target.value,
                      } })
                    }
                    className="select select-bordered w-full mt-2 rounded text-[16px]"
                  >
                    <option value="" disabled selected>
                      Contact
                    </option>
                    <option value="Contact CLN (CAMBODIA) CO., LTD.">
                      <span>Contact CLN (CAMBODIA) CO., LTD.</span>
                    </option>
                  </select>

                  {errors.contact && <p className="text-red-600 font-light text-[11px]">{errors.contact}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex flex-row gap-1">
                    <label htmlFor="comment">Comment</label>
                    <span className="text-gray-600">(Optional)</span>
                  </div>
                  <textarea
                    className="input input-bordered w-full mt-2 rounded"
                    value={formData.ai.comment}
                    onChange={(e) =>
                      setFormData({ ...formData, ai: {
                        ...formData.ai,
                        comment: e.target.value,
                      } })
                    }></textarea>
                </div>
              </div>
            </form>
          </>
        );

      case 4:
        return (
          <>
            <h2 className="text-center text-[24px] font-semibold text-[#4f9748] mb-4">
              Review Registration
            </h2>

            <div className="space-y-3 grid grid-cols-1 lg:grid-cols-2 gap-2 sm:space-y-0">
              <div className="bg-base-400 p-3 rounded text-sm shadow-[rgba(9,_30,_66,_0.25)_0px_4px_8px_-2px,_rgba(9,_30,_66,_0.08)_0px_0px_0px_1px]">
                <div>
                  <div className="flex justify-between items-center">
                    <h1 className="font-semibold text-[16px] mb-2 underline">User Information</h1>
                    <button onClick={() => handleTabClick(1)} className="p-1 bg-blue-50 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3fa24f" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-edit"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" /><path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415" /><path d="M16 5l3 3" /></svg>
                    </button>
                  </div>
                  <table className="table table-xs sm:table-md">
                    <thead>
                      <tr>
                        <th className="text-start">User Name</th>
                        <th className="text-end">Job Title</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{userInformation.uai.firstName + ' ' + userInformation.uai.lastName}</td>
                        <td className="text-end">{userInformation.uai.jobTitle}</td>
                      </tr>
                    </tbody>
                  </table>
                  <table className="table table-xs sm:table-md">
                    <thead>
                      <tr>
                        <th className="text-start">Phone Number</th>
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
                  <h1 className="font-semibold text-[16px] my-2 underline">Account Information</h1>
                  <table className="table table-xs sm:table-md">
                    <thead>
                      <tr>
                        <th className="text-start">Business</th>
                        <th className="text-end">User ID</th>
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

              <div className="bg-base-400 p-3 rounded text-sm shadow-[rgba(9,_30,_66,_0.25)_0px_4px_8px_-2px,_rgba(9,_30,_66,_0.08)_0px_0px_0px_1px]">
                <div>
                  <div className="flex justify-between items-center">
                    <h1 className="font-semibold text-[16px] mb-2 underline">Company Information</h1>
                    <button onClick={() => handleTabClick(2)}  className="p-1 bg-blue-50 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3fa24f" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-edit"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" /><path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415" /><path d="M16 5l3 3" /></svg>
                    </button>
                  </div>

                  <table className="table table-xs sm:table-md">
                    <thead>
                      <tr>
                        <th className="text-start">Company Name</th>
                        <th className="text-end">Local Language</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{userInformation.ci.companyName}</td>
                        <td className="text-end">{userInformation.ci.localLange || 'N/A'}</td>
                      </tr>
                    </tbody>
                  </table>

                  <table className="table table-xs sm:table-md">
                    <thead>
                      <tr>
                        <th className="text-start">Trade Name</th>
                        <th className="text-end">Shipping Party Type</th>
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
                        <th className="text-start">Company Business Type</th>
                        <th className="text-end">Address</th>
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
                        <th className="text-start">Address</th>
                        <th className="text-end">City</th>
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
                        <th className="text-start">Country</th>
                        <th className="text-end">Zip Code</th>
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
                        <th className="text-start">Country</th>
                        <th className="text-end">Zip Code</th>
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
                        <th className="text-start">Department</th>
                        <th className="text-end">Trade</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{userInformation.ci.department}</td>
                        <td className="text-end">{userInformation.ci.trade}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="lg:col-span-2 bg-base-400 p-3 rounded text-sm shadow-[rgba(9,_30,_66,_0.25)_0px_4px_8px_-2px,_rgba(9,_30,_66,_0.08)_0px_0px_0px_1px]">
                <div>
                  <div className="flex justify-between items-center">
                    <h1 className="font-semibold text-[16px] mb-2 underline">Addition Information</h1>
                    <button 
                    onClick={() => handleTabClick(3)} 
                    className="p-1 bg-blue-50 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3fa24f" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-edit"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" /><path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415" /><path d="M16 5l3 3" /></svg>
                    </button>
                  </div>
                  <table className="table table-xs sm:table-md">
                    <thead>
                      <tr>
                        <th className="text-start">Contact CLN (Cambodia) Co., Ltd.</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{userInformation.ai.contact}</td>
                      </tr>
                    </tbody>
                  </table>
                  {userInformation.comment && 
                    <table className="table table-xs sm:table-md">
                      <thead>
                        <tr>
                          <th className="text-start">Comment</th>
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
                    }
                </div>
              </div>
            </div>

            <div className="w-full flex flex-row gap-2 justify-end overflow-hidden">
                        <button onClick={handlePrevious} className="px-3 py-1 text-[16px] sm:text-[18px] rounded text-[#ee3a23] mt-2 hover:text-[#ee3a23]/80 transition-all duration-200 float-right">
                          Previous
                        </button>
                        <button
                      disabled={loading} // disable when loading
                      onClick={handleSubmit}
                      className="px-3 py-1 text-[16px] sm:text-[18px] rounded bg-[#4fb748] text-white mt-2 hover:bg-[#4fb748]/80 transition-all duration-200 float-right"
                    >
                      {loading ? "Submitting..." : "Submit"}
                    </button>
            </div>
          </>
        );

      default:
        return null;
    }
  };


  /* ---------------- UI ---------------- */
  return (
    <section className="flex flex-col lg:flex-row w-full mx-auto">
      <div className="lg:w-1/2">
        <img
          src={Banner}
          alt=""
          className="h-[30vh] md:h-full w-full object-cover"
        />
      </div>

      <div className="lg:w-1/2 p-3 ">
        <h1 className="text-xl font-bold text-center text-gray-900 mb-4 uppercase">
          Welcome to CLN (CAMBODIA) CO., LTD.
        </h1>

        {/* STEPS */}
        <ul className="steps w-full mb-6 ">
          {[
            { id: 1, name: "User & Account Info" },
            { id: 2, name: "Company Info" },
            { id: 3, name: "Additional Info" },
            { id: 4, name: "Review Registration" },
          ].map((step) => (
            <li
              key={step.id}
              onClick={() => handleTabClick(step.id)}
              // Show tick if completed, otherwise show step number
              data-content={completedSteps.includes(step.id) ? "✓" : step.id}
              className={`step ${
                  activeTab && completedSteps.includes(step.id) 
                  ? "step-primary !text-primary" // Completed step style
                  : activeTab === step.id
                  ? "step-primary"             // Active step style
                  : ""                      // Future/uncompleted steps
              }`}
            >
                {step.name}
            </li>
          ))}
        </ul>


        {/* CONTENT */}
        <div className="border rounded border-[#4f9748] px-4 pt-4 pb-6 bg-green-50">
          {renderContent()}
        </div>

        {/* NEXT */}
        {activeTab < 4 && (
            <div className="w-full flex flex-row gap-2 justify-end overflow-hidden">
                {activeTab > 2 && 
                  <button onClick={handlePrevious} className="px-3 py-1 text-[16px] sm:text-[18px] rounded text-[#ee3a23] mt-2 hover:text-[#ee3a23]/80 transition-all duration-200 float-right">
                    Previous
                  </button>
                }
                <button
                    onClick={handleNext}
                    className="px-3 py-1 text-[16px] sm:text-[18px] rounded bg-[#4fb748] text-white mt-2 hover:bg-[#4fb748]/80 transition-all duration-200 float-right"
                  >
                    Next
                </button>
            </div>
        )}
      </div>
    </section>
  );
}
