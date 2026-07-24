import type { TransportMode, ServiceLevel } from './quote.types';

// Export lanes support more equipment types (reefers, high-cubes) than import,
// so container type options are grouped under the clearance direction.
export type ClearanceDirection = 'export' | 'import';
export type ContainerType = "20'GP" | "40'GP" | "40'RF" | "45'RF";

// Price per container type, for a given cost line (clearance or trucking).
export type ContainerPriceMap = Partial<Record<ContainerType, number>>;

// A clearance direction (export/import) shares its price down to the two
// cost lines it contains: clearance & trucking.
export interface DirectionPricing {
  clearance: ContainerPriceMap;
  trucking: ContainerPriceMap;
}

// Both clearance directions (Import — Clearance & Trucking by Container Type,
// Export — Clearance & Trucking by Container Type) for a single commodity.
export interface ContainerPricing {
  export: DirectionPricing;
  import: DirectionPricing;
}

// Commodity is the *parent* of both the Import and Export clearance/trucking
// grids: selecting a commodity from the dropdown scopes which container-type
// price grid you're editing/looking up. Keyed by commodity name.
export type CommodityContainerPricing = Record<string, ContainerPricing>;

export interface RateCard {
  _id: string;
  origin: string;
  destination: string;
  mode: TransportMode;
  service: ServiceLevel;
  // Only present/used for service === 'local_charge'. Stores, per commodity,
  // clearance + trucking price per container type, per clearance direction.
  containers?: CommodityContainerPricing;
  freight: number;
  othc: number;
  currency: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  remark:string;
}

export interface RateCardFormData {
  origin: string;
  destination: string;
  mode: TransportMode;
  service: ServiceLevel;
  containers: CommodityContainerPricing;
  freight: number;
  othc: number;
  currency: string;
  remark: string;
}

export interface RateCardFilters {
  origin?: string;
  mode?: TransportMode;
  service?: ServiceLevel;
  active?: boolean;
}