import baseApi from '../api/baseApi';
import type { SeoMeta } from '../../types/seo';

// ✅ GET all SEO entries (or single entry for a page)
export const getSEO = async (page?: string): Promise<SeoMeta[]> => {
  const endpoint = page ? `/seo/${page}` : '/seo';
  const response = await baseApi.get<SeoMeta | SeoMeta[] | { data: SeoMeta | SeoMeta[] } | { seo: SeoMeta[] }>(endpoint);
  
  // Handle wrapped responses first
  let unwrappedResponse: SeoMeta | SeoMeta[] | unknown = response;
  if (response && typeof response === 'object') {
    if ('data' in response) {
      unwrappedResponse = response.data;
    } else if ('seo' in response && Array.isArray(response.seo)) {
      return response.seo;
    }
  }
  
  // Handle array response
  if (Array.isArray(unwrappedResponse)) {
    return unwrappedResponse;
  }
  
  // Handle single object response - wrap it in an array
  if (unwrappedResponse && typeof unwrappedResponse === 'object' && 'page' in unwrappedResponse) {
    return [unwrappedResponse as SeoMeta];
  }
  
  // Fallback: return empty array if format is unexpected
  console.warn('Unexpected API response format:', response);
  return [];
};

// ✅ GET a single SEO entry
export const getSEOById = async (page: string): Promise<SeoMeta> => {
  const response = await baseApi.get<SeoMeta | { data: SeoMeta }>(`/seo/${page}`);
  
  // Handle wrapped responses
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data;
  }
  
  return response as SeoMeta;
};

// ✅ CREATE a new SEO entry
export const createSEO = async (data: Omit<SeoMeta, 'id'>): Promise<SeoMeta> => {
  return baseApi.post<SeoMeta>('/seo', data);
};

// ✅ UPDATE a SEO entry
export const updateSEO = async (page: string, data: Partial<SeoMeta>): Promise<SeoMeta> => {
  return baseApi.put<SeoMeta>(`/seo/${page}`, data);
};

// ✅ DELETE a SEO entry
export const deleteSEO = async (page: string): Promise<void> => {
  return baseApi.delete<void>(`/seo/${page}`);
};
