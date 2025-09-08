import React, {useEffect, useState} from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import SEO, {type SEOProps} from '../../components/SEO';
import {fetchSEO} from "../../services/seoService.ts";

const AboutCLN: React.FC = () => {
  const [seo, setSeo] = useState<SEOProps | null>(null);
  React.useEffect(() => {AOS.init({ duration: 1000 });
  }, []);

  useEffect(() => {
        fetchSEO("about-us")
            .then((data) =>  setSeo(data))
            .catch(console.error);
    }, []);

  return (
    <>
      <SEO {...seo} />
      {/* ABOUT CLN SECTION */}
      <section className="w-full h-fit bg-gradient-to-t md:bg-gradient-to-r from-[#EE3A23] to-[#4fb748] overflow-hidden">
        <div className="flex flex-col md:flex-row md:gap-5 p-4 xl:max-w-screen-xl mx-auto">
          <div
            data-aos="fade-right"
            data-aos-offset="300"
            data-aos-easing="ease-in-sine"
            className="w-[150px] h-[150px] md:h-full md:w-[40%] lg:w-[28%] mx-auto  bg-black/50 border-[1px] backdrop-blur-[100%] overflow-hidden rounded-full md:rounded-[10px]"
          >
            <img
              src="/assets/image/ceo.png"
              alt="CEO"
              className="w-[150px] md:w-[260px] mx-auto object-cover object-center"
            />
          </div>
          <div
            data-aos="fade-left"
            data-aos-offset="300"
            data-aos-easing="ease-in-sine"
            className="w-full md:w-[60%]"
          >
            <h1 className="text-[24px] font-medium text-center md:text-start text-white">
              ABOUT CLN
            </h1>
            <p className="text-[16px] font-light text-justify text-white hyphens-auto mt-2">
              <span className="font-semibold">CLN Cambodia logistics </span>&nbsp;is the registration company, established its own office in Cambodia in 2015. Currently, we have our own office in Phnom Penh and joined with many shipping companies in both local and overseas.
              <br />
              <br />
              With our quality staff with more than 20 years experiences of handling logistics and advanced information technology, we are dedicated to offering the best international and domestic logistics services and networks that enable our customers to make “All the Possible Movesˮ in their supply chains. We also comply with Cambodia labor law and commit to provide the best services to our customers as their expectation.
            </p>
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="w-full h-[3px] bg-gradient-to-l from-white to-[#4F9748]" />

      {/* VISION & MISSION SECTION */}
      <section className="w-full h-fit px-3 md:p-5 my-4 overflow-hidden">
        <div className="flex flex-col md:flex-row gap-2 md:gap-5 xl:max-w-screen-xl mx-auto">
          {/* VISION */}
          <div
            data-aos="fade-right"
            data-aos-offset="300"
            data-aos-easing="ease-in-sine"
            className="w-full lg:w-[50%] flex flex-col gap-2"
          >
            <div className="flex gap-4 items-center mb-2">
              <span>
                {/* SVG for vision */}
                <svg className="w-[28px]" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clip-path="url(#clip0_14_754)">
                        <path d="M34.1185 25.1221C34.587 25.1221 34.9672 25.5023 34.9672 25.9708C34.9672 26.4393 34.587 26.8195 34.1185 26.8195C33.65 26.8195 33.2698 26.4393 33.2698 25.9708C33.2698 25.5023 33.65 25.1221 34.1185 25.1221Z" fill="#4F9748"/>
                        <path d="M9.33577 25.1221C9.80424 25.1221 10.1845 25.5023 10.1845 25.9708C10.1845 26.4393 9.80424 26.8195 9.33577 26.8195C8.86729 26.8195 8.48706 26.4393 8.48706 25.9708C8.48706 25.5023 8.86729 25.1221 9.33577 25.1221Z" fill="#4F9748"/>
                        <path d="M17.823 31.0634C17.823 35.7508 14.0234 39.5506 9.33583 39.5506C4.64835 39.5506 0.848633 35.7508 0.848633 31.0634C0.848633 30.0424 1.02857 29.0646 1.35871 28.1582C1.57598 27.5624 1.85776 26.9988 2.1947 26.4744C3.70542 24.1294 6.339 22.5762 9.33583 22.5762C14.0234 22.5762 17.823 26.3759 17.823 31.0634Z" stroke="#4F9748" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12.5363 27.1045C13.6896 28.039 14.428 29.4665 14.428 31.063C14.428 33.8714 12.1441 36.1553 9.33569 36.1553" stroke="#4F9748" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M41.2594 26.4744C41.5964 26.9988 41.8781 27.5624 42.0955 28.1582C42.4255 29.0646 42.6055 30.0424 42.6055 31.0634C42.6055 35.7508 38.8059 39.5506 34.1183 39.5506C29.4308 39.5506 25.6311 35.7508 25.6311 31.0634C25.6311 26.376 29.4308 22.5762 34.1183 22.5762C37.1151 22.5762 39.7487 24.1294 41.2594 26.4744Z" stroke="#4F9748" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M37.3198 27.1006C37.7374 27.4392 38.1049 27.8458 38.4062 28.3135C38.609 28.6291 38.7771 28.9678 38.9044 29.3166C39.1081 29.8759 39.2107 30.4615 39.2107 31.0633C39.2107 33.8717 36.9269 36.1556 34.1184 36.1556" stroke="#4F9748" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M25.6311 12.3916V14.089V18.3327V24.2737V27.6686V31.0635" stroke="#4F9748" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M41.2594 26.474L35.574 13.941L33.4453 9.24749C32.8368 8.30287 31.8632 7.61541 30.7234 7.38455C30.4493 7.32854 30.1649 7.29883 29.8747 7.29883C27.5313 7.29883 25.6311 9.19911 25.6311 11.5425" stroke="#4F9748" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M17.8229 11.5425C17.8229 9.19911 15.9226 7.29883 13.5793 7.29883C13.289 7.29883 13.0047 7.32854 12.7306 7.38455C11.5907 7.61541 10.6173 8.30287 10.0087 9.24749L7.88015 13.941L2.19458 26.474" stroke="#4F9748" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M17.823 31.0635V27.6686V24.2737V18.3327V14.089V12.3916" stroke="#4F9748" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M17.823 27.668H25.6312" stroke="#4F9748" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M17.823 24.2734H25.6312" stroke="#4F9748" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M17.823 14.0889H25.6312" stroke="#4F9748" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M25.6311 12.3915V11.5427V6.45045C25.6311 5.04413 26.7709 3.9043 28.1773 3.9043C29.5835 3.9043 30.7234 5.04413 30.7234 6.45045V7.38405" stroke="#4F9748" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12.7307 7.38405V6.45045C12.7307 5.04413 13.8705 3.9043 15.2769 3.9043C16.6832 3.9043 17.823 5.04413 17.823 6.45045V11.5427V12.3915" stroke="#4F9748" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M25.6311 18.3327C25.6311 15.0515 28.291 12.3916 31.5722 12.3916C33.1134 12.3916 34.5181 12.9789 35.5739 13.9414" stroke="#4F9748" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M7.88037 13.9414C8.93618 12.9789 10.3408 12.3916 11.8821 12.3916C15.1633 12.3916 17.8231 15.0515 17.8231 18.3327" stroke="#4F9748" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                        </g>
                        <defs>
                        <clipPath id="clip0_14_754">
                        <rect width="44" height="44" fill="white"/>
                        </clipPath>
                        </defs>
                        </svg>    
              </span>
              <h2 className="text-[18px] md:text-[24px] font-bold text-black">OUR VISION</h2>
            </div>
            <p className="text-[14px] md:text-[22px] font-light text-justify text-black hyphens-auto">
              CLN Logistics aim to provide the logistics process, striving to integrate all aspects of physical cargo movement, vendor and document management, information flow and visibility for customers.
              <br />
              <br />
              This process-focused methodology begins by choosing transportation modes, ports and carriers that will optimize all aspects of your supply chain – seeking solutions that reduce operating costs and transit times.
            </p>
          </div>

          {/* MISSION */}
          <div
            data-aos="fade-left"
            data-aos-offset="300"
            data-aos-easing="ease-in-sine"
            className="w-full lg:w-[50%] flex flex-col gap-2"
          >
            <div className="flex gap-4 items-center mb-2">
              <span>
                <svg className="w-[28px]" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clip-path="url(#clip0_14_773)">
                        <path d="M30.2818 25.1575L35.7346 19.7047C36.6957 18.7439 37.2354 17.4406 37.2354 16.0815V5.72223C37.2354 4.3072 38.3826 3.16016 39.7975 3.16016C41.2125 3.16016 42.3597 4.3072 42.3597 5.72223V19.7108C42.3597 21.7086 41.6592 23.6433 40.3802 25.1781L33.8194 33.051V37.3212H21.863V29.8682C21.863 27.6033 22.7627 25.4311 24.3642 23.8295L31.8007 16.3926C32.8011 15.3922 34.4232 15.392 35.4237 16.3924C36.4243 17.3929 36.4244 19.0151 35.4239 20.0157L30.2818 25.1575Z" stroke="#4F9748" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M13.4442 25.1575L7.99147 19.7047C7.03043 18.7439 6.49061 17.4406 6.49061 16.0815V5.72223C6.49061 4.3072 5.34347 3.16016 3.92853 3.16016C2.51358 3.16016 1.36646 4.3072 1.36646 5.72223V19.7108C1.36646 21.7086 2.06684 23.6433 3.34592 25.1781L9.9067 33.051V37.3212H21.8631V29.8682C21.8631 27.6033 20.9633 25.4311 19.3619 23.8295L11.9255 16.3926C10.925 15.3922 9.30291 15.392 8.30233 16.3924C7.30176 17.3929 7.30167 19.0151 8.30216 20.0157L13.4442 25.1575Z" stroke="#4F9748" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M35.5275 42.4455H21.863V37.3213H35.5275V42.4455Z" stroke="#4F9748" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M21.8631 42.4455H8.19873V37.3213H21.8631V42.4455Z" stroke="#4F9748" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M21.8632 3.80791L20.5782 2.52302C18.9225 0.867326 16.2382 0.867326 14.5824 2.52302C12.9266 4.17881 12.9266 6.86318 14.5824 8.51896L21.8632 15.7997L29.1438 8.51896C30.7997 6.86318 30.7997 4.17881 29.1438 2.52302C27.4881 0.867326 24.8037 0.867326 23.1481 2.52302L21.8632 3.80791Z" stroke="#4F9748" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                        </g>
                        <defs>
                        <clipPath id="clip0_14_773">
                        <rect width="44" height="44" fill="white"/>
                        </clipPath>
                        </defs>
                        </svg>
              </span>
              <h2 className="text-[18px] md:text-[24px] font-bold text-black">OUR MISSION</h2>
            </div>
            <p className="text-[14px] md:text-[22px] font-light text-justify text-black whitespace-pre-line">
              We provide our customers with full control and visibility both in choosing the best-in-class service providers and in managing their own supply chains. Our reward comes from the satisfaction of our customers, their customers, and associates; and we strive to become a trust link in our customers' business success.
            </p>
          </div>
        </div>
      </section>

      {/* BANNER */}
      <section className="w-full h-fit overflow-hidden">
        <div className="relative flex justify-center items-center w-full h-[25vh] md:h-[40vh] lg:h-[50vh]">
          <img
            src="/assets/image/banner_4.png"
            alt="Banner"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/40"></div>
          <div
            data-aos="fade-up"
            data-aos-offset="300"
            data-aos-easing="ease-in-sine"
            className="relative text-center px-4"
          >
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

      {/* DIVIDER */}
      <div className="w-full h-[5px] bg-gradient-to-l from-white to-[#4F9748]" />

      {/* SAMPLE SHIPMENT */}
      <section className="flex flex-col md:flex-row w-full h-fit overflow-hidden p-3 xl:max-w-screen-xl mx-auto gap-3">
        <div
          data-aos="fade-right"
          data-aos-offset="300"
          data-aos-easing="ease-in-sine"
          className="w-[300px] mx-auto bg-gradient-to-b from-white to-[#4F9748] p-2 rounded-lg"
        >
          <img
            src="/assets/image/poster_1.png"
            alt="Sample Shipment"
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div
          data-aos="fade-left"
          data-aos-offset="300"
          data-aos-easing="ease-in-sine"
          className="w-full md:w-[70%] px-3 flex flex-col justify-start"
        >
          <h2 className="text-[18px] md:text-[24px] font-bold text-black">Sample of P.Shipment</h2>
          <p className="text-[14px] md:text-[22px] font-light text-justify text-black hyphens-auto mt-2">
            CLN Logistics has a full capability in handling shipment for customers from A to Z with full correspondence of backup, feedback, and responsibility. We have successfully handled customersʼ shipments with different commodities and delivery times, as illustrated in the attached images.
          </p>
        </div>
      </section>

          {/* FCL - LCL SHIPPING */}
      <section className="flex flex-col md:flex-row w-full h-fit overflow-hidden p-3 xl:max-w-screen-xl mx-auto gap-3">
      <div
          data-aos="fade-right"
          data-aos-offset="300"
          data-aos-easing="ease-in-sine"
          className="w-full md:w-[70%] px-3 flex flex-col justify-start"
        >
          <h2 className="text-[18px] md:text-[24px] font-bold text-black">FCL - LCL SHIPPING</h2>
          <p className="text-[14px] md:text-[22px] font-light text-justify text-black hyphens-auto mt-2">
            CLN Logistics has a full capability in handling shipment for customers from A to Z with full correspondence of backup, feedback, and responsibility. We have successfully handled customersʼ shipments with different commodities and delivery times, as illustrated in the attached images.
          </p>
        </div>
        <div
          data-aos="fade-left"
          data-aos-offset="300"
          data-aos-easing="ease-in-sine"
          className="w-[300px] mx-auto p-2 rounded-lg"
        >
          <img
            src="/assets/image/fcl-lcl.png"
            alt="Sample Shipment"
            className="w-full h-full object-cover object-center"
          />
        </div>
      </section>
    </>
  );
};

export default AboutCLN;
