import type { TransportMode, ServiceLevel } from './quote.types';

export interface RateCard {
  _id: string;
  origin: string;
  destination: string;
  mode: TransportMode;
  service: ServiceLevel;
  docs: number;
  trucking: number;
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
  docs: number;
  trucking: number;
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