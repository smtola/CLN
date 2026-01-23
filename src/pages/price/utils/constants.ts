import type { Country, Currency, Local } from '../types/common.types';
import type { TransportMode, ServiceLevel, ShipmentType } from '../types/quote.types';

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