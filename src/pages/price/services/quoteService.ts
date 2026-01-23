import apiService from './api';
import type {
  QuoteRequest,
  QuoteResponse,
  Quote,
  QuoteHistoryResponse,
} from '../types/quote.types';
import type { Commodity, Location } from '../types/common.types';

class QuoteService {
  private readonly basePath = '/quote';

  async getQuote(data: QuoteRequest): Promise<QuoteResponse> {
    return apiService.post<QuoteResponse>(this.basePath, data);
  }

  async getQuoteById(id: string): Promise<Quote> {
    return apiService.get<Quote>(`${this.basePath}/${id}`);
  }

  async getQuoteHistory(page: number = 1, limit: number = 20): Promise<QuoteHistoryResponse> {
    return apiService.get<QuoteHistoryResponse>(`${this.basePath}s/history`, {
      params: { page, limit },
    });
  }

  // Add this method
  async searchCommodities(query: string): Promise<Commodity[]>  {
    if (!query || query.length < 2) {
      return [];
    }
    return apiService.get<Commodity[]>('/commodities', {
      params: { q: query },
    });
  }

  async searchLocations(query: string): Promise<Location[]> {
    if (!query || query.length < 2) {
      return [];
    }
    return apiService.get<Location[]>('/finder_port/search', {
      params: { q: query },
    });
  }

  async healthCheck(): Promise<{ status: string; message: string }> {
    return apiService.get('/health');
  }
}

export const quoteService = new QuoteService();
export default quoteService;