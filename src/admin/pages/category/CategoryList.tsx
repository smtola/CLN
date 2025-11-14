import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories, deleteCategory } from "../../services/categoryService";
import type { Category } from "../../types/category";
import type { DecodeToken } from "../../../types/auth";
import { getUser } from "../../../authStorage";
import { confirmDelete, showError, showSuccess } from "../../utils/swalHelper";

const CategoryList = () => {
  const [user, setUser] = useState<DecodeToken | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const userToken = await getUser();
      setUser(userToken);
    }
    fetchUser();
  }, [])
 
  const fetchCategory = async () => {
    try {
      setLoading(true);
      const res = await getCategories();
      // Ensure we always have an array
      if (Array.isArray(res)) {
        setCategories(res);
      } else {
        console.error('Invalid response format:', res);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDelete(
      "Delete Category?",
      "Are you sure you want to delete this category? This action cannot be undone.",
      "Yes, delete it!"
    );

    if (!confirmed) return;

    try {
      await deleteCategory(id);
      await showSuccess("Deleted!", "Category has been deleted successfully.", 1500);
      fetchCategory();
    } catch (error) {
      console.error('Error deleting category:', error);
      await showError("Error", "Failed to delete category. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Categories</h1>
        <button
          className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-4 md:px-6 py-2 rounded-lg shadow-md transition-colors duration-200 font-medium text-sm md:text-base"
          onClick={() => navigate("/admin/category/create")}
        >
          + Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 md:p-8 text-center">
          <p className="text-gray-500 text-base md:text-lg">No categories found.</p>
          <button
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm md:text-base"
            onClick={() => navigate("/admin/category/create")}
          >
            Create your first category
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category Name
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
                  {categories.map((category) => (
                    <tr key={category._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user?.username || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                          onClick={() => navigate(`/admin/category/edit/${category._id}`)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 transition-colors"
                          onClick={() => handleDelete(category._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="md:hidden space-y-4">
            {categories.map((category) => (
              <div key={category._id} className="bg-white rounded-lg shadow p-4">
                <div className="flex flex-col space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Category Name</h3>
                    <p className="text-base font-semibold text-gray-900 mt-1">{category.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Created By</h3>
                    <p className="text-sm text-gray-600 mt-1">{user?.username || 'N/A'}</p>
                  </div>
                  <div className="flex gap-3 pt-2 border-t border-gray-200">
                    <button
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                      onClick={() => navigate(`/admin/category/edit/${category._id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                      onClick={() => handleDelete(category._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryList;
