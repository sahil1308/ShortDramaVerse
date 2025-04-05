/**
 * API Service
 * 
 * Handles all network requests to backend services.
 * Provides utilities for authentication, error handling, and request caching.
 */
import { storageService } from './storage';
import { anonymousAuthService } from './anonymousAuth';
import { analyticsService } from './analytics';
import { AnalyticsEventType } from './analytics';

// API configuration
const API_CONFIG = {
  baseUrl: 'https://api.shortdramaverse.com', // Production API
  timeout: 30000, // 30 seconds timeout
  retryCount: 3,
  retryDelay: 1000, // 1 second between retries
  cacheTime: 5 * 60 * 1000, // 5 minutes cache
  cacheSizeLimit: 50, // Max number of cached responses
};

// Cache key prefix
const CACHE_PREFIX = 'api_cache_';

// Cache storage interface
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

// Error types
export enum ApiErrorType {
  NETWORK = 'network_error',
  TIMEOUT = 'timeout',
  SERVER = 'server_error',
  AUTH = 'auth_error',
  NOT_FOUND = 'not_found',
  VALIDATION = 'validation_error',
  UNKNOWN = 'unknown_error'
}

// Custom API error
export class ApiError extends Error {
  type: ApiErrorType;
  status?: number;
  serverMessage?: string;
  
  constructor(
    type: ApiErrorType, 
    message: string, 
    status?: number, 
    serverMessage?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.status = status;
    this.serverMessage = serverMessage;
  }
}

// Request options
export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  queryParams?: Record<string, string | number | boolean>;
  requireAuth?: boolean;
  skipCache?: boolean;
  cacheTTL?: number; // Time to live for cache entry in ms
  retries?: number;
  mockResponse?: any; // For testing and development
}

// Response interface
export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
  cached?: boolean;
}

class ApiService {
  private cache: Map<string, CacheEntry> = new Map();
  private authToken: string | null = null;
  
  constructor() {
    // Initialize cache cleanup interval
    setInterval(() => this.cleanupCache(), 60 * 1000); // Clean every minute
  }
  
  /**
   * Set the authentication token
   */
  setAuthToken(token: string | null): void {
    this.authToken = token;
  }
  
