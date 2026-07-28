import apiService from './api';
import type { Port, PortFormData } from '../types/port.types';

// Same collection the public Origin/Destination search reads from
// (quoteService.searchLocations → GET /finder_port/search). This service
// is the admin-side CRUD for that collection.
class PortService {
  private readonly basePath = '/finder_port';

  async getAllPorts(): Promise<Port[]> {
    return apiService.get<Port[]>(this.basePath);
  }

  async getPortById(id: string): Promise<Port> {
    return apiService.get<Port>(`${this.basePath}/${id}`);
  }

  async createPort(data: PortFormData): Promise<{ id: string; message: string }> {
    return apiService.post<{ id: string; message: string }>(this.basePath, data);
  }

  async updatePort(id: string, data: Partial<PortFormData>): Promise<{ message: string }> {
    return apiService.put<{ message: string }>(`${this.basePath}/${id}`, data);
  }

  async deletePort(id: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`${this.basePath}/${id}`);
  }
}

export const portService = new PortService();
export default portService;
