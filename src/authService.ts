import api from "./apiClient";
import { setAuth, clearAuth } from "./authStorage";
import type { AuthResponse, LoginPayload, LoginResponse, LogoutPayload, LogoutResponse, SignupPayload, VerifyEmailPayload, VerifyEmailResponse, VerifyResponse } from "./types/auth";

export async function signup(payload: SignupPayload) {
  const { data } = await api.post<AuthResponse>("/signup", payload);
  setAuth({ user: data.user });
  return data;
}

export async function login(payload: LoginPayload) {
  const { data } = await api.post<LoginResponse>("/login", payload);
  
  if (data.access_token && data.refresh_token) {
    setAuth({ accessToken: data.access_token, refreshToken: data.refresh_token, user: data.user ?? null });
  }
  
  return data;
}

export async function logout(payload?: LogoutPayload) {
  try {
    const { data } = await api.post<LogoutResponse>("/logout", payload);
    return data;
  } finally {
    clearAuth();
  }
}

export async function verifyOTP(payload: { username: string; otp: string }) {
  const { data } = await api.post<VerifyResponse>("/verify-otp", payload);
  
  // Set auth after OTP verification
  if (data.access_token && data.refresh_token) {
    setAuth({ accessToken: data.access_token, refreshToken: data.refresh_token, user: data.user ?? null });
  }

  return data;
}

export async function verifyEmail(payload: VerifyEmailPayload): Promise<VerifyEmailResponse> {
  const { data } = await api.post<VerifyEmailResponse>("/verify-email", payload);
  return data;
}

export async function resendOTP(username: string) {
  const { data } = await api.post("/resend-otp", { username });
  return data;
}


export async function fetchUsers() {
  const { data } = await api.get("/users");
  return data;
}

