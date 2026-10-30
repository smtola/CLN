import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import UserMenu from "../UserMenu";
import Logo from "/logo.png";
import { getCategories } from "../../admin/services/categoryService";
import type { Category } from "../../admin/types/category";
import { getServices } from "../../admin/services/serviceService";
import type { ServiceItem } from "../../admin/types/service";
import { useNavigate } from "react-router-dom";
import ServiceTypeModal from "../../pages/price/components/ServiceTypeModal";

const Navbar: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>("Customs");
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const navigate = useNavigate();
  const [showServiceModal, setShowServiceModal] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    setActiveTab(tab || "Customs");
    setMobileOpen(false);
  }, [location]);

  const fetchCategory = async () => {
    try {
      const res = await getCategories();
      if (Array.isArray(res)) {
        setCategories(res);
      } else {
        setCategories([]);
      }
    } catch {
      setCategories([]);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await getServices({ page: 1, limit: 50 });
      if (res.success && Array.isArray(res.data)) {
        setServices(res.data);
      } else {
        setServices([]);
      }
    } catch {
      setServices([]);
    }
  };

  useEffect(() => {
    fetchCategory();
    fetchServices();
  }, []);

  const navLinks = [
    { link: "/", name: "Home" },
    { link: "/about-us", name: "About Us" },
    { link: "/contact-us", name: "Contact Us" },
  ];

  const isServicesActive = location.pathname === "/services";
  const isProductsActive = location.pathname === "/products";

  return (
    <div className="w-full">
      {/* ── Top Info Bar ── */}
      <header className="bg-white">
        <div className="flex text-black border-b border-slate-100">
          {/* Left: Hours + Call */}
          <div className="flex gap-1 justify-between w-[50%] lg:w-[66%] ms-2 px-2 py-1.5">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#4F9748]/8">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                  viewBox="0 0 24 24" fill="none" stroke="#4F9748"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M12 13m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                  <path d="M12 10l0 3l2 0" />
                  <path d="M7 4l-2.75 2" />
                  <path d="M17 4l2.75 2" />
                </svg>
              </span>
              <span className="text-[11px] md:text-[12.5px] leading-tight text-slate-600">
                <b className="text-slate-800">Opening Hours</b>
                <p>Mon–Fri 8:00–17:30 &nbsp;·&nbsp; Sat 8:00–12:00</p>
              </span>
            </div>
            <div className="hidden lg:flex gap-2.5 items-center">
              <span className="w-fit h-fit bg-[#4F9748]/8 rounded-full p-2">
                <svg className="w-[18px]" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5.16667 1.33325H12.5L16.1667 10.4999L11.5833 13.2499C13.5468 17.2311 16.7689 20.4532 20.75 22.4166L23.5 17.8333L32.6667 21.4999V28.8333C32.6667 29.8057 32.2804 30.7383 31.5927 31.426C30.9051 32.1136 29.9725 32.4999 29 32.4999C21.8487 32.0653 15.1036 29.0285 10.0375 23.9624C4.97142 18.8963 1.93459 12.1513 1.5 4.99992C1.5 4.02746 1.88631 3.09483 2.57394 2.40719C3.26158 1.71956 4.19421 1.33325 5.16667 1.33325Z"
                    stroke="#4F9748" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className="text-[12.5px] text-slate-500 leading-tight">
                Call Us Anytime<br />
                <b className="text-[#4F9748] text-[13.5px]">+(855) 61 300 618</b>
              </span>
            </div>
          </div>

          {/* Right: Social */}
          <div
            className="flex justify-center items-center gap-3 w-[50%] lg:w-[34%] h-auto bg-gradient-to-r from-[#4F9748] to-[#437d3d] text-white px-4"
            style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 12% 100%)" }}
          >
            <span className="text-[11px] md:text-[13px] font-medium uppercase tracking-wide hidden sm:block text-white/85">
              Reach Us
            </span>
            <ul className="flex items-center gap-2">
              <li>
                <a href="https://www.facebook.com/clncambodia/" aria-label="Facebook"
                  className="flex w-[28px] h-[28px] md:w-[32px] md:h-[32px] bg-white rounded-full items-center justify-center shadow-sm hover:scale-110 hover:shadow-md transition-all duration-200">
                  <svg className="w-[20px] md:w-[20px]" viewBox="0 0 41 45" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.3749 22.25V28.75H17.2499V40.125H23.7499V28.75H28.6249L30.2499 22.25H23.7499V19C23.7499 18.569 23.9211 18.1557 24.2258 17.851C24.5306 17.5462 24.9439 17.375 25.3749 17.375H30.2499V10.875H25.3749C23.22 10.875 21.1534 11.731 19.6296 13.2548C18.1059 14.7785 17.2499 16.8451 17.2499 19V22.25H12.3749Z"
                      stroke="#4F9748" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </li>
              <li>
                <a href="https://t.me/+85561300618" aria-label="Telegram"
                  className="flex w-[28px] h-[28px] md:w-[32px] md:h-[32px] bg-white rounded-full items-center justify-center shadow-sm hover:scale-110 hover:shadow-md transition-all duration-200">
                  <svg className="w-[20px] md:w-[20px]" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_21_272)">
                      <path d="M24 17.3335L18.6667 22.6668L26.6667 30.6668L32 9.3335L8 18.6668L13.3333 21.3335L16 29.3335L20 24.0002"
                        stroke="#4F9748" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_21_272">
                        <rect width="32" height="32" fill="white" transform="translate(4 4)"/>
                      </clipPath>
                    </defs>
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Mobile logo bar */}
        <div className="flex lg:hidden items-center justify-between px-3 py-2 bg-white border-b border-slate-100">
          <NavLink to="/" className="flex items-center gap-2">
            <img src={Logo} alt="CLN Logo" width={90} height={50} />
          </NavLink>
          <div className="flex items-center gap-3">
            {/* <UserMenu /> */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl text-[#4F9748] bg-[#4F9748]/8 hover:bg-[#4F9748]/15 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="6" x2="20" y2="6"/>
                  <line x1="4" y1="12" x2="20" y2="12"/>
                  <line x1="4" y1="18" x2="20" y2="18"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Sticky Navbar ── */}
      <nav className="w-full bg-[#4F9748] sticky top-0 z-50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.25)]">

        {/* ── Desktop Nav ── */}
        <div className="hidden lg:flex items-stretch h-[60px]">
          {/* Red accent wedge + logo */}
          <div className="flex items-center shrink-0 relative">
            <div className="w-[64px] h-full bg-gradient-to-br from-[#f1503a] to-[#ee3a23]"
              style={{ clipPath: "polygon(0% 0%, 0% 0%, 80% 100%, 0% 100%)" }} />
            <NavLink to="/" className="ml-4 h-full flex items-center">
              <img src={Logo} alt="CLN" className="h-[46px] w-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]" />
            </NavLink>
          </div>

          {/* Nav links */}
          <ul className="flex items-stretch gap-0.5 px-3 flex-1">
            {navLinks.slice(0, 2).map((item) => (
              <li key={item.link} className="flex items-stretch">
                <NavLink to={item.link}
                  className={({ isActive }) =>
                    `relative flex items-center px-4 text-[13px] lg:text-[14.5px] font-medium text-white transition-colors duration-200 uppercase tracking-wide whitespace-nowrap
                    after:absolute after:left-4 after:right-4 after:bottom-0 after:h-[2.5px] after:rounded-full after:bg-[#EE3A23] after:transition-transform after:duration-200
                    ${isActive ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"} hover:bg-white/10`
                  }>
                  {item.name}
                </NavLink>
              </li>
            ))}

            {/* Services dropdown */}
            <li className="relative group flex items-stretch">
              <NavLink to="/services"
                className={`relative flex items-center gap-1.5 px-4 text-[13px] lg:text-[14.5px] font-medium text-white transition-colors duration-200 uppercase tracking-wide whitespace-nowrap
                  after:absolute after:left-4 after:right-4 after:bottom-0 after:h-[2.5px] after:rounded-full after:bg-[#EE3A23] after:transition-transform after:duration-200
                  ${isServicesActive ? "after:scale-x-100" : "after:scale-x-0 group-hover:after:scale-x-100"} hover:bg-white/10`}>
                Services
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="group-hover:rotate-180 transition-transform duration-200">
                  <polyline points="6 9 12 15 18 9" transform="scale(0.75) translate(0, 2)"/>
                </svg>
              </NavLink>
              {services.length > 0 && (
                <ul className="absolute top-full left-0 pt-2 w-[240px] opacity-0 invisible translate-y-1
                  group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
                  transition-all duration-200 ease-out">
                  <div className="bg-white text-slate-700 shadow-[0_12px_32px_-8px_rgba(9,30,66,0.25)] rounded-2xl border border-slate-100 overflow-hidden py-1.5">
                    {services.map((item) => (
                      <NavLink key={item.key} to={`/services?tab=${item.key}`}
                        className={`flex items-center gap-2.5 px-4 py-2.5 text-[13.5px] hover:bg-[#4F9748]/8 hover:text-[#4F9748] transition-colors mx-1.5 rounded-xl
                          ${activeTab === item.key ? "bg-[#4F9748]/8 text-[#4F9748] font-medium" : ""}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4F9748] shrink-0" />
                        {item.title}
                      </NavLink>
                    ))}
                  </div>
                </ul>
              )}
            </li>

            {/* Products dropdown */}
            <li className="relative group flex items-stretch">
              <NavLink to="/products"
                className={`relative flex items-center gap-1.5 px-4 text-[13px] lg:text-[14.5px] font-medium text-white transition-colors duration-200 uppercase tracking-wide whitespace-nowrap
                  after:absolute after:left-4 after:right-4 after:bottom-0 after:h-[2.5px] after:rounded-full after:bg-[#EE3A23] after:transition-transform after:duration-200
                  ${isProductsActive ? "after:scale-x-100" : "after:scale-x-0 group-hover:after:scale-x-100"} hover:bg-white/10`}>
                Products
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="group-hover:rotate-180 transition-transform duration-200">
                  <polyline points="6 9 12 15 18 9" transform="scale(0.75) translate(0, 2)"/>
                </svg>
              </NavLink>
              {categories.length > 0 && (
                <ul className="absolute top-full left-0 pt-2 w-[210px] opacity-0 invisible translate-y-1
                  group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
                  transition-all duration-200 ease-out">
                  <div className="bg-white text-slate-700 shadow-[0_12px_32px_-8px_rgba(9,30,66,0.25)] rounded-2xl border border-slate-100 overflow-hidden py-1.5">
                    {categories.map((item) => (
                      <NavLink key={item._id} to={`/products?category=${item.name}`}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-[13.5px] hover:bg-[#4F9748]/8 hover:text-[#4F9748] transition-colors mx-1.5 rounded-xl">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#EE3A23] shrink-0" />
                        {item.name}
                      </NavLink>
                    ))}
                  </div>
                </ul>
              )}
            </li>

            {navLinks.slice(2).map((item) => (
              <li key={item.link} className="flex items-stretch">
                <NavLink to={item.link}
                  className={({ isActive }) =>
                    `relative flex items-center px-4 text-[13px] lg:text-[14.5px] font-medium text-white transition-colors duration-200 uppercase tracking-wide whitespace-nowrap
                    after:absolute after:left-4 after:right-4 after:bottom-0 after:h-[2.5px] after:rounded-full after:bg-[#EE3A23] after:transition-transform after:duration-200
                    ${isActive ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"} hover:bg-white/10`
                  }>
                  {item.name}
                </NavLink>
              </li>
            ))}
            <li className="flex items-stretch">
              <button
                onClick={() => setShowServiceModal(true)}
                type="button"
                className="relative flex items-center px-4 text-[13px] lg:text-[14.5px] font-medium text-white transition-colors duration-200 uppercase tracking-wide whitespace-nowrap
                  after:absolute after:left-4 after:right-4 after:bottom-0 after:h-[2.5px] after:rounded-full after:bg-[#EE3A23] after:transition-transform after:duration-200
                  after:scale-x-0 hover:after:scale-x-100 hover:bg-white/10"
              >
                Spot On
              </button>
            </li>
          </ul>

          {/* Right: User menu */}
          <div className="flex items-center px-6 bg-gradient-to-br from-[#f1503a] to-[#ee3a23] shrink-0">
            <UserMenu />
          </div>
        </div>

        {/* ── Mobile drawer ── */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="bg-[#437d3d] border-t border-white/15">
            <ul className="py-2">
              <li>
                <NavLink to="/"
                  className={({ isActive }) =>
                    `block px-5 py-3 text-[14px] font-medium uppercase tracking-wide transition-colors
                    ${isActive ? "text-white bg-white/15 border-l-4 border-[#EE3A23]" : "text-white/85 hover:bg-white/10 border-l-4 border-transparent"}`}>
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/about-us"
                  className={({ isActive }) =>
                    `block px-5 py-3 text-[14px] font-medium uppercase tracking-wide transition-colors
                    ${isActive ? "text-white bg-white/15 border-l-4 border-[#EE3A23]" : "text-white/85 hover:bg-white/10 border-l-4 border-transparent"}`}>
                  About Us
                </NavLink>
              </li>

              {/* Services accordion */}
              <li>
                <button onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                  className="flex items-center justify-between w-full px-5 py-3 text-[14px] font-medium uppercase tracking-wide text-white/85 hover:bg-white/10 border-l-4 border-transparent transition-colors">
                  Services
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className={`transition-transform duration-200 ${mobileServicesOpen ? "rotate-180" : ""}`}>
                    <polyline points="6 9 12 15 18 9" transform="scale(0.85)"/>
                  </svg>
                </button>
                <div className={`overflow-hidden transition-all duration-200 ${mobileServicesOpen ? "max-h-96" : "max-h-0"}`}>
                  <ul className="bg-black/15 py-1.5">
                    {services.map((item) => (
                      <li key={item.key}>
                        <NavLink to={`/services?tab=${item.key}`}
                          className="flex items-center gap-2 px-8 py-2.5 text-[13px] text-white/75 hover:text-white hover:bg-white/10 transition-colors">
                          <span className="w-1 h-1 rounded-full bg-white/50 shrink-0" />
                          {item.title}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>

              {/* Products accordion */}
              <li>
                <button onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                  className="flex items-center justify-between w-full px-5 py-3 text-[14px] font-medium uppercase tracking-wide text-white/85 hover:bg-white/10 border-l-4 border-transparent transition-colors">
                  Products
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className={`transition-transform duration-200 ${mobileProductsOpen ? "rotate-180" : ""}`}>
                    <polyline points="6 9 12 15 18 9" transform="scale(0.85)"/>
                  </svg>
                </button>
                <div className={`overflow-hidden transition-all duration-200 ${mobileProductsOpen ? "max-h-64" : "max-h-0"}`}>
                  <ul className="bg-black/15 py-1.5">
                    <li>
                      <NavLink to="/products" className="flex items-center gap-2 px-8 py-2.5 text-[13px] text-white/75 hover:text-white hover:bg-white/10 transition-colors">
                        <span className="w-1 h-1 rounded-full bg-white/50 shrink-0" />
                        All Products
                      </NavLink>
                    </li>
                    {categories.map((item) => (
                      <li key={item._id}>
                        <NavLink to={`/products?category=${item.name}`}
                          className="flex items-center gap-2 px-8 py-2.5 text-[13px] text-white/75 hover:text-white hover:bg-white/10 transition-colors">
                          <span className="w-1 h-1 rounded-full bg-white/50 shrink-0" />
                          {item.name}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>

              <li>
                <NavLink to="/contact-us"
                  className={({ isActive }) =>
                    `block px-5 py-3 text-[14px] font-medium uppercase tracking-wide transition-colors
                    ${isActive ? "text-white bg-white/15 border-l-4 border-[#EE3A23]" : "text-white/85 hover:bg-white/10 border-l-4 border-transparent"}`}>
                  Contact Us
                </NavLink>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    setShowServiceModal(true);
                  }}
                  className="block w-full text-left px-5 py-3 text-[14px] font-medium uppercase tracking-wide text-white/85 hover:bg-white/10 border-l-4 border-transparent transition-colors"
                >
                  Spot On
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <ServiceTypeModal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        onSelectLocalCharge={() => {
          setShowServiceModal(false);
          navigate("/price/quote");
        }}
        onSelectFreight={() => {
          setShowServiceModal(false);
          navigate("/freight-quote");
        }}
      />
    </div>
  );
};

export default Navbar;