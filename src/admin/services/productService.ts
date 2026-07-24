import baseApi from "../api/baseApi";
import type { Product, ProductResponse } from "../types/product";

// ✅ GET all products
export const getProducts = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
}): Promise<ProductResponse> => {

  const query = new URLSearchParams();

  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  if (params?.category && params.category !== "All") {
    query.append("category", params.category);
  }

  const response = await baseApi.get<ProductResponse>(
    `/web/products?${query.toString()}`
  );

  return response;
};

// ✅ GET a single Product
export const getProductById = async (id: string): Promise<Product> => {
  const response = await baseApi.get<Product | { data: Product }>(`/web/products/${id}`);
  
  // Handle wrapped responses
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data;
  }
  
  return response as Product;
};

// ✅ CREATE a new Product
export const createProduct = async (data: Omit<Product, "_id">): Promise<Product> => {
  return baseApi.post<Product>("/web/products", data);
};

// ✅ UPDATE a Product
export const updateProduct = async (
  id: string,
  data: Partial<Product>
): Promise<Product> => {
  return baseApi.put<Product>(`/web/products/${id}`, data);
};

// ✅ DELETE a Product
export const deleteProduct = async (id: string): Promise<void> => {
  return baseApi.delete<void>(`/web/products/${id}`);
};
