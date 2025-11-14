import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSEO, deleteSEO } from "../../services/seoService";
import type { SeoMeta } from "../../../types/seo";
import { confirmDelete, showError, showSuccess } from "../../utils/swalHelper";

const ImageCell = ({ src, alt }: { src: string; alt: string }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return <span className="text-xs text-gray-400">N/A</span>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-12 w-12 object-cover rounded-md border border-gray-200"
      onError={() => setHasError(true)}
    />
  );
};

const SEOList = () => {
  const [seos, setSeos] = useState<(SeoMeta & { id?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSEOs = async (page: string) => {
    try {
      setLoading(true);
      const res = await getSEO(page || undefined);
      // Ensure we always have an array
      if (Array.isArray(res) && res.length > 0) {
        setSeos(res);
      } else {
        // If no results and we tried empty string, try 'home' as fallback
        if (!page && res.length === 0) {
          const homeRes = await getSEO('home');
          if (Array.isArray(homeRes) && homeRes.length > 0) {
            setSeos(homeRes);
          } else {
            console.warn('No SEO entries found');
            setSeos([]);
          }
        } else {
          console.warn('No SEO entries found or invalid response format:', res);
          setSeos([]);
        }
      }
    } catch (err) {
      console.error('Error fetching SEO:', err);
      // If error and we tried empty string, try 'home' as fallback
      if (!page) {
        try {
          const homeRes = await getSEO('home');
          if (Array.isArray(homeRes) && homeRes.length > 0) {
            setSeos(homeRes);
          }
        } catch (fallbackErr) {
          console.error('Error fetching home SEO:', fallbackErr);
          setSeos([]);
        }
      } else {
        setSeos([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Try to fetch all SEO entries first, fallback to 'home' if needed
    fetchSEOs('');
  }, []);

  const handleDelete = async (page: string) => {
    const confirmed = await confirmDelete(
      "Delete SEO Entry?",
      "Are you sure you want to delete this SEO entry? This action cannot be undone.",
      "Yes, delete it!"
    );

    if (!confirmed) return;

    try {
      await deleteSEO(page);
      await showSuccess("Deleted!", "SEO entry has been deleted successfully.", 1500);
      fetchSEOs(''); // Refresh the list
    } catch (error) {
      console.error('Error deleting SEO:', error);
      await showError("Error", "Failed to delete SEO entry. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading SEO entries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">SEO Management</h1>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md transition-colors duration-200 font-medium"
          onClick={() => navigate("/admin/seo/create")}
        >
          + Add SEO Entry
        </button>
      </div>

      {seos.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">No SEO entries found.</p>
          <button
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            onClick={() => navigate("/admin/seo/create")}
          >
            Create your first SEO entry
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Page
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Keywords
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {seos.map((seo, idx) => {
                  const seoId = (seo as unknown as { id?: string }).id || idx.toString();
                  return (
                    <tr key={seoId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                          {seo.page || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ImageCell
                          src={seo.image || seo.ogImage || ''}
                          alt={seo.title || seo.page || 'SEO Image'}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 line-clamp-2">
                          {seo.title || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 line-clamp-2 max-w-md">
                          {seo.description || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 line-clamp-2 max-w-xs">
                          {seo.keywords || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                          onClick={() => navigate(`/admin/seo/edit/${seo.page}`)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 transition-colors"
                          onClick={() => handleDelete(seo.page || '')}
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

export default SEOList;
