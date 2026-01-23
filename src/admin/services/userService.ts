import baseApi from '../api/baseApi';
import type { Profile, User, UserType } from '../../types/auth';
import type { UpdateUserPayload } from '../pages/user/UserForm';

export type ApiResponse<T> = {
  status: boolean;
  msg: string;
  data: T;
};
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
export const getUserById = async (_id: string): Promise<ApiResponse<Profile>> => {
  return baseApi.get<ApiResponse<Profile>>(`/auth/users/${_id}`);
};


// ✅ CREATE a new user
export const createUser = async (data: Omit<Profile, '_id'>): Promise<Profile> => {
  return baseApi.post<Profile>('/auth/users', data);
};


export const updateUser = async (
  _id: string,
  data: UpdateUserPayload
): Promise<ApiResponse<UserType>> => {
  return baseApi.put<ApiResponse<UserType>>(`/auth/users/${_id}`, data);
};


// ✅ DELETE a user
export const deleteUser = async (_id: string): Promise<void> => {
  return baseApi.delete<void>(`/auth/users/${_id}`);
};

// ✅ recovere a user
export const recoveredUser = async (
  _id: string,
  data: UpdateUserPayload
): Promise<ApiResponse<UserType>> => {
  return baseApi.put<ApiResponse<UserType>>(`/auth/users/recovered/${_id}`, data);
};

// ✅ empty a trash
export const emptyTrash = async (_id: string): Promise<ApiResponse<UserType>> => {
  return baseApi.delete<ApiResponse<UserType>>(`/auth/users/empty_trash/${_id}`);
};