import type { Country, Currency, Local } from '../types/common.types';
import type { TransportMode, ServiceLevel, ShipmentType } from '../types/quote.types';
import type { ClearanceDirection, ContainerType, WeightBreak } from '../types/rateCard.types';

export const API_BASE_URL =  'https://clnrestapi.vercel.app/api/v1/price';
// 'https://clnrestapi.vercel.app/api/v1/price';
export const COUNTRIES: Country[] = [
  { code: 'KH', name: 'Cambodia', flag: '🇰🇭' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'LA', name: 'Laos', flag: '🇱🇦' },
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲' },
];
export const LOCALS: Local[] = [
  { code: 'PV', name: 'Prey Veng', country: 'Cambodia' },
  { code: 'TK', name: 'Takeo', country: 'Cambodia' },
  { code: 'PM', name: 'Prom', country: 'Cambodia' }
];

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'KHR', symbol: '៛', name: 'Cambodian Riel' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
];

export const TRANSPORT_MODES: { value: TransportMode; label: string; icon: string }[] = [
  { value: 'road', label: 'Road', icon: '🚚' },
  { value: 'air', label: 'Air', icon: '✈️' },
  { value: 'sea', label: 'Sea', icon: '🚢' }
];

export const SERVICE_LEVELS: { value: ServiceLevel; label: string; description: string }[] = [
  { value: 'local_charge', label: 'Local Charges', description: 'Only Local' },
  { value: 'freight', label: 'Freight', description: 'Balanced price and speed' }
];

export const CLEARANCE_OPTIONS: readonly { value: ClearanceDirection; label: string }[] = [
  { value: 'import', label: 'Import' },
  { value: 'export', label: 'Export' },
];

// Container type choices differ by clearance direction (export supports reefers/
// high-cubes that import doesn't) — kept in one place so the quote form and the
// rate card admin panel (which stores price per container type) never drift apart.
// Mirrors CONTAINER_TYPES_BY_CLEARANCE in the backend (app/routes/price.py).
export const CONTAINER_TYPE_OPTIONS: Record<ClearanceDirection, readonly ContainerType[]> = {
  import: ["20'GP", "40'GP"],
  export: ["20'GP", "40'GP", "40'RF", "45'RF"],
};

// Air-freight local charge is priced by weight bracket instead of container
// type. Same bracket set applies to both Import and Export. Mirrors
// WEIGHT_BREAKS in the backend (app/routes/price.py).
export const WEIGHT_BREAK_OPTIONS: readonly WeightBreak[] = [
  '-1,000Kgs',
  '+1,000Kgs',
  '+3,000Kgs',
  '-5,000Kgs',
];

export const SHIPMENT_TYPES: { value: ShipmentType; label: string; icon: string }[] = [
  { value: 'document', label: 'Document', icon: '📄' },
  { value: 'parcel', label: 'Parcel', icon: '📦' },
  { value: 'freight', label: 'Freight', icon: '🚚' },
];

export const FORM_STEPS = [
  { step: 1, label: 'Route Details', icon: '📍' },
  { step: 2, label: 'Cargo Details', icon: '🚚' }
];

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
};

export const SERVICE_COLORS = {
  local_charge: 'bg-green-50 text-green-600',
  freight: 'bg-yellow-50 text-yellow-600',
};

export const MODE_COLORS = {
  road: 'badge-primary',
  air: 'badge-secondary',
  sea: 'badge-accent',
  rail: 'badge-info',
};

// Palette used by the QuoteForm transport-mode selector, cargo cards and CTA button.
export const MODE_STYLES: Record<TransportMode extends infer M ? Extract<M, 'sea' | 'air' | 'road'> : never, {
  label: string;
  tagline: string;
  primary: string;
  bg: string;
  border: string;
  icon: string;
}> = {
  sea: {
    label: 'Sea',
    tagline: 'Container / LCL',
    primary: '#5B4CF4',
    bg: '#EEF0FF',
    border: '#5B4CF4',
    icon: '🚢',
  },
  air: {
    label: 'Air',
    tagline: 'Express Cargo',
    primary: '#0EA5E9',
    bg: '#E0F2FE',
    border: '#0EA5E9',
    icon: '✈️',
  },
  road: {
    label: 'Road',
    tagline: 'Cross-border Truck',
    primary: '#0F9D8A',
    bg: '#E7F8F5',
    border: '#0F9D8A',
    icon: '🚚',
  },
};
// Palette used by the QuoteForm transport-mode selector, cargo cards and CTA button.
export const SERVICE_STYLES: Record<ServiceLevel extends infer M ? Extract<M, 'local_charge'> : never, {
  label: string;
  tagline: string;
  primary: string;
  bg: string;
  border: string;
  icon: string;
}> = {
  local_charge: {
    label: 'Local Charge',
    tagline: 'Clearance / Trucking',
    primary: '#5B4CF4',
    bg: '#EEF0FF',
    border: '#5B4CF4',
    icon: '🚢',
  },
  // freight: {
  //   label: 'Freight',
  //   tagline: 'Clearance / Trucking',
  //   primary: '#0EA5E9',
  //   bg: '#E0F2FE',
  //   border: '#0EA5E9',
  //   icon: '✈️',
  // }
};