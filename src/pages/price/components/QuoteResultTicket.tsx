// ── QuoteResultTicket.tsx ───────────────────────────────────────────────
// The result screen shown right after a quote is generated. Styled as a
// cargo manifest: a route "in transit" between two ports, a meta strip
// (clearance · mode · commodity), and itemized rate lines set like a
// waybill — dotted leaders, monospace figures, a manifest reference.
import React from 'react';
import type { QuoteResponse, ServiceLevel, ServiceQuote } from '../types/quote.types';
import { formatCurrency, formatWeight } from '../utils/formatters';
import { MODE_STYLES } from '../utils/constants';

const DISPLAY_FONT = "'Space Grotesk', system-ui, sans-serif";
const MONO_FONT = "'IBM Plex Mono', ui-monospace, monospace";

const INK = '#10233D';
const STEEL = '#5B7083';
const LINE = '#DCE2E6';
const PAPER = '#F8F8F6';

type Mode = keyof typeof MODE_STYLES;

interface QuoteResultTicketProps {
  quoteResult: QuoteResponse;
  origin: string;
  destination: string;
  commodity: string;
  mode: Mode;
  clearance: 'import' | 'export';
  cargoLabel?: string; // e.g. "2 × 40'GP" or "+2,000Kgs"
  departureDate?: string; // "YYYY-MM-DD" — the date the rate card was matched against
  onReset: () => void;
}

const SERVICE_LABELS: Partial<Record<ServiceLevel, string>> = {
  local_charge: 'Local Charge',
  freight: 'Freight',
};

// ── Small eyebrow label ──────────────────────────────────────────────
const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p
    className="text-[11px] font-semibold uppercase tracking-[0.16em]"
    style={{ color: STEEL, fontFamily: MONO_FONT }}
  >
    {children}
  </p>
);

// ── Stat chip ─────────────────────────────────────────────────────────
const Chip = ({ label, value }: { label: string; value: string }) => (
  <div
    className="flex items-center gap-2 rounded-full border px-3.5 py-1.5"
    style={{ borderColor: LINE, background: '#fff' }}
  >
    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: STEEL }}>
      {label}
    </span>
    <span className="text-xs font-semibold" style={{ color: INK, fontFamily: MONO_FONT }}>
      {value}
    </span>
  </div>
);

// ── One itemized line inside a rate block: "Label ......... $12.00" ──
const LedgerRow = ({
  label,
  value,
  strong,
  accent,
}: {
  label: string;
  value: string;
  strong?: boolean;
  accent?: string;
}) => (
  <div className="flex items-baseline gap-2 py-0.5">
    <span
      className="whitespace-nowrap text-[13px]"
      style={{ color: strong ? INK : STEEL, fontWeight: strong ? 600 : 400 }}
    >
      {label}
    </span>
    <span
      className="flex-1 border-b"
      style={{
        borderBottomStyle: 'dotted',
        borderBottomWidth: 1.5,
        borderColor: '#C7CFD5',
        transform: 'translateY(-3px)',
      }}
    />
    <span
      className="whitespace-nowrap text-[13px]"
      style={{
        color: accent ?? (strong ? INK : STEEL),
        fontFamily: MONO_FONT,
        fontWeight: strong ? 700 : 500,
      }}
    >
      {value}
    </span>
  </div>
);

// ── One priced service ("Local Charge", "Freight" ...) as a manifest block ─
const RateBlock = ({
  service,
  quote,
  accent,
}: {
  service: ServiceLevel;
  quote: ServiceQuote;
  accent: string;
}) => {
  const b = quote.breakdown.breakdown;
  const clearanceAmount = b.clearance ?? b.docs ?? 0;
  const clearanceLabel = b.clearance_type === 'import' ? 'Import Clearance' : 'Export Clearance';

  return (
    <div className="rounded-2xl border p-5" style={{ borderColor: LINE, background: PAPER }}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold" style={{ color: INK, fontFamily: DISPLAY_FONT }}>
            {SERVICE_LABELS[service] ?? service}
          </h3>
          <p className="mt-0.5 text-[11px]" style={{ color: STEEL }}>
            ETA {quote.eta}
          </p>
        </div>
        <div
          className="text-2xl font-bold tabular-nums"
          style={{ color: accent, fontFamily: DISPLAY_FONT }}
        >
          {formatCurrency(quote.price, quote.currency)}
        </div>
      </div>

      <div className="space-y-0.5">
        {clearanceAmount > 0 && <LedgerRow label={clearanceLabel} value={formatCurrency(clearanceAmount, quote.currency)} />}
        {(b.trucking ?? 0) > 0 && <LedgerRow label="Trucking" value={formatCurrency(b.trucking!, quote.currency)} />}
        {(b.freight ?? 0) > 0 && <LedgerRow label="Freight" value={formatCurrency(b.freight!, quote.currency)} />}
        {(b.othc ?? 0) > 0 && <LedgerRow label="OTHC" value={formatCurrency(b.othc!, quote.currency)} />}

        <div className="my-1.5 border-t" style={{ borderColor: LINE }} />
        <LedgerRow label="Subtotal" value={formatCurrency(quote.breakdown.subtotal, quote.currency)} strong />
        <LedgerRow label="Total" value={formatCurrency(quote.breakdown.total, quote.currency)} strong accent={accent} />
        {quote.breakdown.minimum_applied && (
          <p className="pt-1 text-[11px] italic" style={{ color: STEEL }}>
            Minimum charge applied
          </p>
        )}
      </div>
    </div>
  );
};

