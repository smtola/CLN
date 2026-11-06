import React, { useEffect, useRef, useState } from "react";
import ContactUsForm from "../../components/contact-us-form/contact-us-form";
import ContactMascot from "../../components/contact-mascot/ContactMascot";
import SEO, { type SEOProps } from "../../components/SEO";
import { fetchSEO } from "../../services/seoService";
import { organizationSchema } from "../../components/schemaExamples.ts";

const banner = "/assets/image/banner_4.png";

const ContactUs: React.FC = () => {
  const [seo, setSeo] = useState<SEOProps>({});
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSEO("contact-us")
      .then((data) => setSeo(data))
      .catch((error) => {
        console.error("Failed to fetch SEO data:", error);
        // Fallback SEO data
        setSeo({
          title: "CLN | Contact Us",
          description: "Contact CLN Cambodia for international and domestic logistics services.",
          keywords: "CLN Cambodia, contact, logistics, transportation, sea freight, air freight",
          ogTitle: "CLN Cambodia - Contact Us",
          ogDescription: "Contact CLN Cambodia for international and domestic logistics services.",
          ogImage: "https://clncambodia.com/assets/image/seo.jpg",
          canonical: "https://clncambodia.com/contact-us",
          url: "https://clncambodia.com/contact-us",
        });
      });
  }, []);

  return (
    <>
      <SEO {...seo} schemaMarkup={organizationSchema} />

      {/* Banner */}
      <section className="w-full overflow-hidden">
        <div className="relative flex h-[45vh] min-h-[340px] w-full items-start justify-center md:h-[55vh] md:min-h-[420px] lg:h-[50vh]">
          <img
            src={banner}
            alt=""
            width={1920}
            height={1080}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative mt-4 text-center">
            <h1 className="font-playwrite-nz text-[22px] text-white md:text-[44px]">
              Trust <span className="text-[#4fb748]">US</span>
              <br />
              To Handle
              <br />
              <span className="text-[#4fb748]">Your Shipment</span>
            </h1>
          </div>
        </div>
      </section>

      {/* Mascot and contact form.
          Mobile: mascot above the form. Desktop: form on the left, mascot on the right and it follows the scroll. */}
      <div className="relative z-10 mx-auto -mt-24 w-full max-w-screen-xl px-3 pb-12 md:-mt-36 lg:-mt-44 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-6 lg:px-4">
        <div className="mb-4 lg:order-2 lg:sticky lg:top-24 lg:mb-0">
          <ContactMascot watchRef={formRef} />
        </div>
        <div ref={formRef} className="min-w-0 lg:order-1">
          <ContactUsForm />
        </div>
      </div>
    </>
  );
};

export default ContactUs;
