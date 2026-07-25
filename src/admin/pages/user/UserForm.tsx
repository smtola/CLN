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

type FieldConfig = {
  name: string;
  label: string;
  type?: "text" | "email" | "number" | "checkbox" | "select";
  options?: { label: string; value: string }[]; 
};

const fields: FieldConfig[] = [
  { name: "uai.firstName", label: "First Name" },
  { name: "uai.lastName", label: "Last Name" },
  { name: "uai.jobTitle", label: "Job Title" },
  { name: "uai.phoneNumber", label: "Phone Number" },
  { name: "uai.businessEmail", label: "Business Email" },

  { name: "ci.companyName", label: "Company Name" },
  { name: "ci.companyRegisterNumber", label: "Company Reg. Number" },
  { name: "ci.city", label: "Company City" },
  { name: "ci.country", label: "Company Country" },

  { name: "ai.contact", label: "Contact" },
  { name: "ai.comment", label: "Comment" },

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
  is_deleted?:boolean;
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
          setUser(res.data);   // <-- set user with Profile object
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
    <form onSubmit={handleSubmit} className="w-full mx-auto p-6 bg-white rounded-2xl mt-[2rem]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {fields.map((field) => (
          <div key={field.name} className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
            </label>

            <div className="flex">
              {field.type === "checkbox" ? (
                <input
                  type="checkbox"
                  checked={!!getNested(user, field.name)}
                  onChange={(e) => handleChange(field.name, e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              ) : field.type === "select" ? (
                <select
                  value={getNested(user, field.name) as string}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-fit px-4 py-2 float-end rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
      >
        {id ? "Update" : "Create"}
      </button>

      <button
        type="button"
        onClick={() => navigate('/admin/user')}
        className="w-fit px-4 py-2 float-end mr-3 rounded text-red-600 font-semibold hover:bg-red-50 transition disabled:opacity-50"
      >
        Back
      </button>
    </form>

  );
};

export default UserForm;
