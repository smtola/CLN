import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import SEO, { type SEOProps } from "../../components/SEO";
import { fetchSEO } from "../../services/seoService.ts";
import { organizationSchema } from "../../components/schemaExamples.ts";
import { getServices } from "../../admin/services/serviceService.ts";
import type { ServiceItem } from "../../admin/types/service.ts";

const bg_head = "/assets/image/bg_head.jpg";
const air_freight = "/assets/image/air_freight.jpg";

const ServiceSkeleton: React.FC = () => (
  <div className="flex flex-wrap lg:flex-nowrap gap-2 mb-6 animate-pulse">
    <div className="w-full space-y-3">
      <div className="h-6 bg-gray-200 rounded w-1/3" />
      <div className="h-4 bg-gray-100 rounded w-full" />
      <div className="h-4 bg-gray-100 rounded w-full" />
      <div className="h-4 bg-gray-100 rounded w-4/5" />
    </div>
    <div className="w-full mb-2">
      <div className="h-64 bg-gray-200 rounded" />
    </div>
  </div>
);

const Service: React.FC = () => {
  const [seo, setSeo] = useState<SEOProps>({});
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("");
  const [searchParams, setSearchParams] = useSearchParams();
  const contentRef = React.useRef<HTMLDivElement>(null);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getServices({ page: 1, limit: 50 });
      if (res.success && Array.isArray(res.data)) {
        setServices(res.data);
      } else {
        setServices([]);
      }
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    const tabFromQuery = searchParams.get("tab");
    if (tabFromQuery && services.some((s) => s.key === tabFromQuery)) {
      setActiveTab(tabFromQuery);
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (services.length > 0 && !activeTab) {
      setActiveTab(services[0].key);
    }
  }, [searchParams, services, activeTab]);

  const selectTab = (tabKey: string) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey }, { replace: true });
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const searchParam = Object.fromEntries(searchParams);
    fetchSEO("services", searchParam)
      .then((data) => setSeo(data))
      .catch(() => {
        setSeo({
          title: "CLN | Services",
          description: "CLN Cambodia offers comprehensive logistics services.",
          keywords: "CLN Cambodia, services, logistics, freight, transportation",
          ogTitle: "CLN Cambodia - Services",
          ogDescription: "CLN Cambodia offers comprehensive logistics services.",
          ogImage: "https://clncambodia.com/assets/image/seo.jpg",
          canonical: "https://clncambodia.com/services",
          url: "https://clncambodia.com/services",
        });
      });
  }, [searchParams]);

  const activeService = services.find((s) => s.key === activeTab);

  return (
    <>
      <SEO {...seo} schemaMarkup={organizationSchema} />

      {/* HEADER SECTION */}
      <section className="w-full overflow-hidden">
        <div className="relative h-[20vh] smx:h-[30vh] md:h-[50vh]">
          <img
            src={bg_head}
            alt="Header"
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="w-[25vh] h-[25vh] md:w-[40vh] md:h-[30vh] lg:w-[70vh] lg:h-[50vh] bg-white -translate-y-16 translate-x-3 2xl:translate-x-[40%] p-1 overflow-hidden">
          <img
            src={air_freight}
            alt="Air Freight"
            className="w-full h-full object-cover object-center"
          />
        </div>
      </section>

      {/* TABS */}
      <section ref={contentRef} className="w-full px-3 pt-2 2xl:max-w-screen-xl mx-auto">
        {loading ? (
          <ServiceSkeleton />
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🚚</div>
            <p className="text-gray-500 text-[15px]">No services available at the moment.</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <ul className="flex w-full overflow-x-auto overflow-y-hidden space-x-4 hide-scrollbar">
                {services.map((service) => (
                  <li key={service.key}>
                    <button
                      className={`text-[14px] md:text-[22px] capitalize px-2 py-1 md:px-3 md:py-2 rounded-[5px] ${
                        activeTab === service.key
                          ? "bg-[#4fb748]/40 text-[#4fb748]"
                          : "text-[#4fb748]"
                      } whitespace-nowrap`}
                      onClick={() => selectTab(service.key)}
                    >
                      {service.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* SERVICE CONTENT */}
            {activeService && (
              <div className="flex flex-wrap lg:flex-nowrap gap-2 mb-6">
                <div className="w-full">
                  <h2 className="text-[18px] font-bold text-black">
                    {activeService.title}
                  </h2>
                  <p
                    className="text-[14px] md:text-[16px] font-light text-start text-black whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: activeService.description }}
                  />
                </div>
                {activeService.image && (
                  <div className="w-full mb-2">
                    <img
                      src={activeService.image}
                      alt={activeService.title}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
};

export default Service;
