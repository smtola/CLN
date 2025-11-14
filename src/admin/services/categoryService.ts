import baseApi from "../api/baseApi";
import type { Category } from "../types/category";

// ✅ GET all categories
export const getCategories = async (): Promise<Category[]> => {
  const response = await baseApi.get<Category[] | { data: Category[] } | { categories: Category[] }>("/web/categories");
  
  // Handle different response formats
  if (Array.isArray(response)) {
    return response;
  }
  
  // Handle wrapped responses
  if (response && typeof response === 'object') {
    if ('data' in response && Array.isArray(response.data)) {
      return response.data;
    }
    if ('categories' in response && Array.isArray(response.categories)) {
      return response.categories;
    }
  }
  
  // Fallback: return empty array if format is unexpected
  console.warn('Unexpected API response format:', response);
  return [];
};

// ✅ GET a single category
export const getCategoryById = async (id: string): Promise<Category> => {
  const response = await baseApi.get<Category | { data: Category }>(`/web/categories/${id}`);
  
  // Handle wrapped responses
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data;
  }
  
  return response as Category;
};

// ✅ CREATE a new category
export const createCategory = async (data: Omit<Category, "id">): Promise<Category> => {
  return baseApi.post<Category>("/web/categories", data);
};

// ✅ UPDATE a category
export const updateCategory = async (
  id: string,
  data: Partial<Category>
): Promise<Category> => {
  return baseApi.put<Category>(`/web/categories/${id}`, data);
};

// ✅ DELETE a category
export const deleteCategory = async (id: string): Promise<void> => {
  return baseApi.delete<void>(`/web/categories/${id}`);
};
