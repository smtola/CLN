import baseApi from "../api/baseApi";
import type { Product } from "../types/product";

// ✅ GET all products
export const getProducts = async (): Promise<Product[]> => {
  const response = await baseApi.get<Product[] | { data: Product[] } | { products: Product[] }>("/web/products");
  
  // Handle different response formats
  if (Array.isArray(response)) {
    return response;
  }
  
  // Handle wrapped responses
  if (response && typeof response === 'object') {
    if ('data' in response && Array.isArray(response.data)) {
      return response.data;
    }
    if ('products' in response && Array.isArray(response.products)) {
      return response.products;
    }
  }
  
  // Fallback: return empty array if format is unexpected
  console.warn('Unexpected API response format:', response);
  return [];
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
export const createProduct = async (data: Omit<Product, "id">): Promise<Product> => {
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
