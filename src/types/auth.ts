export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  profile?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  requiresOtp?: boolean;
  access_token?:string;
  refreshToken?:string;
  msg?:string;
}

export interface LoginResponse{
  msg: string;
  user: User;
  requiresOtp?: boolean;
  access_token?:string;
  refresh_token?:string;
  username: string;
}

export interface VerifyResponse{
  msg?:string;
  access_token?:string;
  refresh_token?:string;
  user: User;
}

export interface LogoutResponse{
  msg?:string;
  access_token?:string;
  refresh_token?:string;
  user: User;
}

export interface ApiError {
  msg: string;
  statusCode?: number;
}

export interface LoginPayload {
  username: string;
  password: string;
  local_ip: string;
  ip?:string;
}

export interface SignupPayload {
  username?: string;
  email: string;
  password: string;
}

export interface LogoutPayload {
  msg?:string;
  access_token?:string;
  refresh_token?:string;
  user: User;
}

export interface VerifyEmailPayload {
  email: string;
  otp: string;
}

export interface VerifyEmailResponse {
  ok: boolean;
  msg: string;
  token?: string;
}