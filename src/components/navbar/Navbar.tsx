import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import QuoteModal from "../quote-modal/QuoteModal";
import UserMenu from "../UserMenu";
import Logo from "/logo.png";

const Navbar: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>("custom");

  // Listen for query param changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    setActiveTab(tab || "custom");
  }, [location.search]);

  const servicesSubmenu = [
    { name: "Custom Clearance", tab: "custom" },
    { name: "Cross Border (Land Transport)", tab: "land" },
    { name: "Sea Freight", tab: "sea" },
    { name: "Air Freight", tab: "air" },
    { name: "Packing & Warehouse", tab: "packing" },
    { name: "IEC", tab: "iec" },
    { name: "Consolidation", tab: "consolidation" },
    { name: "DTD Service", tab: "door2door" },
  ];

  const productsSubmenu = [
    { name: "Export", category: "Export" },
    { name: "Import", category: "Import" },
  ];

  return (
    <div className="w-full">
      {/* Header Section */}
      <header>
        {/* Top Bar */}
        <div className="flex">
          <div className="flex gap-1 justify-between w-[50%] lg:w-[66%] ms-2 px-1 py-1">
            <div className="flex">
            <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
              viewBox="0 0 24 24" fill="none" stroke="currentColor" 
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"  
              className="icon icon-tabler-outline icon-tabler-alarm">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M12 13m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
              <path d="M12 10l0 3l2 0" />
              <path d="M7 4l-2.75 2" />
              <path d="M17 4l2.75 2" />
            </svg>                  
          </span>
              <span className="text-[14px] md:text-[18px]">
                <b>Opening Hours:</b>
                <p>Mon - Friday 8:00-5:30</p>
                <p>Saturday 8:00-12:00</p>
              </span>
            </div>
            <div className="hidden lg:flex gap-1 w-fit">
              <span className="w-fit h-fit bg-black/30 rounded-full p-2">
              <svg className="w-[24px]" viewBox="0 0 35 31" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_14_679)">
              <path d="M18.9349 29.7286C18.9296 29.4736 18.8459 29.2263 18.695 29.0196C18.5442 28.8129 18.3333 28.6566 18.0905 28.5717L15.0591 28.594C14.9156 28.8309 14.7777 29.0679 14.6313 29.3021C11.6963 29.3708 8.84444 28.3336 6.6518 26.4L5.64979 16.4895L5.04183 15.7842H4.32691C4.17211 14.6022 3.8428 10.9251 6.1508 7.60766C9.44674 2.86845 15.4391 2.72906 17.1926 2.68724C19.1178 2.64264 23.275 2.54507 26.6611 5.62555C30.883 9.45037 30.4467 15.0482 30.3792 15.7842C30.2099 15.755 30.0363 15.7618 29.8699 15.8041C29.7034 15.8464 29.548 15.9232 29.4138 16.0295C29.2419 16.1766 29.1176 16.3705 29.0563 16.5871L28.0205 26.2132C28.128 26.5638 28.341 26.8736 28.631 27.1009C28.9211 27.3283 29.2743 27.4625 29.6435 27.4856C30.0127 27.5086 30.3802 27.4194 30.6968 27.2299C31.0134 27.0404 31.264 26.7596 31.415 26.4251C32.2893 26.1024 33.0561 25.5458 33.6301 24.8173C34.2041 24.0887 34.5628 23.2167 34.6664 22.2983C34.7699 21.3799 34.6143 20.451 34.2166 19.615C33.819 18.779 33.1951 18.0686 32.4142 17.5628C32.5053 17.4014 32.5562 17.2209 32.5625 17.0361C32.5689 16.8513 32.5306 16.6678 32.4508 16.5006C32.3444 16.3148 32.182 16.1667 31.9863 16.0769C32.0652 15.1932 32.4902 9.38626 28.0205 4.71674C23.7254 0.206129 18.1552 0.136435 17.2292 0.139223C16.4298 0.164313 9.24127 0.504421 5.12627 6.50928C2.37074 10.5014 2.56495 14.6858 2.67472 16.0295L2.32852 16.4198V17.1641C2.08646 17.3286 0.102144 18.7504 0.00363171 21.2343C-0.0779927 23.3335 1.22237 25.3351 3.29113 26.2523C3.29113 26.4753 3.35868 27.0468 3.75554 27.2809C3.96101 27.4008 4.21714 27.3729 4.72096 27.3144L6.18739 27.1388C8.44361 29.1211 11.3937 30.1498 14.4061 30.0046C14.5194 30.2034 14.6638 30.3831 14.834 30.5371C14.9747 30.6619 15.1307 30.7686 15.2984 30.8549H18.2284C18.4402 30.7507 18.6185 30.5902 18.7433 30.3912C18.8681 30.1923 18.9344 29.9628 18.9349 29.7286Z" fill="#CE3A23" stroke="#CE3A23" strokeMiterlimit="10"/>
              <path d="M7.18732 15.9628C7.1299 15.6549 6.99234 15.3657 6.78724 15.1216C6.58215 14.8775 6.31605 14.6863 6.01332 14.5655C5.95937 13.4692 5.97735 10.6501 7.93745 8.07327C11.1846 3.82263 16.9262 3.97191 18.0154 4.01106C19.4823 4.05266 23.7493 4.17257 26.6599 7.49085C29.1877 10.3784 29.0387 13.802 28.9719 14.6682C28.6597 14.7094 28.372 14.852 28.1576 15.072C27.9228 15.3182 27.7943 15.6399 27.7979 15.9726C24.8683 16.1401 21.9465 15.5383 19.3513 14.2327C16.8868 12.9824 14.8076 11.141 13.3194 8.8906C12.8982 10.3622 12.1656 11.7363 11.1666 12.9283C10.0902 14.2059 8.73158 15.2419 7.18732 15.9628Z" fill="#CE3A23" stroke="#CE3A23" strokeMiterlimit="10"/>
              </g>
              <defs>
              <clipPath id="clip0_14_679">
              <rect width="35" height="31" fill="white"/>
              </clipPath>
              </defs>
            </svg> 
              </span>
              <span className="font-[300]">
                Call Us Anytime
                <br />
                +(855) 61 300 618
              </span>
            </div>
          </div>

          <div
            className="flex justify-center items-center w-[50%] lg:w-[44%] h-auto bg-[#4F9748] text-white space-x-[1rem]"
            style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 12% 100%)" }}
          >
            <h1 className="text-[14px] md:text-[18px] font-[500] uppercase">
              Reach Us:
            </h1>
            <ul className="flex justify-center items-center gap-2">
              <li>
                <a href="https://www.facebook.com/clncambodia/"><svg className="w-[24px] md:w-[32px]" viewBox="0 0 41 45" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20.5" cy="20.5" r="20.5" fill="white"/>
                  <path d="M12.3749 22.25V28.75H17.2499V40.125H23.7499V28.75H28.6249L30.2499 22.25H23.7499V19C23.7499 18.569 23.9211 18.1557 24.2258 17.851C24.5306 17.5462 24.9439 17.375 25.3749 17.375H30.2499V10.875H25.3749C23.22 10.875 21.1534 11.731 19.6296 13.2548C18.1059 14.7785 17.2499 16.8451 17.2499 19V22.25H12.3749Z" stroke="#4F9748" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>   </a>
              </li>
              <li>
                <a href="https://t.me/+85561300618"><svg className="w-[24px] md:w-[32px]" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20.5" cy="20.5" r="20.5" fill="white"/>
                <g clipPath="url(#clip0_21_272)">
                <path d="M24 17.3335L18.6667 22.6668L26.6667 30.6668L32 9.3335L8 18.6668L13.3333 21.3335L16 29.3335L20 24.0002" stroke="#4F9748" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
                <defs>
                <clipPath id="clip0_21_272">
                <rect width="32" height="32" fill="white" transform="translate(4 4)"/>
                </clipPath>
                </defs>
              </svg>    </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Middle Bar for Mobile */}
        <div className="flex lg:hidden">
          <div
            className="flex items-center gap-1 w-[45%] bg-[#4F9748]/30"
            style={{ clipPath: "polygon(0% 0%, 100% 0%, 80% 100%, 0% 100%)" }}
          >
            <NavLink to="/">
              <img src={Logo} alt="logo" width={70} height={50} className="ms-2" />
            </NavLink>
          </div>
          <div className="flex justify-center items-center w-[65%] h-auto bg-white space-x-[1rem]">
            <QuoteModal />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Divider Line */}
      <div className="lg:hidden w-full h-[3px] bg-gradient-to-l from-[#4F9748] to-[#ffffff]"></div>

      {/* Sticky Navbar */}
      <nav className="w-full bg-[#4F9748] sticky top-0 z-50">
        {/* Desktop */}
        <div className="hidden lg:flex">
          <div className="flex w-[93%] h-full relative space-x-3">
            <div
              className="w-[70px] bg-[#ee3a23]"
              style={{ clipPath: "polygon(0% 0%, 0% 0%, 80% 100%, 0% 100%)" }}
            ></div>
            <div>
              <NavLink to="/">
                <img
                  src={Logo}
                  alt="logo"
                  width={150}
                  className="w-[150px] h-full drop-shadow-md"
                />
              </NavLink>
            </div>

            <ul className="flex gap-[4px] justify-center items-center w-full h-full text-white rounded-full">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    ` px-2 py-4 lg:py-7 2xl:py-8 text-[12px] lg:text-[16px] text-nowrap capitalize ${
                      isActive ? "bg-green-50 border-b-2 border-[#EE3A23] text-[#4F9748]" : ""
                    }`
                  }
                >
                  HOME
                </NavLink>
              </li>
              <li >
                <NavLink
                  to="/about-us"
                  className={({ isActive }) =>
                    `px-2 py-4 lg:py-7 2xl:py-8 text-[12px] lg:text-[16px] text-nowrap capitalize ${
                      isActive ? "bg-green-50 border-b-2 border-[#EE3A23] text-[#4F9748]" : ""
                    }`
                  }
                >
                  ABOUT US
                </NavLink>
              </li>

              {/* Services Dropdown */}
              <li className="relative group px-2 py-4 lg:py-6 2xl:py-7">
                <NavLink
                  to="/services"
                  className={() =>
                    `px-2 py-4 lg:py-7 2xl:py-8 text-[12px] lg:text-[16px] text-nowrap capitalize ${
                      location.pathname === "/services" ? "bg-green-50 border-b-2 border-[#EE3A23] text-[#4F9748]" : ""
                    }`
                  }
                >
                  SERVICES
                </NavLink>
                <ul className="absolute hidden group-hover:block bg-white text-black w-[220px] shadow-lg rounded-md mt-6">
                  {servicesSubmenu.map((item) => (
                    <li key={item.tab}>
                      <NavLink
                        to={`/services?tab=${item.tab}`}
                        className={`block px-4 py-2 hover:bg-gray-100 ${
                          activeTab === item.tab ? "bg-green-50 text-[#4F9748]" : ""
                        }`}
                      >
                        {item.name}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>

              {/* Products Dropdown */}
              <li className="relative group px-2 py-4 lg:py-6 2xl:py-7">
                <NavLink
                  to="/products"
                  className={() =>
                    `px-2 py-4 lg:py-7 2xl:py-8 text-[12px] lg:text-[16px] text-nowrap capitalize ${
                      location.pathname === "/products" ? "bg-green-50 border-b-2 border-[#EE3A23] text-[#4F9748]" : ""
                    }`
                  }
                >
                  PRODUCTS
                </NavLink>
                <ul className="absolute hidden group-hover:block bg-white text-black w-[220px] shadow-lg rounded-md mt-6">
                  {productsSubmenu.map((item) => (
                    <li key={item.category}>
                      <NavLink
                        to={`/products?category=${item.category}`}
                        className="block px-4 py-2 hover:bg-gray-100"
                      >
                        {item.name}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>

              <li >
                <NavLink
                  to="/contact-us"
                  className={({ isActive }) =>
                    `px-2 py-4 lg:py-7 2xl:py-8 text-[12px] lg:text-[16px] text-nowrap capitalize ${
                      isActive ? "bg-green-50 border-b-2 border-[#EE3A23] text-[#4F9748]" : ""
                    }`
                  }
                >
                  CONTACT US
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Quote Button */}
          <div className="flex justify-center items-center w-[50%] h-auto bg-[#ee3a23] space-x-[1rem]">
            <QuoteModal />
            <UserMenu />
          </div>
        </div>

        {/* Mobile */}
        <div className="lg:hidden w-full px-2">
          <div className="overflow-x-auto hide-scrollbar">
            <ul className="flex gap-[4px] items-center justify-center w-fit mx-auto h-full text-white rounded-full">
              {[{link:'/',name:"HOME"},{link:'/about-us',name:"ABOUT US"},{link:'/services',name:"SERVICES"},{link:'/products',name:"PRODUCTS"},{link:'/contact-us',name:"CONTACT US"},].map(
                (item, index) => (
                  <li key={index} className="px-2 py-3">
                    <NavLink
                      to={`${item.link}`}
                      className={({ isActive }) =>
                        `p-2 text-[12px] md:text-[16px] text-nowrap capitalize ${
                          isActive ? "bg-green-50 border-b-2 border-[#EE3A23] text-[#4F9748]" : ""
                        }`
                      }
                    >
                      {item.name}
                    </NavLink>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
