export interface ServiceItem {
  _id: string;
  key: string;
  title: string;
  description: string;
  image: string;
  created_by?: string;
}

export interface ServiceResponse {
  success: boolean;
  message: string;
  data: ServiceItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
