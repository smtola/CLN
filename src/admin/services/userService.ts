import baseApi from '../api/baseApi';
import type { User } from '../../types/auth';

// ✅ GET all users
export const getUsers = async (): Promise<User[]> => {
  const response = await baseApi.get<User[] | { data: User[] } | { users: User[] }>('/auth/users');
  
  // Handle different response formats
  if (Array.isArray(response)) {
    return response;
  }
  
  // Handle wrapped responses
  if (response && typeof response === 'object') {
    if ('data' in response && Array.isArray(response.data)) {
      return response.data;
    }
    if ('users' in response && Array.isArray(response.users)) {
      return response.users;
    }
  }
  
  // Fallback: return empty array if format is unexpected
  console.warn('Unexpected API response format:', response);
  return [];
};

// ✅ GET a single user
export const getUserById = async (id: string): Promise<User> => {
  return baseApi.get<User>(`/auth/users/${id}`);
};

// ✅ CREATE a new user
export const createUser = async (data: Omit<User, 'id'>): Promise<User> => {
  return baseApi.post<User>('/auth/users', data);
};

// ✅ UPDATE a user
export const updateUser = async (id: string, data: Partial<User>): Promise<User> => {
  return baseApi.put<User>(`/auth/users/${id}`, data);
};

// ✅ DELETE a user
export const deleteUser = async (id: string): Promise<void> => {
  return baseApi.delete<void>(`/auth/users/${id}`);
};
