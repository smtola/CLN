import React, { useState, useEffect } from 'react';
import AOS from "aos";
import "aos/dist/aos.css";
import SEO, { type SEOProps } from '../../components/SEO';
import { fetchSEO } from "../../services/seoService.ts";
import { organizationSchema } from '../../components/schemaExamples';
import MembershipShow from '../../components/membership.tsx';

const banner = "/assets/image/bg_head.jpg";
const banner_2 = "/assets/image/banner.jpg";
const carton = "/assets/image/carton.png";
const truck = "/assets/image/mockup_truck.png";
const poster_1 = "/assets/image/poster_1.png";

interface Service {
  title: string;
  image: string;
  link: string;
}

const services: Service[] = [
  { title: 'MoC / MAFF / MCFA', image: 'assets/image/moc-maff-mcfa.jpg', link: '#' },
  { title: 'Customs Clearance', image: 'assets/image/custom clearance.jpg', link: 'https://clncambodia.com/services?tab=Customs' },
  { title: 'Cross Border', image: 'assets/image/cross_2.png', link: 'https://clncambodia.com/services?tab=land' },
  { title: 'Sea Freight', image: 'assets/image/ship.png', link: 'https://clncambodia.com/services?tab=sea' },
  { title: 'Air Freight', image: 'assets/image/airplan.png', link: 'https://clncambodia.com/services?tab=air' },
  { title: 'Packing & Warehouse', image: 'assets/image/warehouse.jpg', link: 'https://clncambodia.com/services?tab=packing' },
  { title: 'International Express Courier', image: 'assets/image/international express.jpg', link: 'https://clncambodia.com/services?tab=iec' },
  { title: 'Consolidation', image: 'assets/image/consolidation.jpg', link: 'https://clncambodia.com/services?tab=consolidation' },
  { title: 'Door to Door Service', image: 'assets/image/door_to_door.png', link: 'https://clncambodia.com/services?tab=door2door' },
];

const stats = [
  { value: '30+', label: 'Years Experience' },
  { value: '9', label: 'Core Services' },
  { value: '20+', label: 'Clients Served' },
  { value: '24/7', label: 'Support' },
];

