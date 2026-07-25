import React, { useEffect, useState } from 'react';
import { useQuoteHistory } from '../hooks/useQuotes';
import type { Quote, ServiceLevel } from '../types/quote.types';
import type { DecodeToken } from '../../../types/auth';
import { getUser } from '../../../authStorage';
import { formatDate, formatDistance, formatWeight, capitalizeFirst } from '../utils/formatters';
import { MODE_COLORS } from '../utils/constants';
import QuoteCard from './QuoteCard';
import RequesterProfileModal from './RequesterProfileModal';

type Mode = keyof typeof MODE_COLORS;

// ── Brand tokens (derived from the CamFA logo) ──────────────────────────
const BRAND = {
  navy: '#0E3793',
  navyDeep: '#081D42',
  green: '#2E9E42',
  coral: '#E5432A',
  ink: '#0A1628',
  slate: '#47536B',
  border: '#e2e8f0',
  bg: '#f8fafc',
};

const MODE_META: Record<Mode, { icon: string; color: string; bg: string }> = {
  air: { icon: '✈️', color: BRAND.navy, bg: '#E7EDFA' },
  road: { icon: '🚚', color: BRAND.green, bg: '#E9F7EA' },
  sea: { icon: '🚢', color: BRAND.coral, bg: '#FDEAE6' },
  rail: { icon: '🚆', color: BRAND.slate, bg: '#EEF1F5' },
};

// ── Mode badge ────────────────────────────────────────────────────────
const ModeBadge = ({ mode }: { mode: Mode }) => {
  const meta = MODE_META[mode] ?? { icon: '•', color: BRAND.slate, bg: '#f1f5f9' };
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ color: meta.color, background: meta.bg }}
    >
      <span className="text-[11px] leading-none">{meta.icon}</span>
      {capitalizeFirst(mode)}
    </span>
  );
};

