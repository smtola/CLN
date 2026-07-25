import baseApi from "../api/baseApi";
import type { QuoteHistoryResponse } from "../types/quoteHistory";

export const getQuoteHistory = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<QuoteHistoryResponse> => {
  const query = new URLSearchParams();

  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  if (params?.search) query.append("search", params.search);

  // Admin-only endpoint: the backend rejects this with 403 for non-ADMIN users.
  return baseApi.get<QuoteHistoryResponse>(`/web/quote-history?${query.toString()}`);
};
