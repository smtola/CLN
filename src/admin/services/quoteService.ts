// src/admin/services/quoteService.ts
import api from "../api/baseApi"; // adjust path to wherever BaseApi is exported from

export interface QuoteStats {
  totalRequests: number;
  successfulRequests: number;
  conversionRate: number; // 0-100
}

interface QuoteRecord {
  converted?: boolean;
}

interface QuoteHistoryResponse {
  quotes: QuoteRecord[];
  total: number;
  page: number;
  pages: number;
}

/**
 * NOTE: there's no dedicated aggregate/stats endpoint yet, so this pulls a
 * large page of history and computes stats client-side. If quote volume
 * grows, ask the backend team for a `/price/quotes/stats` endpoint that
 * returns { totalRequests, successfulRequests } directly instead.
 */
export const getQuoteStats = async (): Promise<QuoteStats> => {
  const params = new URLSearchParams({ page: "1", limit: "1000" });

  const data = await api.get<QuoteHistoryResponse>(
    `/price/quotes/history?${params.toString()}`
  );

  const quotes: QuoteRecord[] = data?.quotes ?? [];
  const totalRequests: number = data?.total ?? quotes.length;
  const successfulRequests: number = quotes.filter(
    (q: QuoteRecord) => q.converted === true
  ).length;

  return {
    totalRequests,
    successfulRequests,
    conversionRate:
      totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
  };
};