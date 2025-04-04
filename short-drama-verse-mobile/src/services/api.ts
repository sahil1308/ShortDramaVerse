/**
 * API Service
 * 
 * Handles all API communication with the backend server.
 * Provides methods for making HTTP requests and error handling.
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { storageService } from './storage';
import { API_CONFIG, APP_CONFIG } from '@/constants/config';

/**
 * API Service Class
 * 
 * Provides methods for making HTTP requests to the backend
 */
class ApiService {
  private api: AxiosInstance;
  private isRefreshing: boolean = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.api = axios.create({
      baseURL: `${API_CONFIG.BASE_URL}/${API_CONFIG.VERSION}`,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS,
    });

    this.setupInterceptors();
  }

  /**
   * Set up request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor for adding auth token
    this.api.interceptors.request.use(
      async (config) => {
        // Add authentication token if available
        const token = await storageService.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for handling common errors and token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;
        
        // Handle 401 Unauthorized errors (token expired)
        if (error.response?.status === 401 && originalRequest && !originalRequest.headers._retry) {
          if (!this.isRefreshing) {
            this.isRefreshing = true;
            
            try {
              // Attempt to refresh the token
              const refreshToken = await storageService.getRefreshToken();
              if (!refreshToken) {
                // No refresh token available, reject the request
                await this.handleAuthError();
                return Promise.reject(error);
              }
              
              // Call refresh token API
              const response = await axios.post(
                `${API_CONFIG.BASE_URL}/${API_CONFIG.VERSION}${API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN}`,
                { refreshToken }
              );
              
              const { accessToken, refreshToken: newRefreshToken } = response.data;
              
              // Store new tokens
              await storageService.setAuthToken(accessToken);
              await storageService.setRefreshToken(newRefreshToken);
              
              // Update authorization header
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              originalRequest.headers._retry = true;
              
              // Execute all pending requests with new token
              this.onRefreshed(accessToken);
              
              // Reset refreshing state
              this.isRefreshing = false;
              
              // Retry the original request
              return this.api(originalRequest);
            } catch (refreshError) {
              // Token refresh failed, handle auth error
              this.isRefreshing = false;
              await this.handleAuthError();
              return Promise.reject(refreshError);
            }
          } else {
            // Add request to queue
            return new Promise((resolve) => {
              this.addRefreshSubscriber((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                originalRequest.headers._retry = true;
                resolve(this.api(originalRequest));
              });
            });
          }
        }
        
        // Handle other error types
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  /**
   * Add a callback to be executed when token is refreshed
   */
  private addRefreshSubscriber(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback);
  }

  /**
   * Execute all refresh subscribers with new token
   */
  private onRefreshed(token: string): void {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  /**
   * Handle authentication errors
   */
  private async handleAuthError(): Promise<void> {
    // Clear authentication data
    await storageService.clearAuthData();
    
    // Add implementation for redirecting to login or showing auth error
    // This will depend on how navigation is handled in the app
  }

  /**
   * Format API errors into a consistent structure
   */
  private handleApiError(error: AxiosError): Error {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const message = 
        data.message || 
        data.error || 
        `Server error: ${status}`;
      
      const formattedError = new Error(message);
      (formattedError as any).status = status;
      (formattedError as any).data = data;
      
      return formattedError;
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Network error: No response received from server');
    } else {
      // Error in setting up the request
      return new Error(`Request error: ${error.message}`);
    }
  }

  /**
   * Make a GET request
   * 
   * @param url API endpoint
   * @param params URL parameters
   * @param config Additional axios config
   * @returns Promise with response data
   */
  async get<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.get(url, { 
        params,
        ...config 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Make a POST request
   * 
   * @param url API endpoint
   * @param data Request body
   * @param config Additional axios config
   * @returns Promise with response data
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Make a PUT request
   * 
   * @param url API endpoint
   * @param data Request body
   * @param config Additional axios config
   * @returns Promise with response data
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Make a PATCH request
   * 
   * @param url API endpoint
   * @param data Request body
   * @param config Additional axios config
   * @returns Promise with response data
   */
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Make a DELETE request
   * 
   * @param url API endpoint
   * @param config Additional axios config
   * @returns Promise with response data
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Download a file
   * 
   * @param url API endpoint
   * @param filename Name to save the file as
   * @param config Additional axios config
   * @returns Promise with saved file path
   */
  async downloadFile(url: string, filename: string, config?: AxiosRequestConfig): Promise<string> {
    try {
      const response = await this.api.get(url, {
        ...config,
        responseType: 'blob',
      });
      
      // Implementation will depend on the file system approach
      // For React Native, we'd typically use react-native-fs or expo-file-system
      // This is a placeholder for the implementation
      console.log('File downloaded, size:', response.data.size);
      
      return `Downloaded: ${filename}`;
    } catch (error) {
      throw error;
    }
  }
}

export const apiService = new ApiService();