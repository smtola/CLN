// Homepage content. Everything here comes from the existing site; nothing is invented.
// Items marked CONFIRM need owner confirmation before the redesign goes live.

export interface ServiceCard { key: string; title: string; blurb: string; image: string; to: string }

export const services: ServiceCard[] = [
  { key: 'moc', title: 'MoC / MAFF / MCFA', blurb: 'Ministry of Commerce, and Ministry of Agriculture, Forestry and Fisheries.', image: '/assets/image/moc-maff-mcfa.webp', to: '/services' },
  { key: 'Customs', title: 'Customs Clearance', blurb: 'Import and export customs clearance.', image: '/assets/image/custom clearance.webp', to: '/services?tab=Customs' },
  { key: 'land', title: 'Cross Border', blurb: 'Cross-border land transportation.', image: '/assets/image/cross_2.webp', to: '/services?tab=land' },
  { key: 'sea', title: 'Sea Freight', blurb: 'International FCL / LCL freight.', image: '/assets/image/ship.webp', to: '/services?tab=sea' },
  { key: 'air', title: 'Air Freight', blurb: 'International air cargo.', image: '/assets/image/airplan.webp', to: '/services?tab=air' },
  { key: 'packing', title: 'Packing & Warehouse', blurb: 'Packing and warehousing.', image: '/assets/image/warehouse.webp', to: '/services?tab=packing' },
  { key: 'iec', title: 'International Express Courier', blurb: 'International express courier.', image: '/assets/image/international express.webp', to: '/services?tab=iec' },
  { key: 'consolidation', title: 'Consolidation', blurb: 'Cargo consolidation.', image: '/assets/image/consolidation.webp', to: '/services?tab=consolidation' },
  { key: 'door2door', title: 'Door to Door Service', blurb: 'Door-to-door logistics.', image: '/assets/image/door_to_door.webp', to: '/services?tab=door2door' },
];

export const stats = [
  { value: '30+', label: 'Years Experience' },
  { value: '9', label: 'Core Services' },
  { value: '20+', label: 'Clients Served' }, // CONFIRM
  { value: '24/7', label: 'Support' },        // CONFIRM
];

export type Mode = 'land' | 'sea' | 'air';
export const routes: { mode: Mode; title: string; to: string; text: string; angle: number }[] = [
  { mode: 'land', title: 'Land', to: 'Regional cross-border destinations', text: 'Cross-border land transportation from Phnom Penh.', angle: -150 },
  { mode: 'sea', title: 'Sea', to: 'International ports', text: 'International FCL / LCL freight.', angle: 20 },
  { mode: 'air', title: 'Air', to: 'International airports', text: 'International air cargo.', angle: -60 },
]; // CONFIRM: specific countries/ports/airports to show

export const ecosystem = [
  { id: 'land', title: 'LAND', text: 'Cross-border transportation.', image: '/assets/image/cross_2.webp', alt: 'CLN cross-border truck' },
  { id: 'sea', title: 'SEA', text: 'International FCL / LCL freight.', image: '/assets/image/ship.webp', alt: 'Container ship' },
  { id: 'air', title: 'AIR', text: 'International air cargo.', image: '/assets/image/airplan.webp', alt: 'Cargo aircraft' },
  { id: 'warehouse', title: 'WAREHOUSE', text: 'Storage and distribution.', image: '/assets/image/warehouse.webp', alt: 'Warehouse' },
];

export const pillars = [
  { title: 'Experience', text: 'Over 30 years of handling import and export logistics.' },
  { title: 'Reliability', text: 'A registered company with its own office in Phnom Penh, complying with Cambodia’s labor laws.' },
  { title: 'Global Network', text: 'Collaboration with many shipping companies, locally and overseas.' },
  { title: 'Customer Service', text: 'Committed to services that meet our customers’ expectations.' },
];

export const partners = [
  { name: 'Cambodia Logistics Association (CLA)', logo: '/assets/image/camfalogo.webp' },
  { name: 'Cambodia Chamber of Commerce', logo: '/assets/image/ccoc.webp' },
];
