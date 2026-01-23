  export interface QuoteRequest {
    // ===== Route Details =====
    origin: string;               // Global port or city
    destination: string;          // Global port or city
    departure_date?: string;      // Optional vessel departure date
    vesselDeparture?: string;
    country:string;
    // Cargo details
    equipmentType?: string; // e.g., 'Container'
    soc?: boolean; // Shipper Owned Container
    containerSize?: string; // "20' Dry" | "40' Dry"
    containerQuantity: number; 
    containerMaxWeight?: number; // in kg
    commodity:string;
    mode:string;
  }
  
  export interface QuoteBreakdown {
    docs: number;
    trucking: number;
    freight: number;
    othc: number;
    subtotal: number;
    total: number;
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
    };
    origin: string;
    destination: string;
  }
  
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