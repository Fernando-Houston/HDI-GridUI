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
    // All Houston deals from your spreadsheet
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
      addedDate: new Date('2025-01-01'),
      status: 'interested',
      notes: 'HCAD $450,000'
    },
    {
      id: 'deal-2',
      address: '5423 San Juan, Houston TX 77020',
      owner: 'MT CORINTH MISSIONARY',
      latitude: 29.7420,
      longitude: -95.3188,
      propertyType: 'residential',
      marketValue: 0,
      landValue: 0,
      squareFeet: 4000,
      yearBuilt: 0,
      accountNumber: '',
      estimatedValueRange: { min: 0, max: 0 },
      rentalEstimate: 0,
      investmentScore: 60,
      neighborhoodTrend: { trend: 'stable', yoyChange: 3.1 },
      gridPosition: { x: 450, y: 350, size: 50 },
      addedDate: new Date('2025-01-01'),
      status: 'interested',
      notes: '$0.0'
    },
    {
      id: 'deal-3',
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
      gridPosition: { x: 460, y: 360, size: 52 },
      addedDate: new Date('2025-01-01'),
      status: 'interested',
      notes: '$137,000'
    },
    {
      id: 'deal-4',
      address: '5423 San Juan, Houston TX 77020',
      owner: 'WANDA ALMA',
      latitude: 29.7420,
      longitude: -95.3188,
      propertyType: 'residential',
      marketValue: 150000,
      landValue: 26200,
      squareFeet: 7440,
      yearBuilt: 0,
      accountNumber: '',
      estimatedValueRange: { min: 145000, max: 165000 },
      rentalEstimate: 0,
      investmentScore: 71,
      neighborhoodTrend: { trend: 'stable', yoyChange: 3.5 },
      gridPosition: { x: 470, y: 370, size: 54 },
      addedDate: new Date('2025-01-01'),
      status: 'interested',
      notes: '$150,000'
    },
    {
      id: 'deal-5',
      address: 'Houston TX 77020',
      owner: 'JACKSON REUBEN L JR',
      latitude: 29.7420,
      longitude: -95.3188,
      propertyType: 'residential',
      marketValue: 150000,
      landValue: 37300,
      squareFeet: 4024,
      yearBuilt: 0,
      accountNumber: '',
      estimatedValueRange: { min: 145000, max: 165000 },
      rentalEstimate: 0,
      investmentScore: 70,
      neighborhoodTrend: { trend: 'stable', yoyChange: 3.2 },
      gridPosition: { x: 480, y: 380, size: 54 },
      addedDate: new Date('2025-02-01'),
      status: 'interested',
      notes: '$150,000'
    },
    {
      id: 'deal-6',
      address: 'Arapahoe St, Houston TX',
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
      addedDate: new Date('2025-11-01'),
      status: 'interested',
      notes: '$240,000'
    },
    {
      id: 'deal-7',
      address: 'Arapahoe St, Houston TX 77020',
      owner: 'NASIZADEH BEHZAD',
      latitude: 29.7380,
      longitude: -95.3220,
      propertyType: 'residential',
      marketValue: 100000,
      landValue: 25000,
      squareFeet: 4000,
      yearBuilt: 0,
      accountNumber: '',
      estimatedValueRange: { min: 95000, max: 110000 },
      rentalEstimate: 0,
      investmentScore: 68,
      neighborhoodTrend: { trend: 'stable', yoyChange: 4.1 },
      gridPosition: { x: 530, y: 430, size: 48 },
      addedDate: new Date('2025-04-01'),
      status: 'interested',
      notes: '$100,000'
    },
    {
      id: 'deal-8',
      address: 'Houston TX 77041',
      owner: 'GHOLAM MAHIN',
      latitude: 29.8640,
      longitude: -95.5800,
      propertyType: 'residential',
      marketValue: 123000,
      landValue: 29500,
      squareFeet: 4166,
      yearBuilt: 0,
      accountNumber: '',
      estimatedValueRange: { min: 120000, max: 135000 },
      rentalEstimate: 0,
      investmentScore: 69,
      neighborhoodTrend: { trend: 'stable', yoyChange: 3.8 },
      gridPosition: { x: 350, y: 450, size: 52 },
      addedDate: new Date('2025-06-01'),
      status: 'interested',
      notes: '$123,000'
    },
    {
      id: 'deal-9',
      address: '5216 Sonora, Houston TX 77020',
      owner: 'GARCIA ABEL',
      latitude: 29.7380,
      longitude: -95.3220,
      propertyType: 'residential',
      marketValue: 135000,
      landValue: 27000,
      squareFeet: 5000,
      yearBuilt: 0,
      accountNumber: '',
      estimatedValueRange: { min: 130000, max: 145000 },
      rentalEstimate: 0,
      investmentScore: 70,
      neighborhoodTrend: { trend: 'stable', yoyChange: 4.2 },
      gridPosition: { x: 540, y: 440, size: 53 },
      addedDate: new Date('2025-06-01'),
      status: 'interested',
      notes: '$135,000'
    },
    {
      id: 'deal-10',
      address: 'Houston TX 77020',
      owner: 'TEXAS RE INVESTMENTS LLC',
      latitude: 29.7420,
      longitude: -95.3188,
      propertyType: 'residential',
      marketValue: 103000,
      landValue: 24700,
      squareFeet: 4167,
      yearBuilt: 0,
      accountNumber: '',
      estimatedValueRange: { min: 100000, max: 115000 },
      rentalEstimate: 0,
      investmentScore: 67,
      neighborhoodTrend: { trend: 'stable', yoyChange: 3.5 },
      gridPosition: { x: 420, y: 460, size: 49 },
      addedDate: new Date('2025-01-01'),
      status: 'interested',
      notes: '$103,000'
    },
    {
      id: 'deal-11',
      address: 'Houston TX 77020',
      owner: 'THOMAS CRAIG A',
      latitude: 29.7420,
      longitude: -95.3188,
      propertyType: 'residential',
      marketValue: 99000,
      landValue: 26500,
      squareFeet: 3733,
      yearBuilt: 0,
      accountNumber: '',
      estimatedValueRange: { min: 95000, max: 110000 },
      rentalEstimate: 0,
      investmentScore: 66,
      neighborhoodTrend: { trend: 'stable', yoyChange: 3.3 },
      gridPosition: { x: 430, y: 470, size: 48 },
      addedDate: new Date('2025-01-01'),
      status: 'interested',
      notes: '$99,000'
    },
    {
      id: 'deal-12',
      address: 'Houston TX 77020',
      owner: 'BALTHAZAN ANN M ET AL',
      latitude: 29.7420,
      longitude: -95.3188,
      propertyType: 'residential',
      marketValue: 180000,
      landValue: 38000,
      squareFeet: 5000,
      yearBuilt: 0,
      accountNumber: '',
      estimatedValueRange: { min: 175000, max: 195000 },
      rentalEstimate: 0,
      investmentScore: 74,
      neighborhoodTrend: { trend: 'warming', yoyChange: 4.5 },
      gridPosition: { x: 440, y: 480, size: 58 },
      addedDate: new Date('2025-04-01'),
      status: 'interested',
      notes: '$180,000'
    },
    {
      id: 'deal-13',
      address: 'Houston TX 77020',
      owner: 'AUDRAY MCMILLAN',
      latitude: 29.7420,
      longitude: -95.3188,
      propertyType: 'residential',
      marketValue: 99000,
      landValue: 26500,
      squareFeet: 3733,
      yearBuilt: 0,
      accountNumber: '',
      estimatedValueRange: { min: 95000, max: 110000 },
      rentalEstimate: 0,
      investmentScore: 66,
      neighborhoodTrend: { trend: 'stable', yoyChange: 3.3 },
      gridPosition: { x: 460, y: 490, size: 48 },
      addedDate: new Date('2025-01-01'),
      status: 'interested',
      notes: '$99,000'
    },
    {
      id: 'deal-14',
      address: '5219 Arapahoe St, Houston TX',
      owner: 'CARRILLO ROMERO JR & HECTOR',
      latitude: 29.7380,
      longitude: -95.3220,
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
      addedDate: new Date('2025-05-01'),
      status: 'interested',
      notes: '$164,000'
    },
    {
      id: 'deal-15',
      address: '5203 Arapahoe, Houston TX',
      owner: 'REO PROJECT LLC',
      latitude: 29.7380,
      longitude: -95.3220,
      propertyType: 'residential',
      marketValue: 113000,
      landValue: 22600,
      squareFeet: 5000,
      yearBuilt: 0,
      accountNumber: '',
      estimatedValueRange: { min: 110000, max: 125000 },
      rentalEstimate: 0,
      investmentScore: 68,
      neighborhoodTrend: { trend: 'stable', yoyChange: 3.7 },
      gridPosition: { x: 510, y: 410, size: 50 },
      addedDate: new Date('2025-01-01'),
      status: 'interested',
      notes: '$113,000'
    },
    {
      id: 'deal-16',
      address: '4733 Simdon St, Houston TX',
      owner: 'AMBASSADOR BUILDING GROUP LLC',
      latitude: 29.7450,
      longitude: -95.3180,
      propertyType: 'residential',
      marketValue: 113000,
      landValue: 22600,
      squareFeet: 5000,
      yearBuilt: 0,
      accountNumber: '',
      estimatedValueRange: { min: 110000, max: 125000 },
      rentalEstimate: 0,
      investmentScore: 68,
      neighborhoodTrend: { trend: 'stable', yoyChange: 3.7 },
      gridPosition: { x: 490, y: 390, size: 50 },
      addedDate: new Date('2025-11-01'),
      status: 'interested',
      notes: '$113,000'
    },
    {
      id: 'deal-17',
      address: 'Houston TX',
      owner: 'CURRENT OWNER',
      latitude: 29.7604,
      longitude: -95.3698,
      propertyType: 'residential',
      marketValue: 160000,
      landValue: 33200,
      squareFeet: 5000,
      yearBuilt: 0,
      accountNumber: '',
      estimatedValueRange: { min: 155000, max: 170000 },
      rentalEstimate: 0,
      investmentScore: 71,
      neighborhoodTrend: { trend: 'stable', yoyChange: 4.0 },
      gridPosition: { x: 380, y: 320, size: 55 },
      addedDate: new Date('2025-08-01'),
      status: 'interested',
      notes: '$160,000'
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