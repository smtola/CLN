import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, ChevronDown, ImageOff, Pencil, Trash2, ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { getServices, deleteService } from "../../services/serviceService";
import type { ServiceItem, ServiceResponse } from "../../types/service";
import { deleteFiles } from "../../services/s3Service";
import { confirmDelete, showError, showSuccess, getApiErrorMessage } from "../../utils/swalHelper";

interface Filters {
  search?: string;
  sortBy?: "title" | "key";
  sortOrder?: "asc" | "desc";
}

const ServiceList = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({});
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res: ServiceResponse = await getServices({ page, limit: pageSize });
      if (res.success && Array.isArray(res.data)) {
        setServices(res.data);
        setTotalPages(res.pagination.pages || 1);
      } else {
        setServices([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      showError("Failed to load services", getApiErrorMessage(error, "Could not load services. Please try again."));
      setServices([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [page, pageSize]);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const handleDelete = async (_id: string) => {
    const confirmed = await confirmDelete(
      "Delete Service?",
      "Are you sure you want to delete this service? This action cannot be undone.",
      "Yes, delete it!"
    );
    if (!confirmed) return;

    try {
      const serviceToDelete = services.find((s) => s._id === _id);
      if (serviceToDelete?.image) {
        try {
          await deleteFiles([serviceToDelete.image]);
        } catch (error) {
          console.error("Error deleting image:", error);
        }
      }
      await deleteService(_id);
      await showSuccess("Deleted!", "Service has been deleted successfully.", 1500);
      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
      await showError("Error", "Failed to delete service. Please try again.");
    }
  };

  const displayedServices = useMemo(() => {
    let result = [...services];

    if (filters.search?.trim()) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(searchLower) ||
          s.key.toLowerCase().includes(searchLower)
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
  }, [services, filters]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-teal-600" />
          <p className="text-sm text-slate-500">Loading services…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Services</h1>
          <p className="mt-1 text-sm text-slate-500">Manage the services you offer.</p>
        </div>
        <button
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-600/20 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/30 active:scale-[0.98] sm:w-auto md:text-base"
          onClick={() => navigate("/admin/service/create")}
        >
          <Plus className="h-4 w-4" />
          Add service
        </button>
      </div>

      {/* Filters/Search/Sort */}
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white p-3 shadow-sm sm:flex-row sm:items-center md:p-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search services..."
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
            value={`${filters.sortBy || ""}-${filters.sortOrder || "asc"}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split("-") as [
                "title" | "key",
                "asc" | "desc"
              ];
              setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
            }}
          >
            <option value="-asc">Sort by</option>
            <option value="title-asc">Title ↑</option>
            <option value="title-desc">Title ↓</option>
            <option value="key-asc">Key ↑</option>
            <option value="key-desc">Key ↓</option>
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

      {/* Service Table */}
      {displayedServices.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/70 bg-white p-12 text-center shadow-sm">
          <LayoutGrid className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-700">No services found</p>
          <p className="mt-1 text-sm text-slate-500">Try adjusting your search.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Key</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedServices.map((service) => (
                  <tr key={service._id} className="transition-colors duration-150 hover:bg-slate-50/60">
                    <td className="whitespace-nowrap px-6 py-3.5">
                      {service.image ? (
                        <img
                          src={service.image}
                          alt={service.title}
                          className="h-10 w-10 rounded-lg border border-slate-200 object-cover shadow-sm"
                        />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-slate-200 text-slate-300">
                          <ImageOff className="h-4 w-4" />
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-sm font-medium text-slate-900">
                      {service.title}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5">
                      <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
                        {service.key}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-right">
                      <button
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-700"
                        onClick={() => navigate(`/admin/service/edit/${service._id}`)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        className="ml-1 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleDelete(service._id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
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

export default ServiceList;