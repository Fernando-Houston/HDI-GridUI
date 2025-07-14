# Backend Coordination - HDI Property API Issues

## Summary
The frontend is experiencing issues with missing fields and data inconsistencies when fetching property data from the API. This document outlines the problems and required changes for the backend API.

## Critical Issues Found

### 1. Missing Required Fields in Property Responses
The frontend expects certain fields that are sometimes missing from API responses, causing TypeErrors:

**Missing Fields:**
- `neighborhoodTrend` (object with `trend` and `yoyChange`)
- `estimatedValueRange` (object with `min` and `max`)
- `rentalEstimate` (number)
- `investmentScore` (number)
- `gridPosition` (object with `x`, `y`, `size`)

**Error Example:**
```
TypeError: undefined is not an object (evaluating 'i.neighborhoodTrend.trend')
```

### 2. Search Endpoint Limitations
The `/properties/search` endpoint has the following issues:
- Returns only a single property instead of an array of matching properties
- Doesn't perform fuzzy/partial matching on addresses
- No pagination support for search results
- Missing full-text search capabilities across 1.7M properties

### 3. Data Format Inconsistencies
Properties are returned with inconsistent field names:
- Sometimes `market_value`, sometimes `marketValue`
- Sometimes `property_address`, sometimes `address`
- Sometimes `square_feet`, sometimes `squareFeet`

## Required Backend Changes

### 1. Standardize Property Response Format
All property endpoints should return properties in this consistent format:

```json
{
  "id": "string",
  "address": "string",
  "latitude": "number",
  "longitude": "number",
  "propertyType": "string (residential|commercial|land)",
  "marketValue": "number",
  "landValue": "number",
  "squareFeet": "number",
  "yearBuilt": "number",
  "owner": "string",
  "accountNumber": "string",
  "estimatedValueRange": {
    "min": "number",
    "max": "number"
  },
  "rentalEstimate": "number",
  "investmentScore": "number",
  "neighborhoodTrend": {
    "trend": "string (hot|warming|stable|cooling)",
    "yoyChange": "number"
  }
}
```

### 2. Enhance Search Endpoint
**Endpoint:** `POST /api/v1/properties/search`

**Request:**
```json
{
  "query": "string",     // Search query
  "limit": "number",     // Max results (default: 10)
  "offset": "number"     // For pagination (default: 0)
}
```

**Response:**
```json
{
  "properties": [...],   // Array of property objects
  "suggestions": [...],  // Array of suggested addresses
  "total": "number",     // Total matching properties
  "page": "number",
  "per_page": "number"
}
```

**Requirements:**
- Implement PostgreSQL full-text search with GIN/GiST indexes
- Support partial matching (e.g., "4726 PROVIDENCE" should find "4726 PROVIDENCE ST HOUSTON TX")
- Return multiple matching properties, not just one
- Add relevance scoring to sort results

### 3. Add Default Values for AI-Derived Fields
For fields that require AI analysis but aren't available yet, provide reasonable defaults:

```python
def get_property_with_defaults(property_data):
    # Calculate defaults based on available data
    market_value = property_data.get('market_value', 0)
    
    return {
        **property_data,
        'estimatedValueRange': property_data.get('estimatedValueRange') or {
            'min': int(market_value * 0.9),
            'max': int(market_value * 1.1)
        },
        'rentalEstimate': property_data.get('rentalEstimate') or int(market_value * 0.005),
        'investmentScore': property_data.get('investmentScore') or calculate_score(property_data),
        'neighborhoodTrend': property_data.get('neighborhoodTrend') or {
            'trend': 'stable',
            'yoyChange': 3.5
        }
    }
```

### 4. Fix CORS Headers
Ensure all endpoints include proper CORS headers:
```python
headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}
```

### 5. Improve Error Handling
Return consistent error responses:
```json
{
  "error": "string",
  "message": "string",
  "code": "string",
  "details": {}
}
```

## Search Implementation Recommendations

### PostgreSQL Full-Text Search Setup
```sql
-- Add search vector column
ALTER TABLE properties ADD COLUMN search_vector tsvector;

-- Create index
CREATE INDEX properties_search_idx ON properties USING GIN(search_vector);

-- Update search vectors
UPDATE properties SET search_vector = 
  to_tsvector('english', 
    COALESCE(address, '') || ' ' || 
    COALESCE(owner_name, '') || ' ' || 
    COALESCE(city, '')
  );

-- Search query
SELECT * FROM properties 
WHERE search_vector @@ plainto_tsquery('english', $1)
ORDER BY ts_rank(search_vector, plainto_tsquery('english', $1)) DESC
LIMIT $2 OFFSET $3;
```

### Alternative: Trigram Search
```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create index
CREATE INDEX properties_address_trgm_idx ON properties USING GIN (address gin_trgm_ops);

-- Search query
SELECT * FROM properties 
WHERE address ILIKE '%' || $1 || '%'
ORDER BY similarity(address, $1) DESC
LIMIT $2 OFFSET $3;
```

## Testing Requirements
1. Test search with partial addresses
2. Verify all properties have required fields
3. Test pagination with large result sets
4. Verify CORS works from Vercel deployment
5. Test error cases and ensure proper error messages

## Timeline
These changes are critical for the frontend to function properly. The search functionality is completely broken without these fixes, preventing users from finding properties in the 1.7M database.

## Questions for Backend Team
1. What's the current database schema for properties?
2. Are there indexes on the address field?
3. What's the current search implementation?
4. Can we add the missing AI fields or should we compute defaults?
5. What's causing the 500 errors on `/properties/all`?

## Frontend Temporary Solution
We've implemented a property transformer to handle missing fields, but this is a bandaid solution. The API should return complete, consistent data to ensure reliability and performance.