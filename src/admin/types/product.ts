export interface Product {
    _id: string;
    key: string;
    category: string;
    product: string;
    caption: string;
    image: string;
    created_by: string;
}

export interface ProductResponse {
    success: boolean;
    message: string;
    data: Product[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }