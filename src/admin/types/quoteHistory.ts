export interface QuoteHistoryItem {
  _id: string;
  company_name: string;
  full_name: string;
  email: string;
  address: string;
  tel: string;
  job: string;
  origin_destination: string;
  product_name: string;
  weight_dimensions: string;
  service: string;
  container_size: string;
  created_by?: string;
  requester_name?: string;
  requester_email?: string;
  created_at?: string;
}

export interface QuoteHistoryResponse {
  success: boolean;
  message: string;
  data: QuoteHistoryItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
