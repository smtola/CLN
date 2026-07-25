import React from 'react';
import type { ServiceQuote, ServiceLevel } from '../types/quote.types';
import { formatCurrency } from '../utils/formatters';
import PriceBreakdown from './PriceBreakdown';

interface QuoteCardProps {
  service: ServiceLevel;
  quote: ServiceQuote;
  onBook?: () => void;
  isPopular?: boolean;
  accentColor?: string;
  popularColor?: string;
}

const QuoteCard: React.FC<QuoteCardProps> = ({
  service,
  quote,
  isPopular = false,
  accentColor = '#0E3793',
  popularColor = '#2E9E42',
}) => {
  const color = isPopular ? popularColor : accentColor;
  return (
    <div
      className="relative bg-white rounded-2xl border p-5 transition-all duration-300 hover:shadow-md"
      style={{ borderColor: isPopular ? popularColor : '#e2e8f0', borderWidth: isPopular ? 2 : 1 }}
    >
      {isPopular && (
        <span
          className="absolute -top-2.5 right-4 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
          style={{ background: popularColor }}
        >
          Recommended
        </span>
      )}

      <h3 className="font-bold text-slate-900 capitalize mb-1">
        {service.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
      </h3>

      <div className="text-3xl font-bold my-2 font-mono" style={{ color }}>
        {formatCurrency(quote.price, quote.currency)}
      </div>

      <PriceBreakdown breakdown={quote.breakdown} currency={quote.currency} accentColor={color} />
    </div>
  );
};

export default QuoteCard;
