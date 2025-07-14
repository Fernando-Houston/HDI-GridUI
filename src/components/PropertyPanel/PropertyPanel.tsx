import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Property } from '../../types/Property';

interface PropertyPanelProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToLeads?: (property: Property) => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  property,
  isOpen,
  onClose,
  onAddToLeads
}) => {
  if (!property) return null;

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'hot': return 'text-red-400';
      case 'warming': return 'text-orange-400';
      case 'stable': return 'text-blue-400';
      case 'cooling': return 'text-gray-400';
      default: return 'text-hdi-text-secondary';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'hot': return '🔥';
      case 'warming': return '📈';
      case 'stable': return '📊';
      case 'cooling': return '📉';
      default: return '📊';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-hdi-bg-secondary/95 backdrop-blur-xl border-l border-hdi-accent-cyan/20 shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-hdi-bg-secondary/90 backdrop-blur-sm border-b border-hdi-accent-cyan/10 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-hdi-text-primary mb-1">
                    {property.address}
                  </h2>
                  <p className="text-hdi-text-secondary text-sm">
                    Owner: {property.owner}
                  </p>
                  <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-hdi-accent-cyan/20 text-hdi-accent-cyan">
                    {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}
                  </div>
                </div>
                
                <button
                  onClick={onClose}
                  className="text-hdi-text-secondary hover:text-hdi-text-primary text-2xl transition-colors duration-200"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Official HCAD Data */}
              <section>
                <h3 className="text-lg font-semibold text-hdi-text-primary mb-4 flex items-center gap-2">
                  🏢 Official Data (HCAD)
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-hdi-bg-primary/50 border border-hdi-accent-cyan/10 rounded-xl p-4"
                  >
                    <div className="text-hdi-text-secondary text-xs font-medium mb-1">Market Value</div>
                    <div className="text-hdi-text-primary text-xl font-bold">
                      {formatCurrency(property.marketValue)}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-hdi-bg-primary/50 border border-hdi-accent-cyan/10 rounded-xl p-4"
                  >
                    <div className="text-hdi-text-secondary text-xs font-medium mb-1">Land Value</div>
                    <div className="text-hdi-text-primary text-xl font-bold">
                      {formatCurrency(property.landValue)}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-hdi-bg-primary/50 border border-hdi-accent-cyan/10 rounded-xl p-4"
                  >
                    <div className="text-hdi-text-secondary text-xs font-medium mb-1">Square Feet</div>
                    <div className="text-hdi-text-primary text-xl font-bold">
                      {property.squareFeet.toLocaleString()}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-hdi-bg-primary/50 border border-hdi-accent-cyan/10 rounded-xl p-4"
                  >
                    <div className="text-hdi-text-secondary text-xs font-medium mb-1">Year Built</div>
                    <div className="text-hdi-text-primary text-xl font-bold">
                      {property.yearBuilt || 'N/A'}
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 bg-hdi-bg-primary/30 border border-hdi-accent-cyan/10 rounded-xl p-4"
                >
                  <div className="text-hdi-text-secondary text-xs font-medium mb-1">Account Number</div>
                  <div className="text-hdi-text-primary font-mono text-sm">
                    {property.accountNumber}
                  </div>
                </motion.div>
              </section>

              {/* AI Market Intelligence */}
              <section>
                <h3 className="text-lg font-semibold text-hdi-text-primary mb-4 flex items-center gap-2">
                  🤖 Market Intelligence (AI)
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gradient-to-br from-hdi-accent-cyan/10 to-hdi-accent-teal/10 border border-hdi-accent-cyan/20 rounded-xl p-4"
                  >
                    <div className="text-hdi-text-secondary text-xs font-medium mb-1">Estimated Value</div>
                    <div className="text-hdi-accent-cyan text-lg font-bold">
                      {property.estimatedValueRange 
                        ? `${formatCurrency(property.estimatedValueRange.min)}-${formatCurrency(property.estimatedValueRange.max)}`
                        : 'N/A'
                      }
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-gradient-to-br from-hdi-accent-teal/10 to-green-500/10 border border-hdi-accent-teal/20 rounded-xl p-4"
                  >
                    <div className="text-hdi-text-secondary text-xs font-medium mb-1">Rental Estimate</div>
                    <div className="text-hdi-accent-teal text-lg font-bold">
                      {property.rentalEstimate > 0 ? `${formatCurrency(property.rentalEstimate)}/mo` : 'N/A'}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-xl p-4"
                  >
                    <div className="text-hdi-text-secondary text-xs font-medium mb-1">Investment Score</div>
                    <div className="text-purple-400 text-lg font-bold flex items-center gap-2">
                      {property.investmentScore}/100
                      <div className="w-12 h-2 bg-hdi-bg-primary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                          style={{ width: `${property.investmentScore}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-400/20 rounded-xl p-4"
                  >
                    <div className="text-hdi-text-secondary text-xs font-medium mb-1">Neighborhood Trend</div>
                    <div className={`text-lg font-bold flex items-center gap-1 ${getTrendColor(property.neighborhoodTrend.trend)}`}>
                      <span>{getTrendIcon(property.neighborhoodTrend.trend)}</span>
                      <span className="capitalize">{property.neighborhoodTrend.trend}</span>
                      <span className="text-sm">+{property.neighborhoodTrend.yoyChange}%</span>
                    </div>
                  </motion.div>
                </div>
              </section>

              {/* Action Buttons */}
              <section className="space-y-3">
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                  onClick={() => onAddToLeads?.(property)}
                  className="w-full bg-gradient-to-r from-hdi-accent-cyan to-hdi-accent-teal text-white font-semibold py-3 px-6 rounded-xl hover:scale-105 transition-transform duration-200 shadow-lg"
                >
                  📁 Add to Leads
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  className="w-full bg-hdi-bg-primary/50 border border-hdi-accent-cyan/30 text-hdi-accent-cyan font-semibold py-3 px-6 rounded-xl hover:bg-hdi-accent-cyan/10 transition-colors duration-200"
                >
                  📊 Generate Report
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="w-full bg-hdi-bg-primary/50 border border-hdi-accent-cyan/30 text-hdi-accent-cyan font-semibold py-3 px-6 rounded-xl hover:bg-hdi-accent-cyan/10 transition-colors duration-200"
                >
                  🗺️ View on Map
                </motion.button>
              </section>

              {/* Data Source Footer */}
              <div className="text-xs text-hdi-text-secondary text-center py-4 border-t border-hdi-accent-cyan/10">
                Data from HCAD • AI estimates from Perplexity • Updated in real-time
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};