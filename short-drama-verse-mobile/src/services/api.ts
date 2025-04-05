/**
 * API Service
 * 
 * Central service for handling all API communications with the backend.
 * Includes request configuration, authentication, and error handling.
 */
import { storageService } from './storage';
import { analyticsService } from './analytics';
import { AnalyticsEventType } from './analytics';

// API configuration constants
const API_BASE_URL = 'https://api.shortdramaverse.com';
const API_TIMEOUT = 30000; // 30 seconds
const AUTH_TOKEN_KEY = 'auth_token';

/**
 * API Error class for standardized error handling
 */
export class ApiError extends Error {
  status: number;
  endpoint: string;
  
  constructor(message: string, status: number, endpoint: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.endpoint = endpoint;
  }
}

/**
 * API Service Class
 * Handles all API requests in the application
 */
class ApiService {
  private authToken: string | null = null;
  private isInitialized = false;
  
  /**
   * Initialize the API service
   * Load stored auth token if available
   */
  async initialize(): Promise<void> {
    try {
      // Try to load existing auth token
      this.authToken = await storageService.getItem(AUTH_TOKEN_KEY);
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing API service:', error);
      this.isInitialized = true; // Still mark as initialized to not block functionality
    }
  }
  
  /**
   * Set the authentication token for API requests
   * @param token JWT token for authentication
   */
  async setAuthToken(token: string | null): Promise<void> {
    this.authToken = token;
    
    if (token) {
      await storageService.setItem(AUTH_TOKEN_KEY, token);
    } else {
      await storageService.removeItem(AUTH_TOKEN_KEY);
    }
  }
  
  /**
   * Get the current authentication token
   */
  getAuthToken(): string | null {
    return this.authToken;
  }
  
  /**
   * Check if the user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authToken !== null;
  }
  
  /**
   * Make a GET request to the API
   * @param endpoint API endpoint (without base URL)
   * @param params URL query parameters
   */
  async get<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    // Convert params object to URL query string
    const queryString = Object.keys(params).length > 0
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : '';
    
    return this.request<T>('GET', `${endpoint}${queryString}`);
  }
  
  /**
   * Make a POST request to the API
   * @param endpoint API endpoint (without base URL)
   * @param data Request body data
   */
  async post<T>(endpoint: string, data: any = {}): Promise<T> {
    return this.request<T>('POST', endpoint, data);
  }
  
  /**
   * Make a PUT request to the API
   * @param endpoint API endpoint (without base URL)
   * @param data Request body data
   */
  async put<T>(endpoint: string, data: any = {}): Promise<T> {
    return this.request<T>('PUT', endpoint, data);
  }
  
  /**
   * Make a PATCH request to the API
   * @param endpoint API endpoint (without base URL)
   * @param data Request body data
   */
  async patch<T>(endpoint: string, data: any = {}): Promise<T> {
    return this.request<T>('PATCH', endpoint, data);
  }
  
  /**
   * Make a DELETE request to the API
   * @param endpoint API endpoint (without base URL)
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint);
  }
  
  /**
   * Make a request to the API with full configuration
   * @param method HTTP method
   * @param endpoint API endpoint (without base URL)
   * @param data Request body data
   */
  private async request<T>(method: string, endpoint: string, data?: any): Promise<T> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const startTime = Date.now();
      
      // Prepare request headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      // Add auth token if available
      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }
      
      // Prepare request options
      const options: RequestInit = {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      };
      
      // Make the fetch request with timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), API_TIMEOUT);
      });
      
      const response = await Promise.race([
        fetch(`${API_BASE_URL}${endpoint}`, options),
        timeoutPromise
      ]) as Response;
      
      // Calculate request duration for analytics
      const duration = Date.now() - startTime;
      
      // Track API request in analytics
      analyticsService.trackEvent(AnalyticsEventType.CUSTOM, {
        name: 'api_request',
        endpoint,
        method,
        status: response.status,
        duration,
      });
      
      // Handle potential errors based on status code
      if (!response.ok) {
        // Try to parse error message from response
        let errorMessage: string;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || `API Error: ${response.statusText}`;
        } catch {
          errorMessage = `API Error: ${response.statusText}`;
        }
        
        throw new ApiError(errorMessage, response.status, endpoint);
      }
      
      // Special case for 204 No Content
      if (response.status === 204) {
        return {} as T;
      }
      
      // Parse and return response data
      return await response.json() as T;
    } catch (error) {
      // Log and rethrow error
      console.error(`API Error (${method} ${endpoint}):`, error);
      
      // Track error in analytics
      if (error instanceof Error) {
        analyticsService.trackError('api_error', error.message, {
          endpoint,
          method,
        });
      }
      
      throw error;
    }
  }
  
  /**
   * Upload a file to the API
   * @param endpoint API endpoint (without base URL)
   * @param file File to upload
   * @param fileFieldName Name of the file field in the form
   * @param additionalData Additional form data to include
   */
  async uploadFile<T>(
    endpoint: string,
    file: File,
    fileFieldName: string = 'file',
    additionalData: Record<string, any> = {}
  ): Promise<T> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      // Create form data
      const formData = new FormData();
      formData.append(fileFieldName, file);
      
      // Add any additional data
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
      
      // Prepare headers
      const headers: Record<string, string> = {};
      
      // Add auth token if available
      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }
      
      // Make the request
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });
      
      if (!response.ok) {
        // Try to parse error message from response
        let errorMessage: string;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || `API Error: ${response.statusText}`;
        } catch {
          errorMessage = `API Error: ${response.statusText}`;
        }
        
        throw new ApiError(errorMessage, response.status, endpoint);
      }
      
      // Parse and return response data
      return await response.json() as T;
    } catch (error) {
      console.error(`File Upload Error (${endpoint}):`, error);
      
      // Track error in analytics
      if (error instanceof Error) {
        analyticsService.trackError('file_upload_error', error.message, {
          endpoint,
        });
      }
      
      throw error;
    }
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();