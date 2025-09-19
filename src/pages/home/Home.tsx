import React, { useState, useEffect } from 'react';
import AOS from "aos";
import "aos/dist/aos.css";
import SEO, {type SEOProps} from '../../components/SEO';
import {fetchSEO} from "../../services/seoService.ts";

interface Service {
  title: string;
  image: string;
}

const services: Service[] = [
  { title: 'Custom Clearance (Import / Export)', image: 'assets/image/custom clearance.jpg' },
  { title: 'Cross border (land transport)', image: 'assets/image/cross.png' },
  { title: 'Sea Freight', image: 'assets/image/ship.png' },
  { title: 'Air Freight', image: 'assets/image/airplan.png' },
  { title: 'Packing & Warehouse', image: 'assets/image/warehouse.jpg' },
  { title: 'International Express Courier', image: 'assets/image/international express.jpg' },
  { title: 'Consolidation', image: 'assets/image/consolidation.jpg' },
  { title: 'Door to Door Service', image: 'assets/image/door_to_door.png' },
];

const Home: React.FC = () => {
  const [visibleCount, setVisibleCount] = useState(4);
    const [seo, setSeo] = useState<SEOProps | null>(null);

  const visibleServices = services.slice(0, visibleCount);
  React.useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);
  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 4, services.length));
  };

  const loadLess = () => {
    setVisibleCount(prev => Math.max(prev - 4, 4));
  };

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

    if (!seo) return <p>Loading...</p>;

  return (
    <>
      <SEO {...seo} />
      <section className="relative">
        <div className="md:hidden w-full h-[3px] bg-gradient-to-l from-[#ffffff] to-[#4F9748]" />

        <div
          className="w-full h-fit bg-[#EE3A23]"
          style={{ clipPath: 'polygon(60% 100%, 100% 80%, 100% 0%, 0% 0%, 0% 80%)' }}
        >
          <div
            className="relative flex items-center justify-center w-full h-[26vh] xs:h-[50vh] smx:h-[60vh] lg:h-[70vh] overflow-hidden"
            style={{ clipPath: 'polygon(60% 100%, 100% 70%, 100% 0%, 0% 0%, 0% 70%)' }}
          >
            <img
              src="assets/image/bg_head.jpg"
              alt="logo"
              width={1920}
              height={1080}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#4fb748] via-[#4fb748]/80 to-white/20" />
            <div className="relative mb-[3rem] text-center">
              <h2
                data-aos="fade-down"
                data-aos-offset="300"
                className="text-[24px] leading-[28px] md:text-[34px] md:leading-[34px] font-medium text-white"
              >
                Welcome to
              </h2>
              <h1
                data-aos="fade-down"
                data-aos-offset="300"
                className="text-[28px] leading-[32px] md:text-[40px] md:leading-[40px] font-medium text-white"
              >
                CLN (CAMBODIA) CO., LTD.
              </h1>
            </div>
          </div>
        </div>

        <div className="absolute top-[70%] xs:top-[80%] left-[25%] xl:left-[20%] md:top-[70%] lg:left-[30%]">
          <img
            data-aos="fade-up"
            data-aos-offset="300"
            src="assets/image/carton.png"
            alt="carton"
            width={1920}
            height={1080}
            className="w-[140px] smx:w-[250px] md:w-[300px] lg:w-[400px]"
          />
        </div>
        <div className="absolute top-[60%] xs:top-[70%] left-0 xs:left-[-10%] smx:top-[70%] md:top-[60%] lg:top-[50%] xl:left-[-4%]">
          <img
            data-aos="fade-right"
            data-aos-offset="300"
            src="assets/image/mockup_truck.png"
            alt="truck mockup"
            width={1920}
            height={1080}
            className="w-[220px] smx:w-[400px] md:w-[500px] lg:w-[700px] xl:w-[800px]"
          />
        </div>
      </section>

      <div className="w-full mt-[5rem] md:mt-[10rem] lg:mt-[12rem] overflow-hidden">
        <h1 className="text-[24px] md:text-[28px] font-medium text-center text-[#EE3A23]">Transportation</h1>
        <div className="animate-marquee whitespace-nowrap overflow-hidden">
          {['truck_1.png', 'ship_1.png', 'airplan_1.png'].map((img, idx) => (
            <img
              key={idx}
              src={`assets/image/${img}`}
              alt={img}
              width={1920}
              height={1080}
              className="inline-block w-[120px] md:w-[400px] xl:w-[300px] mx-[0.5vw]"
            />
          ))}
        </div>
      </div>

      <section className="px-3 xl:max-w-screen-xl mx-auto overflow-hidden">
    <h1 data-aos="fade-left" className="w-fit mx-auto text-[20px] md:text-[28px] font-[400] text-white bg-[#EE3A23] px-4 lg:px-10 py-1 rounded-full my-5">
        ABOUT CLN
    </h1>

    <div className="flex flex-col md:flex-row gap-[1rem]">
        <div data-aos="fade-left"
        data-aos-offset="300"
        data-aos-easing="ease-in-sine"
        className="relative w-full md:w-[40%] h-full mb-2">
            <div  className="w-[240px] smx:w-[400px] xss:w-[390px] md:w-[240px] lg:w-[300px] px-[1.4rem]">
                <div className="w-full h-[30vh] xss:h-[40vh] md:h-[20vh] lg:h-[28vh] rounded-tl-[30px] overflow-hidden">
                    <img 
                        src="assets/image/poster_1.png" 
                        alt="logo"
                        className="w-full h-full object-cover object-center"
                    />
                </div>
            </div>
            <div className="absolute right-0 bottom-0 top-[43%]">
                <img
                        src="assets/image/banner_2.JPG" 
                        alt="logo"
                        width="1920"
                        height="1080"
                        className="w-[230px] xs:w-[250px] xss:w-[280px] smx:w-[380px] md:w-[210px] lg:w-[280px] h-[25vh]  md:h-[13vh] lg:h-[20vh] object-cover object-center border-[5px] border-white rounded-br-[30px]"
                    />
            </div>
            <div className="w-[88%] md:w-[83%] h-full bg-[#EE3A23] rounded-bl-[40px]">
                <div className="px-[2rem] py-[2rem] smx:py-[4rem] md:p-[1.5rem]">
                    <b className="text-[24px] md:text-[28px] font-bold text-white">
                        20
                    </b>
                    <br/>
                    <span className="text-[14px] md:text-[16px] text-white">
                        Years of 
                        <br/>
                        Experiences
                    </span>
                </div>
            </div>
        </div>
        <div data-aos="fade-right"
        data-aos-offset="300"
        data-aos-easing="ease-in-sine" className="w-full md:w-[60%] md:order-first">
            <p className="text-[14px] md:text-[18px] font-[300] text-justify hyphens-auto text-[#000]">
                <span className="font-semibold">CLN Cambodia logistics</span>
                &nbsp;is the registration company, established its own office in Cambodia in 2015.
                Currently, we have our own office in Phnom Penh and joined with many shipping companies in both
                local and oversea.
            
                With our quality staff with more than 20 years experiences of handling logistics and advanced
                information technology, we are dedicated to offering the best international and domestic
                logistics services and networks that enable our customers to make “All the Possible
                Movesˮ in their supply chains. We also comply with Cambodia labor law and
                commit to provide the best services to our customers as their expectation.
            </p>     
        </div>
    </div>
      </section>



      {/* ... Continue refactoring banners and service sections similarly ... */}

      <section className="w-full max-w-screen-xl mx-auto px-3 py-6 overflow-hidden">
        <h1 className="w-fit mx-auto text-[20px] md:text-[28px] font-[400] text-white bg-[#EE3A23] px-4 lg:px-10 py-1 rounded-full mb-4">
          SERVICES
        </h1>
        <div className="flex flex-wrap w-full gap-4">
          {visibleServices.map((service, idx) => (
            <div key={idx} className="relative w-[47%] md:w-[48%] lg:w-[32%] h-[240px] md:h-[40vh] lg:h-[50vh] overflow-hidden">
              <img
                src={service.image}
                alt={service.title}
                width={1920}
                height={1080}
                className="absolute inset-0 w-full h-full object-cover object-center z-[1]"
                style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 50%, 0% 100%)' }}
              />
              <div className="flex justify-center items-center absolute bottom-0 left-1/2 -translate-x-[37%] w-[80%] bg-white px-4 h-[13vh] md:h-[24vh] rounded-[10px] shadow-md z-[2] my-2">
                <h1 className="text-[13px] md:text-[22px] font-bold text-[#4FB748] text-center">
                  {service.title}
                </h1>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-end mt-4">
          {visibleCount > 4 && (
            <button
              onClick={loadLess}
              className="w-fit px-3 py-1 my-2 text-[14px] font-mono text-center bg-gray-50 border border-gray-600 text-gray-600 rounded"
            >
              See Less
            </button>
          )}
          {visibleCount < services.length && (
            <button
              onClick={loadMore}
              className="w-fit px-3 py-1 my-2 text-[14px] font-mono text-center bg-green-50 border border-green-600 text-green-600 rounded"
            >
              See More
            </button>
          )}
        </div>
      </section>
      </>
  );
};

export default Home;
