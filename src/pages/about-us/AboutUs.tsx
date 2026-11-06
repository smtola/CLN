import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import SEO, { type SEOProps } from "../../components/SEO";
import { fetchSEO } from "../../services/seoService.ts";
import { organizationSchema } from "../../components/schemaExamples.ts";
import GlobalNetwork from "../home/sections/GlobalNetwork.tsx";

const ceo = "/assets/image/Owner.jpeg";
const banner_4 = "/assets/image/banner_4.png";
const poster_1 = "/assets/image/poster_1.png";
const lcl = "/assets/image/fcl-lcl.png";

const FACTS = [
  { value: "2015", label: "Registered in Cambodia" },
  { value: "30+ years", label: "Import and export logistics experience" },
  { value: "Phnom Penh", label: "Office, with local and overseas shipping partners" },
];

const EyeIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const TargetIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" />
  </svg>
);

const AboutCLN: React.FC = () => {
  const [seo, setSeo] = useState<SEOProps>({});

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out",
      disable: () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
  }, []);

  useEffect(() => {
    fetchSEO("about-us")
      .then((data) => setSeo(data))
      .catch((error) => {
        console.error("Failed to fetch SEO data:", error);
        // Fallback SEO data
        setSeo({
          title: "CLN | About Us",
          description: "Learn about CLN Cambodia and our logistics expertise.",
          keywords: "CLN Cambodia, about, logistics, transportation, company",
          ogTitle: "CLN Cambodia - About Us",
          ogDescription: "Learn about CLN Cambodia and our logistics expertise.",
          ogImage: "https://clncambodia.com/assets/image/seo.jpg",
          canonical: "https://clncambodia.com/about-us",
          url: "https://clncambodia.com/about-us",
        });
      });
  }, []);

  return (
    <>
      <SEO {...seo} schemaMarkup={organizationSchema} />

      {/* HERO: ABOUT CLN */}
      <section className="w-full overflow-hidden bg-white">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#EE3A23] to-[#4fb748]" />
        <div className="mx-auto grid max-w-screen-xl items-center gap-12 px-4 py-14 md:px-8 md:py-20 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
          <div data-aos="fade-up">
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-neutral-900 md:text-6xl">
              Every possible move
              <br />
              in your <span className="text-[#EE3A23]">supply chain.</span>
            </h1>

            <div className="mt-8 max-w-[62ch] space-y-4 text-[17px] leading-relaxed text-neutral-600">
              <p>
                <span className="font-semibold text-neutral-900">CLN Cambodia Logistics</span> is a registered company
                established in Cambodia in 2015. We have an office in Phnom Penh and work with many shipping companies,
                both locally and overseas.
              </p>
              <p>
                With over 30 years of experience in import and export logistics, and advanced information technology, we
                offer international and domestic logistics services and networks that let our customers make “All the
                Possible Moves” in their supply chains. We comply with Cambodia’s labor laws and are committed to meeting
                our customers’ expectations.
              </p>
            </div>

            <dl className="mt-10 grid gap-6 border-t border-neutral-200 pt-6 sm:grid-cols-3">
              {FACTS.map((f) => (
                <div key={f.value}>
                  <dt className="text-2xl font-bold text-[#4F9748]">{f.value}</dt>
                  <dd className="mt-1 text-sm leading-snug text-neutral-600">{f.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <figure data-aos="fade-up" data-aos-delay="150" className="mx-auto w-64 sm:w-72 lg:w-full lg:max-w-sm">
            <div className="relative">
              <div className="absolute inset-0 translate-x-3 translate-y-3 rotate-3 rounded-3xl bg-gradient-to-br from-[#EE3A23] to-[#4fb748]" aria-hidden="true" />
              <img
                src={ceo}
                alt="CEO of CLN Cambodia"
                className="relative aspect-[4/5] w-full rounded-3xl object-cover object-top shadow-lg"
              />
            </div>
            <figcaption className="mt-6 text-center text-sm text-neutral-600 lg:text-left">CEO, CLN Cambodia</figcaption>
          </figure>
        </div>
      </section>

      {/* VISION & MISSION */}
      <section className="w-full overflow-hidden bg-neutral-50">
        <div className="mx-auto grid max-w-screen-xl gap-6 px-4 py-14 md:px-8 md:py-20 lg:grid-cols-2 lg:gap-10">
          <article data-aos="fade-up" className="rounded-2xl border-l-4 border-[#4F9748] bg-white p-7 shadow-sm md:p-9">
            <div className="flex items-center gap-3 text-[#4F9748]">
              <EyeIcon />
              <h2 className="text-2xl font-bold text-neutral-900">Our vision</h2>
            </div>
            <div className="mt-5 space-y-4 text-[17px] leading-relaxed text-neutral-600">
              <p>
                At CLN Logistics, we make logistics simple, smooth and stress-free for our customers. We take care of
                every part of the supply chain, from moving cargo and coordinating partners to handling documents and
                sharing information, so you always know what is happening with your shipments.
              </p>
              <p>
                By choosing the best routes, transportation methods and partners, we help your business save time,
                reduce costs and keep goods moving. With CLN Logistics, your supply chain is not just managed, it works
                smarter, so you can focus on what matters most.
              </p>
            </div>
          </article>

          <article data-aos="fade-up" data-aos-delay="120" className="rounded-2xl border-l-4 border-[#EE3A23] bg-white p-7 shadow-sm md:p-9">
            <div className="flex items-center gap-3 text-[#EE3A23]">
              <TargetIcon />
              <h2 className="text-2xl font-bold text-neutral-900">Our mission</h2>
            </div>
            <p className="mt-5 text-[17px] leading-relaxed text-neutral-600">
              We give our customers full control and visibility, both in choosing the best service providers and in
              managing their own supply chains. Our reward is the satisfaction of our customers, their customers and our
              associates, and we strive to be a trusted link in our customers’ business success.
            </p>
          </article>
        </div>
      </section>

      {/* BANNER */}
      <section className="w-full overflow-hidden">
        <div className="relative flex h-[32vh] w-full items-center justify-center md:h-[44vh] lg:h-[52vh]">
          <img src={banner_4} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-black/45" />
          <div data-aos="fade-up" className="relative px-4 text-center">
            <h2 className="font-playwrite-nz text-[24px] leading-snug text-white md:text-[44px]">
              Trust <span className="text-[#4fb748]">US</span>
              <br />
              To Handle
              <br />
              <span className="text-[#4fb748]">Your Shipment</span>
            </h2>
          </div>
        </div>
        <div className="h-1.5 w-full bg-gradient-to-r from-[#EE3A23] to-[#4fb748]" />
      </section>

      {/* AGRICULTURE */}
      <section className="w-full overflow-hidden bg-white">
        <div className="mx-auto grid max-w-screen-xl items-center gap-10 px-4 py-14 md:px-8 md:py-20 md:grid-cols-[320px_minmax(0,1fr)] lg:gap-16">
          <div data-aos="fade-up" className="mx-auto w-full max-w-[320px] rounded-2xl bg-gradient-to-b from-neutral-100 to-[#4F9748]/40 p-3">
            <img src={poster_1} alt="Sample agriculture shipments handled by CLN" className="w-full rounded-xl object-cover object-center" />
          </div>
          <div data-aos="fade-up" data-aos-delay="120">
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-neutral-900 md:text-4xl">
              Your trusted logistics partner in the agriculture industry
            </h2>
            <p className="mt-5 max-w-[62ch] text-[17px] leading-relaxed text-neutral-600">
              CLN Logistics handles shipments for our customers from A to Z, with full follow-up, feedback and
              responsibility. We have successfully handled shipments of different commodities and delivery times, as
              shown in the poster.
            </p>
          </div>
        </div>
      </section>

      {/* FCL / LCL */}
      <section className="w-full overflow-hidden bg-neutral-50">
        <div className="mx-auto max-w-screen-xl px-4 py-14 md:px-8 md:py-20">
          <div data-aos="fade-up" className="flex items-center gap-3">
            <span className="h-8 w-1 rounded-full bg-[#4F9748]" aria-hidden="true" />
            <h2 className="text-2xl font-bold text-neutral-900 md:text-3xl">FCL and LCL shipping</h2>
          </div>
          <div data-aos="fade-up" data-aos-delay="120" className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-2xl bg-white p-3 shadow-sm md:p-5">
            <img src={lcl} alt="FCL and LCL shipping" className="h-auto w-full object-contain" />
          </div>
        </div>
      </section>

      {/* GLOBAL NETWORK */}
      <div className="w-full overflow-hidden bg-white">
        <GlobalNetwork />
      </div>
    </>
  );
};

export default AboutCLN;
