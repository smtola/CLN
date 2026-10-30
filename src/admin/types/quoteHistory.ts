export interface QuoteCostBreakdown {
  clearance?: number;
  trucking?: number;
  clearance_type?: string;
  container_type?: string;
  commodity?: string;
}

export interface QuoteCharge {
  price: number;
  eta: string;
  currency: string;
  breakdown?: {
    subtotal: number;
    minimum_applied: boolean;
    total: number;
    breakdown?: QuoteCostBreakdown;
  };
}

export interface QuoteRequestedBy {
  user_id: string;
  username: string;
  email: string;
}

export interface QuoteHistoryItem {
  _id: string;
  quote_ref: string;
  origin: string;
  origin_country: string | null;
  destination: string;
  destination_country: string | null;
  commodity: string;
  mode: string;
  clearance: string;
  container_type: string;
  weight_break: string | null;
  departure_date: string;
  container_max_weight: number;
  container_quantity: number;
  distance_km: number;
  chargeable_weight: number;
  quotes: Record<string, QuoteCharge | undefined>;
  requested_by: QuoteRequestedBy;
  converted: boolean;
  created_at: string;
  price: number;
  currency: string;
  eta: string;
}

// Raw shape actually returned by GET /price/quotes/quote-history
export interface QuoteHistoryApiResponse {
  quotes: Array<Omit<QuoteHistoryItem, "created_at"> & { created_at: string | { $date: string } }>;
  total: number;
  page: number;
  pages: number;
}

// Normalized shape the rest of the app relies on
export interface QuoteHistoryResponse {
  success: boolean;
  data: QuoteHistoryItem[];
  pagination: { total: number; page: number; pages: number };
}