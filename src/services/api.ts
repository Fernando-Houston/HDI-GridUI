import type { Property, PropertySearchResult } from '../types/Property';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://hdi-api-production.up.railway.app';
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false;

// Fallback to mock data if needed
import { mockProperties, mockSearchSuggestions } from '../data/mockProperties';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/${API_VERSION}`;
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
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
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

  // Search properties with autocomplete
  async searchProperties(query: string, limit: number = 10): Promise<PropertySearchResult> {
    // Try to search using the location endpoint with a text query
    // Since the search endpoint returns analysis data, we'll use location search instead
    try {
      // First, try to get properties from nearby endpoint centered on Houston
      const nearbyEndpoint = `/properties/location?lat=29.7604&lon=-95.3698&radius_miles=10&limit=500`;
      const nearbyResponse = await this.fetchWithErrorHandling<any>(nearbyEndpoint);
      
      if (nearbyResponse && nearbyResponse.properties) {
        // Filter properties by address matching the query
        const filteredProperties = nearbyResponse.properties.filter((prop: any) => {
          const address = prop.address || prop.property_address || '';
          return address.toLowerCase().includes(query.toLowerCase());
        }).slice(0, limit);

        // Map properties to ensure they have the right structure
        const mappedProperties = filteredProperties.map((prop: any, index: number) => ({
          ...prop,
          id: prop.id || prop.account_number || `property-${index}`,
          address: prop.address || prop.property_address || 'Unknown Address',
          marketValue: prop.market_value || prop.marketValue || 0,
          propertyType: prop.property_type || prop.propertyType || 'residential',
          latitude: prop.latitude || prop.lat || 29.7604,
          longitude: prop.longitude || prop.lon || -95.3698,
          landValue: prop.land_value || prop.landValue || 0,
          squareFeet: prop.square_feet || prop.squareFeet || 0,
          yearBuilt: prop.year_built || prop.yearBuilt || 0,
          owner: prop.owner || prop.owner_name || 'Unknown',
          accountNumber: prop.account_number || prop.accountNumber || '',
          // Generate a random grid position for search results
          gridPosition: {
            x: 200 + Math.random() * 600,
            y: 150 + Math.random() * 400,
            size: 40 + Math.random() * 30
          }
        }));

        // Generate suggestions from the filtered properties
        const suggestions = mappedProperties.map((prop: any) => prop.address).slice(0, 8);

        return {
          properties: mappedProperties,
          suggestions: suggestions,
          total: mappedProperties.length
        };
      }
      
      // If no properties found, return empty results
      return {
        properties: [],
        suggestions: [],
        total: 0
      };
    } catch (error) {
      // If search fails, fall back to mock data
      return this.getMockData('/search');
    }
  }

  // Get property details by address
  async getPropertyDetails(address: string): Promise<Property> {
    const endpoint = `/properties/${encodeURIComponent(address)}`;
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
    return this.fetchWithErrorHandling<PropertySearchResult>(endpoint);
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
  getNearbyProperties,
  getMarketTrends,
  getAllProperties,
  testConnection,
  getApiStatus
} = apiService;