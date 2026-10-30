import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, ChevronDown, ImageOff, Pencil, Trash2, ChevronLeft, ChevronRight, PackageSearch } from "lucide-react";
import { getProducts, deleteProduct } from "../../services/productService";
import type { Product, ProductResponse } from "../../types/product";
import { deleteFiles } from "../../services/s3Service";
import { confirmDelete, showError, showSuccess, getApiErrorMessage } from "../../utils/swalHelper";

interface Filters {
  category?: string;
  search?: string;
  sortBy?: "product" | "category";
  sortOrder?: "asc" | "desc";
}

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({});
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res: ProductResponse = await getProducts({ page, limit: pageSize });
      if (res.success && Array.isArray(res.data)) {
        setProducts(res.data);
        setTotalPages(res.pagination.pages || 1);
      } else {
        setProducts([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      showError("Failed to load products", getApiErrorMessage(error, "Could not load products. Please try again."));
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, pageSize]);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const handleDelete = async (_id: string) => {
    const confirmed = await confirmDelete(
      "Delete Product?",
      "Are you sure you want to delete this product? This action cannot be undone.",
      "Yes, delete it!"
    );
    if (!confirmed) return;

    try {
      const productToDelete = products.find((p) => p._id === _id);
      if (productToDelete) {
        const images = parseImages(productToDelete.image);
        if (images.length > 0) {
          try {
            await deleteFiles(images);
          } catch (error) {
            console.error("Error deleting images:", error);
          }
        }
      }
      await deleteProduct(_id);
      await showSuccess("Deleted!", "Product has been deleted successfully.", 1500);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      await showError("Error", "Failed to delete product. Please try again.");
    }
  };

  const parseImages = (imageInput: string | string[]): string[] => {
    const result: string[] = [];
    const normalize = (value: string | string[]) => {
      if (!value) return;
      if (typeof value === "string") {
        if (value.startsWith("[") && value.endsWith("]")) {
          try {
            const parsed: string[] = JSON.parse(value);
            normalize(parsed);
            return;
          } catch {
            //
          }
        }
        if (value.includes(",")) {
          value
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean)
            .forEach(normalize);
          return;
        }
        result.push(value);
        return;
      }
      if (Array.isArray(value)) value.forEach(normalize);
    };
    normalize(imageInput);
    return result;
  };

  const displayedProducts = useMemo(() => {
    let result = [...products];

    if (filters.category && filters.category !== "All") {
      result = result.filter((p) => p.category === filters.category);
    }

    if (filters.search?.trim()) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((p) =>
        p.product.toLowerCase().includes(searchLower)
      );
    }

    if (filters.sortBy) {
      result.sort((a, b) => {
        const fieldA = a[filters.sortBy!] as string;
        const fieldB = b[filters.sortBy!] as string;
        if (filters.sortOrder === "desc") return fieldB.localeCompare(fieldA);
        return fieldA.localeCompare(fieldB);
      });
    }

    return result;
  }, [products, filters]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-teal-600" />
          <p className="text-sm text-slate-500">Loading products…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Products</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your product catalog.</p>
        </div>
        <button
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-600/20 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/30 active:scale-[0.98] sm:w-auto md:text-base"
          onClick={() => navigate("/admin/product/create")}
        >
          <Plus className="h-4 w-4" />
          Add product
        </button>
      </div>

      {/* Filters/Search/Sort */}
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white p-3 shadow-sm sm:flex-row sm:items-center md:p-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-900 shadow-sm transition-all duration-150 hover:border-slate-300 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
            value={filters.search || ""}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, search: e.target.value }));
              setPage(1);
            }}
          />
        </div>

        <div className="relative">
          <select
            className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm text-slate-900 shadow-sm transition-all duration-150 hover:border-slate-300 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 sm:w-auto"
            value={filters.category || "All"}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, category: e.target.value }));
              setPage(1);
            }}
          >
            <option value="All">All categories</option>
            {[...new Set(products.map((p) => p.category))].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>

        <div className="relative">
          <select
            className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm text-slate-900 shadow-sm transition-all duration-150 hover:border-slate-300 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 sm:w-auto"
            value={`${filters.sortBy || ""}-${filters.sortOrder || "asc"}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split("-") as ["product" | "category", "asc" | "desc"];
              setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
            }}
          >
            <option value="-asc">Sort by</option>
            <option value="product-asc">Product ↑</option>
            <option value="product-desc">Product ↓</option>
            <option value="category-asc">Category ↑</option>
            <option value="category-desc">Category ↓</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>

        <div className="flex items-center gap-2 sm:ml-auto">
          <label className="text-sm text-slate-500">Per page</label>
          <div className="relative">
            <select
              className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-900 shadow-sm transition-all duration-150 hover:border-slate-300 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Product Table */}
      {displayedProducts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/70 bg-white p-12 text-center shadow-sm">
          <PackageSearch className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-700">No products found</p>
          <p className="mt-1 text-sm text-slate-500">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Category</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedProducts.map((product) => {
                  const images = parseImages(product.image);
                  return (
                    <tr key={product._id} className="transition-colors duration-150 hover:bg-slate-50/60">
                      <td className="whitespace-nowrap px-6 py-3.5">
                        <div className="flex -space-x-2">
                          {images.length > 0 ? (
                            <>
                              {images.slice(0, 3).map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img}
                                  className="h-10 w-10 rounded-lg border-2 border-white object-cover shadow-sm"
                                />
                              ))}
                              {images.length > 3 && (
                                <span className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-white bg-slate-100 text-xs font-medium text-slate-500 shadow-sm">
                                  +{images.length - 3}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-slate-200 text-slate-300">
                              <ImageOff className="h-4 w-4" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3.5 text-sm font-medium text-slate-900">
                        {product.product}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3.5">
                        <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
                          {product.category}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3.5 text-right">
                        <button
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-700"
                          onClick={() => navigate(`/admin/product/edit/${product._id}`)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          className="ml-1 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleDelete(product._id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 sm:px-6">
            <p className="text-sm text-slate-500">
              Page <span className="font-medium text-slate-700">{page}</span> of{" "}
              <span className="font-medium text-slate-700">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors duration-150 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors duration-150 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;