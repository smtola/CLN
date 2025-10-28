import React, { useState, useEffect } from "react";
import Logo from "/logo.png";

const Footer: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Show button when scrolled down
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <footer className="relative w-full h-full overflow-hidden">

        <div className="relative w-full h-auto bg-[#4fb748] mt-[5rem]">
          <ul className="flex flex-col md:flex-row xl:max-w-screen-xl mx-auto px-5 py-[3rem] text-white space-y-2 md:space-y-0">
            {/* Services */}
            <li className="w-full md:w-[30%] space-y-2">
              <a
                    href="/"
                    className="w-full h-full bg-white z-[2]"
                  >
                    <img
                      src={Logo}
                      alt="logo"
                      width={1920}
                      height={1080}
                      className="w-[100px] h-[60px] xl:w-[200px] xl:h-[120px] bg-white"
                    />
                </a>
              <h1 className="text-[16px] md:text-[22px] font-[500]">Our Services</h1>
              <ul className="text-[14px] md:text-[18px] font-[300] space-y-[0.5rem]">
                {[
                  "Customs Clearance",
                  "Cross Border (Land Transport)",
                  "Sea Freight",
                  "Air Freight",
                  "Packing & Warehouse",
                  "International Express Courier",
                  "Consolidation",
                  "Door to Door Service",
                ].map((service) => (
                  <li key={service}>{service}</li>
                ))}
              </ul>
            </li>

            {/* Links */}
            <li className="w-full md:w-[20%] space-y-2">
              <h1 className="text-[16px] md:text-[22px] font-[500]">Links</h1>
              <ul className="text-[14px] md:text-[18px] font-[300] space-y-[0.5rem]">
                {[
                  { name: "HOME", href: "/" },
                  { name: "ABOUT US", href: "/about-us" },
                  { name: "SERVICES", href: "/services" },
                  { name: "PRODUCTS", href: "/product" },
                  { name: "CONTACT US", href: "/contact-us" },
                ].map((link) => (
                  <li key={link.name}>
                    <a href={link.href}>{link.name}</a>
                  </li>
                ))}
              </ul>
            </li>

            {/* Contact */}
            <li className="w-full md:w-[50%] space-y-2">
              <h1 className="text-[16px] md:text-[22px] font-[500]">Contact Us</h1>
              <ul className="text-[14px] md:text-[18px] font-[300] space-y-[0.5rem]">
                <li className="flex items-start gap-2">
                  {/* Location SVG */}
                  <span>
                    <svg
                      className="w-[24px]"
                      viewBox="0 0 33 37"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10.875 15.625C10.875 17.1168 11.4676 18.5476 12.5225 19.6025C13.5774 20.6574 15.0082 21.25 16.5 21.25C17.9918 21.25 19.4226 20.6574 20.4775 19.6025C21.5324 18.5476 22.125 17.1168 22.125 15.625C22.125 14.1332 21.5324 12.7024 20.4775 11.6475C19.4226 10.5926 17.9918 10 16.5 10C15.0082 10 13.5774 10.5926 12.5225 11.6475C11.4676 12.7024 10.875 14.1332 10.875 15.625Z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M27.1069 26.6063L19.1513 34.562C18.4481 35.2644 17.4949 35.659 16.5009 35.659C15.507 35.659 14.5538 35.2644 13.8506 34.562L5.89313 26.6063C3.79542 24.5085 2.36689 21.8358 1.78817 18.9261C1.20946 16.0164 1.50655 13.0004 2.64189 10.2596C3.77722 7.51872 5.69981 5.17609 8.16653 3.5279C10.6333 1.87971 13.5333 1 16.5 1C19.4667 1 22.3668 1.87971 24.8335 3.5279C27.3002 5.17609 29.2228 7.51872 30.3581 10.2596C31.4935 13.0004 31.7906 16.0164 31.2118 18.9261C30.6331 21.8358 29.2046 24.5085 27.1069 26.6063Z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span>
                    No.27, Street 322, S/K Boeung Keng Kang I, Khan Chamkamon,<br/>
                    Phnom Penh – Cambodia.
                  </span>
                </li>

                <li className="flex items-start gap-2">
                  {/* Phone SVG */}
                  <span>
                    <svg
                      className="w-[24px]"
                      viewBox="0 0 34 34"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5.16667 1.33325H12.5L16.1667 10.4999L11.5833 13.2499C13.5468 17.2311 16.7689 20.4532 20.75 22.4166L23.5 17.8333L32.6667 21.4999V28.8333C32.6667 29.8057 32.2804 30.7383 31.5927 31.426C30.9051 32.1136 29.9725 32.4999 29 32.4999C21.8487 32.0653 15.1036 29.0285 10.0375 23.9624C4.97142 18.8963 1.93459 12.1513 1.5 4.99992C1.5 4.02746 1.88631 3.09483 2.57394 2.40719C3.26158 1.71956 4.19421 1.33325 5.16667 1.33325Z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span>
                    +(855) 77 551 651
                    <br />
                    +(855) 61 300 618
                  </span>
                </li>

                <li className="flex items-start gap-2">
                  {/* Email SVG */}
                  <span>
                    <svg
                      className="w-[24px]"
                      viewBox="0 0 44 44"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5.5 12.8334C5.5 11.861 5.88631 10.9283 6.57394 10.2407C7.26158 9.55306 8.19421 9.16675 9.16667 9.16675H34.8333C35.8058 9.16675 36.7384 9.55306 37.4261 10.2407C38.1137 10.9283 38.5 11.861 38.5 12.8334V31.1667C38.5 32.1392 38.1137 33.0718 37.4261 33.7595C36.7384 34.4471 35.8058 34.8334 34.8333 34.8334H9.16667C8.19421 34.8334 7.26158 34.4471 6.57394 33.7595C5.88631 33.0718 5.5 32.1392 5.5 31.1667V12.8334Z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5.5 12.8333L22 23.8333L38.5 12.8333"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span>
                    m.sovann@clncambodia.com
                    <br />
                    sales@clncambodia.com
                    <br />
                    info@clncambodia.com
                  </span>
                </li>

                <li>
                  <div className="w-full p-1 bg-[#EE3A23]">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3909.0116701989737!2d104.92487919999996!3d11.551020300000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31095156a4abdf4d%3A0x45da1330d54da592!2sCLN!5e0!3m2!1sen!2skh!4v1755752038357!5m2!1sen!2skh"
                      className="w-full h-[200px] md:h-[300px]"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </footer>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-5 right-5 p-3 bg-green-500 text-white rounded-[10px] shadow-lg z-[10] transition-all duration-500 hover:bg-green-600"
        >
          ↑ Top
        </button>
      )}
    </>
  );
};

export default Footer;
