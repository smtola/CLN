import axios, { AxiosError } from "axios";
import type { AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { getAccessToken, getRefreshToken, setAccessToken, clearAuth } from "./authStorage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  withCredentials: false, // set true if using cookies
});

let isRefreshing = false;

type QueueItem = {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  config: AxiosRequestConfig;
};

const requestQueue: QueueItem[] = [];

function processQueue(error: unknown, token: string | null) {
  while (requestQueue.length) {
    const { resolve, reject, config } = requestQueue.shift()!;
    if (error) {
      reject(error);
    } else {
      if (token && config.headers) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      resolve(api(config));
    }
  }
}

const AUTH_WHITELIST = ["/login", "/signup", "/verify-email", "/refresh"];

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && config.headers && !config.headers["Authorization"]) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (!error.response) return Promise.reject(error);

    const status = error.response.status;
    const isWhitelisted = AUTH_WHITELIST.some((p) => original.url?.includes(p));

    if (status === 401 && !original._retry && !isWhitelisted) {
      original._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        const rToken = getRefreshToken();

        if (!rToken) {
          clearAuth();
          return Promise.reject(error);
        }

        api
          .post("/refresh", { refreshToken: rToken })
          .then((res: { data: { accessToken?: string } }) => {
            const newAccess = res.data?.accessToken;
            if (!newAccess) throw new Error("No accessToken in /refresh response");
            setAccessToken(newAccess);
            processQueue(null, newAccess);
            return newAccess;
          })
          .catch((err:unknown) => {
            processQueue(err, null);
            clearAuth();
            throw err;
          })
          .finally(() => {
            isRefreshing = false;
          });
      }

      return new Promise((resolve, reject) => {
        requestQueue.push({ resolve, reject, config: original });
      });
    }

    return Promise.reject(error);
  }
);

export default api;
