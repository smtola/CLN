// ── Port (a.k.a. "finder_port") ─────────────────────────────────────────
// Ports are the master location records that back the Origin/Destination
// search on the quote form (see quoteService.searchLocations, which hits
// `/finder_port/search`). This file types the admin-side CRUD for that
// same collection — the Port Manager lets an admin add, edit, and retire
// the seaports, airports, inland depots, and border crossings that show
// up as suggestions there.

export type PortType = 'sea' | 'air' | 'road';

export interface Port {
  _id: string;
  name: string;    // display name, e.g. "Phnom Penh Autonomous Port"
  code: string;     // UN/LOCODE or IATA code, e.g. "KHPNH"
  city: string;
  country: string;
  type: PortType;
  lat: number;
  lon: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PortFormData {
  name: string;
  code: string;
  city: string;
  country: string;
  type: PortType;
  lat: number;
  lon: number;
}

export interface PortFilters {
  search?: string;
  country?: string;
  type?: PortType;
}
