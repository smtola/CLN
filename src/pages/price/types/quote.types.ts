export interface QuoteRequest {
  // ===== Route Details =====
  origin: string;               // Global port or city
  destination: string;          // Global port or city
  // Requested departure date ("YYYY-MM-DD"). Sent as-is to the backend,
  // which uses it to pick a rate card whose validity window covers it.
  vesselDeparture?: string;
  country:string;
  // Cargo details
  equipmentType: string; // e.g., 'Container'
  soc?: boolean; // Shipper Owned Container
  clearance: 'import' | 'export'; // Clearance direction — determines container type options & rate lookup
  containerSize: string; // e.g. "20'GP" | "40'GP" | "40'RF" | "45'RF"
  containerQuantity: number; 
  containerMaxWeight?: number; // in kg
  weightBreak?: string; // e.g. "-1,000Kgs" | "+1,000Kgs" | "+3,000Kgs" | "-5,000Kgs" — air mode only
  commodity:string;
  mode:string;
}

// Cost-line breakdown returned per quoted service. `docs` is kept as an
// optional legacy alias for `clearance` so any older stored quotes still render.
export interface QuoteBreakdown {
  clearance?: number;
  trucking?: number;
  freight?: number;
  othc?: number;
  clearance_type?: 'import' | 'export';
  container_type?: string;
  weight_break?: string;
  commodity?: string;
  /** @deprecated use `clearance` — kept for backward compatibility with older quotes */
  docs?: number;
  subtotal: number;
  total: number;
  minimum_applied?: boolean;
  breakdown:QuoteBreakdown;
}

export interface ServiceQuote {
  price: number;
  eta: string;
  breakdown: QuoteBreakdown;
  currency: string;
}

export interface QuoteResponse {
  quote_id: string;
  distance_km: number;
  chargeable_weight: number;
  quotes: {
    economy?: ServiceQuote;
    standard?: ServiceQuote;
    express?: ServiceQuote;
    local_charge?: ServiceQuote;
    freight?: ServiceQuote;
  };
  origin: string;
  destination: string;
  commodity?: string;
  mode?: string;
  clearance?: 'import' | 'export';
  container_type?: string;
  weight_break?: string;
  departure_date?: string;
}

export interface Quote {
  _id: string;
  quote_ref: string;
  origin: string;
  destination: string;
  distance_km: number;
  actual_weight: number;
  dimensions: number[];
  chargeable_weight: number;
  mode: TransportMode;
  country: string;
  shipment_type: ShipmentType;
  quotes: {
    economy?: ServiceQuote;
    standard?: ServiceQuote;
    express?: ServiceQuote;
  };
  created_at: {
    $date: string
  };
  converted: boolean;
}

export interface QuoteHistoryResponse {
  quotes: Quote[];
  total: number;
  page: number;
  pages: number;
}

export type TransportMode = 'road' | 'air' | 'sea' | 'rail';
export type ShipmentType = 'document' | 'parcel' | 'freight';
export type ServiceLevel = 'local_charge' | 'freight';

export interface Quote {
  _id: string;
  origin: string;
  destination: string;
  distance_km: number;
  actual_weight: number;
  dimensions: number[];
  chargeable_weight: number;
  mode: TransportMode;
  country: string;
  shipment_type: ShipmentType;
  quotes: {
    economy?: ServiceQuote;
    standard?: ServiceQuote;
    express?: ServiceQuote;
  };
  created_at: {
    $date: string
  };
  converted: boolean;
  departure_date?: string;
  // Only present when the caller is an ADMIN — backend strips it for
  // everyone else.
  requested_by?: {
    user_id: string;
    username?: string;
    email?: string;
  };
}