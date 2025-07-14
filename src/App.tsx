import { useState, useCallback } from 'react';
import { PropertyGrid } from './components/PropertyGrid/PropertyGrid';
import { SearchBar } from './components/SearchBar/SearchBar';
import { PropertyPanel } from './components/PropertyPanel/PropertyPanel';
import { StatusBar } from './components/StatusBar/StatusBar';
import { LeadsFolder } from './components/LeadsFolder/LeadsFolder';
import { mockProperties, mockSearchSuggestions } from './data/mockProperties';
import type { Property } from './types/Property';

interface Lead extends Property {
  addedDate: Date;
  status: 'interested' | 'contacted' | 'scheduled' | 'closed';
  notes?: string;
}

function App() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isLeadsFolderOpen, setIsLeadsFolderOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel] = useState(1.0);

  // Handle property selection from grid
  const handlePropertySelect = useCallback((property: Property) => {
    setSelectedProperty(property);
    setIsPanelOpen(true);
  }, []);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // In real app, this would trigger API call
    console.log('Searching for:', query);
  }, []);

  // Handle search suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: string) => {
    setSearchQuery(suggestion);
    
    // Find matching property and focus on it
    const matchingProperty = mockProperties.find(prop => 
      prop.address.toLowerCase().includes(suggestion.toLowerCase())
    );
    
    if (matchingProperty) {
      handlePropertySelect(matchingProperty);
    }
  }, [handlePropertySelect]);

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
    setSelectedProperty(lead);
    setIsPanelOpen(true);
    setIsLeadsFolderOpen(false);
  }, []);

  // Close property panel
  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    setSelectedProperty(null);
  }, []);

  // Toggle leads folder
  const handleToggleLeadsFolder = useCallback(() => {
    setIsLeadsFolderOpen(prev => !prev);
  }, []);

  return (
    <div className="relative w-full h-screen bg-hdi-bg-primary overflow-hidden font-hdi">
      {/* Search Bar */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-30 w-full max-w-2xl px-6">
        <SearchBar
          onSearch={handleSearch}
          suggestions={mockSearchSuggestions}
          onSuggestionSelect={handleSuggestionSelect}
          placeholder="Search Houston properties..."
        />
      </div>

      {/* Main Grid Canvas */}
      <div className="absolute inset-0">
        <PropertyGrid
          properties={mockProperties}
          onPropertySelect={handlePropertySelect}
          selectedPropertyId={selectedProperty?.id}
        />
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
        propertiesCount={mockProperties.length}
        zoomLevel={zoomLevel}
        responseTime={Math.floor(Math.random() * 50) + 5} // Mock response time
        connectionStatus="connected"
      />

      {/* Grid overlay for debugging (remove in production) */}
      <div className="absolute top-20 left-4 z-40 bg-black/50 text-white p-2 rounded text-xs font-mono">
        <div>Properties: {mockProperties.length}</div>
        <div>Selected: {selectedProperty?.address || 'None'}</div>
        <div>Leads: {leads.length}</div>
        <div>Search: {searchQuery || 'None'}</div>
      </div>
    </div>
  );
}

export default App;