  /**
   * Get the current authentication token
   */
  getAuthToken(): string | null {
    return this.authToken;
  }
  
  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    // Find expired entries
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    });
    
    // Remove expired entries
    expiredKeys.forEach(key => {
      this.cache.delete(key);
    });
    
    // Check if cache size exceeds limit
    if (this.cache.size > API_CONFIG.cacheSizeLimit) {
      // Find oldest entries to remove
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      // Remove oldest entries until size is within limit
      for (let i = 0; i < entries.length - API_CONFIG.cacheSizeLimit; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }
  
  /**
   * Get cached response if available and not expired
   */
  private getCachedResponse<T>(cacheKey: string): CacheEntry | null {
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp <= cached.ttl) {
      return cached;
    }
    
    return null;
  }
  
  /**
   * Cache a response
   */
  private cacheResponse<T>(cacheKey: string, data: T, ttl: number): void {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  /**
   * Generate cache key from endpoint and parameters
   */
  private generateCacheKey(endpoint: string, options: ApiRequestOptions): string {
    const method = options.method || 'GET';
    const queryParams = options.queryParams ? JSON.stringify(options.queryParams) : '';
    const body = options.body ? JSON.stringify(options.body) : '';
    
    return `${method}_${endpoint}_${queryParams}_${body}`;
  }
  
  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, queryParams?: Record<string, string | number | boolean>): string {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${API_CONFIG.baseUrl}/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
    
    if (!queryParams) {
      return url;
    }
    
    const queryString = Object.entries(queryParams)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');
    
    return queryString ? `${url}${url.includes('?') ? '&' : '?'}${queryString}` : url;
  }
  
  /**
   * Prepare request headers
   */
  private async prepareHeaders(
    options: ApiRequestOptions
  ): Promise<Headers> {
    const headers = new Headers(options.headers || {});
    
    // Set default headers if not provided
    if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    
    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json');
    }
    
    // Add auth token if required
    if (options.requireAuth) {
      if (this.authToken) {
        headers.set('Authorization', `Bearer ${this.authToken}`);
      } else {
        // For anonymous users, get user ID
        try {
          const user = await anonymousAuthService.getCurrentUser();
          headers.set('X-Anonymous-ID', user.id);
          
          // Add device identifiers
          Object.entries(user.deviceIdentifiers).forEach(([key, value]) => {
            headers.set(`X-Device-${key}`, value);
          });
        } catch (error) {
          console.error('Error getting anonymous user:', error);
        }
      }
    }
    
    return headers;
  }
  
  /**
   * Make an API request
   */
  async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    // For development and testing mode, return mock response if provided
    if (options.mockResponse !== undefined) {
      return {
        data: options.mockResponse,
        status: 200,
        headers: new Headers(),
        cached: false
      };
    }
    
    const method = options.method || 'GET';
    const url = this.buildUrl(endpoint, options.queryParams);
    const cacheKey = this.generateCacheKey(endpoint, options);
    const cacheTTL = options.cacheTTL || API_CONFIG.cacheTime;
    const maxRetries = options.retries ?? API_CONFIG.retryCount;
    
    // Check cache for GET requests if not explicitly skipped
    if (method === 'GET' && !options.skipCache) {
      const cached = this.getCachedResponse<T>(cacheKey);
      if (cached) {
        // Track cache hit
        analyticsService.trackEvent(AnalyticsEventType.CUSTOM, {
          name: 'api_cache_hit',
          endpoint,
          cached_at: cached.timestamp
        });
        
        return {
          data: cached.data,
          status: 200,
          headers: new Headers(),
          cached: true
        };
      }
    }
    
    // Track API request
    const requestStartTime = Date.now();
    let retryCount = 0;
    
    while (true) {
      try {
        // Prepare headers
        const headers = await this.prepareHeaders(options);
        
        // Prepare request body
        let body: any = undefined;
        if (options.body) {
          body = options.body instanceof FormData
            ? options.body
            : JSON.stringify(options.body);
        }
        
        // Track request start
        analyticsService.trackEvent(AnalyticsEventType.CUSTOM, {
          name: 'api_request_start',
          endpoint,
          method,
          retry_count: retryCount
        });
        
        // Set up timeout
        const timeoutController = new AbortController();
        const timeoutId = setTimeout(
          () => timeoutController.abort(),
          API_CONFIG.timeout
        );
        
        // Make the request
        const response = await fetch(url, {
          method,
          headers,
          body,
          signal: timeoutController.signal
        });
        
        // Clear timeout
        clearTimeout(timeoutId);
        
        // Handle response
        const responseData = response.headers.get('Content-Type')?.includes('application/json')
          ? await response.json()
          : await response.text();
        
        // Calculate response time
        const responseTime = Date.now() - requestStartTime;
        
        // Track API response time
        analyticsService.trackEvent(AnalyticsEventType.API_RESPONSE_TIME, {
          endpoint,
          method,
          status: response.status,
          response_time_ms: responseTime,
          retry_count: retryCount
        });
        
        // Handle error responses
        if (!response.ok) {
          const errorMessage = 
            typeof responseData === 'string' 
              ? responseData 
              : responseData?.message || 'Unknown error';
          
          // Determine error type based on status code
          let errorType: ApiErrorType;
          switch (Math.floor(response.status / 100)) {
            case 4:
              if (response.status === 401 || response.status === 403) {
                errorType = ApiErrorType.AUTH;
              } else if (response.status === 404) {
                errorType = ApiErrorType.NOT_FOUND;
              } else if (response.status === 422) {
                errorType = ApiErrorType.VALIDATION;
              } else {
                errorType = ApiErrorType.UNKNOWN;
              }
              break;
            case 5:
              errorType = ApiErrorType.SERVER;
              break;
            default:
              errorType = ApiErrorType.UNKNOWN;
          }
          
          // Track API error
          analyticsService.trackEvent(AnalyticsEventType.NETWORK_ERROR, {
            endpoint,
            method,
            status: response.status,
            error_type: errorType,
            response_time_ms: responseTime,
            retry_count: retryCount
          });
          
          throw new ApiError(
            errorType,
            `API Error (${response.status}): ${errorMessage}`,
            response.status,
            typeof responseData === 'object' ? responseData?.message : undefined
          );
        }
        
        // Cache successful GET responses
        if (method === 'GET' && !options.skipCache) {
          this.cacheResponse(cacheKey, responseData, cacheTTL);
        }
        
        // Return successful response
        return {
          data: responseData as T,
          status: response.status,
          headers: response.headers,
          cached: false
        };
      } catch (error: any) {
        // Track API error
        analyticsService.trackEvent(AnalyticsEventType.NETWORK_ERROR, {
          endpoint,
          method,
          error_message: error.message,
          error_type: error.type || 'unknown',
          retry_count: retryCount
        });
        
        // Handle aborted requests (timeout)
        if (error.name === 'AbortError') {
          error = new ApiError(
            ApiErrorType.TIMEOUT,
            `Request timeout after ${API_CONFIG.timeout}ms`,
            undefined,
            undefined
          );
        }
        
        // Handle network errors
        if (error.message && error.message.includes('Network request failed')) {
          error = new ApiError(
            ApiErrorType.NETWORK,
            'Network connection failed',
            undefined,
            undefined
          );
        }
        
        // Retry on network errors or server errors if retries remaining
        if (
          retryCount < maxRetries &&
          (error.type === ApiErrorType.NETWORK || 
          error.type === ApiErrorType.SERVER || 
          error.type === ApiErrorType.TIMEOUT)
        ) {
          retryCount++;
          
          // Exponential backoff with jitter
          const delay = API_CONFIG.retryDelay * Math.pow(2, retryCount - 1) * (0.5 + Math.random() * 0.5);
          
          console.log(`Retrying request to ${endpoint} (${retryCount}/${maxRetries}) after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // Rethrow the error if no more retries
        throw error;
      }
    }
  }
  
  /**
   * Make a GET request
   */
  async get<T>(
    endpoint: string,
    queryParams?: Record<string, string | number | boolean>,
    options: Omit<ApiRequestOptions, 'method' | 'queryParams'> = {}
  ): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...options,
      method: 'GET',
      queryParams
    });
    
    return response.data;
  }
  
  /**
   * Make a POST request
   */
  async post<T>(
    endpoint: string,
    body?: any,
    options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
  ): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body
    });
    
    return response.data;
  }
  
  /**
   * Make a PUT request
   */
  async put<T>(
    endpoint: string,
    body?: any,
    options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
  ): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body
    });
    
    return response.data;
  }
  
  /**
   * Make a PATCH request
   */
  async patch<T>(
    endpoint: string,
    body?: any,
    options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
  ): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body
    });
    
    return response.data;
  }
  
  /**
   * Make a DELETE request
   */
  async delete<T>(
    endpoint: string,
    options: Omit<ApiRequestOptions, 'method'> = {}
  ): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...options,
      method: 'DELETE'
    });
    
    return response.data;
  }
  
  /**
   * Clear the entire response cache
   */
  clearCache(): void {
    this.cache.clear();
  }
  
  /**
   * Clear cache entries matching a particular endpoint pattern
   */
  clearCacheForEndpoint(endpointPattern: string | RegExp): void {
    const keysToRemove: string[] = [];
    
    this.cache.forEach((_, key) => {
      if (typeof endpointPattern === 'string') {
        if (key.includes(endpointPattern)) {
          keysToRemove.push(key);
        }
      } else {
        if (endpointPattern.test(key)) {
          keysToRemove.push(key);
        }
      }
    });
    
    keysToRemove.forEach(key => {
      this.cache.delete(key);
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();