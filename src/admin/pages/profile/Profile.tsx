import { useEffect, useState } from "react";
import { getUser } from "../../../authStorage";
import type { DecodeToken } from "../../../types/auth";
import { changePassword, changeRole, checkPassword } from "../../../authService";
import { showError, showSuccess } from "../../../admin/utils/swalHelper";
import { Eye, EyeOff, ShieldCheck, ShieldAlert, KeyRound, UserRound, Pencil, X } from "lucide-react";
import { useParams } from "react-router-dom";
import PasswordStrengthInput from "../../../components/PasswordStrengthInput";

interface ShowPassword {
  current: boolean;
  confirm: boolean;
}

const defaultData = {
  uai: {
    current_password: "",
    new_password: "",
    confirm_password: "",
  },
};

const Profile = () => {
  const [user, setUser] = useState<DecodeToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState<ShowPassword>({
    current: false,
    confirm: false,
  });
  const { id } = useParams<{ id: string }>();
  const [passwordValid, setPasswordValid] = useState<boolean | null>(null);
  const [formData, setFormData] = useState(defaultData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingRole, setEditingRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"USER" | "ADMIN">("USER");
  const [roleLoading, setRoleLoading] = useState(false);
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userToken = await getUser();
        setUser(userToken);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  useEffect(() => {
    if (user?.role) {
      setSelectedRole(user.role as "USER" | "ADMIN");
    }
  }, [user]);

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
      const result = await checkPassword(formData.uai.current_password);

      if ("valid" in result && result.valid) {
        if (!validation()) return;
        setPasswordValid(true);
        console.log(
          "Current password correct. Proceed to change password:",
          formData.uai.new_password
        );
        // TODO: Call your "change password" API here
        // Step 3: Call change-password API
        const result = await changePassword(
          formData.uai.current_password,
          formData.uai.new_password,
          formData.uai.confirm_password
        );

        if (result.status) {
          showSuccess("Password changed successfully!");
          setFormData(defaultData);
        } else {
          showError(result.msg || "Failed to change password");
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

  /*----------------- Role --------------------------*/
  const handleUpdateRole = async () => {
    if (!user?.sub || !selectedRole) return;

    setRoleLoading(true);
    try {
      const res = await changeRole(user.sub, selectedRole);

      if (res.status) {
        showSuccess("Role updated successfully");

        setUser((prev) =>
          prev
            ? {
                ...prev,
                role: selectedRole,
              }
            : prev
        );

        setEditingRole(false);
      } else {
        showError(res.message || "Failed to update role");
      }
    } catch {
      showError("Something went wrong");
    } finally {
      setRoleLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-teal-600" />
          <p className="text-sm text-slate-500">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-3 md:p-6">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
          <p className="text-sm font-medium text-red-600">Unable to load profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">My profile</h1>
        <p className="mt-1 text-sm text-slate-500 md:text-base">Manage your account information here.</p>
      </div>

      {/* Identity card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm md:rounded-3xl">
        <div className="h-1 w-full bg-gradient-to-r from-teal-600 via-sky-500 to-blue-600" />

        <div className="p-4 md:p-8">
          <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center md:mb-8 md:gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-blue-600 text-2xl font-semibold text-white shadow-md shadow-blue-600/20 ring-4 ring-white md:h-24 md:w-24 md:text-3xl">
              {user.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-semibold text-slate-900 md:text-2xl">{user.username}</h2>
              <p className="break-all text-sm text-slate-500 md:text-base">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <label className="text-xs font-medium text-slate-400">Username</label>
              <p className="mt-1.5 text-base font-medium text-slate-900 md:text-lg">{user.username}</p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <label className="text-xs font-medium text-slate-400">Email</label>
              <p className="mt-1.5 break-all text-base font-medium text-slate-900 md:text-lg">{user.email}</p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <label className="text-xs font-medium text-slate-400">Role</label>

              {/* VIEW MODE */}
              {isAdmin && !editingRole && (
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium md:text-sm ${
                      user.role === "ADMIN"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {user.role || "USER"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingRole(true)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 transition-colors duration-150 hover:text-teal-800"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </button>
                </div>
              )}

              {!isAdmin && !editingRole && (
                <p className="mt-2">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 md:text-sm">
                    {user.role || "USER"}
                  </span>
                </p>
              )}

              {/* EDIT MODE */}
              {editingRole && (
                <div className="mt-3 space-y-2.5">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as "USER" | "ADMIN")}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-all duration-150 hover:border-slate-300 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleUpdateRole}
                      disabled={roleLoading || selectedRole === user.role}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-teal-600 to-blue-600 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:shadow-md disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
                    >
                      {roleLoading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
                      {roleLoading ? "Updating…" : "Update"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingRole(false);
                        setSelectedRole(user.role);
                      }}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-slate-50"
                    >
                      <X className="h-3.5 w-3.5" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <label className="text-xs font-medium text-slate-400">Verification status</label>
              <p className="mt-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium md:text-sm ${
                    user.isVerify ? "bg-teal-50 text-teal-700" : "bg-red-50 text-red-700"
                  }`}
                >
                  {user.isVerify ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
                  {user.isVerify ? "Verified" : "Not verified"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Password card */}
      <div className="relative mt-6 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm md:mt-8 md:rounded-3xl">
        <div className="h-1 w-full bg-gradient-to-r from-teal-600 via-sky-500 to-blue-600" />

        <div className="p-4 md:p-8">
          <div className="mb-5 flex items-center gap-3 md:mb-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-blue-600 text-white shadow-md shadow-blue-600/20">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 md:text-lg">Change password</h3>
              <p className="text-sm text-slate-500">Choose a strong password you haven't used elsewhere.</p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            {/* Current password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Current password</label>
              <div className="relative">
                <input
                  type={showPassword.current ? "text" : "password"}
                  placeholder="Enter your current password"
                  value={formData.uai.current_password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      uai: { ...formData.uai, current_password: e.target.value },
                    })
                  }
                  className={`w-full rounded-xl border px-3.5 py-2.5 pr-11 text-sm text-slate-900 shadow-sm transition-all duration-150 focus:outline-none focus:ring-4 md:text-base ${
                    passwordValid === false
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                      : "border-slate-200 hover:border-slate-300 focus:border-teal-500 focus:ring-teal-500/10"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => ({ ...prev, current: !prev.current }))}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 transition-colors duration-150 hover:text-slate-600"
                >
                  {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.current_password && (
                <p className="text-sm text-red-600">{errors.current_password}</p>
              )}
            </div>

            {/* New password — now actually wired to PasswordStrengthInput */}
            <PasswordStrengthInput
              id="new_password"
              label="New password"
              value={formData.uai.new_password}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  uai: { ...formData.uai, new_password: value },
                })
              }
              disallowedValues={[user.username, user.email]}
              error={errors.new_password}
            />

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Confirm password</label>
              <div className="relative">
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  placeholder="Re-enter your new password"
                  value={formData.uai.confirm_password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      uai: { ...formData.uai, confirm_password: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 pr-11 text-sm text-slate-900 shadow-sm transition-all duration-150 hover:border-slate-300 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 md:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 transition-colors duration-150 hover:text-slate-600"
                >
                  {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="text-sm text-red-600">{errors.confirm_password}</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-600/20 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:translate-y-0 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none md:text-base"
            >
              {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {loading ? "Processing…" : "Change password"}
            </button>
          </form>
        </div>
      </div>

      {/* Info footer */}
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4 md:mt-8 md:p-5">
        <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        <p className="text-sm text-slate-500">
          For security reasons, some account settings can only be changed by administrators.
          If you need to update your information, please contact your system administrator.
        </p>
      </div>
    </div>
  );
};

export default Profile;