// ── The route "in transit" — signature element ─────────────────────────
const TransitRoute = ({ origin, destination, accent, icon }: { origin: string; destination: string; accent: string; icon: string }) => (
  <div className="flex items-center gap-4">
    <h2
      className="shrink-0 text-2xl md:text-[32px] font-bold tracking-tight"
      style={{ color: INK, fontFamily: DISPLAY_FONT }}
    >
      {origin || '—'}
    </h2>

    <div className="relative flex flex-1 items-center min-w-[64px]">
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: accent }} />
      <svg viewBox="0 0 200 24" preserveAspectRatio="none" className="h-6 w-full" aria-hidden>
        <line
          x1="0" y1="12" x2="200" y2="12"
          stroke={accent}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="2 6"
          className="animate-transit"
        />
      </svg>
      <span
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-base leading-none"
        style={{ filter: 'saturate(0.9)' }}
      >
        {icon}
      </span>
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: accent }} />
    </div>

    <h2
      className="shrink-0 text-2xl md:text-[32px] font-bold tracking-tight"
      style={{ color: INK, fontFamily: DISPLAY_FONT }}
    >
      {destination || '—'}
    </h2>
  </div>
);

const QuoteResultTicket: React.FC<QuoteResultTicketProps> = ({
  quoteResult,
  origin,
  destination,
  commodity,
  mode,
  clearance,
  cargoLabel,
  departureDate,
  onReset,
}) => {
  const style = MODE_STYLES[mode];
  const accent = style?.primary ?? '#5B4CF4';
  const icon = style?.icon ?? '📦';

  // Prefer the date the backend actually matched the rate card against
  // (quoteResult.departure_date) — falls back to whatever the form sent.
  const resolvedDepartureDate = quoteResult.departure_date || departureDate;
  const formattedDepartureDate = resolvedDepartureDate
    ? new Date(`${resolvedDepartureDate}T00:00:00`).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    : undefined;

  const manifestNo = quoteResult.quote_id
    ? quoteResult.quote_id.slice(-6).toUpperCase()
    : '—';

  const services = Object.entries(quoteResult.quotes).filter(([, q]) => q) as [ServiceLevel, ServiceQuote][];

  return (
    <div>
      {/* Header: manifest number + New Quote */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <Eyebrow>Manifest No. {manifestNo}</Eyebrow>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-slate-50"
          style={{ borderColor: LINE, color: STEEL }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          New Quote
        </button>
      </div>

      {/* Route */}
      <TransitRoute origin={origin} destination={destination} accent={accent} icon={icon} />

      <p className="mt-3 text-xs font-semibold uppercase tracking-wider" style={{ color: STEEL }}>
        {clearance === 'import' ? 'Import' : 'Export'}
        {' · '}
        {style?.label ?? mode}
        {commodity ? ` · ${commodity}` : ''}
      </p>

      {/* Stat chips */}
      <div className="mt-5 flex flex-wrap gap-2">
        {formattedDepartureDate ? (
          <Chip label="Departure" value={formattedDepartureDate} />
        ) : null}
        {/* {mode === 'road' && quoteResult.distance_km ? (
          <Chip label="Distance" value={`${quoteResult.distance_km.toLocaleString()} km`} />
        ) : null} */}
        {quoteResult.chargeable_weight ? (
          <Chip label="Chargeable" value={formatWeight(quoteResult.chargeable_weight)} />
        ) : null}
        {cargoLabel ? <Chip label={mode === 'air' ? 'Bracket' : 'Equipment'} value={cargoLabel} /> : null}
      </div>

      {/* Rate lines */}
      {services.length > 0 ? (
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {services.map(([svc, quote]) => (
            <RateBlock key={svc} service={svc} quote={quote} accent={accent} />
          ))}
        </div>
      ) : (
        <div className="mt-7 rounded-2xl border border-dashed p-6 text-center" style={{ borderColor: LINE, color: STEEL }}>
          No rate lines on this manifest.
        </div>
      )}
    </div>
  );
};

export default QuoteResultTicket;
