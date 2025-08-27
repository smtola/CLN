import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SEO from "../../components/SEO";

interface ServiceItem {
  key: string;
  title: string;
  description: string;
  image: string;
}

const Service: React.FC = () => {
  const tabs = [
    { key: "custom", label: "Custom Clearance" },
    { key: "land", label: "Cross Border (Land Transport)" },
    { key: "sea", label: "Sea Freight" },
    { key: "air", label: "Air Freight" },
    { key: "packing", label: "Packing & Warehouse" },
    { key: "iec", label: "International Express Courier" },
    { key: "consolidation", label: "Consolidation" },
    { key: "door2door", label: "DTD Service" },
  ];

  const services: ServiceItem[] = [
    {
      key: "custom",
      title: "Custom Clearance",
      description:
        "CLN Logistics has full capability in handling shipment for customers from A to Z...",
      image: "/assets/image/custom clearance.jpg",
    },
    {
      key: "land",
      title: "Cross Border (Land Transport)",
      description:
        "CLN Logistics has full capability in handling shipment for customers from A to Z...",
      image: "/assets/image/cross.png",
    },
    {
      key: "air",
      title: "Air Freight",
      description:
        "CLN Logistics has full capability in handling shipment for customers from A to Z...",
      image: "/assets/image/airplan.png",
    },
    {
      key: "sea",
      title: "Sea Freight",
      description:
        "CLN Logistics has full capability in handling shipment for customers from A to Z...",
      image: "/assets/image/ship.png",
    },
    {
      key: "packing",
      title: "Packing & Warehouse",
      description:
        "CLN Logistics has full capability in handling shipment for customers from A to Z...",
      image: "/assets/image/warehouse.jpg",
    },
    {
      key: "iec",
      title: "International Express Courier",
      description:
        "CLN Logistics has full capability in handling shipment for customers from A to Z...",
      image: "/assets/image/international express.jpg",
    },
    {
      key: "consolidation",
      title: "Consolidation",
      description:
        "CLN Logistics has full capability in handling shipment for customers from A to Z...",
      image: "/assets/image/consolidation.jpg",
    },
    {
      key: "door2door",
      title: "Door To Door Service",
      description:
        "CLN Logistics has full capability in handling shipment for customers from A to Z...",
      image: "/assets/image/door_to_door.png",
    },
  ];

  const [activeTab, setActiveTab] = useState<string>("custom");
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const tabFromQuery = searchParams.get("tab");
    if (tabFromQuery) setActiveTab(tabFromQuery);
  }, [searchParams]);

  const selectTab = (tabKey: string) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey }, { replace: true });
  };

  return (
    <>
     <SEO 
        title="CLN | SERVICES"
        description="CLN Cambodia provides international and domestic logistics, sea freight, air freight, and cross-border land transport services with 20 years of experience."
        keywords="CLN Cambodia, logistics, transportation, sea freight, air freight, cross-border transport, warehousing, customs clearance"
        author="CLN Cambodia"
        ogTitle="CLN | Services"
        ogDescription="Offering international and domestic logistics services with 20 years of experience."
        ogImage="/assets/image/bg_head.jpg"
       />
      {/* HEADER SECTION */}
      <section className="w-full overflow-hidden">
        <div className="relative h-[20vh] smx:h-[30vh] md:h-[50vh]">
          <img
            src="/assets/image/bg_head.jpg"
            alt="Header"
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="w-[25vh] h-[25vh] md:w-[40vh] md:h-[30vh] lg:w-[70vh] lg:h-[50vh] bg-white -translate-y-16 translate-x-3 2xl:translate-x-[40%] p-1 overflow-hidden">
          <img
            src="/assets/image/air_freight.jpg"
            alt="Air Freight"
            className="w-full h-full object-cover object-center"
          />
        </div>
      </section>

      {/* TABS */}
      <section className="w-full px-3 2xl:max-w-screen-xl mx-auto">
        <div className="mb-8">
          <ul className="flex w-full overflow-x-auto overflow-y-hidden space-x-4 hide-scrollbar">
            {tabs.map((t) => (
              <li key={t.key}>
                <button
                  className={`text-[14px] md:text-[22px] capitalize px-2 py-1 md:px-3 md:py-2 rounded-[5px] ${
                    activeTab === t.key
                      ? "bg-[#4fb748]/40 text-[#4fb748]"
                      : "text-[#4fb748]"
                  } whitespace-nowrap`}
                  onClick={() => selectTab(t.key)}
                >
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* SERVICE CONTENT */}
        {services.map(
          (service) =>
            activeTab === service.key && (
              <div key={service.key} className="mb-6">
                <div className="mb-2">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <h2 className="text-[18px] md:text-[22px] font-bold text-black">
                  {service.title}
                </h2>
                <p className="text-[14px] md:text-[18px] font-light text-justify text-black hyphens-auto">
                  {service.description}
                </p>
              </div>
            )
        )}
      </section>
    </>
  );
};

export default Service;
