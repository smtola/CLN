// PriceBreakdown.tsx
import React from 'react';
import type { QuoteBreakdown } from '../types/quote.types';
import { formatCurrency } from '../utils/formatters';

interface PriceBreakdownProps {
  breakdown: QuoteBreakdown;
  currency?: string;
  className?: string;
  accentColor?: string;
}

const Row = ({
  label,
  value,
  bold,
  accent,
  accentColor = '#1B4F8A',
}: {
  label: string;
  value: string;
  bold?: boolean;
  accent?: boolean;
  accentColor?: string;
}) => (
  <div
    className="flex items-center justify-between py-1"
    style={{ borderTop: bold ? '1px solid #e2e8f0' : undefined, marginTop: bold ? 4 : 0 }}
  >
    <span
      className="text-xs"
      style={{ color: bold ? (accent ? accentColor : '#334155') : '#94a3b8', fontWeight: bold ? 600 : 400 }}
    >
      {label}
    </span>
    <span
      className="text-xs font-mono"
      style={{ color: accent ? accentColor : bold ? '#0A1628' : '#475569', fontWeight: bold ? 700 : 500 }}
    >
      {value}
    </span>
  </div>
);

const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  breakdown,
  currency = 'USD',
  className = '',
  accentColor = '#1B4F8A',
}) => {
  const b = breakdown.breakdown;
  // `clearance` is the current field name; `docs` is kept only so older,
  // already-saved quotes (from before this field was renamed) still render.
  const clearanceAmount = b.clearance ?? b.docs ?? 0;
  const clearanceLabel = b.clearance_type === 'import' ? 'Import Clearance' : 'Export Clearance';

  return (
    <div className={`flex-1 ${className}`}>
      <p
        className="text-xs font-bold uppercase tracking-wider mb-2"
        style={{ color: '#94a3b8' }}
      >
        Breakdown{b.container_type ? ` · ${b.container_type}` : ''}
      </p>

      <div className="space-y-0.5">
        {clearanceAmount > 0 && (
          <Row label={clearanceLabel} value={formatCurrency(clearanceAmount, currency)} />
        )}
        {(b.trucking ?? 0) > 0 && (
          <Row label="Trucking" value={formatCurrency(b.trucking!, currency)} />
        )}
        {(b.freight ?? 0) > 0 && (
          <Row label="Freight" value={formatCurrency(b.freight!, currency)} />
        )}
        {(b.othc ?? 0) > 0 && (
          <Row label="OTHC" value={formatCurrency(b.othc!, currency)} />
        )}

        {/* Divider + totals */}
        <Row
          label="Subtotal"
          value={formatCurrency(breakdown.subtotal, currency)}
          bold
        />
        <Row
          label="Total"
          value={formatCurrency(breakdown.total, currency)}
          bold
          accent
          accentColor={accentColor}
        />
      </div>
    </div>
  );
};

export default PriceBreakdown;