const Home: React.FC = () => {
  const [visibleCount, setVisibleCount] = useState(6);
  const [seo, setSeo] = useState<SEOProps>({});
  const visibleServices = services.slice(0, visibleCount);

  useEffect(() => {
    AOS.init({ duration: 900, once: true });
  }, []);

  useEffect(() => {
    fetchSEO("home")
      .then((data) => setSeo(data))
      .catch(() => setSeo({
        title: "CLN CAMBODIA CO., LTD. - Your Trusted Logistics Partner",
        description: "Discover CLN Cambodia Co., Ltd., your trusted partner for innovative solutions in Cambodia. 30 years of experience in handling import and export logistics.",
        keywords: "CLN Cambodia, logistics, freight, transportation, customs clearance, Cambodia services",
        canonical: "https://clncambodia.com/",
        ogTitle: "CLN CAMBODIA CO., LTD. - Your Trusted Logistics Partner",
        ogDescription: "Discover CLN Cambodia Co., Ltd., your trusted partner for innovative solutions in Cambodia. 30 years of experience in handling import and export logistics.",
        ogImage: "https://clncambodia.com/assets/image/seo.jpg",
        ogType: "website",
        url: "https://clncambodia.com/",
      }));
  }, []);

  return (
    <>
      <SEO {...seo} schemaMarkup={organizationSchema} />

      {/* ── Hero Section ── */}
      <section className="relative">
        <div className="md:hidden w-full h-[3px] bg-gradient-to-l from-[#ffffff] to-[#4F9748]" />

        <div
          className="w-full bg-[#EE3A23]"
          style={{ clipPath: 'polygon(60% 100%, 100% 80%, 100% 0%, 0% 0%, 0% 80%)' }}
        >
          <div
            className="relative flex items-center justify-center w-full h-[28vh] xs:h-[50vh] smx:h-[60vh] lg:h-[72vh] overflow-hidden"
            style={{ clipPath: 'polygon(60% 100%, 100% 70%, 100% 0%, 0% 0%, 0% 70%)' }}
          >
            <img
              src={banner}
              alt="CLN Cambodia logistics banner"
              width={1920}
              height={1080}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#4fb748] via-[#4fb748]/80 to-white/10" />

            {/* Hero text */}
            <div className="relative z-10 text-center px-4 mb-12 md:mb-20">
              <p
                data-aos="fade-down"
                className="text-[11px] md:text-[14px] text-white/90 font-medium uppercase tracking-[4px] mb-2"
              >
                Cambodia's Trusted Logistics Partner
              </p>
              <h2
                data-aos="fade-down"
                data-aos-delay="100"
                className="text-[40px] leading-tight md:text-[68px] md:leading-[68px] font-bold text-white uppercase drop-shadow-lg"
              >
                Welcome to
              </h2>
              <h1
                data-aos="fade-down"
                data-aos-delay="200"
                className="text-[20px] leading-[28px] md:text-[34px] md:leading-[38px] font-semibold text-white uppercase drop-shadow"
              >
                CLN (CAMBODIA) CO., LTD.
              </h1>
              <div
                data-aos="fade-up"
                data-aos-delay="300"
                className="flex flex-wrap justify-center gap-2 mt-4"
              >
                <a href="/services"
                  className="px-5 py-2 bg-[#EE3A23] text-white text-[13px] font-semibold rounded-full hover:bg-[#d43320] transition-colors shadow-lg">
                  Our Services
                </a>
                <a href="/contact-us"
                  className="px-5 py-2 bg-white/20 border border-white text-white text-[13px] font-semibold rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm">
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Truck & carton decorative images */}
        <div className="absolute top-[68%] xs:top-[78%] left-[24%] xl:left-[20%] md:top-[68%] lg:left-[30%] pointer-events-none">
          <img
            data-aos="fade-up"
            src={carton}
            alt="carton"
            width={1920}
            height={1080}
            className="w-[130px] smx:w-[230px] md:w-[280px] lg:w-[380px]"
          />
        </div>
        <div className="absolute top-[58%] xs:top-[68%] left-0 xs:left-[-10%] smx:top-[68%] md:top-[58%] lg:top-[48%] xl:left-[-4%] pointer-events-none">
          <img
            data-aos="fade-right"
            src={truck}
            alt="CLN truck"
            width={1920}
            height={1080}
            className="w-[210px] smx:w-[380px] md:w-[480px] lg:w-[680px] xl:w-[780px]"
          />
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <div className="w-full mt-[5rem] md:mt-[10rem] lg:mt-[15rem] xl:mt-[12rem] bg-[#4F9748]">
        <div className="max-w-screen-xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} data-aos="fade-up" data-aos-delay={i * 80}
              className="flex flex-col items-center text-center py-2 border-r border-white/30 last:border-r-0">
              <span className="text-[28px] md:text-[36px] font-bold text-white leading-none">{s.value}</span>
              <span className="text-[11px] md:text-[13px] text-white/80 font-medium uppercase tracking-wider mt-1">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Transportation Marquee ── */}
      <div className="w-full py-6 overflow-hidden bg-white border-y border-gray-100">
        <p className="text-[13px] md:text-[15px] font-semibold text-center text-[#EE3A23] uppercase tracking-widest mb-3">
          Transportation Modes
        </p>
        <div className="animate-marquee w-full max-w-[100vh] whitespace-nowrap ">
          {['truck_1.png', 'ship_1.png', 'airplan_1.png', 'truck_1.png', 'ship_1.png', 'airplan_1.png'].map((img, idx) => (
            <img
              key={idx}
              src={`assets/image/${img}`}
              alt={img.replace('.png', '')}
              width={400}
              height={300}
              className="inline-block w-[380px] mx-[1vw] object-contain"
            />
          ))}
        </div>
      </div>

      {/* ── About CLN ── */}
      <section className="px-4 xl:max-w-screen-xl mx-auto overflow-hidden py-8">
        <div className="flex items-center gap-3 justify-center mb-6">
          <div className="h-[2px] w-12 bg-[#4F9748]" />
          <h2
            data-aos="fade-up"
            className="text-[20px] md:text-[26px] font-semibold text-white bg-[#EE3A23] px-6 py-1.5 rounded-full">
            ABOUT CLN
          </h2>
          <div className="h-[2px] w-12 bg-[#4F9748]" />
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Image block */}
          <div
            data-aos="fade-left"
            className="relative w-full md:w-[40%] shrink-0"
          >
            <div className="w-[240px] smx:w-[380px] xss:w-[370px] md:w-[240px] lg:w-[300px] px-5">
              <div className="w-full h-[28vh] xss:h-[38vh] md:h-[20vh] lg:h-[28vh] rounded-tl-[24px] overflow-hidden ring-2 ring-[#4F9748]/30">
                <img src={poster_1} alt="CLN Cambodia office" className="w-full h-full object-cover object-center" />
              </div>
            </div>
            <div className="absolute right-0 bottom-0 top-[42%]">
              <img
                src={banner_2}
                alt="CLN team"
                width={1920}
                height={1080}
                className="w-[220px] xs:w-[240px] xss:w-[270px] smx:w-[360px] md:w-[200px] lg:w-[270px] h-[22vh] md:h-[13vh] lg:h-[20vh] object-cover object-center border-[4px] border-white rounded-br-[24px] shadow-lg"
              />
            </div>
            <div className="w-[88%] md:w-[83%] bg-[#EE3A23] rounded-bl-[32px]">
              <div className="px-6 py-5 smx:py-8 md:p-5">
                <b className="text-[28px] md:text-[32px] font-bold text-white leading-none">30+</b>
                <br />
                <span className="text-[13px] md:text-[14px] text-white/90 font-medium">
                  Years of<br />Experience
                </span>
              </div>
            </div>
          </div>

          {/* Text block */}
          <div
            data-aos="fade-right"
            className="w-full md:w-[60%] md:order-first flex flex-col justify-center"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-6 bg-[#4F9748] rounded-full" />
              <span className="text-[16px] font-semibold text-[#4F9748] uppercase tracking-wider">Our Story</span>
            </div>
            <p className="text-[16px] font-[300] text-justify text-gray-800 leading-relaxed">
              <span className="font-semibold text-[#4F9748]">CLN Cambodia Logistics</span> is a registered company established in Cambodia since 2015. Currently, we have an office in Phnom Penh and collaborate with many shipping companies both locally and overseas. With over <b>30 years</b> of experience in handling import and export logistics, along with advanced information technology, we are dedicated to offering the best international and domestic logistics services and networks that enable our customers to make <em> “All the Possible Moves” </em> in their supply chains. We also comply with Cambodia’s labor laws and are committed to providing the best services to meet our customers’ expectations.
            </p>
          </div>
        </div>
      </section>

      {/* ── Network Membership ── */}
      <section className="px-4 xl:max-w-screen-xl mx-auto overflow-hidden py-8">
        <div className="flex items-center gap-3 justify-center mb-6">
          <div className="h-[2px] w-12 bg-[#4F9748]" />
          <h2
            data-aos="fade-up"
            className="text-[20px] md:text-[26px] font-semibold text-white bg-[#EE3A23] px-6 py-1.5 rounded-full">
            Network Membership
          </h2>
          <div className="h-[2px] w-12 bg-[#4F9748]" />
        </div>
        <MembershipShow />
      </section>

      {/* ── Services Grid ── */}
      <section className="w-full max-w-screen-xl mx-auto px-4 py-8 overflow-hidden">
        <div className="flex items-center gap-3 justify-center mb-6">
          <div className="h-[2px] w-12 bg-[#EE3A23]" />
          <h2 className="text-[20px] md:text-[26px] font-semibold text-white bg-[#4F9748] px-6 py-1.5 rounded-full">
            SERVICES
          </h2>
          <div className="h-[2px] w-12 bg-[#EE3A23]" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {visibleServices.map((service, idx) => (
            <a href={service.link}
              key={idx}
              data-aos="fade-up"
              data-aos-delay={idx * 60}
              className="group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 aspect-[4/3]"
            >
              {/* Background image */}
              <img
                src={service.image}
                alt={service.title}
                width={800}
                height={600}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              {/* Green accent bar on hover */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#4F9748] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                <div className="flex items-start gap-2">
                  <h3 className="text-[12px] md:text-[16px] font-semibold text-white leading-tight drop-shadow">
                    {service.title}
                  </h3>
                </div>
              </div>
              {/* Red badge on active/hover */}
              <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#EE3A23] opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>

        {/* Show more / less */}
        <div className="flex gap-3 justify-center mt-6">
          {visibleCount > 6 && (
            <button
              onClick={() => setVisibleCount(6)}
              className="px-5 py-2 text-[13px] font-medium border border-gray-400 text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              Show Less
            </button>
          )}
          {visibleCount < services.length && (
            <button
              onClick={() => setVisibleCount(services.length)}
              className="px-5 py-2 text-[13px] font-medium bg-[#4F9748] text-white rounded-full hover:bg-[#3d7d38] transition-colors shadow"
            >
              View All Services
            </button>
          )}
        </div>
      </section>
    </>
  );
};

export default Home;
