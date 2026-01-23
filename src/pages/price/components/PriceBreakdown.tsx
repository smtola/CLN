import React from 'react';
import type { QuoteBreakdown } from '../types/quote.types';
import { formatCurrency } from '../utils/formatters';

interface PriceBreakdownProps {
  breakdown: QuoteBreakdown;
  currency?: string;
  className?: string;
}

const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  breakdown,
  currency = 'USD',
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="divider text-xs opacity-70">Price Breakdown</div>
      
      <div className="text-xs space-y-1">
        <div className="flex justify-between items-center">
          <span className="opacity-70">Export Clearance:</span>
          <span className="font-medium">{formatCurrency(breakdown.breakdown.docs, currency)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="opacity-70">Trucking:</span>
          <span className="font-medium">{formatCurrency(breakdown.breakdown.trucking, currency)}</span>
        </div>
        {breakdown.breakdown.freight &&
          <div className="flex justify-between items-center">
            <span className="opacity-70">Freight:</span>
            <span className="font-medium">{formatCurrency(breakdown.breakdown.freight, currency)}</span>
          </div>
        }
        {breakdown.breakdown.freight &&
        <div className="flex justify-between items-center">
          <span className="opacity-70">OTHC:</span>
          <span className="font-medium">{formatCurrency(breakdown.breakdown.othc, currency)}</span>
        </div>
        }
        <div className="divider my-1"></div>
        
        <div className="flex justify-between items-center font-bold">
          <span>Subtotal:</span>
          <span>{formatCurrency(breakdown.subtotal, currency)}</span>
        </div>
        
        <div className="flex justify-between items-center font-bold text-primary text-sm">
          <span>Total:</span>
          <span>{formatCurrency(breakdown.total, currency)}</span>
        </div>
      </div>
    </div>
  );
};

export default PriceBreakdown;