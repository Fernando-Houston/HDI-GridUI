import type { Property, PropertySearchResult } from '../types/Property';
import { transformProperty } from '../utils/propertyTransformer';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://hdi-api-production.up.railway.app';
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false;

// Fallback to mock data if needed
import { mockProperties, mockSearchSuggestions } from '../data/mockProperties';

class ApiService {
  private baseUrl: string;
  private searchCache: Map<string, { data: PropertySearchResult; timestamp: number }>;
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/${API_VERSION}`;
    this.searchCache = new Map();
  }

  // Generic fetch wrapper with error handling
  private async fetchWithErrorHandling<T>(
    endpoint: string, 
    options?: RequestInit
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorMessage = `API Error: ${response.status} - ${response.statusText}`;
        console.error(`[API] ${endpoint} failed:`, errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`[API] ${endpoint} success:`, { 
        endpoint, 
        dataReceived: !!data,
        recordCount: Array.isArray(data) ? data.length : (data?.properties?.length || 1)
      });
      return data;
    } catch (error) {
      console.warn(`API request failed: ${endpoint}`, error);
      
      // Fallback to mock data if API fails
      if (USE_MOCK_DATA || this.shouldFallbackToMock(endpoint)) {
        return this.getMockData(endpoint) as T;
      }
      
      throw error;
    }
  }

  // Determine if we should fallback to mock data
  private shouldFallbackToMock(_endpoint: string): boolean {
    // API endpoint is now available - use real data
    return false;
  }

  // Get mock data based on endpoint
  private getMockData(endpoint: string): any {
    if (endpoint.includes('/search')) {
      return {
        results: mockProperties.slice(0, 5),
        suggestions: mockSearchSuggestions.slice(0, 8),
        total: mockProperties.length
      };
    }
    
    if (endpoint.includes('/nearby')) {
      return {
        properties: mockProperties,
        total: mockProperties.length
      };
    }

    // Single property lookup
    const addressMatch = endpoint.match(/\/properties\/(.+)/);
    if (addressMatch) {
      const address = decodeURIComponent(addressMatch[1]);
      const property = mockProperties.find(p => 
        p.address.toLowerCase().includes(address.toLowerCase())
      );
      return property || mockProperties[0];
    }

    return mockProperties;
  }

  // Clear expired cache entries
  private clearExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.searchCache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.searchCache.delete(key);
      }
    }
  }

  // Search properties with autocomplete
  async searchProperties(query: string, limit: number = 10): Promise<PropertySearchResult> {
    console.log('[API] Searching properties:', { query, limit });
    
    // Check cache first
    const cacheKey = `search:${query}:${limit}`;
    const cached = this.searchCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log('[API] Returning cached search results:', { query, results: cached.data.total });
      return cached.data;
    }
    
    try {
      // Use the actual search endpoint
      const searchEndpoint = `/properties/search`;
      const searchResponse = await this.fetchWithErrorHandling<any>(searchEndpoint, {
        method: 'POST',
        body: JSON.stringify({ address: query })
      });
      
      // The search endpoint now returns {success, properties, count}
      if (searchResponse && searchResponse.success) {
        const properties = (searchResponse.properties || []).map((prop: any) => transformProperty(prop));
        console.log('[API] Search response:', { 
          success: searchResponse.success,
          count: searchResponse.count,
          propertiesFound: properties.length,
          query 
        });

        // Generate suggestions from all found properties
        const suggestions = searchResponse.suggestions || properties.map((prop: any) => prop.address).slice(0, 10);

        const result = {
          properties: properties.slice(0, limit),
          suggestions: suggestions,
          total: searchResponse.count || properties.length
        };
        console.log('[API] Search result:', { found: result.total, query });
        
        // Cache the result
        this.searchCache.set(cacheKey, { data: result, timestamp: Date.now() });
        this.clearExpiredCache(); // Clean up old entries
        
        return result;
      }
      
      // If no properties found, return empty results but don't cache
      console.log('[API] No properties found for query:', query);
      return {
        properties: [],
        suggestions: [],
        total: 0
      };
    } catch (error) {
      console.error('[API] Search error:', error);
      // If search fails, return empty results with error context
      return {
        properties: [],
        suggestions: [],
        total: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      } as PropertySearchResult;
    }
  }

  // Get property details by address
  async getPropertyDetails(address: string): Promise<Property> {
    const endpoint = `/properties/${encodeURIComponent(address)}`;
    return this.fetchWithErrorHandling<Property>(endpoint);
  }

  // Get property by account number
  async getPropertyByAccount(accountNumber: string): Promise<Property> {
    const endpoint = `/properties/account/${accountNumber}`;
    return this.fetchWithErrorHandling<Property>(endpoint);
  }

  // Get nearby properties for grid display
  async getNearbyProperties(
    lat: number, 
    lng: number, 
    radius: number = 1,
    limit: number = 100
  ): Promise<PropertySearchResult> {
    const endpoint = `/properties/location?lat=${lat}&lon=${lng}&radius_miles=${radius}&limit=${limit}`;
    const response = await this.fetchWithErrorHandling<any>(endpoint);
    
    // Transform response to match PropertySearchResult format
    if (response && response.properties) {
      const properties = response.properties.map((prop: any) => transformProperty(prop));
      console.log('[API] Location search:', { 
        found: properties.length,
        total: response.count,
        location: `${lat},${lng}` 
      });
      
      return {
        properties,
        suggestions: [],
        total: response.count || properties.length
      };
    }
    
    return { properties: [], suggestions: [], total: 0 };
  }

  // Get market trends for area
  async getMarketTrends(area: string): Promise<any> {
    const endpoint = `/market/trends?area=${encodeURIComponent(area)}`;
    return this.fetchWithErrorHandling<any>(endpoint);
  }

  // Browse all properties with pagination
  async getAllProperties(
    page: number = 1,
    perPage: number = 1000,
    filters?: {
      city?: string;
      minValue?: number;
      maxValue?: number;
    }
  ): Promise<{
    properties: Property[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  }> {
    let endpoint = `/properties/all?page=${page}&per_page=${perPage}`;
    
    if (filters) {
      if (filters.city) endpoint += `&city=${encodeURIComponent(filters.city)}`;
      if (filters.minValue) endpoint += `&min_value=${filters.minValue}`;
      if (filters.maxValue) endpoint += `&max_value=${filters.maxValue}`;
    }
    
    return this.fetchWithErrorHandling(endpoint);
  }

  // Test API connection
  async testConnection(): Promise<{ status: 'connected' | 'disconnected', responseTime: number }> {
    const startTime = Date.now();
    
    try {
      await fetch(`${API_BASE_URL}/health`, { 
        method: 'GET',
        timeout: 5000 
      } as RequestInit);
      
      return {
        status: 'connected',
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        status: 'disconnected',
        responseTime: Date.now() - startTime
      };
    }
  }

  // Get API status for status bar
  async getApiStatus(): Promise<{
    connectionStatus: 'connected' | 'connecting' | 'disconnected';
    responseTime: number;
    propertiesLoaded: number;
  }> {
    try {
      const connection = await this.testConnection();
      const properties = USE_MOCK_DATA ? mockProperties : await this.getNearbyProperties(29.7604, -95.3698);
      
      return {
        connectionStatus: connection.status,
        responseTime: connection.responseTime,
        propertiesLoaded: Array.isArray(properties) ? properties.length : properties.total || 0
      };
    } catch (error) {
      return {
        connectionStatus: 'disconnected',
        responseTime: 0,
        propertiesLoaded: USE_MOCK_DATA ? mockProperties.length : 0
      };
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export individual methods for easier importing
export const {
  searchProperties,
  getPropertyDetails,
  getPropertyByAccount,
  getNearbyProperties,
  getMarketTrends,
  getAllProperties,
  testConnection,
  getApiStatus
} = apiService;