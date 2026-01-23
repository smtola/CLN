import React, { useState, useEffect } from 'react';
import { useQuoteHistory } from '../hooks/useQuotes';
import type { Quote, ServiceLevel } from '../types/quote.types';
import { formatDate, formatDistance, formatWeight, capitalizeFirst } from '../utils/formatters';
import { MODE_COLORS } from '../utils/constants';
import QuoteCard from './QuoteCard';

const QuoteHistory: React.FC = () => {
  const { loading, error, quotes, pagination, fetchQuotes, goToPage } = useQuoteHistory();
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const viewQuoteDetails = (quote: Quote) => {
    setSelectedQuote(quote);
    const modal = document.getElementById('quote_detail_modal') as HTMLDialogElement;
    modal?.showModal();
  };
  
  if (loading && quotes.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title text-2xl">📊 Quote History</h2>
            <button
              onClick={() => fetchQuotes()}
              className="btn btn-ghost btn-sm"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                '🔄 Refresh'
              )}
            </button>
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {quotes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg opacity-70">No quotes found</p>
              <p className="text-sm opacity-50">Create your first quote to see it here</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Route</th>
                      <th>Distance</th>
                      <th>Weight</th>
                      <th>Mode</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.map((quote) => (
                      <tr key={quote._id}>
                        <td className="text-sm">{formatDate(quote.created_at.$date)}</td>
                        <td>
                          <div className="text-sm">
                            <div className="font-semibold">{quote.origin}</div>
                            <div className="text-xs opacity-70">→ {quote.destination}</div>
                          </div>
                        </td>
                        <td>{formatDistance(quote.distance_km)}</td>
                        <td>
                          <div className="text-sm">
                            <div>{formatWeight(quote.chargeable_weight)}</div>
                          </div>
                        </td>
                        <td>
                          <div className={`badge ${MODE_COLORS[quote.mode]} badge-outline`}>
                            {capitalizeFirst(quote.mode)}
                          </div>
                        </td>
                        <td>
                          <button
                            onClick={() => viewQuoteDetails(quote)}
                            className="btn btn-sm btn-ghost"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="join">
                    <button
                      className="join-item btn btn-sm"
                      onClick={() => goToPage(pagination.page - 1)}
                      disabled={pagination.page === 1 || loading}
                    >
                      «
                    </button>
                    <button className="join-item btn btn-sm">
                      Page {pagination.page} of {pagination.pages}
                    </button>
                    <button
                      className="join-item btn btn-sm"
                      onClick={() => goToPage(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages || loading}
                    >
                      »
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Quote Detail Modal */}
      <dialog id="quote_detail_modal" className="modal">
        <div className="modal-box w-11/12 max-w-3xl">
          {selectedQuote && (
            <>
              <h3 className="font-bold text-lg mb-4">Quote Details</h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-base-200 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Route Information</h4>
                  <div className="space-y-1 text-sm">
                    <div>
                      <strong>From:</strong> {selectedQuote.origin}
                    </div>
                    <div>
                      <strong>To:</strong> {selectedQuote.destination}
                    </div>
                    <div>
                      <strong>Distance:</strong> {formatDistance(selectedQuote.distance_km)}
                    </div>
                  </div>
                </div>

                <div className="bg-base-200 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Shipment Details</h4>
                  <div className="space-y-1 text-sm">
                    <div>
                      <strong>Weight:</strong> {formatWeight(selectedQuote.chargeable_weight)}
                    </div>
                    <div>
                      <strong>Mode:</strong> {capitalizeFirst(selectedQuote.mode)}
                    </div>
                  </div>
                </div>
              </div>

              <h4 className="font-semibold mb-3">Available Quotes</h4>
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(selectedQuote.quotes).map(([service, quote]) => (
                  <QuoteCard key={service} service={service as ServiceLevel} quote={quote} />
                ))}
              </div>

              <div className="modal-action">
                <form method="dialog">
                  <button className="btn">Close</button>
                </form>
              </div>
            </>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default QuoteHistory;