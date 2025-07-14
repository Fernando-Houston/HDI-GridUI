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
  const [showWelcome, setShowWelcome] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isLeadsFolderOpen, setIsLeadsFolderOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
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
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-30 w-full max-w-2xl px-6">
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
      <div className="absolute top-20 left-4 z-40 bg-black/50 text-white p-2 rounded text-xs font-mono">
        <div>Properties: {totalProperties}</div>
        <div>Selected: {selectedProperty?.address || 'None'}</div>
        <div>Leads: {leads.length}</div>
        <div>Search: {searchQuery || 'None'}</div>
        <div>API: {apiStatus.connectionStatus}</div>
        <div>Loading: {isLoadingNearby ? 'Yes' : 'No'}</div>
      </div>
    </motion.div>
  );
}

export default App;