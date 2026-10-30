import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { logout } from "../../authService";
import Swal from "sweetalert2";

const AdminNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };
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
  const navLinks = [
    { to: "/admin", label: "Dashboard", end: true },
    { to: "/admin/category", label: "Category" },
    { to: "/admin/product", label: "Product" },
    { to: "/admin/service", label: "Service" },
    { to: "/admin/seo", label: "SEO" },
    { to: "/admin/rate", label: "Rate" },
    { to: "/admin/port", label: "Port" },
    { to: "/admin/quote-history", label: "Quote History" },
    { to: "/admin/profile", label: "Profile" },
    { to: "/admin/user", label: "User" },
    { to: "/admin/trash", label: "Trash" },
  ];

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={toggleMenu}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
        className="fixed left-4 top-4 z-50 rounded-lg bg-[#c4ffc0] p-2 text-[#4FB748] shadow-lg transition-colors duration-200 hover:bg-[#b0e8ac] active:scale-95 md:hidden"
      >
        <div className="relative h-6 w-6">
          <svg
            className={`absolute inset-0 h-6 w-6 transition-all duration-200 ${
              isOpen ? "rotate-45 scale-75 opacity-0" : "rotate-0 scale-100 opacity-100"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          <svg
            className={`absolute inset-0 h-6 w-6 transition-all duration-200 ${
              isOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-45 scale-75 opacity-0"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
      </button>

      {/* Backdrop for Mobile — always mounted, fades via opacity so it never pops */}
      <div
        onClick={closeMenu}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 md:hidden ${
          isOpen ? "pointer-events-auto opacity-50" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Sidebar Navigation */}
      <nav
        className={`
          fixed
          left-0 top-0
          flex h-screen w-64 flex-col
          border-r border-[#4FB748]
          bg-[#eff6ee] text-[#4FB748]
          p-4
          shadow-xl
          z-40
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <h2 className="mb-4 shrink-0 text-xl font-bold md:mb-6 md:text-2xl">
          Admin Panel
        </h2>

        <ul className="mb-4 flex-1 space-y-1 overflow-y-auto">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `block rounded px-3 py-2 text-sm transition-all duration-200 md:text-base ${
                    isActive
                      ? "border-l-4 border-[#EE3A23] bg-[#ffd4d0] text-[#EE3A23]"
                      : "border-l-4 border-transparent hover:translate-x-0.5 hover:bg-[#b0e8ac] hover:text-[#4FB748]"
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Navigate to Client Side Button */}
        <div className="shrink-0 space-y-2 border-t border-[#4FB748]/30 pt-4">
          <Link
            to="/"
            onClick={closeMenu}
            className="flex w-full items-center gap-2 rounded-lg bg-[#4FB748] px-3 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 hover:bg-[#3d7a38] hover:shadow-lg active:scale-[0.98] md:text-base"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>View Website</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg bg-[#f03d3d] px-3 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 hover:bg-[#ed7e7e] hover:shadow-lg active:scale-[0.98] md:text-base"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M10 8v-2a2 2 0 0 1 2 -2h7a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2v-2" />
              <path d="M15 12h-12l3 -3" />
              <path d="M6 15l-3 -3" />
            </svg>

            <span>Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default AdminNavbar;