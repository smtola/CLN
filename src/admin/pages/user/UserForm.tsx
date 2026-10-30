import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getUserById,
  createUser,
  updateUser,
} from "../../services/userService";
import type { UserType, Profile } from "../../../types/auth";
import { showError, showSuccess, getApiErrorMessage } from "../../utils/swalHelper";
import { useNavigate } from "react-router-dom";
import { UserRound, Building2, MessageSquareText, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";

type FieldConfig = {
  name: string;
  label: string;
  type?: "text" | "email" | "number" | "checkbox" | "select";
  options?: { label: string; value: string }[];
};

type FieldSection = {
  title: string;
  icon: React.ElementType;
  fields: FieldConfig[];
};

const sections: FieldSection[] = [
  {
    title: "Personal information",
    icon: UserRound,
    fields: [
      { name: "uai.firstName", label: "First name" },
      { name: "uai.lastName", label: "Last name" },
      { name: "uai.jobTitle", label: "Job title" },
      { name: "uai.phoneNumber", label: "Phone number" },
      { name: "uai.businessEmail", label: "Business email", type: "email" },
    ],
  },
  {
    title: "Company information",
    icon: Building2,
    fields: [
      { name: "ci.companyName", label: "Company name" },
      { name: "ci.companyRegisterNumber", label: "Company reg. number" },
      { name: "ci.city", label: "Company city" },
      { name: "ci.country", label: "Company country" },
    ],
  },
  {
    title: "Additional information",
    icon: MessageSquareText,
    fields: [
      { name: "ai.contact", label: "Contact" },
      { name: "ai.comment", label: "Comment" },
    ],
  },
  {
    title: "Account",
    icon: ShieldCheck,
    fields: [
      {
        name: "role",
        label: "Role",
        type: "select",
        options: [
          { label: "User", value: "USER" },
          { label: "Admin", value: "ADMIN" },
        ],
      },
      { name: "is_verified", label: "Verified", type: "checkbox" },
    ],
  },
];

const getNested = (obj: unknown, path: string) => {
  if (obj === null || obj === undefined) return "";
  return path.split(".").reduce((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return "";
  }, obj as unknown);
};

const setNested = (obj: unknown, path: string, value: unknown) => {
  if (!obj || typeof obj !== "object") return;

  const keys = path.split(".");
  let temp = obj as Record<string, unknown>;

  keys.forEach((key, idx) => {
    if (idx === keys.length - 1) {
      temp[key] = value;
    } else {
      if (!temp[key] || typeof temp[key] !== "object") {
        temp[key] = {};
      }
      temp = temp[key] as Record<string, unknown>;
    }
  });
};

const defaultFormData: Profile = {
  uai: {
    firstName: "",
    lastName: "",
    businessEmail: "",
    userId: "",
    pwd: "",
    cpwd: "",
    jobTitle: "",
    phoneNumber: "",
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
  role: "USER",
  local_ip: "",
  is_verified: false,
};

export type UpdateUserPayload = {
  uai?: {
    firstName?: string;
    lastName?: string;
    jobTitle?: string;
    phoneNumber?: string;
    businessEmail?: string;
    userId?: string;
  };
  ci?: Partial<UserType["ci"]>;
  ai?: Partial<UserType["ai"]>;
  role?: "USER" | "ADMIN";
  is_deleted?: boolean;
};

const UserForm = () => {
  const [user, setUser] = useState<Profile>(defaultFormData);
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const payload: UpdateUserPayload = {
    uai: {
      firstName: user.uai.firstName,
      lastName: user.uai.lastName,
      jobTitle: user.uai.jobTitle,
      phoneNumber: user.uai.phoneNumber,
      businessEmail: user.uai.businessEmail,
      userId: user.uai.userId,
    },
    ci: user.ci,
    ai: user.ai,
    role: user.role,
  };

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        setLoading(true);

        const res = await getUserById(id);

        // This is your actual response format
        if (res && res.status && res.data) {
          setUser(res.data); // <-- set user with Profile object
        } else {
          console.error('Invalid response format:', res);
          setUser(defaultFormData);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        showError("Failed to load user", getApiErrorMessage(err, "Could not load this user. Please try again."));
        setUser(defaultFormData);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleChange = (name: string, value: unknown) => {
    const newUser = structuredClone(user) as Profile;
    setNested(newUser, name, value);
    setUser(newUser);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        const res = await updateUser(id, payload);
        showSuccess(res.msg);
      } else {
        await createUser(user as unknown as UserType);
        showSuccess("Created!");
      }
    } catch (err) {
      console.error(err);
      showError("Failed!", getApiErrorMessage(err, "Failed to save user. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-6 w-full md:mt-8">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-8px_rgba(16,24,40,0.10)] md:rounded-3xl">
        <div className="h-1 w-full bg-gradient-to-r from-teal-600 via-sky-500 to-blue-600" />

        <div className="p-4 md:p-8">
          <div className="mb-6 flex items-center gap-3 md:mb-8">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-blue-600 text-white shadow-md shadow-blue-600/20 md:h-12 md:w-12">
              <UserRound className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
                {id ? "Edit user" : "Add user"}
              </h1>
              <p className="text-sm text-slate-500">
                {id ? "Update this account's information." : "Fill in the details to create a new account."}
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.title}>
                  <div className="mb-4 flex items-center gap-2">
                    <Icon className="h-4 w-4 text-teal-600" />
                    <h2 className="text-sm font-semibold text-slate-700">{section.title}</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                    {section.fields.map((field) => (
                      <div key={field.name}>
                        {field.type === "checkbox" ? (
                          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5">
                            <input
                              type="checkbox"
                              checked={!!getNested(user, field.name)}
                              onChange={(e) => handleChange(field.name, e.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-4 focus:ring-teal-500/20"
                            />
                            <span className="text-sm font-medium text-slate-700">{field.label}</span>
                          </label>
                        ) : (
                          <>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                              {field.label}
                            </label>
                            {field.type === "select" ? (
                              <select
                                value={getNested(user, field.name) as string}
                                onChange={(e) => handleChange(field.name, e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-all duration-150 hover:border-slate-300 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 md:text-base"
                              >
                                {field.options?.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={field.type || "text"}
                                value={getNested(user, field.name) as string | number | ""}
                                onChange={(e) => handleChange(field.name, e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-all duration-150 hover:border-slate-300 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 md:text-base"
                              />
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() => navigate('/admin/user')}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-600/20 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:translate-y-0 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Saving…" : id ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default UserForm;