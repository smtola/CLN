import { useEffect, useState } from "react";
import { getUser } from "../../../authStorage";
import type { DecodeToken } from "../../../types/auth";
import { changePassword, changeRole, checkPassword } from "../../../authService";
import { showError, showSuccess } from "../../../admin/utils/swalHelper";
import { Eye, EyeOff } from "lucide-react";
import { useParams } from "react-router-dom";
interface ShowPassword {
  current: boolean;
  new: boolean;
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
    new: false,
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
                  role: selectedRole, // ✅ now guaranteed string
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">Unable to load profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-600 mt-2 text-sm md:text-base">Manage your account information here.</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 md:px-6 py-6 md:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl md:text-3xl font-bold flex-shrink-0">
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">{user.username}</h2>
              <p className="text-sm md:text-base text-gray-600 break-all">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide">Username</label>
              <p className="mt-2 text-base md:text-lg text-gray-900">{user.username}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide">Email</label>
              <p className="mt-2 text-base md:text-lg text-gray-900 break-all">{user.email}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide">
                Role
              </label>

              {/* VIEW MODE */}
              {isAdmin && !editingRole && (
                <p className="mt-2">
                  <span
                    onClick={() => setEditingRole(true)}
                    className={`px-3 py-1 inline-flex text-xs md:text-sm leading-5 font-semibold rounded-full cursor-pointer transition ${
                      user.role === "ADMIN"
                        ? "bg-purple-100 text-purple-800 hover:bg-purple-200"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {user.role || "USER"}
                  </span>
                  <span className="ml-2 text-xs text-gray-400">
                    (click to edit)
                  </span>
                </p>
              )}

            {/* EDIT MODE */}
            {editingRole && (
              <div className="mt-3 space-y-2">
                <select
                  value={selectedRole}
                  onChange={(e) =>
                    setSelectedRole(e.target.value as "USER" | "ADMIN")
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleUpdateRole}
                    disabled={roleLoading || selectedRole === user.role}
                    className={`flex-1 py-2 rounded-lg text-white text-sm font-semibold ${
                      roleLoading || selectedRole === user.role
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {roleLoading ? "Updating..." : "Update"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingRole(false);
                      setSelectedRole(user.role);
                    }}
                    className="flex-1 py-2 rounded-lg border text-sm font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>


            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide">Verification Status</label>
              <p className="mt-2">
                <span className={`px-3 py-1 inline-flex text-xs md:text-sm leading-5 font-semibold rounded-full ${
                  user.isVerify 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.isVerify ? 'Verified' : 'Not Verified'}
                </span>
              </p>
            </div>
          </div>

          {/* ---------------- Current Password ---------------- */}
          <div className="p-3 rounded">
          <hr className="my-2 sm:hidden" />
            <form className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-md font-semibold text-gray-400">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.current ? "text" : "password"}
                        placeholder="Current Password"
                        value={formData.uai.current_password}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            uai: {
                              ...formData.uai,
                              current_password: e.target.value,
                            },
                          })
                        }
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-gray-200 text-black ${
                          passwordValid === false
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowPassword((prev) => ({
                            ...prev,
                            current: !prev.current,
                          }));
                        }}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                      >
                        {showPassword.current ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {errors.current_password && (
                      <p className="text-red-600 text-md">
                        {errors.current_password}
                      </p>
                    )}
                  </div>

                  {/* ---------------- New Password ---------------- */}
                  <div className="space-y-2">
                    <label className="text-md font-semibold text-gray-400">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.new ? "text" : "password"}
                        placeholder="New Password"
                        value={formData.uai.new_password}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            uai: { ...formData.uai, new_password: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-gray-200 text-black"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowPassword((prev) => ({ ...prev, new: !prev.new }));
                        }}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                      >
                        {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.new_password && (
                      <p className="text-red-600 text-md">{errors.new_password}</p>
                    )}
                  </div>

                  {/* ---------------- confirm Password ---------------- */}
                  <div className="space-y-2">
                    <label className="text-md font-semibold text-gray-400">
                      confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.confirm ? "text" : "password"}
                        placeholder="confirm Password"
                        value={formData.uai.confirm_password}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            uai: { ...formData.uai, confirm_password: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-gray-200 text-black"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowPassword((prev) => ({
                            ...prev,
                            confirm: !prev.confirm,
                          }));
                        }}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                      >
                        {showPassword.confirm ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {errors.confirm_password && (
                      <p className="text-red-600 text-md">{errors.confirm_password}</p>
                    )}
                  </div>

                  {/* ---------------- Submit Button ---------------- */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSubmit();
                    }}
                    disabled={loading}
                    className={`w-full py-2 rounded-lg text-white font-semibold transition my-2 ${
                      loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#4F9848]/80 hover:bg-[#4F9848]"
                    }`}
                  >
                    {loading ? "Processing..." : "Change"}
                  </button>
            </form>
          </div>

          <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Account Information</h3>
            <p className="text-xs md:text-sm text-gray-600">
              For security reasons, some account settings can only be changed by administrators.
              If you need to update your information, please contact your system administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
  