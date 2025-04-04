/**
 * API Service for ShortDramaVerse Mobile
 * 
 * This service handles all API communication including
 * authentication, request interceptors, and error handling.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import { StorageKey } from './storage';

// Base API configuration
const API_BASE_URL = 'https://shortdramaverse-api.example.com';
const API_TIMEOUT = 15000; // 15 seconds

/**
 * API Service class for handling all API communication
 */
class ApiService {
  private api: AxiosInstance;
  private authToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Platform': Platform.OS,
        'X-App-Version': process.env.APP_VERSION || '1.0.0',
      },
    });

    // Initialize request interceptor
    this.api.interceptors.request.use(
      this.handleRequest.bind(this),
      this.handleRequestError.bind(this),
    );

    // Initialize response interceptor
    this.api.interceptors.response.use(
      this.handleResponse.bind(this),
      this.handleResponseError.bind(this),
    );

    // Load authentication tokens from storage
    this.loadAuthTokens();
  }

  /**
   * Load authentication tokens from storage
   */
  private async loadAuthTokens(): Promise<void> {
    try {
      this.authToken = await AsyncStorage.getItem(StorageKey.AUTH_TOKEN);
      this.refreshToken = await AsyncStorage.getItem(StorageKey.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error loading auth tokens:', error);
    }
  }

  /**
   * Handle API request config
   */
  private handleRequest(config: AxiosRequestConfig): AxiosRequestConfig {
    // Add authentication token to request if available
    if (this.authToken) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${this.authToken}`,
      };
    }
    return config;
  }

  /**
   * Handle API request error
   */
  private handleRequestError(error: any): Promise<any> {
    console.error('Request error:', error);
    return Promise.reject(error);
  }

  /**
   * Handle API response
   */
  private handleResponse(response: any): AxiosResponse {
    return response;
  }

  /**
   * Handle API response error
   */
  private async handleResponseError(error: any): Promise<any> {
    const originalRequest = error.config;
    
    // Handle token expiration
    if (error.response?.status === 401 &&
        !originalRequest._retry &&
        this.refreshToken) {
      
      if (this.isRefreshing) {
        // Wait for the refresh to complete and retry
        return new Promise((resolve) => {
          this.refreshSubscribers.push((token: string) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(this.api(originalRequest));
          });
        });
      }
      
      originalRequest._retry = true;
      this.isRefreshing = true;
      
      try {
        // Attempt to refresh the token
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          { refreshToken: this.refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );
        
        const { token, refreshToken } = response.data;
        
        // Store new tokens
        await this.setAuthToken(token, refreshToken);
        
        // Notify subscribers
        this.refreshSubscribers.forEach(callback => callback(token));
        this.refreshSubscribers = [];
        
        // Retry original request
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return this.api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Clear tokens and force logout
        await this.clearAuthToken();
        
        // Navigate to auth screen
        // This would typically be handled by the auth context
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please log in again.'
        );
        
        return Promise.reject(refreshError);
      } finally {
        this.isRefreshing = false;
      }
    }
    
    // Parse error message
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response) {
      // Server responded with error status
      const serverError = error.response.data;
      errorMessage = serverError.message || serverError.error || error.response.statusText;
    } else if (error.request) {
      // Request made but no response received
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please check your internet connection and try again.';
      } else {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      }
    }
    
    // Create error with proper message
    const apiError = new Error(errorMessage);
    
    // Add response data for debugging
    (apiError as any).response = error.response;
    (apiError as any).request = error.request;
    (apiError as any).status = error.response?.status;
    
    return Promise.reject(apiError);
  }

  /**
   * Set authentication token
   * 
   * @param token - Authentication token
   * @param refreshToken - Refresh token
   */
  public async setAuthToken(token: string, refreshToken: string): Promise<void> {
    this.authToken = token;
    this.refreshToken = refreshToken;
    
    try {
      await AsyncStorage.setItem(StorageKey.AUTH_TOKEN, token);
      await AsyncStorage.setItem(StorageKey.REFRESH_TOKEN, refreshToken);
    } catch (error) {
      console.error('Error storing auth tokens:', error);
      throw new Error('Failed to store authentication tokens');
    }
  }

  /**
   * Clear authentication token
   */
  public async clearAuthToken(): Promise<void> {
    this.authToken = null;
    this.refreshToken = null;
    
    try {
      await AsyncStorage.removeItem(StorageKey.AUTH_TOKEN);
      await AsyncStorage.removeItem(StorageKey.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error removing auth tokens:', error);
      throw new Error('Failed to remove authentication tokens');
    }
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return !!this.authToken;
  }

  /**
   * Perform GET request
   * 
   * @param path - API path
   * @param params - Query parameters
   * @returns Response data
   */
  public async get<T>(path: string, params?: any): Promise<T> {
    try {
      const response = await this.api.get<T>(path, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Perform POST request
   * 
   * @param path - API path
   * @param data - Request body
   * @returns Response data
   */
  public async post<T>(path: string, data?: any): Promise<T> {
    try {
      const response = await this.api.post<T>(path, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Perform PUT request
   * 
   * @param path - API path
   * @param data - Request body
   * @returns Response data
   */
  public async put<T>(path: string, data?: any): Promise<T> {
    try {
      const response = await this.api.put<T>(path, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Perform PATCH request
   * 
   * @param path - API path
   * @param data - Request body
   * @returns Response data
   */
  public async patch<T>(path: string, data?: any): Promise<T> {
    try {
      const response = await this.api.patch<T>(path, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Perform DELETE request
   * 
   * @param path - API path
   * @param params - Query parameters
   * @returns Response data
   */
  public async delete<T>(path: string, params?: any): Promise<T> {
    try {
      const response = await this.api.delete<T>(path, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload file
   * 
   * @param path - API path
   * @param fileUri - URI of file to upload
   * @param fileField - Name of file field
   * @param mimeType - MIME type of file
   * @param extraData - Additional form data
   * @returns Response data
   */
  public async uploadFile<T>(
    path: string,
    fileUri: string,
    fileField: string = 'file',
    mimeType: string = 'application/octet-stream',
    extraData: { [key: string]: string } = {}
  ): Promise<T> {
    try {
      // Create form data
      const formData = new FormData();
      
      // Add file
      formData.append(fileField, {
        uri: fileUri,
        name: fileUri.split('/').pop() || 'file',
        type: mimeType,
      } as any);
      
      // Add extra data
      Object.keys(extraData).forEach(key => {
        formData.append(key, extraData[key]);
      });
      
      // Upload file
      const response = await this.api.post<T>(path, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

// Export as singleton
export default new ApiService();