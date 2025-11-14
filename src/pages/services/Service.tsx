import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SEO, {type SEOProps} from '../../components/SEO';
import {fetchSEO} from "../../services/seoService.ts";
const bg_head = "/assets/image/bg_head.jpg";
const air_freight = "/assets/image/air_freight.jpg";
import { organizationSchema } from "../../components/schemaExamples.ts";

interface ServiceItem {
  key: string;
  title: string;
  description: string;
  image: string;
}

const Service: React.FC = () => {
  const [seo, setSeo] = useState<SEOProps>({});
  const tabs = [
    { key: "Customs", label: "Customs Clearance" },
    { key: "land", label: "Cross Border (Land Transport)" },
    { key: "sea", label: "Sea Freight" },
    { key: "air", label: "Air Freight" },
    { key: "packing", label: "Packing & Warehouse" },
    { key: "iec", label: "International Express Courier" },
    { key: "consolidation", label: "Consolidation" },
    { key: "door2door", label: "Door to Door Service" },
  ];

  const services: ServiceItem[] = [
    {
      key: "Customs",
      title: "Customs Clearance",
      description:
        "CLN is the proud owner of a certified Customs Brokerage License, dedicated to making customs clearance simple, transparent, and stress-free. <br/> <br/> Our team of certified customs specialists guides importers and exporters through every stage of the process — from preparing and submitting documentation to checking import/export requirements, classifying goods, and ensuring that all duties, taxes, and fees are calculated accurately. <br/> <br/>No confusion. No hassle.<br/> Just smooth, worry-free clearance every time.<br/> <br/> Beyond clearance services, we also provide training and guidance for businesses and individuals looking to apply for Certificates of Origin (CO) online. Our team ensures you understand the process, obtain your CO certification, and meet all necessary proof of permission requirements — helping you stay fully compliant with customs regulations.",
      image: "/assets/image/custom clearance.jpg",
    },
    {
      key: "land",
      title: "Cross Border (Land Transport)",
      description:
        `At CLN Cambodia Logistics, we see cross border land transport as more than just moving goods it’s about building connections between countries, businesses, and people.

With our reliable road transport network, we make international trade easier, faster, and more convenient across regional borders.

Our experienced team ensures your cargo move safely and efficiently across borders helping your business grow with confidence.
        `,
      image: "/assets/image/cross.png",
    },
    {
      key: "sea",
      title: "Sea Freight",
      description:
      `Sea freight is the transportation of goods by cargo ships across international waters. It is one of the most cost-effective and reliable methods for moving large volumes of goods over long distances. Businesses choose sea freight when shipping bulk cargo, raw materials, or products that are not time-sensitive. We handle fresh bananas, fresh mangoes, rice, cashews, and more agricultural products.
      `,
      image: "/assets/image/ship.png",
    },
    {
      key: "air",
      title: "Air Freight",
      description:
        `Air freight is the transportation of goods via aircraft, offering the fastest and most efficient solution for international and domestic shipping. It is ideal for time-sensitive, high-value, or perishable cargo that requires quick delivery across long distances for international shipping. We handle fresh durian, machinery spare parts, samples of products, documents, and frozen seafood.
        `,
      image: "/assets/image/airplan.png",
    },
    {
      key: "packing",
      title: "Packing & Warehouse",
      description:
        `<b class="font-[500]">Packing Services</b>
Proper packing is essential to protect goods during transportation and storage. Professional packing ensures products are secured, labeled, and prepared according to international shipping standards.
Customsized Solutions: Packing tailored to the type, size, and fragility of goods.
<b class="font-[500]">Materials Used</b>: Wooden crates, pallets, cartons, bubble wrap, shrink wrap, and protective coverings.
<b class="font-[500]">Export Compliance</b>: Ensures packaging meets Customss and international trade requirements.
<b class="font-[500]">Benefits</b>: Reduced risk of damage, easier handling, and cost efficiency in shipping.
<b class="font-[500]">Warehouse Services</b>
Warehousing provides safe storage and efficient management of goods before distribution or shipping.
<b class="font-[500]">Storage Options</b>: Short-term and long-term storage solutions.
<b class="font-[500]">Inventory Management</b>: Tracking and monitoring of goods for accuracy and efficiency.
<b class="font-[500]">Value-Added Services</b>: Sorting, labeling, repacking, cross-docking, and order fulfillment.
<b class="font-[500]">Security & Safety</b>: Controlled environments, CCTV monitoring, and safety standards for goods.`,
      image: "/assets/image/warehouse.jpg",
    },
    {
      key: "iec",
      title: "International Express Courier",
      description:
        "International Express Courier services provide fast and reliable delivery of documents, parcels, and goods across borders. This service is ideal for businesses and individuals who require urgent, time-definite shipping with door-to-door convenience.",
      image: "/assets/image/international express.jpg",
    },
    {
      key: "consolidation",
      title: "Consolidation",
      description:
        "Consolidation is a shipping method where multiple smaller shipments from different shippers are combined into a single larger shipment. By grouping goods together, businesses can reduce transportation costs, optimize container usage, and improve overall supply chain efficiency.",
      image: "/assets/image/consolidation.jpg",
    },
    {
      key: "door2door",
      title: "Door To Door Service",
      description:
        "Door-to-Door Service provides a complete logistics solution where goods are picked up directly from the sender’s location and delivered straight to the recipient’s address. This hassle-free service eliminates the need for shippers and consignees to manage multiple transportation steps, offering end-to-end convenience and efficiency.",
      image: "/assets/image/door_to_door.png",
    },
  ];

  const [activeTab, setActiveTab] = useState<string>("Customs");
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const tabFromQuery = searchParams.get("tab");
    if (tabFromQuery) setActiveTab(tabFromQuery);
  }, [searchParams]);

  const selectTab = (tabKey: string) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey }, { replace: true });
  };
  
  useEffect(() => {
    const searchParam = Object.fromEntries(searchParams);
    fetchSEO("services", searchParam)
        .then((data) =>  setSeo(data))
        .catch((error) => {
            console.error("Failed to fetch SEO data:", error);
            // Fallback SEO data
            setSeo({
                title: "CLN | Services",
                description: "CLN Cambodia offers comprehensive logistics services.",
                keywords: "CLN Cambodia, services, logistics, freight, transportation",
                ogTitle: "CLN Cambodia - Services",
                ogDescription: "CLN Cambodia offers comprehensive logistics services.",
                ogImage: "https://clncambodia.com/assets/image/logo.png",
                canonical: "https://clncambodia.com/services",
                url: "https://clncambodia.com/services"
            });
        });
  }, [searchParams]);

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
              <div key={service.key} className="flex flex-wrap lg:flex-nowrap gap-2 mb-6">
                <div className="w-full">
                  <h2 className="text-[18px] md:text-[22px] font-bold text-black">
                    {service.title}
                  </h2>
                  <p
                    className="text-[14px] md:text-[18px] font-light text-start text-black whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: service.description }}
                  ></p>
                </div>
                <div className="w-full mb-2">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              </div>
            )
        )}
      </section>
    </>
  );
};

export default Service;
