import React from "react";
import ContactUsForm from "../../components/contact-us-form/contact-us-form"; 
import SEO from "../../components/SEO";

const ContactUs: React.FC = () => {
  return (
    <>
    <SEO
              title="CLN | CONTACT US"
              description="CLN Cambodia provides international and domestic logistics, sea freight, air freight, and cross-border land transport services with 20 years of experience."
              keywords="CLN Cambodia, logistics, transportation, sea freight, air freight, cross-border transport, warehousing, customs clearance"
              author="CLN Cambodia"
              ogTitle="CLN | Services"
              ogDescription="Offering international and domestic logistics services with 20 years of experience."
              ogImage="/assets/image/bg_head.jpg"
            
      />
      {/* Banner Section */}
      <section className="w-full h-fit overflow-hidden">
        <div className="relative flex justify-center items-start w-full h-[45vh] md:h-[60vh] lg:h-[50vh]">
          <img
            src="assets/image/banner_4.png"
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
