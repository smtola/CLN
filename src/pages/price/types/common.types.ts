export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
  }
  
  export interface ApiError {
    error: string;
    details?: string;
  }
  
  export interface PaginationParams {
    page: number;
    limit: number;
  }
  
  export interface Location {
    city: string;
    code: string;
    country: string;
    type: string;
    name: string;
    lat: number;
    lon: number;
  }

  export interface Commodity {
    id: string;            // unique identifier for the commodity
    name: string;          // display name of the commodity
    description?: string;  // optional description
    code?: string;         // optional commodity code
  }
  
  export interface Country {
    code: string;
    name: string;
    flag: string;
  }

  export interface Local {
    code: string;
    name: string;
    country: string;
  }
  
  export interface Currency {
    code: string;
    symbol: string;
    name: string;
  }
  
  export interface LoadingState {
    isLoading: boolean;
    error: string | null;
  }
  
  export type FormStep = 1 | 2 | 3 | 4 | 5;