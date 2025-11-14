export interface User {
  _id: string;
  username?: string;
  email: string;
  role?: string;
  profile?: string;
  is_verified?: boolean;
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
  httpStatus?:number;
}

export interface LoginResponse{
  requiresOtp?: boolean;
  access_token?:string;
  refresh_token?:string;
  msg?: string;
  user?: User;
  username?: string;
  status?:boolean;
}

export interface VerifyResponse{
  msg?:string;
  access_token?:string;
  refresh_token?:string;
  user?: User;
  status?:boolean;
}

export interface LogoutResponse{
  msg?:string;
  access_token?:string;
  refresh_token?:string;
  user?: User;
  status?:boolean;
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
  status?:boolean;
}

export interface SignupPayload {
  username?: string;
  email?: string;
  password?: string;
  status?:boolean;
}

export interface LogoutPayload {
  msg?:string;
  access_token?:string;
  refresh_token?:string;
  user?: User;
  status?:boolean;
}

export interface VerifyEmailPayload {
  username?:string;
  email?: string;
  otp?: string;
  msg?: string;
  status?:boolean;
}

export interface VerifyOTPPayload{
  username:string;
  otp:string;
  msg?:string;
  access_token?:string;
  refresh_token?:string;
  status?:boolean;
  user?: User;
}

export interface VerifyEmailResponse {
  msg?: string;
  token?: string;
  access_token?:string;
  refresh_token?:string;
  status?:boolean;
  user?:User;
}

export interface DecodeToken{
  username: string;
  email:string;
  role:string;
  isVerify:boolean;
}