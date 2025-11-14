import type { User } from "./types/auth";
import Cookies from "js-cookie";

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

export function setAuth({ accessToken, refreshToken }: { accessToken?: string; refreshToken?: string; user?: User }) {
  if (accessToken) {
    localStorage.setItem(ACCESS_KEY, accessToken)
    Cookies.set('accessToken', accessToken)
  };
  if (refreshToken) {
    localStorage.setItem(REFRESH_KEY, refreshToken)
    Cookies.set('refreshToken', refreshToken)
  };
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

export async function getUser() {
  const token = localStorage.getItem(ACCESS_KEY);
  if (!token) {
    return null;
  }

  try {
    // Decode the JWT payload (middle part)
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  Cookies.remove("accessToken");
  Cookies.remove("refreshToken");
  Cookies.remove("remember_web_59ba36addc2b2f9401580f014c7f58ea4e30989d");
}
