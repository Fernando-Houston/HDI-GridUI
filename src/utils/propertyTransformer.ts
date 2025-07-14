import type { Property } from '../types/Property';

/**
 * Transforms raw property data from API into consistent Property format
 * Now mostly a safety net since backend provides all fields
 * Ensures all required fields have default values as fallback
 */
export function transformProperty(rawProp: any, index?: number): Property {
  const marketValue = rawProp.marketValue || rawProp.market_value || rawProp.official_data?.market_value || 0;
  
  return {
    // Core identification
    id: rawProp.id || rawProp.account_number || `property-${index || Date.now()}`,
    
    // Address and location
    address: rawProp.address || rawProp.property_address || 'Unknown Address',
    latitude: rawProp.latitude || rawProp.lat || 29.7604,
    longitude: rawProp.longitude || rawProp.lon || -95.3698,
    
    // Property details - handle both camelCase and snake_case
    propertyType: rawProp.propertyType || rawProp.property_type || 'residential',
    marketValue: rawProp.marketValue || rawProp.market_value || rawProp.appraised_value || 0,
    landValue: rawProp.landValue || rawProp.land_value || 0,
    squareFeet: rawProp.squareFeet || rawProp.square_feet || rawProp.building_sqft || rawProp.living_sqft || 0,
    yearBuilt: rawProp.yearBuilt || rawProp.year_built || 0,
    
    // Ownership
    owner: rawProp.owner || rawProp.owner_name || 'Unknown',
    accountNumber: rawProp.accountNumber || rawProp.account_number || '',
    
    // Analysis fields - backend now provides these, but keep fallbacks
    estimatedValueRange: rawProp.estimatedValueRange || 
      (marketValue > 0 ? { 
        min: Math.round(marketValue * 0.9), 
        max: Math.round(marketValue * 1.1) 
      } : null),
    
    rentalEstimate: rawProp.rentalEstimate?.monthly || rawProp.rentalEstimate || 
      (marketValue > 0 ? Math.round(marketValue * 0.007) : 0), // 0.7% monthly as per backend
    
    investmentScore: rawProp.investmentScore?.score || rawProp.investmentScore || 
      Math.floor(50 + (marketValue > 200000 ? 20 : 0) + ((rawProp.squareFeet || 0) > 2000 ? 10 : 0)),
    
    neighborhoodTrend: rawProp.neighborhoodTrend || {
      trend: rawProp.neighborhoodTrend?.direction === 'up' ? 'warming' : 
             rawProp.neighborhoodTrend?.direction === 'down' ? 'cooling' : 'stable',
      yoyChange: rawProp.neighborhoodTrend?.percentage || (marketValue > 300000 ? 4.5 : 3.2)
    },
    
    // Grid visualization
    gridPosition: rawProp.gridPosition || {
      x: 200 + Math.random() * 600,
      y: 150 + Math.random() * 400,
      size: 40 + Math.min(30, marketValue / 10000) // Size based on value
    },
    
    // Preserve any additional fields
    ...rawProp
  };
}

/**
 * Transforms an array of raw properties
 */
export function transformProperties(rawProperties: any[]): Property[] {
  return rawProperties.map((prop, index) => transformProperty(prop, index));
}