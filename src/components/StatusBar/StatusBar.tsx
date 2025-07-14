import React from 'react';
import { motion } from 'framer-motion';

interface StatusBarProps {
  propertiesCount: number;
  zoomLevel: number;
  responseTime?: number;
  connectionStatus?: 'connected' | 'connecting' | 'disconnected';
}

export const StatusBar: React.FC<StatusBarProps> = ({
  propertiesCount,
  zoomLevel,
  responseTime = 0,
  connectionStatus = 'connected'
}) => {
  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-hdi-accent-teal';
      case 'connecting': return 'text-yellow-400';
      case 'disconnected': return 'text-red-400';
      default: return 'text-hdi-text-secondary';
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected': return '🟢';
      case 'connecting': return '🟡';
      case 'disconnected': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="fixed bottom-0 left-0 right-0 bg-hdi-bg-secondary/95 backdrop-blur-sm border-t border-hdi-accent-cyan/20 px-6 py-3 z-30"
    >
      <div className="flex items-center justify-between text-sm">
        {/* Left side - Property stats */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-hdi-text-secondary">Properties Loaded:</span>
            <span className="text-hdi-accent-cyan font-semibold">
              {propertiesCount.toLocaleString()}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-hdi-text-secondary">Zoom Level:</span>
            <span className="text-hdi-accent-cyan font-semibold">
              {zoomLevel.toFixed(1)}x
            </span>
          </div>
        </div>

        {/* Center - Performance metrics */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-hdi-text-secondary">Response Time:</span>
            <span className={`font-semibold ${responseTime < 100 ? 'text-hdi-accent-teal' : responseTime < 500 ? 'text-yellow-400' : 'text-red-400'}`}>
              {responseTime}ms
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-hdi-text-secondary">API Status:</span>
            <span className={`font-semibold ${getConnectionColor()}`}>
              {getConnectionIcon()} {connectionStatus}
            </span>
          </div>
        </div>

        {/* Right side - System info */}
        <div className="flex items-center gap-6">
          <div className="text-hdi-text-secondary text-xs">
            HDI Property Intelligence v1.0
          </div>
          
          <div className="flex items-center gap-1 text-xs text-hdi-text-secondary">
            <span>🏠</span>
            <span>Houston Data Intelligence</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};