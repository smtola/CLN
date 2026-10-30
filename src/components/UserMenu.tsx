import { useState, useEffect, useRef } from "react";
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
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      const res = await logout();

      if (!res.msg) {
        Swal.fire("Logout Failed", res.msg ?? "Unknown error", "error");
        return;
      }
      setOpen(false);
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

  // Close on Escape for accessibility
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Proper async call inside useEffect
  useEffect(() => {
    const fetchUser = async () => {
      const userToken = await getUser();
      setUser(userToken);
    };
    fetchUser();
  }, []);

  return (
    <div className="relative inline-block text-left user-menu-dropdown" ref={menuRef}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="group flex flex-row items-center gap-2.5 rounded-full px-2 py-1 transition-colors duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 lg:text-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-[28px] h-[28px] md:w-[32px] md:h-[32px] icon icon-tabler icons-tabler-outline icon-tabler-user-circle transition-transform duration-200 group-hover:scale-105"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
          <path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
          <path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855" />
        </svg>

        <span className="font-light text-[18px] leading-none">
          {user?.username ?? "Guest"}
        </span>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${
            open ? "rotate-180" : "rotate-0"
          }`}
        >
          <path d="M6 9l6 6l6 -6" />
        </svg>
      </button>

      {/* Dropdown */}
      <div
        role="menu"
        className={`absolute right-0 z-[90] mt-2 w-56 origin-top-right rounded-xl bg-white shadow-lg shadow-black/10 ring-1 ring-black/5 transition-all duration-150 ease-out ${
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
        }`}
      >
        {user ? (
          <>
            {/* Identity header */}
            <div className="px-4 py-3">
              <p className="text-[11px] uppercase tracking-wide text-gray-400">
                Signed in as
              </p>
              <p className="truncate text-sm font-medium text-gray-900">
                {user.username}
              </p>
            </div>

            <div className="h-px bg-gray-100" />

            <div className="py-1.5">
              <div className="px-1.5">
                <Profiles />
              </div>

              <button
                onClick={handleLogout}
                role="menuitem"
                className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-gray-700 transition-colors duration-150 hover:bg-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-gray-400"
                >
                  <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                  <path d="M9 12h12l-3 -3" />
                  <path d="M18 15l3 -3" />
                </svg>
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="py-1.5">
            <NavLink
              to="/auth/login"
              role="menuitem"
              className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-gray-700 transition-colors duration-150 hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-gray-400"
              >
                <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                <path d="M20 12h-13l3 -3" />
                <path d="M10 15l-3 -3" />
              </svg>
              Login
            </NavLink>
            <NavLink
              to="/auth/sign-up"
              role="menuitem"
              className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-gray-700 transition-colors duration-150 hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-gray-400"
              >
                <path d="M8 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
                <path d="M6 21v-2a4 4 0 0 1 4 -4h4" />
                <path d="M19 16v6" />
                <path d="M16 19h6" />
              </svg>
              Register
            </NavLink>
          </div>
        )}
      </div>
    </div>
  );
}