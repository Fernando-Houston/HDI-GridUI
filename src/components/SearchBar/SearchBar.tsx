import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  onSearch: (query: string) => void;
  suggestions: string[];
  onSuggestionSelect: (suggestion: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  suggestions,
  onSuggestionSelect,
  placeholder = "Search Houston properties..."
}) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on query
  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    setShowSuggestions(value.length >= 2);
    
    if (value.length >= 3) {
      onSearch(value);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(filteredSuggestions[selectedIndex]);
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

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onSuggestionSelect(suggestion);
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

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-2 bg-hdi-bg-secondary/95 backdrop-blur-lg border border-hdi-accent-cyan/20 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="py-2">
              {filteredSuggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`px-6 py-3 cursor-pointer transition-all duration-200 ${
                    index === selectedIndex
                      ? 'bg-hdi-accent-cyan/20 text-hdi-accent-cyan'
                      : 'text-hdi-text-primary hover:bg-hdi-accent-cyan/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-hdi-accent-teal rounded-full flex-shrink-0"></div>
                    <span className="font-medium">{suggestion}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Footer */}
            <div className="px-6 py-2 border-t border-hdi-accent-cyan/10 bg-hdi-bg-secondary/50">
              <div className="text-xs text-hdi-text-secondary flex items-center justify-between">
                <span>↑↓ Navigate • Enter Select • Esc Close</span>
                <span className="text-hdi-accent-teal">AI Enhanced</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading indicator */}
      {query.length >= 3 && (
        <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
          <div className="w-5 h-5 border-2 border-hdi-accent-cyan/30 border-t-hdi-accent-cyan rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};