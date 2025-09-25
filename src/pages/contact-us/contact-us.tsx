import React, { useEffect, useState } from "react";
import ContactUsForm from "../../components/contact-us-form/contact-us-form"; 
import SEO, { type SEOProps } from "../../components/SEO";
import { fetchSEO } from "../../services/seoService";
import banner from "/assets/image/banner_4.png";

const ContactUs: React.FC = () => {
  const [seo, setSeo] = useState<SEOProps | null>(null);

  useEffect(() => {
    fetchSEO("home")
        .then((data) => setSeo(data))
        .catch((error) => {
            console.error("Failed to fetch SEO data:", error);
            // Fallback SEO data
            setSeo({
                title: "CLN | Home",
                description: "CLN Cambodia provides international and domestic logistics services.",
                keywords: "CLN Cambodia, logistics, transportation, sea freight, air freight",
                ogTitle: "CLN Cambodia",
                ogDescription: "Offering international and domestic logistics services with 20 years of experience.",
                ogImage: "https://clncambodia.com/og-home.png",
                url: "https://clncambodia.com"
            });
        });
}, []);
  return (
    <>
      <SEO {...seo} />
      {/* Banner Section */}
      <section className="w-full h-fit overflow-hidden">
        <div className="relative flex justify-center items-start w-full h-[45vh] md:h-[60vh] lg:h-[50vh]">
          <img
            src={banner}
            alt="logo"
            width={1920}
            height={1080}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative mt-4 text-center">
            <h1 className="text-white text-[22px] md:text-[44px] font-playwrite-nz">
              Trust <span className="text-[#4fb748]">US</span>
              <br />
              To Handle
              <br />
              <span className="text-[#4fb748]">Your Shipment</span>
            </h1>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <div className="w-full max-w-screen-xl mx-auto p-3 translate-y-[-30%] px-5 overflow-hidden">
        <ContactUsForm />
      </div>
    </>
  );
};

export default ContactUs;
