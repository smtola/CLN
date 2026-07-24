import baseApi from "../api/baseApi";
import type { ServiceItem, ServiceResponse } from "../types/service";

export const getServices = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  order?: "asc" | "desc";
}): Promise<ServiceResponse> => {
  const query = new URLSearchParams();

  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  if (params?.search) query.append("search", params.search);
  if (params?.order) query.append("order", params.order);

  return baseApi.get<ServiceResponse>(`/web/services?${query.toString()}`);
};

export const getServiceById = async (id: string): Promise<ServiceItem> => {
  const response = await baseApi.get<ServiceItem | { data: ServiceItem }>(
    `/web/services/${id}`
  );

  if (response && typeof response === "object" && "data" in response) {
    return response.data;
  }

  return response as ServiceItem;
};

export const createService = async (
  data: Omit<ServiceItem, "_id">
): Promise<ServiceItem> => {
  return baseApi.post<ServiceItem>("/web/services", data);
};

export const updateService = async (
  id: string,
  data: Partial<ServiceItem>
): Promise<ServiceItem> => {
  return baseApi.put<ServiceItem>(`/web/services/${id}`, data);
};

export const deleteService = async (id: string): Promise<void> => {
  return baseApi.delete<void>(`/web/services/${id}`);
};
