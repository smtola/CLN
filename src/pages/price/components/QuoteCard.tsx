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
}

const QuoteCard: React.FC<QuoteCardProps> = ({
  service,
  quote,
  isPopular = false,
  accentColor = '#5B4CF4',
}) => {
  return (
    <div
      className="bg-white rounded-2xl border p-5 transition-all duration-300 hover:shadow-md"
      style={{ borderColor: isPopular ? accentColor : '#e2e8f0', borderWidth: isPopular ? 2 : 1 }}
    >
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-bold text-slate-900 capitalize">
          {service.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
        </h3>
        {isPopular && (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
            style={{ background: accentColor }}
          >
            Popular
          </span>
        )}
      </div>

      <div className="text-3xl font-bold my-2" style={{ color: accentColor }}>
        {formatCurrency(quote.price, quote.currency)}
      </div>

      <PriceBreakdown breakdown={quote.breakdown} currency={quote.currency} />
    </div>
  );
};

export default QuoteCard;
