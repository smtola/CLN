import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, deleteProduct } from "../../services/productService";
import type { Product, ProductResponse } from "../../types/product";
// import type { DecodeToken } from "../../../types/auth";
// import { getUser } from "../../../authStorage";
import { deleteFiles } from "../../services/s3Service";
import { confirmDelete, showError, showSuccess } from "../../utils/swalHelper";

interface Filters {
  category?: string;
  search?: string;
  sortBy?: "product" | "category";
  sortOrder?: "asc" | "desc";
}

const ProductList = () => {
  // const [user, setUser] = useState<DecodeToken | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({});
  const [pageSize, setPageSize] = useState(5); // dynamic page size
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  // Fetch user info
  // useEffect(() => {
  //   const fetchUser = async () => {
  //     const userToken = await getUser();
  //     setUser(userToken);
  //   };
  //   fetchUser();
  // }, []);

  // Fetch products from API
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
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Refetch when page changes
  useEffect(() => {
    fetchProducts();
  }, [page, pageSize]);

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1); // reset to first page
  };

  // Delete product
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

  // Parse images (string, JSON array, or comma-separated)
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

  // Apply filters/search/sort client-side (optional)
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Products</h1>
        <button
          className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-4 md:px-6 py-2 rounded-lg shadow-md transition-colors duration-200 font-medium text-sm md:text-base"
          onClick={() => navigate("/admin/product/create")}
        >
          + Add Product
        </button>
      </div>

      {/* Filters/Search/Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-start sm:items-center">
        <select
          className="border rounded px-3 py-2"
          value={filters.category || "All"}
          onChange={(e) => {
            setFilters((prev) => ({ ...prev, category: e.target.value }));
            setPage(1);
          }}
        >
          <option value="All">All Categories</option>
          {[...new Set(products.map((p) => p.category))].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search products..."
          className="border rounded px-3 py-2 flex-1"
          value={filters.search || ""}
          onChange={(e) => {
            setFilters((prev) => ({ ...prev, search: e.target.value }));
            setPage(1);
          }}
        />

        <select
          className="border rounded px-3 py-2"
          value={`${filters.sortBy || ""}-${filters.sortOrder || "asc"}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split("-") as ["product" | "category", "asc" | "desc"];
            setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
          }}
        >
          <option value="-asc">Sort By</option>
          <option value="product-asc">Product ↑</option>
          <option value="product-desc">Product ↓</option>
          <option value="category-asc">Category ↑</option>
          <option value="category-desc">Category ↓</option>
        </select>
      </div>
          {/* Page size selector */}
          <div className="mb-4 flex items-center justify-end gap-2">
            <label>Pages:</label>
            <select
              className="border rounded px-2 py-1"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
      {/* Product Table */}
      {displayedProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">No products found.</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayedProducts.map((product) => {
                const images = parseImages(product.image);
                return (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {images.slice(0, 3).map((img, idx) => (
                          <img key={idx} src={img} className="w-12 h-12 object-cover rounded" />
                        ))}
                        {images.length > 3 && <span className="text-xs text-gray-500">+{images.length - 3}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.product}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="text-blue-600 hover:text-blue-900 mr-4" onClick={() => navigate(`/admin/product/edit/${product._id}`)}>Edit</button>
                      <button className="text-red-600 hover:text-red-900" onClick={() => handleDelete(product._id)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-end gap-2 p-4">
            <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border rounded disabled:opacity-50">Previous</button>
            <span className="px-3 py-1 border rounded">{page} / {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
