import { useEffect, useState } from "react";
import { getQuoteHistory } from "../../services/quoteHistoryService";
import type { QuoteHistoryItem } from "../../types/quoteHistory";
import { notifyApiError } from "../../utils/swalHelper";

const QuoteHistoryList = () => {
  const [quotes, setQuotes] = useState<QuoteHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<QuoteHistoryItem | null>(null);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const res = await getQuoteHistory({ page, limit: pageSize, search: search || undefined });
      if (res.success && Array.isArray(res.data)) {
        setQuotes(res.data);
        setTotalPages(res.pagination?.pages || 1);
        setTotal(res.pagination?.total ?? res.data.length);
      } else {
        setQuotes([]);
        setTotalPages(1);
        setTotal(0);
      }
    } catch (error) {
      // Admin-only endpoint — a non-admin viewing this page (or a backend error) surfaces here as a toast
      notifyApiError(error, "Failed to load quote history", "Failed to load quote history. Please try again.");
      setQuotes([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchQuotes();
  };

  const formatDate = (value?: string) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
  };

  if (loading && quotes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4" />
          <p className="text-gray-600">Loading quote history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Quote History</h1>
          <p className="text-sm text-gray-500 mt-1">
            All "Request a Quote" submissions from the website ({total} total). Admin only.
          </p>
        </div>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by company, name, email, or service..."
          className="border rounded px-3 py-2 flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors duration-200 font-medium text-sm"
        >
          Search
        </button>
      </form>

      <div className="mb-4 flex items-center justify-end gap-2">
        <label>Per page:</label>
        <select
          className="border rounded px-2 py-1"
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
        >
          {[10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {quotes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">No quote requests found.</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quotes.map((q) => (
                <tr key={q._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(q.created_at)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{q.company_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{q.requester_name || q.full_name}</div>
                    <div className="text-xs text-gray-500">{q.requester_email || q.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{q.service}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{q.origin_destination}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => setSelected(q)}
                    >
                      View
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

      {selected && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-[90] p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              ✖
            </button>
            <h2 className="text-xl font-bold mb-4 text-[#5b975f]">Quote Request Details</h2>
            <dl className="grid grid-cols-3 gap-x-3 gap-y-2 text-sm">
              <dt className="font-medium text-gray-500">Submitted</dt>
              <dd className="col-span-2">{formatDate(selected.created_at)}</dd>
              <dt className="font-medium text-gray-500">Company</dt>
              <dd className="col-span-2">{selected.company_name}</dd>
              <dt className="font-medium text-gray-500">Full Name</dt>
              <dd className="col-span-2">{selected.full_name}</dd>
              <dt className="font-medium text-gray-500">Email</dt>
              <dd className="col-span-2">{selected.email}</dd>
              <dt className="font-medium text-gray-500">Telephone</dt>
              <dd className="col-span-2">{selected.tel}</dd>
              <dt className="font-medium text-gray-500">Job Title</dt>
              <dd className="col-span-2">{selected.job}</dd>
              <dt className="font-medium text-gray-500">Address</dt>
              <dd className="col-span-2">{selected.address}</dd>
              <dt className="font-medium text-gray-500">Origin - Destination</dt>
              <dd className="col-span-2">{selected.origin_destination}</dd>
              <dt className="font-medium text-gray-500">Product</dt>
              <dd className="col-span-2">{selected.product_name}</dd>
              <dt className="font-medium text-gray-500">Weight/Dimensions</dt>
              <dd className="col-span-2">{selected.weight_dimensions}</dd>
              <dt className="font-medium text-gray-500">Service</dt>
              <dd className="col-span-2">{selected.service}</dd>
              <dt className="font-medium text-gray-500">Container/Weight</dt>
              <dd className="col-span-2">{selected.container_size}</dd>
              <dt className="font-medium text-gray-500">Requested By</dt>
              <dd className="col-span-2">
                {selected.requester_name || "—"} {selected.requester_email ? `(${selected.requester_email})` : ""}
              </dd>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteHistoryList;
