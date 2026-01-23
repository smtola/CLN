import React from 'react';
import type { ServiceQuote, ServiceLevel } from '../types/quote.types';
import { formatCurrency } from '../utils/formatters';
import PriceBreakdown from './PriceBreakdown';

interface QuoteCardProps {
  service: ServiceLevel;
  quote: ServiceQuote;
  onBook?: () => void;
  isPopular?: boolean;
}

const QuoteCard: React.FC<QuoteCardProps> = ({
  service,
  quote,
  isPopular = false,
}) => {
  return (
    <div
      className={`bg-white rounded-sm ${
        isPopular ? 'ring-2 ring-primary' : ''
      }`}
    >
      <div className="card-body">
        <div className="flex justify-between items-start">
          <h3 className="card-title capitalize">
            {service.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            {isPopular && <div className="badge badge-primary">Popular</div>}
          </h3>
          {/* <div className={`badge ${SERVICE_COLORS[service]} capitalize`}>
            {service}
          </div> */}
        </div>

        <div className="text-3xl font-bold text-primary my-2">
          {formatCurrency(quote.price, quote.currency)}
        </div>


        <PriceBreakdown breakdown={quote.breakdown} currency={quote.currency} />
      </div>
    </div>
  );
};

export default QuoteCard;