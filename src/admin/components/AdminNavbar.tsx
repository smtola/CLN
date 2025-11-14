import { useState } from "react";
import { NavLink, Link } from "react-router-dom";

const AdminNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const navLinks = [
    { to: "/admin", label: "Dashboard", end: true },
    { to: "/admin/category", label: "Categories" },
    { to: "/admin/product", label: "Products" },
    { to: "/admin/seo", label: "SEO" },
    { to: "/admin/profile", label: "Profile" },
    { to: "/admin/user", label: "Users" },
  ];

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden fixed top-4 left-4 z-50 bg-[#c4ffc0] text-[#4FB748] p-2 rounded-lg shadow-lg hover:bg-[#b0e8ac] transition-colors"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar Navigation */}
      <nav
        className={`
          fixed md:static
          top-0 left-0
          w-64 bg-[#c4ffc0] text-[#4FB748] 
          min-h-screen p-4
          z-40
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Admin Panel</h2>
        <ul className="space-y-1 mb-4">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm md:text-base transition-colors ${
                    isActive
                      ? "text-[#EE3A23] bg-[#ffd4d0] border-l-4 border-[#EE3A23]"
                      : "hover:bg-[#b0e8ac] hover:text-[#4FB748]"
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
        
        {/* Navigate to Client Side Button */}
        <div className="mt-6 pt-4 border-t border-[#4FB748]/30">
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-[#4FB748] text-white hover:bg-[#3d7a38] transition-colors text-sm md:text-base font-medium shadow-md"
          >
            <svg
              className="w-5 h-5"
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
        </div>
      </nav>
    </>
  );
};

export default AdminNavbar;
