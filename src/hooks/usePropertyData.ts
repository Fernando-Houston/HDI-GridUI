import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { Property } from '../types/Property';

// Hook for property search with debouncing
export const usePropertySearch = (query: string, enabled: boolean = true) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return useQuery({
    queryKey: ['propertySearch', debouncedQuery],
    queryFn: () => apiService.searchProperties(debouncedQuery),
    enabled: enabled && debouncedQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for getting property details
export const usePropertyDetails = (address: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['propertyDetails', address],
    queryFn: () => apiService.getPropertyDetails(address),
    enabled: enabled && !!address,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook for nearby properties (grid data)
export const useNearbyProperties = (
  lat: number, 
  lng: number, 
  radius: number = 1,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['nearbyProperties', lat, lng, radius],
    queryFn: () => apiService.getNearbyProperties(lat, lng, radius),
    enabled: enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
};

// Hook for API status monitoring
export const useApiStatus = () => {
  const [status, setStatus] = useState<{
    connectionStatus: 'connected' | 'connecting' | 'disconnected';
    responseTime: number;
    propertiesLoaded: number;
  }>({
    connectionStatus: 'connecting',
    responseTime: 0,
    propertiesLoaded: 0
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const apiStatus = await apiService.getApiStatus();
        setStatus(apiStatus);
      } catch (error) {
        setStatus({
          connectionStatus: 'disconnected',
          responseTime: 0,
          propertiesLoaded: 0
        });
      }
    };

    // Check immediately
    checkStatus();

    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  return status;
};

// Hook for managing property state with API integration
export const usePropertyManager = () => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [gridCenter, setGridCenter] = useState({ lat: 29.7604, lng: -95.3698 }); // Houston center

  // Get nearby properties for the current grid view
  const { 
    data: nearbyData, 
    isLoading: isLoadingNearby,
    error: nearbyError,
    refetch: refetchNearby
  } = useNearbyProperties(gridCenter.lat, gridCenter.lng);

  // Get details for selected property
  const { 
    data: selectedPropertyDetails,
    isLoading: isLoadingDetails,
    error: detailsError
  } = usePropertyDetails(
    selectedProperty?.address || '', 
    !!selectedProperty?.address
  );

  const properties = nearbyData?.properties || [];
  const totalProperties = nearbyData?.total || 0;

  // Update grid center and refetch properties
  const updateGridCenter = (lat: number, lng: number) => {
    setGridCenter({ lat, lng });
  };

  // Select a property and get its details
  const selectProperty = (property: Property) => {
    setSelectedProperty(property);
  };

  // Clear selected property
  const clearSelection = () => {
    setSelectedProperty(null);
  };

  return {
    // Properties data
    properties,
    totalProperties,
    selectedProperty: selectedPropertyDetails || selectedProperty,
    
    // Loading states
    isLoadingNearby,
    isLoadingDetails,
    
    // Error states
    nearbyError,
    detailsError,
    
    // Actions
    selectProperty,
    clearSelection,
    updateGridCenter,
    refetchNearby,
    
    // Grid state
    gridCenter
  };
};