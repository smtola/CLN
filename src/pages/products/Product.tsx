import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
// import SEO from "../../components/SEO";

interface ProductItem {
  key: string;
  category: string;
  product: string;
  caption: string;
  image: string[];
}

interface SubCategory {
  key: string;
  category: string;
  product: string;
}

const Products: React.FC = () => {
  const categories = ["All", "Export", "Import"];
  const subCat: SubCategory[] = [
    { key: "rice", category: "Export", product: "Rice" },
    { key: "rubber", category: "Export", product: "Rubber" },
    { key: "lo", category: "Import", product: "Lubricant Oil" },
    { key: "personal_effect", category: "Import", product: "Personal Effect" },
    { key: "soy_bean", category: "Export", product: "Soy Bean" },
    { key: "pesticide", category: "Import", product: "Pesticide" },
    { key: "fertillizer", category: "Import", product: "Fertillizer" },
    { key: "farm_equipment", category: "Import", product: "Farm Equipment" },
    { key: "dis", category: "Import", product: "Drip Irrigation System" },
    { key: "aquarium_products", category: "Import", product: "Aquarium Products" },
    { key: "tractors", category: "Import", product: "Tractors" },
    { key: "implement", category: "Import", product: "Implement" },
    { key: "sp", category: "Import", product: "Spare Parts" },
    { key: "fresh_mango", category: "Export", product: "Fresh Mango" },
    { key: "fresh_banana", category: "Export", product: "Fresh Banana" },
    { key: "fresh_durian", category: "Export", product: "Fresh Durian" },
    { key: "sugar_palm", category: "Export", product: "Sugar Palm" },
    { key: "pepper", category: "Export", product: "Pepper" },
    { key: "shelving_rack", category: "Import", product: "Shelving Rack and Light Fitting" },
    { key: "furniture", category: "Export", product: "Furniture" },
    { key: "bsapm", category: "Export", product: "Buddha Status And Pagoda Materials" },
    { key: "veterinary_medicine", category: "Import", product: "Veterinary Medicine" },
  ];

  const products:ProductItem[] = [
    {
      key: 'rice',
      category: 'Export',
      product: 'Rice',
      caption: 'Cambodia - France, Germany, Philippines and China',
      image: ['assets/image/products/rice/rice.jpeg'],
    },
    {
      key: 'rubber',
      category: 'Export',
      product: 'Rubber',
      caption: 'Cambodia - China',
      image: [
        'assets/image/products/rubber/rubber_1.jpg',
        'assets/image/products/rubber/rubber_2.jpg'
      ],
    },
    {
      key: 'lo',
      category: 'Import',
      product: 'Lubricant Oil',
      caption: '',
      image: [],
    },
    {
      key: 'personal_effect',
      category: 'Import',
      product: 'Personal Effect',
      caption: '',
      image: [],
    },
    {
      key: 'soy_bean',
      category: 'Export',
      product: 'Soy Bean',
      caption: '',
      image: [],
    },
    {
      key: 'pesticide',
      category: 'Import',
      product: 'Pesticide',
      caption: 'China, Thailand, Vietnam and Spain - Cambodia - Cambodia',
      image: [
        'assets/image/products/pesticide/pesticide_1.jpg',
        'assets/image/products/pesticide/pesticide_2.jpg',
        'assets/image/products/pesticide/pesticide_3.jpg'
      ],
    },
    {
      key: 'fertillizer',
      category: 'Import',
      product: 'Fertillizer',
      caption: 'China, Thailand, Vietnam and Spain - Cambodia',
      image: [
        'assets/image/products/fertillizer/fertillizer_1.jpg',
        'assets/image/products/fertillizer/fertillizer_2.jpg',
        'assets/image/products/fertillizer/fertillizer_3.jpg',
        'assets/image/products/fertillizer/fertillizer_4.jpg',
      ],
    },
    {
      key: 'farm_equipment',
      category: 'Import',
      product: 'Farm Equipment',
      caption: '',
      image: [],
    },
    {
      key: 'dis',
      category: 'Import',
      product: 'Drip Irrigation System',
      caption: 'China-Cambodia',
      image: [
        'assets/image/products/drip lrrigation system/dls_1.png',
        'assets/image/products/drip lrrigation system/dls_2.png',
        'assets/image/products/drip lrrigation system/dls_3.png'
      ],
    },
    {
      key: 'aquarium_products',
      category: 'Import',
      product: 'Aquarium Products',
      caption: '',
      image: [
        
      ],
    },
    {
      key: 'tractors',
      category: 'Import',
      product: 'Tractors',
      caption: 'Cambodia - India and Italy',
      image: ['assets/image/products/tractors/tractor_1.jpg',
        'assets/image/products/tractors/tractor_2.png',
        'assets/image/products/tractors/tractor_3.jpg'],
    },
    {
      key: 'implement',
      category: 'Import',
      product: 'Implement',
      caption: 'Cambodia - India and Italy',
      image: [
        'assets/image/products/implement/implement1.jpeg',
        'assets/image/products/implement/implement_2.jpg',
        'assets/image/products/implement/implement_3.jpg',
        'assets/image/products/implement/implement_4.jpg'
      ]
    },
    {
      key: 'sp',
      category: 'Import',
      product: 'Spare Parts',
      caption: 'Cambodia - India and Italy',
      image: [
        'assets/image/products/spare parts/sp_1.jpg',
        'assets/image/products/spare parts/sp_2.jpg',
        'assets/image/products/spare parts/sp_3.jpg',
        'assets/image/products/spare parts/sp_4.jpg'
      ]
    },
    {
      key: 'fresh_mango',
      category: 'Export',
      product: 'Fresh Mango',
      caption: 'Cambodia - China, Thailand, India, Dubai and Vietnam',
      image: [
        'assets/image/products/fresh mango/fresh_mango_1.jpg',
        'assets/image/products/fresh mango/fresh_mango_2.jpg',
        'assets/image/products/fresh mango/fresh_mango_3.png',
        'assets/image/products/fresh mango/fresh_mango_4.jpg',
        'assets/image/products/fresh mango/fresh_mango_5.jpg',
        'assets/image/products/fresh mango/fresh_mango_6.jpg'
      ]
    },
    {
      key: 'fresh_banana',
      category: 'Export',
      product: 'Fresh Banana',
      caption: 'Cambodia - China, Thailand, India, Dubai and Vietnam',
      image: [
        'assets/image/products/fresh banana/fresh_banana_1.png',
        'assets/image/products/fresh banana/fresh_banana_2.png'
      ]
    },
    {
      key: 'fresh_durian',
      category: 'Export',
      product: 'Fresh Durian',
      caption: 'Cambodia - China, Thailand, India, Dubai and Vietnam',
      image: [
        'assets/image/products/durian/durian_3.jpg',
        'assets/image/products/durian/durian_2.jpg',
        'assets/image/products/durian/durian_1.jpg',
        'assets/image/products/durian/durian_6.jpg',
        'assets/image/products/durian/durian_5.jpg',
        'assets/image/products/durian/durian_4.jpg'
      ]
    },
    {
      key: 'sugar_palm',
      category: 'Export',
      product: 'Sugar Palm',
      caption: 'Cambodia - Japan, Vietnam and Thailand',
      image: [],
    },
    {
      key: 'pepper',
      category: 'Export',
      product: 'Pepper',
      caption: 'Cambodia - Japan, Vietnam and Thailand',
      image: [
        'assets/image/products/pepper/pepper_2.jpg',
        'assets/image/products/pepper/pepper_3.jpg',
        'assets/image/products/pepper/pepper_4.jpg',
        'assets/image/products/pepper/pepper_1.jpg',
      ]
    },
    {
      key: 'shelving_rack',
      category: 'Import',
      product: 'Shelving Rack and Light Fitting',
      caption: '',
      image: [
        'assets/image/products/shelving rack and light fitting/sralf_1.png',
        'assets/image/products/shelving rack and light fitting/sralf_2.png',
        'assets/image/products/shelving rack and light fitting/sralf_3.png'
      ]
    },
    {
      key: 'furniture',
      category: 'Import',
      product: 'Furniture',
      caption: '',
      image: [
        'assets/image/products/furniture/furniture_1.png',
        'assets/image/products/furniture/furniture_2.png'
      ]
    },
    {
      key: 'bsapm',
      category: 'Export',
      product: 'Buddha Status And Pagoda Materials',
      caption: 'USA-Cambodia',
      image: [
        'assets/image/products/buddha status/buddha_status_1.jpg',
        'assets/image/products/buddha status/buddha_status_2.jpg'
      ],
    },
    {
      key: 'veterinary_midicine',
      category: 'Import',
      product: 'Veterinary Medicine',
      caption: 'Vietnam-Cambodia',
      image: []
    },
  ];


  const [showPopup, setShowPopup] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [visibleProduct, setVisibleProduct] = useState(2);
  const [visibleImage, setVisibleImage] = useState(4);

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const cat = searchParams.get("category");
    const prod = searchParams.get("product");

    if (cat && categories.includes(cat)) setSelectedCategory(cat);

    if (prod) {
      if (
        selectedCategory === "All" ||
        subCat.some((sc) => sc.product === prod && sc.category === selectedCategory)
      ) {
        setSelectedProduct(prod);
      } else {
        setSelectedProduct(null);
      }
    } else {
      setSelectedProduct(null);
    }
  }, [searchParams, selectedCategory]);

  const selectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedProduct(null);
    setSearchParams({ category: cat });
    setShowPopup(false);
  };

  const selectProduct = (prod: string) => {
    setSelectedProduct(prod === "All" ? null : prod);
    setSearchParams({
      category: selectedCategory,
      product: prod === "All" ? "" : prod,
    });
  };

  const filteredSubCat = selectedCategory === "All"
    ? subCat
    : subCat.filter((sc) => sc.category === selectedCategory);

  const filteredProducts = products
    .filter((p) => selectedCategory === "All" || p.category === selectedCategory)
    .filter((p) => !selectedProduct || p.product === selectedProduct)
    .slice(0, visibleProduct);

  const filteredProductsTotal = products
    .filter((p) => selectedCategory === "All" || p.category === selectedCategory)
    .filter((p) => !selectedProduct || p.product === selectedProduct).length;

  const getVisibleImages = (item: ProductItem) => item.image.slice(0, visibleImage);

  const loadMoreImages = (item: ProductItem) => {
    if (visibleImage < item.image.length) setVisibleImage(visibleImage + 4);
  };

  const loadLessImages = () => {
    if (visibleImage > 4) setVisibleImage(visibleImage - 4);
  };

  const loadMore = () => {
    if (visibleProduct < filteredProductsTotal) setVisibleProduct(visibleProduct + 2);
  };

  const loadLess = () => {
    if (visibleProduct > 2) setVisibleProduct(visibleProduct - 2);
  };

  return (
    <>
      {/* Products Section */}
      <section className="w-full h-fit bg-gradient-to-r from-[#4fb748] to-[#EE3A23]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-[16px] md:text-[24px] font-medium text-white text-center py-4">
            Products We Handle Currently
          </h1>

          <div className="flex flex-nowrap items-center gap-4 p-3">
            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={() => setShowPopup(true)}
                className="flex items-center text-[16px] md:text-[22px] gap-2 px-4 py-2 border border-white hover:bg-white/20 text-white rounded-xl transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 md:w-6 md:h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 4.5h18M6 9.75h12M9 15h6M11.25 19.5h1.5"
                  />
                </svg>
                Filters
              </button>

              {/* Popup Overlay */}
              {showPopup && (
                <div
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                  onClick={() => setShowPopup(false)}
                >
                  <div
                    className="bg-white rounded-[10px] w-80 p-6 shadow-lg relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setShowPopup(false)}
                      className="absolute top-3 right-3 text-[16px] md:text-[22px] text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>

                    <h2 className="text-[16px] md:text-[22px] font-bold text-gray-800 mb-4">
                      Category Filters
                    </h2>

                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => selectCategory(cat)}
                          className={`px-4 py-2 text-[16px] md:text-[22px] rounded-[10px] ${
                            selectedCategory === cat
                              ? "bg-green-500 text-white shadow hover:bg-green-600"
                              : "border border-green-500 text-green-600 hover:bg-green-100"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Product Tabs */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar px-1">
              <ul className="flex gap-2 text-[16px] md:text-[22px]">
                <li>
                  <button
                    onClick={() => selectProduct("All")}
                    className={`px-4 py-2 rounded-[10px] ${
                      !selectedProduct
                        ? "bg-[#4fb748]/30 border border-[#4fb748] text-white backdrop-blur-[10px] whitespace-nowrap"
                        : "border bg-black/40 border-white text-green-600 hover:bg-[#4fb748]/30 whitespace-nowrap"
                    }`}
                  >
                    All
                  </button>
                </li>
                {filteredSubCat.map((sc) => (
                  <li key={sc.key}>
                    <button
                      onClick={() => selectProduct(sc.product)}
                      className={`px-4 py-2 rounded-[10px] ${
                        selectedProduct === sc.product
                          ? "bg-[#4fb748]/30 border border-[#4fb748] text-white backdrop-blur-[10px] whitespace-nowrap"
                          : "border bg-black/40 border-white text-green-600 hover:bg-[#4fb748]/30 whitespace-nowrap"
                      }`}
                    >
                      {sc.product}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Product Display */}
      <section className="max-w-7xl mx-auto p-3 grid gap-6">
        {filteredProducts.map((item) => (
          <div key={item.key} className="bg-white overflow-hidden">
            <div className="p-4">
              <h2 className="text-[16px] md:text-[22px] text-[#000] font-medium">{item.product}</h2>
              <span className="text-[14px] md:text-[20px] text-[#000] font-light">{item.caption}</span>
            </div>

            <div className="columns-2 w-full">
              {getVisibleImages(item).map((img, idx) => (
                <a key={idx} href={img} target="_blank" rel="noopener noreferrer">
                  <img
                    src={img}
                    alt={item.product}
                    className="w-full object-contain mb-4"
                  />
                </a>
              ))}
            </div>

            <div className="flex gap-2 justify-end mt-4">
              {visibleImage > 4 && (
                <button
                  onClick={loadLessImages}
                  className="px-3 py-1 bg-gray-200 border border-gray-400 rounded text-gray-700"
                >
                  See Less
                </button>
              )}
              {visibleImage < item.image.length && (
                <button
                  onClick={() => loadMoreImages(item)}
                  className="px-3 py-1 bg-green-50 border border-green-600 text-green-600 rounded"
                >
                  See More Image
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Show More / Less Products */}
        <div className="flex gap-2 justify-end mt-4">
          {visibleProduct > 2 && (
            <button
              onClick={loadLess}
              className="px-3 py-1 bg-gray-200 border border-gray-400 rounded text-gray-700"
            >
              See Less
            </button>
          )}
          {visibleProduct < filteredProductsTotal && (
            <button
              onClick={loadMore}
              className="px-3 py-1 bg-green-50 border border-green-600 text-green-600 rounded"
            >
              See More Products
            </button>
          )}
        </div>
      </section>
    </>
  );
};

export default Products;
