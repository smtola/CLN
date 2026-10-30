import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { getCategories, deleteCategory } from "../../services/categoryService";
import type { Category } from "../../types/category";
import type { DecodeToken } from "../../../types/auth";
import { getUser } from "../../../authStorage";
import {
  confirmDelete,
  showError,
  showSuccess,
  getApiErrorMessage,
} from "../../utils/swalHelper";

/** Neutral gray skeleton block */
function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />;
}

const CategoryList = () => {
  const [user, setUser] = useState<DecodeToken | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const userToken = await getUser();
      setUser(userToken);
    };
    fetchUser();
  }, []);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const res = await getCategories();
      // Ensure we always have an array
      if (Array.isArray(res)) {
        setCategories(res);
      } else {
        console.error("Invalid response format:", res);
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      showError(
        "Failed to load categories",
        getApiErrorMessage(error, "Could not load categories. Please try again.")
      );
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
      console.error("Error deleting category:", error);
      await showError("Error", "Failed to delete category. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="p-3 md:p-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-full sm:w-40" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">Categories</h1>
        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-lg active:scale-[0.98] sm:w-auto md:px-6 md:text-base"
          onClick={() => navigate("/admin/category/create")}
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center shadow-sm md:p-12">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
            <FolderOpen className="h-6 w-6 text-blue-500" />
          </div>
          <p className="text-base text-gray-500 md:text-lg">No categories found.</p>
          <p className="mt-1 text-sm text-gray-400">
            Get started by creating your first category.
          </p>
          <button
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-600 md:text-base"
            onClick={() => navigate("/admin/category/create")}
          >
            <Plus className="h-4 w-4" />
            Create your first category
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden overflow-hidden rounded-xl bg-white shadow md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Category Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {categories.map((category) => (
                    <tr
                      key={category._id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {category.name}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {user?.username || "N/A"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            aria-label={`Edit ${category.name}`}
                            title="Edit"
                            className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-900"
                            onClick={() => navigate(`/admin/category/edit/${category._id}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            aria-label={`Delete ${category.name}`}
                            title="Delete"
                            className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-900"
                            onClick={() => handleDelete(category._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="space-y-4 md:hidden">
            {categories.map((category) => (
              <div
                key={category._id}
                className="rounded-xl bg-white p-4 shadow transition-shadow duration-200 hover:shadow-md"
              >
                <div className="flex flex-col space-y-3">
                  <div>
                    <h3 className="text-sm font-medium uppercase tracking-wide text-gray-500">
                      Category Name
                    </h3>
                    <p className="mt-1 text-base font-semibold text-gray-900">
                      {category.name}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium uppercase tracking-wide text-gray-500">
                      Created By
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {user?.username || "N/A"}
                    </p>
                  </div>
                  <div className="flex gap-3 border-t border-gray-200 pt-2">
                    <button
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors active:scale-[0.98] hover:bg-blue-600"
                      onClick={() => navigate(`/admin/category/edit/${category._id}`)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors active:scale-[0.98] hover:bg-red-600"
                      onClick={() => handleDelete(category._id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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