import { useEffect, useState } from "react";
import { getQuoteHistory } from "../../services/quoteHistoryService";
import type { QuoteHistoryItem, QuoteCharge } from "../../types/quoteHistory";
import { notifyApiError } from "../../utils/swalHelper";
import { formatDate } from "../../../pages/price/utils/formatters";

type FetchStatus = "loading" | "success" | "empty" | "forbidden" | "error";

const getStatusCode = (error: unknown): number | undefined => {
  if (typeof error === "object" && error !== null) {
    const maybeResponse = (error as { response?: { status?: number } }).response;
    if (maybeResponse && typeof maybeResponse.status === "number") return maybeResponse.status;
  }
  return undefined;
};

const formatMoney = (value?: number, currency?: string) => {
  if (value === undefined || value === null) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: currency || "USD" }).format(value);
  } catch {
    return `${currency ?? ""} ${value.toFixed(2)}`.trim();
  }
};

const formatDates = (value?: string) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
};

const STATUS_STYLE = {
  converted: { label: "Converted", bg: "#EAF2EA", text: "#3F6B42", dot: "#5B975F" },
  pending: { label: "Pending", bg: "#F5F1E6", text: "#8A6D22", dot: "#B08B2E" },
};

const QuoteHistoryList = () => {
  const [quotes, setQuotes] = useState<QuoteHistoryItem[]>([]);
  const [status, setStatus] = useState<FetchStatus>("loading");
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<QuoteHistoryItem | null>(null);

  const fetchQuotes = async () => {
    try {
      setStatus("loading");
      const res = await getQuoteHistory({ page, limit: pageSize, search: search || undefined });

      setQuotes(res.data);
      setTotalPages(res.pagination.pages || 1);
      setTotal(res.pagination.total ?? res.data.length);
      setStatus(res.data.length === 0 ? "empty" : "success");
    } catch (error) {
      const code = getStatusCode(error);
      setQuotes([]);
      setTotalPages(1);
      setTotal(0);

      if (code === 403 || code === 401) {
        setStatus("forbidden");
      } else {
        setStatus("error");
        notifyApiError(error, "Failed to load quote history", "Failed to load quote history. Please try again.");
      }
    }
  };

  useEffect(() => {
    fetchQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchQuotes();
  };

  return (
    <div className="min-h-screen bg-[#F7F8F6] p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium text-[#5B6B5E]">Admin</p>
            <h1 className="mt-1 text-3xl text-[#1F2B22]" style={{ fontFamily: '"Source Serif 4", Georgia, serif' }}>
              Quote history
            </h1>
            <p className="mt-1 text-sm text-[#5B6B5E]">Every price quote generated through the calculator.</p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-full border border-[#DDE3DC] bg-white px-4 py-1.5 text-sm text-[#3F6B42] sm:self-auto">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5B975F]" />
            {total} {total === 1 ? "quote" : "quotes"}
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A9A8C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search by reference, route, commodity, or requester"
              className="w-full rounded-lg border border-[#DDE3DC] bg-white py-2.5 pl-9 pr-3 text-sm text-[#1F2B22] placeholder:text-[#8A9A8C] focus:border-[#5B975F] focus:outline-none focus:ring-2 focus:ring-[#5B975F]/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button type="submit" className="rounded-lg bg-[#3F6B42] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#345A37] focus:outline-none focus:ring-2 focus:ring-[#5B975F]/40">
              Search
            </button>
            <label className="flex items-center gap-2 text-sm text-[#5B6B5E]">
              <span className="hidden sm:inline">Per page</span>
              <select
                className="rounded-lg border border-[#DDE3DC] bg-white px-2 py-2.5 text-sm text-[#1F2B22] focus:border-[#5B975F] focus:outline-none focus:ring-2 focus:ring-[#5B975F]/20"
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              >
                {[10, 20, 50].map((size) => <option key={size} value={size}>{size}</option>)}
              </select>
            </label>
          </div>
        </form>

        <div className="overflow-hidden rounded-xl border border-[#DDE3DC] bg-white">
          {status === "loading" && <SkeletonRows />}

          {status === "forbidden" && (
            <StateNotice title="Admins only" body="This page is restricted to admin accounts. If you think you should have access, ask an administrator to check your role." />
          )}

          {status === "error" && (
            <StateNotice title="Couldn't load quote history" body="The request didn't go through. Check your connection and try again." action={{ label: "Retry", onClick: fetchQuotes }} />
          )}

          {status === "empty" && (
            <StateNotice title="No quotes found" body={search ? `Nothing matches "${search}".` : "Quotes generated through the calculator will show up here."} />
          )}

          {status === "success" && (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#EDF0EC]">
                  <thead>
                    <tr className="border-b border-[#DDE3DC] text-left text-xs font-medium text-[#5B6B5E]">
                      <th className="px-6 py-3 font-medium">Submitted</th>
                      <th className="px-6 py-3 font-medium">Reference</th>
                      <th className="px-6 py-3 font-medium">Route</th>
                      <th className="px-6 py-3 font-medium">Commodity</th>
                      <th className="px-6 py-3 font-medium">Price</th>
                      <th className="px-6 py-3 font-medium">Requested by</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDF0EC]">
                    {quotes.map((q) => {
                      const s = STATUS_STYLE[q.converted ? "converted" : "pending"];
                      return (
                        <tr key={q._id} className="cursor-pointer transition-colors hover:bg-[#F5F7F4]" onClick={() => setSelected(q)}>
                          <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-[#5B6B5E]">{formatDates(q.created_at)}</td>
                          <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-[#1F2B22]">{q.quote_ref}</td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-[#1F2B22]">{q.origin} → {q.destination}</td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-[#1F2B22]">
                            {q.commodity}
                            <div className="text-xs text-[#5B6B5E]">{q.container_type} · {q.mode}</div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-[#1F2B22]">
                            {formatMoney(q.price, q.currency)}
                            <div className="text-xs text-[#5B6B5E]">{q.eta}</div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="text-sm text-[#1F2B22]">{q.requested_by?.username || "—"}</div>
                            <div className="text-xs text-[#5B6B5E]">{q.requested_by?.email}</div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium" style={{ backgroundColor: s.bg, color: s.text }}>
                              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
                              {s.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-[#DDE3DC] px-6 py-4">
                <p className="text-xs text-[#5B6B5E]">Page {page} of {totalPages}</p>
                <div className="flex items-center gap-2">
                  <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-[#DDE3DC] px-3 py-1.5 text-sm text-[#1F2B22] transition-colors hover:bg-[#F5F7F4] disabled:cursor-not-allowed disabled:opacity-40">
                    Previous
                  </button>
                  <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-lg border border-[#DDE3DC] px-3 py-1.5 text-sm text-[#1F2B22] transition-colors hover:bg-[#F5F7F4] disabled:cursor-not-allowed disabled:opacity-40">
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {selected && <QuoteDrawer quote={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

const StateNotice = ({ title, body, action }: { title: string; body: string; action?: { label: string; onClick: () => void } }) => (
  <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
    <p className="text-sm font-medium text-[#1F2B22]">{title}</p>
    <p className="max-w-sm text-sm text-[#5B6B5E]">{body}</p>
    {action && (
      <button onClick={action.onClick} className="mt-1 rounded-lg border border-[#DDE3DC] px-4 py-2 text-sm font-medium text-[#1F2B22] transition-colors hover:bg-[#F5F7F4]">
        {action.label}
      </button>
    )}
  </div>
);

const SkeletonRows = () => (
  <div className="divide-y divide-[#EDF0EC] px-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="flex items-center gap-6 py-4">
        <div className="h-3 w-24 animate-pulse rounded bg-[#EDF0EC]" />
        <div className="h-3 w-28 animate-pulse rounded bg-[#EDF0EC]" />
        <div className="h-3 w-36 animate-pulse rounded bg-[#EDF0EC]" />
        <div className="h-3 w-24 animate-pulse rounded bg-[#EDF0EC]" />
        <div className="h-3 w-20 animate-pulse rounded bg-[#EDF0EC]" />
      </div>
    ))}
  </div>
);

const QuoteDrawer = ({ quote, onClose }: { quote: QuoteHistoryItem; onClose: () => void }) => {
  const charges = Object.entries(quote.quotes || {}).filter(([, v]) => v) as [string, QuoteCharge][];
  const s = STATUS_STYLE[quote.converted ? "converted" : "pending"];

  return (
    <div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0 bg-[#1F2B22]/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-[#DDE3DC] px-6 py-5">
          <div>
            <p className="font-mono text-xs text-[#5B6B5E]">{quote.quote_ref}</p>
            <h2 className="mt-0.5 text-xl text-[#1F2B22]" style={{ fontFamily: '"Source Serif 4", Georgia, serif' }}>
              {quote.origin} → {quote.destination}
            </h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-[#8A9A8C] transition-colors hover:bg-[#F5F7F4] hover:text-[#1F2B22] focus:outline-none focus:ring-2 focus:ring-[#5B975F]/30">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium" style={{ backgroundColor: s.bg, color: s.text }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
              {s.label}
            </span>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-[#1F2B22]">Shipment</p>
            <dl className="space-y-3">
              {[
                ["Commodity", quote.commodity],
                ["Mode", quote.mode],
                ["Clearance", quote.clearance],
                ["Container type", quote.container_type],
                ["Container qty", String(quote.container_quantity ?? "—")],
                ["Max weight", quote.container_max_weight ? `${quote.container_max_weight} kg` : "—"],
                ["Chargeable weight", quote.chargeable_weight ? `${quote.chargeable_weight} kg` : "—"],
                ["Distance", quote.distance_km ? `${quote.distance_km} km` : "—"],
                ["Departure date", formatDate(quote.departure_date)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 text-sm">
                  <dt className="text-[#5B6B5E]">{label}</dt>
                  <dd className="text-right text-[#1F2B22]">{value || "—"}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-[#1F2B22]">Cost breakdown</p>
            <div className="space-y-3">
              {charges.map(([key, charge]) => (
                <div key={key} className="rounded-lg border border-[#EDF0EC] p-3">
                  <div className="flex justify-between text-sm font-medium text-[#1F2B22]">
                    <span className="capitalize">{key.replace(/_/g, " ")}</span>
                    <span>{formatMoney(charge.price, charge.currency)}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-[#5B6B5E]">ETA {charge.eta}</p>
                  {charge.breakdown?.breakdown && (
                    <dl className="mt-2 space-y-1 border-t border-[#EDF0EC] pt-2 text-xs">
                      {charge.breakdown.breakdown.clearance !== undefined && (
                        <div className="flex justify-between"><dt className="text-[#5B6B5E]">Clearance</dt><dd className="text-[#1F2B22]">{formatMoney(charge.breakdown.breakdown.clearance, charge.currency)}</dd></div>
                      )}
                      {charge.breakdown.breakdown.trucking !== undefined && (
                        <div className="flex justify-between"><dt className="text-[#5B6B5E]">Trucking</dt><dd className="text-[#1F2B22]">{formatMoney(charge.breakdown.breakdown.trucking, charge.currency)}</dd></div>
                      )}
                    </dl>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-[#1F2B22]">Requested by</p>
            <p className="text-sm text-[#1F2B22]">{quote.requested_by?.username}</p>
            <p className="text-xs text-[#5B6B5E]">{quote.requested_by?.email}</p>
          </div>
        </div>

        <div className="border-t border-[#DDE3DC] px-6 py-4 text-xs text-[#5B6B5E]">
          Submitted {formatDates(quote.created_at)}
        </div>
      </div>
    </div>
  );
};

export default QuoteHistoryList;