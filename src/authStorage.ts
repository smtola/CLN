import type { User } from "./types/auth";
import Cookies from "js-cookie";

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";
const USER_KEY = "authUser";

export function setAuth({ accessToken, refreshToken, user }: { accessToken?: string; refreshToken?: string; user?: User }) {
  if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_KEY, token);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function getUser(): User | null {
  const u = localStorage.getItem(USER_KEY);
  try {
    return u ? (JSON.parse(u) as User) : null;
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  Cookies.remove("accessToken");
  Cookies.remove("remember_web_59ba36addc2b2f9401580f014c7f58ea4e30989d");
}