// ── Detail Modal (pure React state, no <dialog>) ──────────────────────
// Styled after a cargo manifest / airway bill: a route line in the header,
// a perforated ticket-stub seam, and mono-set data — the same idiom the
// price breakdown already uses for numbers.
const DetailModal = ({
  quote,
  onClose,
}: {
  quote: Quote;
  onClose: () => void;
}) => {
  const modeMeta = MODE_META[quote.mode] ?? { icon: '•', color: BRAND.slate, bg: '#f1f5f9' };
  // Backend issues a proper quote_ref (e.g. "CLN-260725-9F3A2B"); older
  // quotes created before that field existed fall back to a derived code.
  const refCode = quote.quote_ref ?? (quote._id ? quote._id.slice(-8).toUpperCase() : null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(8,17,32,0.7)', backdropFilter: 'blur(3px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full overflow-hidden flex flex-col"
        style={{ maxWidth: 760, maxHeight: '90vh' }}
      >
        {/* Header — navy gradient with route line */}
        <div
          className="relative flex-shrink-0 px-6 pt-5 pb-9"
          style={{ background: `linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.navyDeep} 100%)` }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: 'rgba(255,255,255,0.55)' }}
              >
                Quote Details{refCode ? ` · REF ${refCode}` : ''}
              </p>
              <h3 className="text-white text-lg font-bold mt-1 font-mono tracking-tight">
                {quote.origin} <span style={{ color: 'rgba(255,255,255,0.4)' }}>→</span> {quote.destination}
              </h3>
            </div>
            <button onClick={onClose} className="text-slate-200 hover:text-white transition-colors mt-0.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Route line: origin → mode → destination */}
          <div className="flex items-center gap-2 mt-6">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#fff' }} />
            <span className="flex-1 border-t border-dashed" style={{ borderColor: 'rgba(255,255,255,0.35)' }} />
            <span
              className="flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0 text-[13px]"
              style={{ background: '#fff' }}
            >
              {modeMeta.icon}
            </span>
            <span className="flex-1 border-t border-dashed" style={{ borderColor: 'rgba(255,255,255,0.35)' }} />
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: BRAND.coral }} />
          </div>
        </div>

        {/* Perforated ticket-stub seam */}
        <div className="relative flex-shrink-0" style={{ height: 1, background: BRAND.navyDeep }}>
          <div className="absolute inset-x-0 flex justify-between px-4" style={{ top: -6 }}>
            {Array.from({ length: 26 }).map((_, i) => (
              <span key={i} className="w-[7px] h-[7px] rounded-full bg-white flex-shrink-0" />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 pt-7 space-y-5">
          {/* Route & shipment info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border" style={{ borderColor: BRAND.border, background: BRAND.bg }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#64748b' }}>Route</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">From</span>
                  <span className="font-semibold" style={{ color: BRAND.ink }}>{quote.origin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">To</span>
                  <span className="font-semibold" style={{ color: BRAND.ink }}>{quote.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Distance</span>
                  <span className="font-semibold font-mono" style={{ color: BRAND.ink }}>{formatDistance(quote.distance_km)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border" style={{ borderColor: BRAND.border, background: BRAND.bg }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#64748b' }}>Shipment</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Chargeable Wt.</span>
                  <span className="font-semibold font-mono" style={{ color: BRAND.ink }}>{formatWeight(quote.chargeable_weight)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Mode</span>
                  <ModeBadge mode={quote.mode} />
                </div>
              </div>
            </div>
          </div>

          {/* Quote cards */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#64748b' }}>Available Options</p>
            <div className="grid md:grid-cols-3 gap-3">
              {Object.entries(quote.quotes).map(([service, q]) => (
                <QuoteCard
                  key={service}
                  service={service as ServiceLevel}
                  quote={q}
                  isPopular={service === 'standard'}
                  accentColor={BRAND.navy}
                  popularColor={BRAND.green}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t bg-slate-50"
          style={{ borderColor: BRAND.border }}
        >
          {refCode ? (
            <span className="text-[11px] font-mono tracking-wider" style={{ color: '#94a3b8' }}>
              REF #{refCode}
            </span>
          ) : <span />}
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors hover:bg-white"
            style={{ borderColor: BRAND.border, color: BRAND.slate }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Pagination ────────────────────────────────────────────────────────
const Pagination = ({
  page,
  pages,
  loading,
  onPage,
}: {
  page: number;
  pages: number;
  loading: boolean;
  onPage: (p: number) => void;
}) => {
  if (pages <= 1) return null;
  const btnCls = (disabled: boolean) =>
    `px-3 py-1.5 text-sm rounded-lg border transition-colors ${
      disabled
        ? 'opacity-40 cursor-not-allowed'
        : 'hover:bg-slate-100 cursor-pointer'
    }`;
  return (
    <div className="flex items-center justify-end gap-2 pt-4" style={{ borderTop: '1px solid #f1f5f9' }}>
      <button
        className={btnCls(page === 1 || loading)}
        disabled={page === 1 || loading}
        onClick={() => onPage(page - 1)}
        style={{ borderColor: '#e2e8f0', color: '#475569' }}
      >
        ‹ Prev
      </button>
      <span className="px-3 py-1.5 text-sm text-slate-600">
        {page} / {pages}
      </span>
      <button
        className={btnCls(page === pages || loading)}
        disabled={page === pages || loading}
        onClick={() => onPage(page + 1)}
        style={{ borderColor: '#e2e8f0', color: '#475569' }}
      >
        Next ›
      </button>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────
const QuoteHistory: React.FC = () => {
  const { loading, error, quotes, pagination, fetchQuotes, goToPage } = useQuoteHistory();
  // FIX: pure React state modal — no dependency on DaisyUI <dialog> JS
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [viewingRequesterId, setViewingRequesterId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<DecodeToken | undefined>();

  useEffect(() => { fetchQuotes(); }, []);
  useEffect(() => { getUser().then(setCurrentUser).catch(() => {}); }, []);

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#4F9848' }}>
            Quote History
          </p>
          <h2 className="text-xl font-bold" style={{ color: '#0A1628' }}>Past Requests</h2>
        </div>
        <button
          onClick={() => fetchQuotes()}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors hover:bg-slate-100 disabled:opacity-50"
          style={{ borderColor: '#e2e8f0', color: '#475569' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 flex gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0 mt-0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Table card */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: '#e2e8f0' }}>
        {loading && quotes.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : quotes.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10 mx-auto mb-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">No quotes yet. Get your first quote!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {[
                    'Date', 'Route', 'Distance', 'Weight', 'Mode',
                    ...(isAdmin ? ['Requested By'] : []),
                    '',
                  ].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote, i) => (
                  <tr
                    key={quote._id}
                    style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 1 ? '#fafafa' : 'white' }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {formatDate(quote.created_at.$date)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">{quote.origin}</p>
                      <p className="text-xs text-slate-400 mt-0.5">→ {quote.destination}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDistance(quote.distance_km)}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatWeight(quote.chargeable_weight)}</td>
                    <td className="px-4 py-3"><ModeBadge mode={quote.mode} /></td>

                    {/* Admin-only: who requested this quote + a link to their profile */}
                    {isAdmin && (
                      <td className="px-4 py-3">
                        {quote.requested_by ? (
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-semibold text-slate-800 text-xs">
                                {quote.requested_by.username ?? '—'}
                              </p>
                              <p className="text-xs text-slate-400">{quote.requested_by.email ?? ''}</p>
                            </div>
                            <button
                              onClick={() => setViewingRequesterId(quote.requested_by!.user_id)}
                              className="px-2 py-1 text-xs font-semibold rounded-lg border transition-colors hover:bg-slate-50"
                              style={{ borderColor: '#e2e8f0', color: '#1B4F8A' }}
                            >
                              Profile
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    )}

                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedQuote(quote)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors hover:bg-slate-50"
                        style={{ borderColor: '#e2e8f0', color: '#1B4F8A' }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {quotes.length > 0 && (
          <div className="px-4 pb-4">
            <Pagination page={pagination.page} pages={pagination.pages} loading={loading} onPage={goToPage} />
          </div>
        )}
      </div>

      {/* Quote detail modal */}
      {selectedQuote && (
        <DetailModal quote={selectedQuote} onClose={() => setSelectedQuote(null)} />
      )}

      {/* Requester profile modal — admin only, gated by state that only admins can set */}
      {viewingRequesterId && (
        <RequesterProfileModal userId={viewingRequesterId} onClose={() => setViewingRequesterId(null)} />
      )}
    </div>
  );
};

export default QuoteHistory;