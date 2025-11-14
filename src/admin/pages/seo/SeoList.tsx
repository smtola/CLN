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

  const fetchSEOs = async () => {
    try {
      setLoading(true);
      const res = await getSEO(); // Get all SEO entries
      // Ensure we always have an array
      if (Array.isArray(res)) {
        setSeos(res);
      } else {
        console.warn('Unexpected response format, expected array:', res);
        setSeos([]);
      }
    } catch (err) {
      console.error('Error fetching SEO entries:', err);
      setSeos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSEOs();
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
      fetchSEOs(); // Refresh the list
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
    <div className="p-3 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">SEO Management</h1>
        <button
          className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-4 md:px-6 py-2 rounded-lg shadow-md transition-colors duration-200 font-medium text-sm md:text-base"
          onClick={() => navigate("/admin/seo/create")}
        >
          + Add SEO Entry
        </button>
      </div>

      {seos.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 md:p-8 text-center">
          <p className="text-gray-500 text-base md:text-lg">No SEO entries found.</p>
          <button
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm md:text-base"
            onClick={() => navigate("/admin/seo/create")}
          >
            Create your first SEO entry
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
                          <div className="text-sm text-nowrap font-medium text-gray-900 line-clamp-2">
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

          {/* Mobile/Tablet Card View */}
          <div className="md:hidden space-y-4">
            {seos.map((seo, idx) => {
              const seoId = (seo as unknown as { id?: string }).id || idx.toString();
              return (
                <div key={seoId} className="bg-white rounded-lg shadow p-4">
                  <div className="flex flex-col space-y-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Page</h3>
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 mt-1">
                        {seo.page || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Image</h3>
                      <ImageCell
                        src={seo.image || seo.ogImage || ''}
                        alt={seo.title || seo.page || 'SEO Image'}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Title</h3>
                      <p className="text-base font-semibold text-gray-900 mt-1">{seo.title || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Description</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-3">{seo.description || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Keywords</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{seo.keywords || 'N/A'}</p>
                    </div>
                    <div className="flex gap-3 pt-2 border-t border-gray-200">
                      <button
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                        onClick={() => navigate(`/admin/seo/edit/${seo.page}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                        onClick={() => handleDelete(seo.page || '')}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default SEOList;
