import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, Pencil, Trash2, ImageOff } from "lucide-react";
import { getSEO, deleteSEO } from "../../services/seoService";
import type { SeoMeta } from "../../../types/seo";
import { confirmDelete, showError, showSuccess, getApiErrorMessage } from "../../utils/swalHelper";

const ImageCell = ({ src, alt }: { src: string; alt: string }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-slate-200 text-slate-300">
        <ImageOff className="h-4 w-4" />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-12 w-12 rounded-lg border border-slate-200 object-cover shadow-sm"
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
      showError("Failed to load SEO entries", getApiErrorMessage(err, "Could not load SEO entries. Please try again."));
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
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-teal-600" />
          <p className="text-sm text-slate-500">Loading SEO entries…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">SEO management</h1>
          <p className="mt-1 text-sm text-slate-500">Manage meta titles, descriptions, and keywords per page.</p>
        </div>
        <button
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-600/20 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/30 active:scale-[0.98] sm:w-auto md:text-base"
          onClick={() => navigate("/admin/seo/create")}
        >
          <Plus className="h-4 w-4" />
          Add SEO entry
        </button>
      </div>

      {seos.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/70 bg-white p-10 text-center shadow-sm md:p-12">
          <FileText className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-700">No SEO entries found</p>
          <p className="mt-1 text-sm text-slate-500">Create your first entry to manage page metadata.</p>
          <button
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-600/20 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/30 active:scale-[0.98]"
            onClick={() => navigate("/admin/seo/create")}
          >
            <Plus className="h-4 w-4" />
            Create your first SEO entry
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Page</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Keywords</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {seos.map((seo, idx) => {
                    const seoId = (seo as unknown as { id?: string }).id || idx.toString();
                    return (
                      <tr key={seoId} className="transition-colors duration-150 hover:bg-slate-50/60">
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
                            {seo.page || 'N/A'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <ImageCell
                            src={seo.image || seo.ogImage || ''}
                            alt={seo.title || seo.page || 'SEO Image'}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-nowrap text-sm font-medium text-slate-900 line-clamp-2">
                            {seo.title || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="line-clamp-2 max-w-md text-sm text-slate-500">
                            {seo.description || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="line-clamp-2 max-w-xs text-sm text-slate-500">
                            {seo.keywords || 'N/A'}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <button
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-700"
                            onClick={() => navigate(`/admin/seo/edit/${seo.page}`)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            className="ml-1 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleDelete(seo.page || '')}
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
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="space-y-3 md:hidden">
            {seos.map((seo, idx) => {
              const seoId = (seo as unknown as { id?: string }).id || idx.toString();
              return (
                <div key={seoId} className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <ImageCell
                      src={seo.image || seo.ogImage || ''}
                      alt={seo.title || seo.page || 'SEO Image'}
                    />
                    <div className="min-w-0 flex-1">
                      <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
                        {seo.page || 'N/A'}
                      </span>
                      <p className="mt-1.5 truncate text-sm font-semibold text-slate-900">{seo.title || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                    <div>
                      <p className="text-xs font-medium text-slate-400">Description</p>
                      <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">{seo.description || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-400">Keywords</p>
                      <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">{seo.keywords || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                    <button
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors duration-150 hover:bg-blue-100"
                      onClick={() => navigate(`/admin/seo/edit/${seo.page}`)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors duration-150 hover:bg-red-100"
                      onClick={() => handleDelete(seo.page || '')}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
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