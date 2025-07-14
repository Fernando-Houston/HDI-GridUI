export interface Property {
  id: string;
  address: string;
  owner: string;
  latitude: number;
  longitude: number;
  propertyType: 'residential' | 'commercial' | 'land';
  
  // HCAD Data
  marketValue: number;
  landValue: number;
  squareFeet: number;
  yearBuilt: number;
  accountNumber: string;
  
  // AI Estimates (for $0 properties)
  estimatedValueRange: {
    min: number;
    max: number;
  };
  rentalEstimate: number;
  investmentScore: number;
  neighborhoodTrend: {
    trend: 'hot' | 'warming' | 'stable' | 'cooling';
    yoyChange: number;
  };
  
  // Grid positioning
  gridPosition: {
    x: number;
    y: number;
    size: number;
  };
}

export interface PropertySearchResult {
  properties: Property[];
  suggestions: string[];
  total: number;
}

export interface GridViewport {
  offsetX: number;
  offsetY: number;
  scale: number;
  centerLat: number;
  centerLng: number;
}