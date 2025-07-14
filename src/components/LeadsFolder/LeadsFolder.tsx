import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Property } from '../../types/Property';

interface Lead extends Property {
  addedDate: Date;
  status: 'interested' | 'contacted' | 'scheduled' | 'closed';
  notes?: string;
}

interface LeadsFolderProps {
  isOpen: boolean;
  onToggle: () => void;
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onRemoveLead: (leadId: string) => void;
}

export const LeadsFolder: React.FC<LeadsFolderProps> = ({
  isOpen,
  onToggle,
  leads,
  onLeadClick,
  onRemoveLead
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredLeads = selectedStatus === 'all' 
    ? leads 
    : leads.filter(lead => lead.status === selectedStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'interested': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'contacted': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'scheduled': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'closed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-hdi-text-secondary/20 text-hdi-text-secondary border-hdi-text-secondary/30';
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed right-6 top-1/2 transform -translate-y-1/2 translate-y-32 w-12 h-12 bg-hdi-bg-secondary/90 border border-hdi-accent-cyan/30 rounded-xl text-hdi-accent-cyan hover:bg-hdi-accent-cyan/20 transition-all duration-200 flex items-center justify-center backdrop-blur-sm z-40"
      >
        📁
      </button>

      {/* Leads Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggle}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-45"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-20 top-24 bottom-24 w-80 bg-hdi-bg-secondary/95 backdrop-blur-xl border border-hdi-accent-cyan/20 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-hdi-accent-cyan/20 to-hdi-accent-teal/20 border-b border-hdi-accent-cyan/20 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-hdi-text-primary flex items-center gap-2">
                    📁 Current Leads
                  </h3>
                  <span className="text-hdi-accent-cyan text-sm font-medium bg-hdi-accent-cyan/20 px-2 py-1 rounded-full">
                    {leads.length}
                  </span>
                </div>

                {/* Status Filter */}
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {['all', 'interested', 'contacted', 'scheduled', 'closed'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition-all duration-200 ${
                        selectedStatus === status
                          ? 'bg-hdi-accent-cyan text-white'
                          : 'bg-hdi-bg-primary/50 text-hdi-text-secondary hover:bg-hdi-accent-cyan/20'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Leads List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                <AnimatePresence>
                  {filteredLeads.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-hdi-text-secondary py-8"
                    >
                      <div className="text-4xl mb-2">📂</div>
                      <div className="text-sm">No leads found</div>
                      <div className="text-xs">Add properties to start building your lead list</div>
                    </motion.div>
                  ) : (
                    filteredLeads.map((lead, index) => (
                      <motion.div
                        key={lead.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => onLeadClick(lead)}
                        className="bg-hdi-bg-primary/50 border border-hdi-accent-cyan/10 rounded-xl p-3 cursor-pointer hover:bg-hdi-accent-cyan/10 hover:border-hdi-accent-cyan/30 transition-all duration-200 group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-hdi-text-primary text-sm truncate mb-1">
                              {lead.address.split(',')[0]}
                            </div>
                            
                            <div className="text-xs text-hdi-text-secondary mb-2">
                              {formatCurrency(lead.marketValue)} • {lead.address.split(',')[1]?.trim()}
                            </div>

                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(lead.status)}`}>
                                {lead.status}
                              </span>
                              <span className="text-xs text-hdi-text-secondary">
                                {lead.addedDate.toLocaleDateString()}
                              </span>
                            </div>

                            {lead.notes && (
                              <div className="text-xs text-hdi-text-secondary bg-hdi-bg-primary/30 rounded px-2 py-1 mt-1">
                                {lead.notes}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveLead(lead.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs ml-2 transition-opacity duration-200"
                          >
                            ✕
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              {leads.length > 0 && (
                <div className="border-t border-hdi-accent-cyan/20 p-3 bg-hdi-bg-primary/30">
                  <div className="flex gap-2">
                    <button className="flex-1 bg-hdi-accent-cyan/20 hover:bg-hdi-accent-cyan/30 text-hdi-accent-cyan text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200">
                      Export All
                    </button>
                    <button className="flex-1 bg-hdi-accent-teal/20 hover:bg-hdi-accent-teal/30 text-hdi-accent-teal text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200">
                      Generate Report
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};