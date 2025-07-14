import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Property } from '../../types/Property';

interface SearchResultsProps {
  results: Property[];
  isOpen: boolean;
  onSelectProperty: (property: Property) => void;
  onClose: () => void;
  searchQuery: string;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  isOpen,
  onSelectProperty,
  onClose,
  searchQuery
}) => {
  if (!isOpen || results.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute top-16 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4 sm:px-6 z-40"
      >
        <div className="bg-hdi-bg-secondary/95 backdrop-blur-xl border border-hdi-accent-cyan/20 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-hdi-accent-cyan/20 to-hdi-accent-teal/20 border-b border-hdi-accent-cyan/20 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-hdi-text-primary">
                Search Results for "{searchQuery}"
              </h3>
              <button
                onClick={onClose}
                className="text-hdi-text-secondary hover:text-hdi-text-primary transition-colors"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-hdi-text-secondary mt-1">
              {results.length} properties found
            </p>
          </div>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto">
            {results.map((property, index) => (
              <motion.div
                key={property.id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelectProperty(property)}
                className="p-4 border-b border-hdi-accent-cyan/10 hover:bg-hdi-accent-cyan/10 cursor-pointer transition-all duration-200 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-hdi-text-primary group-hover:text-hdi-accent-cyan transition-colors">
                      {property.address}
                    </h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-hdi-text-secondary">
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
                      <p className="text-xs text-hdi-text-secondary mt-1">
                        Owner: {property.owner}
                      </p>
                    )}
                  </div>
                  <div className="ml-4">
                    <span className="text-xs text-hdi-accent-cyan group-hover:opacity-100 opacity-0 transition-opacity">
                      Click to view →
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-3 bg-hdi-bg-primary/30 text-center">
            <p className="text-xs text-hdi-text-secondary">
              Click any property to view details and add to leads
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};