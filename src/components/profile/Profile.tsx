import { Eye, EyeOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { changePassword, checkPassword, fetchProfile } from "../../authService";
import type { Profile } from "../../types/auth";
import { showError, showSuccess } from "../../admin/utils/swalHelper";

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

  return (
    <div>
      <button
        className="block w-full text-center font-bold border-b px-4 py-2 text-md text-blue-700 hover:bg-blue-100"
        onClick={() => modalRef.current?.showModal()}
      >
        Profile
      </button>

      <dialog ref={modalRef} className="modal rounded">
        <div className="modal-box w-11/12 max-w-5xl ">
          <h3 className="font-bold text-xl text-center mb-4">
              User & Account Information
          </h3>{" "}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* User & Account Information */}{" "}
            <div className="shadow-[rgba(9,_30,_66,_0.25)_0px_4px_8px_-2px,_rgba(9,_30,_66,_0.08)_0px_0px_0px_1px] p-3 rounded">
              <ul className="flex flex-row items-start">
                {" "}
                <li className="w-[60%] mx-auto">
                  {" "}
                  <h1 className="text-md font-semibold text-gray-400">
                    First Name
                  </h1>{" "}
                  <p className="text-md font-light text-gray-900">{users?.uai.firstName}</p>{" "}
                </li>{" "}
                <li className="w-[40%] mx-auto">
                  {" "}
                  <h1 className="text-start text-md font-semibold text-gray-400">
                    Last Name
                  </h1>{" "}
                  <p className="text-md font-light text-gray-900">{users?.uai.lastName}</p>{" "}
                </li>{" "}
              </ul>{" "}
              <ul className="flex flex-row items-start">
                {" "}
                <li className="w-[60%] mx-auto">
                  {" "}
                  <h1 className="text-start text-md font-semibold text-gray-400">
                    Job Title
                  </h1>{" "}
                  <p className="text-md font-light text-gray-900">{users?.uai.jobTitle}</p>{" "}
                </li>{" "}
                <li className="w-[40%] mx-auto">
                  {" "}
                  <h1 className="text-start text-md font-semibold text-gray-400">
                    Phone Number
                  </h1>{" "}
                  <p className="text-md font-light text-gray-900">{users?.uai.phoneNumber}</p>{" "}
                </li>{" "}
              </ul>{" "}
              <ul className="flex flex-row items-start">
                {" "}
                <li className="w-[60%] mx-auto">
                  {" "}
                  <h1 className="text-start text-md font-semibold text-gray-400">
                    Business Email
                  </h1>{" "}
                  <p className="text-md font-light text-gray-900">
                  {users?.uai.businessEmail}
                  </p>{" "}
                </li>{" "}
                <li className="w-[40%] mx-auto">
                  {" "}
                  <h1 className="text-start text-md font-semibold text-gray-400">
                    User ID
                  </h1>{" "}
                  <p className="text-md font-light text-gray-900">{users?.uai.userId}</p>{" "}
                </li>{" "}
              </ul>{" "}
            </div>
            
            {/* ---------------- Current Password ---------------- */}
          <div className="shadow-[rgba(9,_30,_66,_0.25)_0px_4px_8px_-2px,_rgba(9,_30,_66,_0.08)_0px_0px_0px_1px] p-3 rounded">
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

            
            {/* Company Information */}{" "}
            <div className=" md:col-span-2 shadow-[rgba(9,_30,_66,_0.25)_0px_4px_8px_-2px,_rgba(9,_30,_66,_0.08)_0px_0px_0px_1px] p-3 rounded">
            <hr className="my-2 sm:hidden" />
              <ul className="flex flex-row items-start">
                {" "}
                <li className="w-[60%] mx-auto">
                  {" "}
                  <h1 className="text-start text-md font-semibold text-gray-400">
                    Company Name
                  </h1>{" "}
                  <p className="text-md font-light text-gray-900">{users?.ci.companyName}</p>{" "}
                </li>{" "}
                <li className="w-[40%] mx-auto">
                  {" "}
                  <h1 className="text-start text-md font-semibold text-gray-400">
                    Local Language
                  </h1>{" "}
                  <p className="text-md font-light text-gray-900">{users?.ci.localLang}</p>{" "}
                </li>{" "}
              </ul>{" "}
              <ul className="flex flex-row items-start">
                {" "}
                <li className="w-[60%] mx-auto">
                  {" "}
                  <h1 className="text-start text-md font-semibold text-gray-400">
                    Trade Name
                  </h1>{" "}
                  <p className="text-md font-light text-gray-900">{users?.ci.tradeName}</p>{" "}
                </li>{" "}
                <li className="w-[40%] mx-auto">
                  {" "}
                  <h1 className="text-start text-md font-semibold text-gray-400">
                    Shipping Party Type
                  </h1>{" "}
                  <p className="text-md font-light text-gray-900">{users?.ci.SPT}</p>{" "}
                </li>{" "}
              </ul>{" "}
              <ul className="flex flex-row items-start">
                {" "}
                <li className="w-[60%] mx-auto">
                  {" "}
                  <h1 className="text-start text-md font-semibold text-gray-400">
                    Company Business Type
                  </h1>{" "}
                  <p className="text-md font-light text-gray-900">{users?.ci.CBT}</p>{" "}
                </li>{" "}
                <li className="w-[40%] mx-auto">
                  {" "}
                  <h1 className="text-start text-md font-semibold text-gray-400">
                    Address
                  </h1>{" "}
                  <p className="text-md font-light text-gray-900">{users?.ci.address}</p>{" "}
                </li>{" "}
              </ul>{" "}
              <ul className="flex flex-row items-start">
                {" "}
                <li className="w-[60%] mx-auto">
                  {" "}
                  <h1 className="text-start text-md font-semibold text-gray-400">
                    City
                  </h1>{" "}
                  <p className="text-md font-light text-gray-900">{users?.ci.city}</p>{" "}
                </li>{" "}
                <li className="w-[40%] mx-auto">
                  {" "}
                  <h1 className="text-start text-md font-semibold text-gray-400">
                    Country
                  </h1>{" "}
                  <p className="text-md font-light text-gray-900">{users?.ci.country}</p>{" "}
                </li>{" "}
              </ul>{" "}
              <ul className="flex flex-row items-start">
                {" "}
                <li className="w-[60%] mx-auto">
                  {" "}
                  <h1 className="text-start text-md font-semibold text-gray-400">
                    Zip Code
                  </h1>{" "}
                  <p className="text-md font-light text-gray-900">{users?.ci.zipCode}</p>{" "}
                </li>{" "}
                <li className="w-[40%] mx-auto">
                  {" "}
                  <h1 className="text-start text-md font-semibold text-gray-400">
                    Department
                  </h1>{" "}
                  <p className="text-md font-light text-gray-900">{users?.ci.department}</p>{" "}
                </li>{" "}
              </ul>{" "}
              <ul className="flex flex-row items-start">
                {" "}
                <li className="w-[100%] mx-auto">
                  {" "}
                  <h1 className="text-start text-md font-semibold text-gray-400">
                    Trade
                  </h1>{" "}
                  <p className="text-md font-light text-gray-900">{users?.ci.trade}</p>{" "}
                </li>{" "}
              </ul>{" "}
            </div>
          </div>
          <div className="modal-action border-t pt-3 sm:border-0">
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
