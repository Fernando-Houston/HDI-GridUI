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
    try {
      // Use the actual search endpoint
      const searchEndpoint = `/properties/search`;
      const searchResponse = await this.fetchWithErrorHandling<any>(searchEndpoint, {
        method: 'POST',
        body: JSON.stringify({ address: query })
      });
      
      // The search endpoint returns a single property or analysis
      if (searchResponse) {
        const properties = [];
        
        // If we got a property with an address, add it to results
        if (searchResponse.address || searchResponse.property_address) {
          const prop = {
            ...searchResponse,
            id: searchResponse.id || searchResponse.account_number || `property-${Date.now()}`,
            address: searchResponse.address || searchResponse.property_address || query,
            marketValue: searchResponse.market_value || searchResponse.marketValue || searchResponse.official_data?.market_value || 0,
            propertyType: searchResponse.property_type || searchResponse.propertyType || 'residential',
            latitude: searchResponse.latitude || searchResponse.lat || 29.7604,
            longitude: searchResponse.longitude || searchResponse.lon || -95.3698,
            landValue: searchResponse.land_value || searchResponse.landValue || 0,
            squareFeet: searchResponse.square_feet || searchResponse.squareFeet || 0,
            yearBuilt: searchResponse.year_built || searchResponse.yearBuilt || 0,
            owner: searchResponse.owner || searchResponse.owner_name || 'Unknown',
            accountNumber: searchResponse.account_number || searchResponse.accountNumber || '',
            gridPosition: {
              x: 200 + Math.random() * 600,
              y: 150 + Math.random() * 400,
              size: 40 + Math.random() * 30
            }
          };
          properties.push(prop);
        }
        
        // Also try the browse all endpoint with the search query
        try {
          const browseEndpoint = `/properties/all?page=1&per_page=20&search=${encodeURIComponent(query)}`;
          const browseResponse = await this.fetchWithErrorHandling<any>(browseEndpoint);
          
          if (browseResponse && browseResponse.properties) {
            const additionalProperties = browseResponse.properties.map((prop: any, index: number) => ({
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
              gridPosition: {
                x: 200 + Math.random() * 600,
                y: 150 + Math.random() * 400,
                size: 40 + Math.random() * 30
              }
            }));
            properties.push(...additionalProperties);
          }
        } catch (browseError) {
          console.log('Browse endpoint not available yet');
        }

        // Generate suggestions from all found properties
        const suggestions = properties.map((prop: any) => prop.address).slice(0, 10);

        return {
          properties: properties.slice(0, limit),
          suggestions: suggestions,
          total: properties.length
        };
      }
      
      // If no properties found, return empty results
      return {
        properties: [],
        suggestions: [],
        total: 0
      };
    } catch (error) {
      console.error('Search error:', error);
      // If search fails, return empty results
      return {
        properties: [],
        suggestions: [],
        total: 0
      };
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
  getPropertyByAccount,
  getNearbyProperties,
  getMarketTrends,
  getAllProperties,
  testConnection,
  getApiStatus
} = apiService;