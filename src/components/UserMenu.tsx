import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { logout } from "../authService";
import { getUser } from "../authStorage";
import type { DecodeToken } from "../types/auth";
import Profiles from "./profile/Profile";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState<DecodeToken>();
  const handleLogout = async () => {
    try {
      const res = await logout();

      if (!res.msg) {
        Swal.fire("Logout Failed", res.msg ?? "Unknown error", "error");
        return;
      }
      navigate("/");
      Swal.fire({
        icon: "success",
        title: res.msg,
        timer: 1500,
        showConfirmButton: false,
      });
     
    } catch (err: unknown) {
      Swal.fire(
        "Error",
        err instanceof Error ? err.message : "Unknown error occurred",
        "error"
      );
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".user-menu-dropdown")) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);
  // ✅ Proper async call inside useEffect
  useEffect(() => {
    const fetchUser = async () => {
      const userToken = await getUser();
      setUser(userToken);
    };
    fetchUser();
  }, []);
  
  return (
    <div className="relative inline-block text-left user-menu-dropdown">
      {/* Button */}
      <button
        
        onClick={() => setOpen(!open)}
        className="flex flex-row items-center gap-2 focus:outline-none lg:text-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-[28px] h-[28px] md:w-[32px] md:h-[32px] icon icon-tabler icons-tabler-outline icon-tabler-user-circle"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
          <path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
          <path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855" />
        </svg>
        <span className="font-ligth text-[18px]">{user?.username ?? "Guest"}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-[90]">
          <div className="py-1">
            {user ? (
              <>
                <Profiles />

                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/auth/login"
                  className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/auth/sign-up"
                  className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
