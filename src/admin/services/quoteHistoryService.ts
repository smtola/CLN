import baseApi from "../api/baseApi";
import type { QuoteHistoryApiResponse, QuoteHistoryResponse } from "../types/quoteHistory";

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
  const res = await baseApi.get<QuoteHistoryApiResponse>(
    `/price/quotes/history?${query.toString()}`
  );

  // The API replies with { quotes, total, page, pages } — not { success, data, pagination } —
  // and created_at arrives as Mongo extended JSON ({ $date: "..." }) instead of a plain
  // string. Normalize both here so the rest of the app deals with one consistent shape.
  return {
    success: true,
    data: (res.quotes ?? []).map((q) => ({
      ...q,
      created_at: typeof q.created_at === "string" ? q.created_at : q.created_at?.$date ?? "",
    })),
    pagination: {
      total: res.total ?? 0,
      page: res.page ?? params?.page ?? 1,
      pages: res.pages ?? 1,
    },
  };
};