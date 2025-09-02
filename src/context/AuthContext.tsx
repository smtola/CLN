// src/context/AuthContext.tsx
import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import { getUser, clearAuth } from "../authStorage";
import { login as apiLogin, signup as apiSignup, logout as apiLogout } from "../authService";
import type { User, LoginPayload, SignupPayload, LogoutPayload } from "../types/auth";
import { AuthContext } from "../authContext";

// 3️⃣ Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getUser());
  const [loading, setLoading] = useState(false);
  const [authed, setAuthed] = useState(!!user);

  const login = async (payload: LoginPayload) => {
    setLoading(true);
    try {
      const data = await apiLogin(payload);
      setUser(data.user);
      setAuthed(true);
      return { ok: true };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message || "An error occurred" };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (payload: SignupPayload) => {
    setLoading(true);
    try {
      const data = await apiSignup(payload);
      setUser(data.user);
      setAuthed(true);
      return { ok: true };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message || "An error occurred" };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (payload?: LogoutPayload) => {
    setLoading(true);
    try {
      const res = await apiLogout(payload);
      return { msg: res?.msg ?? "Logged out" };
    } finally {
      clearAuth();
      setUser(null);
      setAuthed(false);
      setLoading(false);
    }
  };

  const value = useMemo(() => ({ user, setUser, authed, loading, login, signup, logout }), [user, authed, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
