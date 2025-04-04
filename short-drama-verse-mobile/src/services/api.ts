/**
 * API Service
 * 
 * This service handles all API communication with the backend server.
 * It provides methods for making HTTP requests and handling responses.
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG } from '@/constants/config';
import { storageService } from './storage';

/**
 * APIError class to standardize error handling across the app
 */
export class APIError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number = 500, data?: any) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Axios instance with base configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/${API_CONFIG.VERSION}`,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

/**
 * Request interceptor
 * - Adds authorization header if token exists
 * - Handles request configuration
 */
apiClient.interceptors.request.use(
  async (config) => {
    const token = await storageService.getAuthToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(new APIError('Request configuration error', 0, error));
  }
);

/**
 * Response interceptor
 * - Handles successful responses
 * - Handles error responses with standardized error handling
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    if (!error.response) {
      // Network or connection error
      return Promise.reject(
        new APIError('Network error, please check your connection', 0)
      );
    }

    const { status, data } = error.response;

    // Handle token expiration
    if (status === 401) {
      try {
        const refreshed = await refreshToken();
        if (refreshed && error.config) {
          // Retry the original request with new token
          return apiClient(error.config);
        }
      } catch (refreshError) {
        // If refresh token fails, redirect to login
        await storageService.clearAuthData();
        return Promise.reject(
          new APIError('Session expired, please login again', 401)
        );
      }
    }

    // Handle other errors
    let message = 'An unexpected error occurred';
    if (typeof data === 'object' && data !== null && 'message' in data) {
      message = data.message as string;
    } else if (typeof data === 'string') {
      message = data;
    }

    return Promise.reject(new APIError(message, status, data));
  }
);

/**
 * Refreshes the authentication token
 * @returns {Promise<boolean>} True if token refresh was successful
 */
async function refreshToken(): Promise<boolean> {
  try {
    const refreshToken = await storageService.getRefreshToken();
    
    if (!refreshToken) {
      return false;
    }
    
    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/${API_CONFIG.VERSION}${API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN}`,
      { refreshToken }
    );
    
    if (response.data.token) {
      await storageService.setAuthToken(response.data.token);
      if (response.data.refreshToken) {
        await storageService.setRefreshToken(response.data.refreshToken);
      }
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}

/**
 * API Service for making HTTP requests
 */
class ApiService {
  /**
   * Makes a GET request to the specified endpoint
   * @param endpoint The API endpoint to call
   * @param params Optional query parameters
   * @param config Optional axios request configuration
   * @returns Promise resolving to the response data
   */
  async get<T>(endpoint: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.get<T>(endpoint, {
      ...config,
      params,
    });
    return response.data;
  }

  /**
   * Makes a POST request to the specified endpoint
   * @param endpoint The API endpoint to call
   * @param data The data to send in the request body
   * @param config Optional axios request configuration
   * @returns Promise resolving to the response data
   */
  async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.post<T>(endpoint, data, config);
    return response.data;
  }

  /**
   * Makes a PUT request to the specified endpoint
   * @param endpoint The API endpoint to call
   * @param data The data to send in the request body
   * @param config Optional axios request configuration
   * @returns Promise resolving to the response data
   */
  async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.put<T>(endpoint, data, config);
    return response.data;
  }

  /**
   * Makes a PATCH request to the specified endpoint
   * @param endpoint The API endpoint to call
   * @param data The data to send in the request body
   * @param config Optional axios request configuration
   * @returns Promise resolving to the response data
   */
  async patch<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.patch<T>(endpoint, data, config);
    return response.data;
  }

  /**
   * Makes a DELETE request to the specified endpoint
   * @param endpoint The API endpoint to call
   * @param config Optional axios request configuration
   * @returns Promise resolving to the response data
   */
  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.delete<T>(endpoint, config);
    return response.data;
  }
}

export const apiService = new ApiService();