import React, { useState, useEffect, useCallback } from "react";
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

// Skeleton loader for product cards
const ProductSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
    <div className="p-4 border-b border-gray-100">
      <div className="h-5 bg-gray-200 rounded w-1/2 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-3/4" />
    </div>
    <div className="columns-2 gap-2 p-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-36 bg-gray-200 rounded-lg mb-2" />
      ))}
    </div>
  </div>
);

const Products: React.FC = () => {
  const [seo, setSeo] = useState<SEOProps>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "All";
  const selectedProduct = searchParams.get("product");
  const [showPopup, setShowPopup] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 6, total: 0, pages: 1 });
  const [visibleImagesMap, setVisibleImagesMap] = useState<Record<string, number>>({});

  const fetchCategory = async () => {
    try {
      const res = await getCategories();
      if (Array.isArray(res)) {
        setCategories([{ name: "All" }, ...res]);
      } else {
        setCategories([]);
      }
    } catch {
      setCategories([]);
    }
  };

  const fetchProducts = useCallback(async (page = 1, reset = false) => {
    try {
      setLoading(true);
      // When a specific product is selected, load all items in the category
      // so client-side filtering isn't limited to the first paginated page.
      const limit = selectedProduct ? 100 : 6;
      const res = await getProducts({
        page: selectedProduct ? 1 : page,
        limit,
        category: selectedCategory,
      });
      if (res.success) {
        setProducts((prev) => (reset ? res.data : [...prev, ...res.data]));
        setPagination(res.pagination);
      } else {
        setProducts([]);
      }
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedProduct]);

  useEffect(() => {
    fetchCategory();
  }, []);

  useEffect(() => {
    fetchProducts(1, true);
    setVisibleImagesMap({});
  }, [fetchProducts]);

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
        ogImage: "https://clncambodia.com/assets/image/seo.jpg",
        url: "https://clncambodia.com/products"
      }));
  }, [searchParams]);

  const selectCategory = (cat: string) => {
    const params = new URLSearchParams(searchParams);
    if (cat === "All") params.delete("category");
    else params.set("category", cat);
    params.delete("product");
    setSearchParams(params);
    setShowPopup(false);
  };

  const selectProduct = (prod: string) => {
    const params = new URLSearchParams(searchParams);
    if (prod === "All") {
      params.delete("product");
    } else {
      params.set("product", prod);
      const match = subCat.find((sc) => sc.product === prod);
      if (match) params.set("category", match.category);
    }
    setSearchParams(params);
  };

  const filteredSubCat = selectedCategory === "All"
    ? subCat
    : subCat.filter((sc) => sc.category === selectedCategory);

  const filteredProducts = products
    .filter((p) => selectedCategory === "All" || p.category === selectedCategory)
    .filter((p) => !selectedProduct || p.product === selectedProduct);

  const getVisibleImages = (item: Product): string[] => {
    const images: string[] = [];
    const normalize = (img: string | string[]): void => {
      if (!img) return;
      if (typeof img === "string") {
        if (img.startsWith("[") && img.endsWith("]")) {
          try {
            normalize(JSON.parse(img));
          } catch {
            images.push(img);
          }
        } else {
          images.push(img);
        }
      } else if (Array.isArray(img)) {
        img.forEach(normalize);
      }
    };
    normalize(item.image);
    return images;
  };

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

  const categoryColor = (cat: string) =>
    cat === "Export"
      ? "bg-[#4F9748]/10 text-[#4F9748] border-[#4F9748]/30"
      : "bg-[#EE3A23]/10 text-[#EE3A23] border-[#EE3A23]/30";

  return (
    <>
      <SEO {...seo} />

      {/* ── Page Header ── */}
      <section className="w-full bg-gradient-to-r from-[#4fb748] to-[#EE3A23]">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <h1 className="text-[15px] md:text-[22px] font-semibold text-white text-center mb-4 tracking-wide">
            Products We Handle Currently
          </h1>

          <div className="flex flex-nowrap items-center gap-3">
            {/* Filter button */}
            <button
              onClick={() => setShowPopup(true)}
              className="flex items-center shrink-0 gap-2 px-4 py-2 bg-white/20 border border-white/60 text-white text-[13px] md:text-[15px] font-medium rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                stroke-width="1"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M4 4h16v2.172a2 2 0 0 1 -.586 1.414l-4.414 4.414v7l-6 2v-8.5l-4.48 -4.928a2 2 0 0 1 -.52 -1.345v-2.227z" />
              </svg>

              {selectedCategory !== "All" ? selectedCategory : "Filter"}
            </button>

            {/* Product pills */}
            <div className="overflow-x-auto hide-scrollbar flex-1">
              <ul className="flex gap-2 w-max">
                <li>
                  <button
                    onClick={() => selectProduct("All")}
                    className={`px-3 py-1.5 rounded-lg text-[12px] md:text-[14px] font-medium whitespace-nowrap transition-colors
                      ${!selectedProduct
                        ? "bg-white text-[#4F9748] shadow-sm"
                        : "bg-white/15 border border-white/50 text-white hover:bg-white/25"}`}>
                    All
                  </button>
                </li>
                {filteredSubCat.map((sc) => (
                  <li key={sc.key}>
                    <button
                      onClick={() => selectProduct(sc.product)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] md:text-[14px] font-medium whitespace-nowrap transition-colors
                        ${selectedProduct === sc.product
                          ? "bg-white text-[#4F9748] shadow-sm"
                          : "bg-white/15 border border-white/50 text-white hover:bg-white/25"}`}>
                      {sc.product}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Filter popup */}
        {showPopup && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPopup(false)}
          >
            <div
              className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[16px] font-bold text-gray-800">Filter by Category</h2>
                <button
                  onClick={() => setShowPopup(false)}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectCategory(cat.name)}
                    className={`px-4 py-2 text-[13px] rounded-lg font-medium transition-colors
                      ${selectedCategory === cat.name
                        ? "bg-[#4F9748] text-white shadow-sm"
                        : "border border-[#4F9748]/40 text-[#4F9748] hover:bg-[#4F9748]/10"}`}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Product List ── */}
      <section className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-gray-500 text-[15px]">No products found for this selection.</p>
            <button
              onClick={() => selectCategory("All")}
              className="mt-4 px-5 py-2 bg-[#4F9748] text-white rounded-full text-[13px] font-medium hover:bg-[#3d7d38] transition-colors">
              View All Products
            </button>
          </div>
        ) : (
          filteredProducts.map((item: Product) => {
            const images = getVisibleImages(item);
            const visibleImages = visibleImagesMap[item._id] || Math.min(4, images.length);

            return (
              <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                {/* Product header */}
                <div className="flex items-start justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                  <div>
                    <h2 className="text-[15px] md:text-[18px] font-semibold text-gray-900">{item.product}</h2>
                    {item.caption && (
                      <p className="text-[12px] md:text-[14px] text-gray-500 mt-0.5">{item.caption}</p>
                    )}
                  </div>
                  {item.category && (
                    <span className={`shrink-0 ml-3 px-3 py-1 text-[11px] font-semibold rounded-full border ${categoryColor(item.category)}`}>
                      {item.category}
                    </span>
                  )}
                </div>

                {/* Image gallery */}
                <div className="p-3">
                  <div className="columns-2 md:columns-3 lg:columns-4 gap-2">
                    {images.slice(0, visibleImages).map((img, idx) => (
                      <a key={idx} href={img} target="_blank" rel="noopener noreferrer"
                        className="block mb-2 overflow-hidden rounded-lg group">
                        <img
                          src={img}
                          alt={`${item.product} ${idx + 1}`}
                          className="w-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-lg"
                          loading="lazy"
                        />
                      </a>
                    ))}
                  </div>

                  {/* Gallery controls */}
                  {images.length > 4 && (
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
                      <span className="text-[12px] text-gray-400">
                        Showing {Math.min(visibleImages, images.length)} of {images.length} photos
                      </span>
                      <div className="flex gap-2">
                        {visibleImages > 4 && (
                          <button
                            onClick={() => loadLessImages(item)}
                            className="px-3 py-1.5 text-[12px] font-medium border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                            See Less
                          </button>
                        )}
                        {visibleImages < images.length && (
                          <button
                            onClick={() => loadMoreImages(item)}
                            className="px-3 py-1.5 text-[12px] font-medium bg-[#4F9748] text-white rounded-lg hover:bg-[#3d7d38] transition-colors">
                            Load More
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Pagination */}
        {!loading && !selectedProduct && pagination.page < pagination.pages && (
          <div className="flex justify-center pt-4">
            <button
              onClick={() => fetchProducts(pagination.page + 1)}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#4F9748] text-white font-medium rounded-full hover:bg-[#3d7d38] transition-colors shadow-sm text-[14px]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  stroke-width="1"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M17 13v-6l-5 4l-5 -4v6l5 4z" />
                </svg>

              Load More Products
            </button>
          </div>
        )}
      </section>
    </>
  );
};

export default Products;
