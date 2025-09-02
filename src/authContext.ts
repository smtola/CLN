import { createContext } from "react";
import type { User, LoginPayload, SignupPayload, LogoutPayload } from "./types/auth";

export interface AuthContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
  authed: boolean;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<{ ok: boolean; error?: string }>;
  signup: (payload: SignupPayload) => Promise<{ ok: boolean; error?: string }>;
  logout: (payload: LogoutPayload) => Promise<{ msg: string }>;
}

export const AuthContext = createContext<AuthContextProps | null>(null);
