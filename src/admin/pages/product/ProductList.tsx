import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, deleteProduct } from "../../services/productService";
import type { Product } from "../../types/product";
import type { DecodeToken } from "../../../types/auth";
import { getUser } from "../../../authStorage";
import { deleteFiles } from "../../services/s3Service";
import { confirmDelete, showError, showSuccess } from "../../utils/swalHelper";

const ProductList = () => {
  const [user, setUser] = useState<DecodeToken | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const userToken = await getUser();
      setUser(userToken);
    }
    fetchUser();
  })
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getProducts();
      // Ensure we always have an array
      if (Array.isArray(res)) {
        setProducts(res);
      } else {
        console.error('Invalid response format:', res);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchProducts(); 
  }, []);

  const handleDelete = async (_id: string) => {
    const confirmed = await confirmDelete(
      "Delete Product?",
      "Are you sure you want to delete this product? This action cannot be undone.",
      "Yes, delete it!"
    );

    if (!confirmed) return;

    try {
      // Find the product to get its images
      const productToDelete = products.find(p => p._id === _id);
      
      if (productToDelete) {
        // Parse and delete images from R2 storage
        const images = parseImages(productToDelete.image);
        if (images.length > 0) {
          try {
            await deleteFiles(images);
          } catch (error) {
            console.error('Error deleting images from storage:', error);
            // Continue with product deletion even if image deletion fails
          }
        }
      }
      
      // Delete the product from the database
      await deleteProduct(_id);
      await showSuccess("Deleted!", "Product has been deleted successfully.", 1500);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      await showError("Error", "Failed to delete product. Please try again.");
    }
  };

  // Parse image string (could be comma-separated or single URL)
  const parseImages = (imageString: string): string[] => {
    if (!imageString) return [];
    // Check if it's a JSON array string
    try {
      const parsed = JSON.parse(imageString);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Not JSON, try comma-separated
      if (imageString.includes(',')) {
        return imageString.split(',').map(img => img.trim()).filter(Boolean);
      }
    }
    return [imageString];
  };

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Products</h1>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md transition-colors duration-200 font-medium"
          onClick={() => navigate("/admin/product/create")}
        >
          + Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">No products found.</p>
          <button
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            onClick={() => navigate("/admin/product/create")}
          >
            Create your first product
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => {
                  const images = parseImages(product.image);
                  return (
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {images.length > 0 ? (
                          <div className="flex items-center gap-2">
                            {images.slice(0, 3).map((img, idx) => (
                              <div
                                key={idx}
                                className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0"
                              >
                                <img
                                  src={img}
                                  alt={`${product.product} ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect width="64" height="64" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="10"%3ENo Image%3C/text%3E%3C/svg%3E';
                                  }}
                                />
                              </div>
                            ))}
                            {images.length > 3 && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                +{images.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                            <span className="text-xs text-gray-400">No image</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{product.product}</div>
                        {product.caption && (
                          <div className="text-sm text-gray-500 mt-1 line-clamp-2">{product.caption}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user?.username || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                          onClick={() => navigate(`/admin/product/edit/${product._id}`)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 transition-colors"
                          onClick={() => handleDelete(product._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
