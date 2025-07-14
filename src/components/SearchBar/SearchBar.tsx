import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Property } from '../../types/Property';

interface SearchBarProps {
  onSearch: (query: string) => void;
  suggestions: string[];
  onSuggestionSelect: (suggestion: string) => void;
  placeholder?: string;
  searchResults?: Property[];
  onPropertySelect?: (property: Property) => void;
  isSearching?: boolean;
  searchError?: Error | null;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  suggestions: _suggestions,
  onSuggestionSelect: _onSuggestionSelect,
  placeholder = "Search Houston properties...",
  searchResults = [],
  onPropertySelect,
  isSearching = false,
  searchError = null
}) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Show search results if available, otherwise show suggestions
  const hasResults = searchResults.length > 0;
  const showResults = hasResults && query.length >= 3;

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    setShowSuggestions(value.length >= 2);
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    if (value.length >= 3) {
      setIsDebouncing(true);
      debounceTimerRef.current = setTimeout(() => {
        onSearch(value);
        setIsDebouncing(false);
      }, 300); // 300ms debounce delay
    } else {
      setIsDebouncing(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = showResults ? searchResults.length : 0;
    if (!showSuggestions || totalItems === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < totalItems - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : totalItems - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && showResults) {
          handlePropertyClick(searchResults[selectedIndex]);
        } else if (query.trim()) {
          onSearch(query);
          setShowSuggestions(false);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle suggestion click - removed as we're using property results instead

  // Handle property click
  const handlePropertyClick = (property: Property) => {
    setQuery('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
    if (onPropertySelect) {
      onPropertySelect(property);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full px-4 sm:px-6 py-3 sm:py-4 pr-12 sm:pr-14 bg-hdi-bg-secondary/90 border border-hdi-accent-cyan/30 rounded-full text-hdi-text-primary placeholder-hdi-text-secondary text-base sm:text-lg font-medium backdrop-blur-sm focus:outline-none focus:border-hdi-accent-cyan focus:shadow-lg focus:shadow-hdi-accent-cyan/20 transition-all duration-300"
        />
        
        {/* Search Icon */}
        <div className="absolute right-3 sm:right-5 top-1/2 transform -translate-y-1/2">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-hdi-accent-cyan to-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200">
            <span className="text-white text-sm sm:text-lg">⚡</span>
          </div>
        </div>
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {showSuggestions && (showResults || searchError) && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-2 bg-hdi-bg-secondary/95 backdrop-blur-lg border border-hdi-accent-cyan/20 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-96"
          >
            {searchError ? (
              <div className="p-6 text-center">
                <div className="text-red-400 text-lg mb-2">⚠️ Search Error</div>
                <div className="text-hdi-text-secondary text-sm">
                  Unable to search properties. Please try again.
                </div>
              </div>
            ) : (
            <div className="py-2 overflow-y-auto max-h-80">
              {searchResults.slice(0, 10).map((property, index) => (
                <motion.div
                  key={property.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handlePropertyClick(property)}
                  className={`px-6 py-4 cursor-pointer transition-all duration-200 border-b border-hdi-accent-cyan/10 last:border-b-0 ${
                    index === selectedIndex
                      ? 'bg-hdi-accent-cyan/20'
                      : 'hover:bg-hdi-accent-cyan/10'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-hdi-text-primary">
                        {property.address}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-hdi-text-secondary">
                        <span className="text-hdi-accent-teal font-medium">
                          ${(property.marketValue || 0).toLocaleString()}
                        </span>
                        <span className="capitalize">
                          {property.propertyType || 'residential'}
                        </span>
                        {property.squareFeet && (
                          <span>{property.squareFeet.toLocaleString()} sqft</span>
                        )}
                      </div>
                      {property.owner && (
                        <div className="text-xs text-hdi-text-secondary mt-1">
                          Owner: {property.owner}
                        </div>
                      )}
                    </div>
                    <div className="ml-4 text-xs text-hdi-accent-cyan">
                      →
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            )}
            
            {/* Footer */}
            <div className="px-6 py-2 border-t border-hdi-accent-cyan/10 bg-hdi-bg-secondary/50">
              <div className="text-xs text-hdi-text-secondary flex items-center justify-between">
                <span>↑↓ Navigate • Enter Select • Esc Close</span>
                <span className="text-hdi-accent-teal">{searchResults.length} results found</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading indicator */}
      {query.length >= 3 && (isDebouncing || isSearching) && (
        <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
          <div className="w-5 h-5 border-2 border-hdi-accent-cyan/30 border-t-hdi-accent-cyan rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};