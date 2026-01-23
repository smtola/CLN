import apiService from './api';
import type { RateCard, RateCardFormData } from '../types/rateCard.types';

class RateCardService {
  private readonly basePath = '/rate-cards';

  async getAllRateCards(): Promise<RateCard[]> {
    return apiService.get<RateCard[]>(this.basePath);
  }

  async getRateCardById(id: string): Promise<RateCard> {
    return apiService.get<RateCard>(`${this.basePath}/${id}`);
  }

  async createRateCard(data: RateCardFormData): Promise<{ id: string; message: string }> {
    return apiService.post<{ id: string; message: string }>(this.basePath, data);
  }

  async updateRateCard(id: string, data: Partial<RateCardFormData>): Promise<{ message: string }> {
    return apiService.put<{ message: string }>(`${this.basePath}/${id}`, data);
  }

  async deleteRateCard(id: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`${this.basePath}/${id}`);
  }
}

export const rateCardService = new RateCardService();
export default rateCardService;