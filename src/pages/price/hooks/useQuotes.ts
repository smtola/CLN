import { useState, useCallback } from 'react';
import quoteService from '../services/quoteService';
import type {
  QuoteRequest,
  QuoteResponse,
  Quote,
  QuoteHistoryResponse,
} from '../types/quote.types';
import axios from 'axios';


export const useQuotes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quoteResult, setQuoteResult] = useState<QuoteResponse | null>(null);

  const getQuote = useCallback(async (data: QuoteRequest): Promise<QuoteResponse | null> => {
    setLoading(true);
    setError(null);
    setQuoteResult(null); // clear any stale result from a previous request
    try {
      const result = await quoteService.getQuote(data);
      setQuoteResult(result);
      return result;
    } catch (err: unknown) {
      let errorMessage = 'Failed to get quote';
  
      if (axios.isAxiosError(err)) {
        errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          errorMessage;
      }
  
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetQuote = useCallback(() => {
    setQuoteResult(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    quoteResult,
    getQuote,
    resetQuote,
  };
};

export type QuoteHistoryFilters = {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
};

export const useQuoteHistory = (initialPage: number = 1, initialLimit: number = 20) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState<QuoteHistoryFilters>({});

  const fetchQuotes = useCallback(async (page?: number, limit?: number, nextFilters?: QuoteHistoryFilters) => {
    setLoading(true);
    setError(null);
    const currentPage = page || pagination.page;
    const currentLimit = limit || pagination.limit;
    const currentFilters = nextFilters !== undefined ? nextFilters : filters;

    try {
      const result: QuoteHistoryResponse = await quoteService.getQuoteHistory(currentPage, currentLimit, currentFilters);
      setQuotes(result.quotes);
      setPagination({
        page: result.page,
        limit: currentLimit,
        total: result.total,
        pages: result.pages,
      });
      if (nextFilters !== undefined) setFilters(nextFilters);
    }  catch (err: unknown) {
      let errorMessage = 'Failed to get quote';
    
      if (axios.isAxiosError(err)) {
        errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          errorMessage;
      }
    
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  const goToPage = useCallback((page: number) => {
    fetchQuotes(page, pagination.limit);
  }, [fetchQuotes, pagination.limit]);

  const refresh = useCallback(() => {
    fetchQuotes(pagination.page, pagination.limit);
  }, [fetchQuotes, pagination.page, pagination.limit]);

  // Applies new search/date-range filters and resets back to page 1.
  const applyFilters = useCallback((nextFilters: QuoteHistoryFilters) => {
    fetchQuotes(1, pagination.limit, nextFilters);
  }, [fetchQuotes, pagination.limit]);

  return {
    loading,
    error,
    quotes,
    pagination,
    filters,
    fetchQuotes,
    goToPage,
    refresh,
    applyFilters,
  };
};