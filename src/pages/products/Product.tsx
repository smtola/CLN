import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import SEO, { type SEOProps } from "../../components/SEO";
import { fetchSEO } from "../../services/seoService.ts";
import type { Category } from "../../admin/types/category.ts";
import { getCategories } from "../../admin/services/categoryService.ts";
import { getProducts } from "../../admin/services/productService.ts";
import type { Product } from "../../admin/types/product.ts";

interface SubCategory {
  key: string;
  category: string;
  product: string;
}

const Products: React.FC = () => {
  const [seo, setSeo] = useState<SEOProps>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "All";
  const [showPopup, setShowPopup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [visibleProduct, setVisibleProduct] = useState(2);

  const subCat: SubCategory[] = [
    { key: "rice", category: "Export", product: "Rice" },
    { key: "rubber", category: "Export", product: "Rubber" },
    { key: "lo", category: "Import", product: "Lubricant Oil" },
    { key: "personal_effect", category: "Import", product: "Personal Effect" },
    { key: "soy_bean", category: "Export", product: "Soy Bean" },
    { key: "pesticide", category: "Import", product: "Pesticide" },
    { key: "fertillizer", category: "Import", product: "Fertillizer" },
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

  const fetchCategory = async () => {
    try {
      const res = await getCategories();
      if (Array.isArray(res)) {
        setCategories([{ name: "All" }, ...res]);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error(err);
      setCategories([]);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getProducts();
      if (Array.isArray(res)) setProducts(res);
      else setProducts([]);
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
    fetchProducts();
  }, []);

  useEffect(() => {
    const searchParam = Object.fromEntries(searchParams);
    fetchSEO("products", searchParam)
      .then((data) => setSeo(data))
      .catch(() => setSeo({
        title: "CLN | Products",
        description: "Browse CLN Cambodia products and services.",
        keywords: "CLN Cambodia, products, logistics, transportation",
        ogTitle: "CLN Cambodia - Products",
        ogDescription: "Browse CLN Cambodia products and services.",
        ogImage: "https://clncambodia.com/assets/image/logo.png",
        url: "https://clncambodia.com/products"
      }));
  }, [searchParams]);

  const selectCategory = (cat: string) => {
    setSelectedProduct(null);
    if (cat === "All") searchParams.delete("category");
    else searchParams.set("category", cat);
    setSearchParams(searchParams);
    setShowPopup(false);
  };

  const selectProduct = (prod: string) => {
    setSelectedProduct(prod === "All" ? null : prod);
    const params = new URLSearchParams(searchParams);
    params.set("category", selectedCategory);
    if (prod === "All") params.delete("product");
    else params.set("product", prod);
    setSearchParams(params);
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

  const getVisibleImages = (item: Product): string[] => {
    const result: string[] = [];
    const images = Array.isArray(item.image) ? item.image : [item.image];
    images.forEach((img) => {
      if (typeof img === "string") {
        // parse stringified array
        if (img.startsWith("[") && img.endsWith("]")) {
          try {
            const parsed = JSON.parse(img);
            if (Array.isArray(parsed)) result.push(...parsed);
            return;
          } catch {
            // 
          }
        }
        result.push(img);
      }
    });
    return result;
  };

  const [visibleImagesMap, setVisibleImagesMap] = useState<Record<string, number>>({});

  const loadMoreImages = (item: Product) => {
    setVisibleImagesMap((prev) => ({
      ...prev,
      [item._id]: Math.min((prev[item._id] || 4) + 4, getVisibleImages(item).length),
    }));
  };

  const loadLessImages = (item: Product) => {
    setVisibleImagesMap((prev) => ({
      ...prev,
      [item._id]: Math.max((prev[item._id] || 4) - 4, 4),
    }));
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading products...</p>
      </div>
    </div>
  );

  return (
    <>
      <SEO {...seo} />

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
                Filters
              </button>

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
                      {categories.map((cat, idx) => (
                        <button
                          key={idx}
                          onClick={() => selectCategory(cat.name)}
                          className={`px-4 py-2 text-[16px] md:text-[22px] rounded-[10px] ${
                            selectedCategory === cat.name
                              ? "bg-green-500 text-white shadow hover:bg-green-600"
                              : "border border-green-500 text-green-600 hover:bg-green-100"
                          }`}
                        >
                          {cat.name}
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
        {filteredProducts.map((item: Product) => {
          const images = getVisibleImages(item);
          const visibleImages = visibleImagesMap[item._id] || Math.min(4, images.length);

          return (
            <div key={item._id} className="bg-white overflow-hidden">
              <div className="p-4">
                <h2 className="text-[16px] md:text-[22px] text-[#000] font-medium">{item.product}</h2>
                <span className="text-[14px] md:text-[20px] text-[#000] font-light">{item.caption}</span>
              </div>

              <div className="columns-2 w-full">
                {images.slice(0, visibleImages).map((img, idx) => (
                  <a key={idx} href={img} target="_blank" rel="noopener noreferrer">
                    <img src={img} alt={item.product} className="w-full object-contain mb-4" />
                  </a>
                ))}
              </div>

              <div className="flex gap-2 justify-end mt-4">
                {visibleImages > 4 && (
                  <button
                    onClick={() => loadLessImages(item)}
                    className="px-3 py-1 bg-gray-200 border border-gray-400 rounded text-gray-700"
                  >
                    See Less
                  </button>
                )}
                {visibleImages < images.length && (
                  <button
                    onClick={() => loadMoreImages(item)}
                    className="px-3 py-1 bg-green-50 border border-green-600 text-green-600 rounded"
                  >
                    See More Images
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Show More / Less Products */}
        <div className="flex gap-2 justify-end mt-4">
          {visibleProduct > 2 && (
            <button
              onClick={() => setVisibleProduct(Math.max(2, visibleProduct - 2))}
              className="px-3 py-1 bg-gray-200 border border-gray-400 rounded text-gray-700"
            >
              See Less
            </button>
          )}
          {visibleProduct < filteredProductsTotal && (
            <button
              onClick={() => setVisibleProduct(Math.min(filteredProductsTotal, visibleProduct + 2))}
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
