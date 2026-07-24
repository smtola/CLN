import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getServices, deleteService } from "../../services/serviceService";
import type { ServiceItem, ServiceResponse } from "../../types/service";
import { deleteFiles } from "../../services/s3Service";
import { confirmDelete, showError, showSuccess } from "../../utils/swalHelper";

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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4" />
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Services</h1>
        <button
          className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-4 md:px-6 py-2 rounded-lg shadow-md transition-colors duration-200 font-medium text-sm md:text-base"
          onClick={() => navigate("/admin/service/create")}
        >
          + Add Service
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-start sm:items-center">
        <input
          type="text"
          placeholder="Search services..."
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
            const [sortBy, sortOrder] = e.target.value.split("-") as [
              "title" | "key",
              "asc" | "desc"
            ];
            setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
          }}
        >
          <option value="-asc">Sort By</option>
          <option value="title-asc">Title ↑</option>
          <option value="title-desc">Title ↓</option>
          <option value="key-asc">Key ↑</option>
          <option value="key-desc">Key ↓</option>
        </select>
      </div>

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

      {displayedServices.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">No services found.</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Key
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayedServices.map((service) => (
                <tr key={service._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {service.image ? (
                      <img src={service.image} alt={service.title} className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <span className="text-xs text-gray-400">No image</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{service.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{service.key}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      onClick={() => navigate(`/admin/service/edit/${service._id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDelete(service._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end gap-2 p-4">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 border rounded">
              {page} / {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceList;
