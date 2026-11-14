import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import axios from "axios";
import { ApiError } from "./errors";
import type { ApiResponse } from "@/types/api";
import { useAuthStore } from "@/stores/auth-store";

interface RetryQueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: RetryQueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Configure request and response interceptors on the Axios client instance.
 */
export function setupInterceptors(axiosInstance: AxiosInstance): AxiosInstance {
  // Request Interceptor: Attach Bearer Access Token if present
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      config.headers["X-Requested-With"] = "XMLHttpRequest";

      // Dynamically attach in-memory access token
      const token = useAuthStore.getState().accessToken;
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(
        new ApiError(
          error.message || "Failed to send request",
          undefined,
          undefined,
          true
        )
      );
    }
  );

  // Response Interceptor: Seamless Token Refresh & Concurrency Queue
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError<ApiResponse>) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // Network failure / server offline
      if (!error.response) {
        return Promise.reject(
          new ApiError(
            "Network error: Unable to connect to Asli Cart API server. Ensure the backend is running.",
            undefined,
            undefined,
            true
          )
        );
      }

      const { status, data } = error.response;
      const requestUrl = originalRequest?.url || "";

      // Check if 401 is eligible for token refresh
      const isAuthEndpoint =
        requestUrl.includes("/auth/login") ||
        requestUrl.includes("/auth/register") ||
        requestUrl.includes("/auth/refresh");

      if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
        // If refresh is already in-progress, queue this request
        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((newToken) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return axiosInstance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const authState = useAuthStore.getState();
          const isStaff = authState.user?.role !== "CUSTOMER";
          const refreshUrl = isStaff
            ? "/admin/auth/refresh"
            : "/customer/auth/refresh";

          // Use raw axios to prevent infinite interceptor loops
          const refreshRes = await axios.post<
            ApiResponse<{ accessToken: string; refreshToken?: string }>
          >(
            `${axiosInstance.defaults.baseURL}${refreshUrl}`,
            { refreshToken: authState.refreshToken },
            { withCredentials: true }
          );

          const newAccessToken = refreshRes.data.data?.accessToken;
          if (!newAccessToken) {
            throw new Error("No access token returned in refresh response");
          }

          // Update store with new token
          authState.setAccessToken(newAccessToken);

          // Retry all queued requests
          processQueue(null, newAccessToken);

          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshErr) {
          // Token refresh failed completely: clear session
          processQueue(refreshErr, null);
          useAuthStore.getState().clearAuth();
          return Promise.reject(
            new ApiError("Session expired. Please log in again.", 401, undefined, false)
          );
        } finally {
          isRefreshing = false;
        }
      }

      // Normal error formatting
      const message =
        data?.message ||
        (status === 404
          ? "Requested resource was not found"
          : status === 403
          ? "You do not have permission to perform this action"
          : status === 401
          ? "Invalid credentials or unauthorized"
          : status === 429
          ? "Too many requests. Please slow down."
          : "Server error occurred");

      return Promise.reject(
        new ApiError(message, status, data?.errors, false)
      );
    }
  );

  return axiosInstance;
}
