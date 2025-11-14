const BASE_URL = 'https://clnrestapi.vercel.app/api/v1/docs';

interface RequestConfig {
  url: string;
  method: string;
  headers?: HeadersInit;
  body?: unknown;
}

class BaseApi {
  private baseURL: string;

  constructor() {
    this.baseURL = BASE_URL;
  }

  private async request<T>(config: RequestConfig): Promise<T> {
    const token = localStorage.getItem('accessToken');
    
    // Build full URL
    const fullUrl = `${this.baseURL}${config.url}`;
    
    // Prepare headers
    const headers: Record<string, string> = {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      ...(config.headers as Record<string, string>),
    };

    // Add authorization token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method: config.method,
      headers,
    };

    // Add body for POST, PUT requests
    if (config.body !== undefined) {
      requestOptions.body = JSON.stringify(config.body);
    }

    const response = await fetch(fullUrl, requestOptions);
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    // Handle 422 Validation Error
    if (response.status === 422) {
      const errorData = await response.json().catch(() => ({}));
      console.error('422 Validation Error:', {
        url: fullUrl,
        method: config.method,
        status: response.status,
        data: errorData,
        headers: headers,
      });
      // Throw error with more details from API response
      const errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
      throw new Error(`Validation Error: ${errorMessage}`);
    }

    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Parse and return response data
    const data = await response.json();
    return data as T;
  }

  get<T>(url: string): Promise<T> {
    return this.request<T>({
      url,
      method: 'GET',
    });
  }

  post<T>(url: string, data?: unknown): Promise<T> {
    return this.request<T>({
      url,
      method: 'POST',
      body: data,
    });
  }

  put<T>(url: string, data?: unknown): Promise<T> {
    return this.request<T>({
      url,
      method: 'PUT',
      body: data,
    });
  }

  delete<T>(url: string): Promise<T> {
    return this.request<T>({
      url,
      method: 'DELETE',
    });
  }
}

export default new BaseApi();
