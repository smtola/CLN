export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  profile?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface SignupResponse {
  user?: User;
  is_verified?: boolean;
  access_token?:string;
  refresh_token?:string;
  msg?:string;
}

export interface LoginResponse{
  requiresOtp?: boolean;
  access_token?:string;
  refresh_token?:string;
  msg?: string;
  user?: User;
  username?: string;
}

export interface VerifyResponse{
  msg?:string;
  access_token?:string;
  refresh_token?:string;
  user?: User;
}

export interface LogoutResponse{
  msg?:string;
  access_token?:string;
  refresh_token?:string;
  user?: User;
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
  msg?:string;
}

export interface SignupPayload {
  username?: string;
  email?: string;
  password?: string;
}

export interface LogoutPayload {
  msg?:string;
  access_token?:string;
  refresh_token?:string;
  user?: User;
}

export interface VerifyEmailPayload {
  username?:string;
  email?: string;
  otp?: string;
  msg?: string;
}

export interface VerifyOTPPayload{
  username:string;
  otp:string;
  msg?:string;
  access_token?:string;
  refresh_token?:string;
  user?: User;
}

export interface VerifyEmailResponse {
  msg?: string;
  token?: string;
}