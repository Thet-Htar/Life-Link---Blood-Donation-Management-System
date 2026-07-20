
import { useAuthStore } from "@/store/authState";
import axios from "axios";
import authService from "./authService";

//to avoid infite loop of refresh token requests,
//  we will use a flag to check if the request is already in progress
let isRefreshing = false;
let failedQueue: any[] = [];

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

//handling 401 errors and refreshing the token
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalConfig = error.config;

    if (
      error.response?.status === 401 &&
      !originalConfig._retry &&
      !originalConfig.url?.includes("/auth/login") &&
      !originalConfig.url?.includes("/auth/refresh")
    ) {
      originalConfig._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalConfig.headers.Authorization = `Bearer ${token}`;
            return api(originalConfig);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }
      isRefreshing = true;

      try {
        const res = await authService.refresh();

        const newAccessToken = res.accessToken;

        useAuthStore.getState().setAuth(newAccessToken, res.user);

        originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalConfig);
      } catch (err) {
        processQueue(err, null);

        useAuthStore.getState().logout();
        window.location.href = "/login";

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;

//console.log("API URL:", import.meta.env.VITE_API_URL);
