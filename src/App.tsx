import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PropertyGrid } from './components/PropertyGrid/PropertyGrid';
import { SearchBar } from './components/SearchBar/SearchBar';
import { PropertyPanel } from './components/PropertyPanel/PropertyPanel';
import { StatusBar } from './components/StatusBar/StatusBar';
import { LeadsFolder } from './components/LeadsFolder/LeadsFolder';
import { WelcomeScreen } from './components/WelcomeScreen/WelcomeScreen';
import { usePropertyManager, usePropertySearch, useApiStatus } from './hooks/usePropertyData';
import type { Property } from './types/Property';

interface Lead extends Property {
  addedDate: Date;
  status: 'interested' | 'contacted' | 'scheduled' | 'closed';
  notes?: string;
}

function App() {
  const [showWelcome, setShowWelcome] = useState(false); // Skip welcome when leads are pre-loaded
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isLeadsFolderOpen, setIsLeadsFolderOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([
    // Pre-populated Houston deals from your spreadsheet
    {
      id: 'deal-1',
      address: '4603 Market St, Houston TX 77020',
      owner: 'DAVIS & DAVIS LP',
      latitude: 29.772487,
      longitude: -95.324041,
      propertyType: 'residential',
      marketValue: 450000,
      landValue: 26000,
      squareFeet: 18000,
      yearBuilt: 0,
      accountNumber: '0402570000043',
      estimatedValueRange: { min: 440000, max: 480000 },
      rentalEstimate: 0,
      investmentScore: 75,
      neighborhoodTrend: { trend: 'warming', yoyChange: 5.2 },
      gridPosition: { x: 400, y: 300, size: 65 },
      addedDate: new Date(),
      status: 'interested',
      notes: 'HCAD Value: $450,000'
    },
    {
      id: 'deal-2',
      address: '5133 San Juan St, Houston TX 77020',
      owner: 'JOLIET DELORIS',
      latitude: 29.7420,
      longitude: -95.3188,
      propertyType: 'residential',
      marketValue: 137000,
      landValue: 34300,
      squareFeet: 4000,
      yearBuilt: 0,
      accountNumber: '',
      estimatedValueRange: { min: 130000, max: 150000 },
      rentalEstimate: 0,
      investmentScore: 70,
      neighborhoodTrend: { trend: 'stable', yoyChange: 3.1 },
      gridPosition: { x: 450, y: 350, size: 50 },
      addedDate: new Date(),
      status: 'interested',
      notes: 'Price: $137,000'
    },
    {
      id: 'deal-3',
      address: '5203 Garnet St, Houston TX',
      owner: 'CARRILLO ROMERO JR & HECTOR',
      latitude: 29.7400,
      longitude: -95.3200,
      propertyType: 'residential',
      marketValue: 164000,
      landValue: 32800,
      squareFeet: 5000,
      yearBuilt: 0,
      accountNumber: '',
      estimatedValueRange: { min: 160000, max: 175000 },
      rentalEstimate: 0,
      investmentScore: 72,
      neighborhoodTrend: { trend: 'warming', yoyChange: 4.5 },
      gridPosition: { x: 500, y: 400, size: 55 },
      addedDate: new Date(),
      status: 'interested',
      notes: 'Price: $164,000'
    },
    {
      id: 'deal-4',
      address: '5216 Arapahoe St, Houston TX',
      owner: 'LEVINE LOUIS JR',
      latitude: 29.7380,
      longitude: -95.3220,
      propertyType: 'residential',
      marketValue: 240000,
      landValue: 28900,
      squareFeet: 8300,
      yearBuilt: 0,
      accountNumber: '',
      estimatedValueRange: { min: 235000, max: 255000 },
      rentalEstimate: 0,
      investmentScore: 78,
      neighborhoodTrend: { trend: 'warming', yoyChange: 6.2 },
      gridPosition: { x: 520, y: 420, size: 60 },
      addedDate: new Date(),
      status: 'interested',
      notes: 'Price: $240,000'
    },
    {
      id: 'deal-5',
      address: '4742 Providence St, Houston TX',
      owner: 'JONES SHIRLEY A',
      latitude: 29.7450,
      longitude: -95.3180,
      propertyType: 'residential',
      marketValue: 175000,
      landValue: 28700,
      squareFeet: 8100,
      yearBuilt: 0,
      accountNumber: '',
      estimatedValueRange: { min: 170000, max: 185000 },
      rentalEstimate: 0,
      investmentScore: 74,
      neighborhoodTrend: { trend: 'stable', yoyChange: 3.8 },
      gridPosition: { x: 480, y: 380, size: 58 },
      addedDate: new Date(),
      status: 'interested',
      notes: 'Price: $175,000'
    }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel] = useState(1.0);

  // Use API hooks
  const {
    properties,
    totalProperties,
    selectedProperty,
    isLoadingNearby,
    selectProperty,
    clearSelection
  } = usePropertyManager();

  const { data: searchData } = usePropertySearch(
    searchQuery, 
    searchQuery.length >= 2
  );

  const apiStatus = useApiStatus();

  // Handle property selection from grid
  const handlePropertySelect = useCallback((property: Property) => {
    selectProperty(property);
    setIsPanelOpen(true);
  }, [selectProperty]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Handle search suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: string) => {
    setSearchQuery(suggestion);
    
    // Find matching property from search results or current properties
    const searchResults = searchData?.properties || [];
    const allProperties = [...searchResults, ...properties];
    
    const matchingProperty = allProperties.find(prop => 
      prop.address.toLowerCase().includes(suggestion.toLowerCase())
    );
    
    if (matchingProperty) {
      handlePropertySelect(matchingProperty);
    }
  }, [searchData, properties, handlePropertySelect]);

  // Handle adding property to leads
  const handleAddToLeads = useCallback((property: Property) => {
    const existingLead = leads.find(lead => lead.id === property.id);
    
    if (!existingLead) {
      const newLead: Lead = {
        ...property,
        addedDate: new Date(),
        status: 'interested',
        notes: ''
      };
      
      setLeads(prev => [...prev, newLead]);
      
      // Show success feedback (in real app, this might be a toast notification)
      console.log('Added to leads:', property.address);
    }
  }, [leads]);

  // Handle removing lead
  const handleRemoveLead = useCallback((leadId: string) => {
    setLeads(prev => prev.filter(lead => lead.id !== leadId));
  }, []);

  // Handle lead click (opens property panel)
  const handleLeadClick = useCallback((lead: Lead) => {
    selectProperty(lead);
    setIsPanelOpen(true);
    setIsLeadsFolderOpen(false);
  }, [selectProperty]);

  // Close property panel
  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    clearSelection();
  }, [clearSelection]);

  // Toggle leads folder
  const handleToggleLeadsFolder = useCallback(() => {
    setIsLeadsFolderOpen(prev => !prev);
  }, []);

  // Handle welcome screen completion
  const handleWelcomeComplete = useCallback(() => {
    setShowWelcome(false);
  }, []);

  // Show welcome screen first
  if (showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full h-screen bg-hdi-bg-primary overflow-hidden font-hdi"
    >
      {/* Search Bar */}
      <div className="absolute top-4 sm:top-6 left-1/2 transform -translate-x-1/2 z-30 w-full max-w-2xl px-4 sm:px-6">
        <SearchBar
          onSearch={handleSearch}
          suggestions={searchData?.suggestions || []}
          onSuggestionSelect={handleSuggestionSelect}
          placeholder="Search Houston properties..."
        />
      </div>

      {/* Main Grid Canvas */}
      <div className="absolute inset-0">
        {isLoadingNearby ? (
          <div className="w-full h-full flex items-center justify-center bg-hdi-bg-primary">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-hdi-accent-cyan/30 border-t-hdi-accent-cyan rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-hdi-text-primary text-lg font-medium">Loading Houston Properties...</div>
              <div className="text-hdi-text-secondary text-sm">Connecting to Railway API</div>
            </div>
          </div>
        ) : (
          <PropertyGrid
            properties={properties}
            onPropertySelect={handlePropertySelect}
            selectedPropertyId={selectedProperty?.id}
          />
        )}
      </div>

      {/* Property Details Panel */}
      <PropertyPanel
        property={selectedProperty}
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        onAddToLeads={handleAddToLeads}
      />

      {/* Leads Folder */}
      <LeadsFolder
        isOpen={isLeadsFolderOpen}
        onToggle={handleToggleLeadsFolder}
        leads={leads}
        onLeadClick={handleLeadClick}
        onRemoveLead={handleRemoveLead}
      />

      {/* Status Bar */}
      <StatusBar
        propertiesCount={totalProperties}
        zoomLevel={zoomLevel}
        responseTime={apiStatus.responseTime}
        connectionStatus={apiStatus.connectionStatus}
      />

      {/* Grid overlay for debugging (remove in production) */}
      <div className="absolute top-16 sm:top-20 left-2 sm:left-4 z-40 bg-black/50 text-white p-1 sm:p-2 rounded text-xs font-mono max-w-48 sm:max-w-none">
        <div>Properties: {totalProperties}</div>
        <div className="truncate">Selected: {selectedProperty?.address?.split(',')[0] || 'None'}</div>
        <div>Leads: {leads.length}</div>
        <div className="truncate">Search: {searchQuery || 'None'}</div>
        <div>API: {apiStatus.connectionStatus}</div>
        <div>Loading: {isLoadingNearby ? 'Yes' : 'No'}</div>
      </div>
    </motion.div>
  );
}

export default App;