import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { Property } from '../../types/Property';

interface PropertyGridProps {
  properties: Property[];
  onPropertySelect: (property: Property) => void;
  selectedPropertyId?: string;
}

interface GridViewport {
  offsetX: number;
  offsetY: number;
  scale: number;
}

export const PropertyGrid: React.FC<PropertyGridProps> = ({
  properties,
  onPropertySelect,
  selectedPropertyId
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewport, setViewport] = useState<GridViewport>({
    offsetX: 0,
    offsetY: 0,
    scale: 1
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);

  // Canvas setup and resize handling
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    
    drawGrid();
  }, [viewport, properties, hoveredProperty, selectedPropertyId]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  // Draw grid and properties
  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Clear canvas
    ctx.fillStyle = '#0f0f1e';
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(42, 42, 62, 0.5)';
    ctx.lineWidth = 1;

    const gridSize = 50 * viewport.scale;
    const offsetX = viewport.offsetX % gridSize;
    const offsetY = viewport.offsetY % gridSize;

    // Vertical lines
    for (let x = offsetX; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = offsetY; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw properties
    properties.forEach(property => {
      const x = property.gridPosition.x * viewport.scale + viewport.offsetX;
      const y = property.gridPosition.y * viewport.scale + viewport.offsetY;
      const size = property.gridPosition.size * viewport.scale;

      // Skip if property is outside viewport
      if (x + size < 0 || x - size > width || y + size < 0 || y - size > height) {
        return;
      }

      // Set color based on property type
      let fillColor: string;
      switch (property.propertyType) {
        case 'residential':
          fillColor = 'rgba(0, 212, 255, 0.7)'; // Teal
          break;
        case 'commercial':
          fillColor = 'rgba(102, 126, 234, 0.7)'; // Blue
          break;
        case 'land':
          fillColor = 'rgba(0, 255, 136, 0.7)'; // Green
          break;
        default:
          fillColor = 'rgba(160, 160, 176, 0.7)'; // Gray
      }

      // Apply hover or selection effects
      if (hoveredProperty === property.id) {
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 15;
        fillColor = fillColor.replace('0.7', '0.9');
      } else if (selectedPropertyId === property.id) {
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 10;
        fillColor = fillColor.replace('0.7', '0.8');
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = fillColor;

      // Draw shape based on property type
      if (property.propertyType === 'commercial') {
        // Rectangle for commercial
        const rectWidth = size;
        const rectHeight = size * 0.67;
        ctx.fillRect(x - rectWidth/2, y - rectHeight/2, rectWidth, rectHeight);
      } else if (property.propertyType === 'land') {
        // Polygon for land (hexagon)
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const px = x + Math.cos(angle) * (size/2);
          const py = y + Math.sin(angle) * (size/2);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        // Square for residential
        ctx.fillRect(x - size/2, y - size/2, size, size);
      }

      // Add value label for larger properties
      if (size > 40) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = `${Math.max(10, size/6)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const valueText = property.marketValue > 0 
          ? `$${Math.round(property.marketValue / 1000)}K`
          : 'Est.';
        
        ctx.fillText(valueText, x, y);
      }

      // Reset shadow
      ctx.shadowBlur = 0;
    });
  }, [viewport, properties, hoveredProperty, selectedPropertyId]);

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - viewport.offsetX,
      y: e.clientY - viewport.offsetY
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDragging) {
      setViewport(prev => ({
        ...prev,
        offsetX: e.clientX - dragStart.x,
        offsetY: e.clientY - dragStart.y
      }));
    } else {
      // Check for property hover
      const hoveredProp = properties.find(property => {
        const x = property.gridPosition.x * viewport.scale + viewport.offsetX;
        const y = property.gridPosition.y * viewport.scale + viewport.offsetY;
        const size = property.gridPosition.size * viewport.scale;
        
        return mouseX >= x - size/2 && mouseX <= x + size/2 &&
               mouseY >= y - size/2 && mouseY <= y + size/2;
      });

      setHoveredProperty(hoveredProp?.id || null);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Find clicked property
    const clickedProperty = properties.find(property => {
      const x = property.gridPosition.x * viewport.scale + viewport.offsetX;
      const y = property.gridPosition.y * viewport.scale + viewport.offsetY;
      const size = property.gridPosition.size * viewport.scale;
      
      return mouseX >= x - size/2 && mouseX <= x + size/2 &&
             mouseY >= y - size/2 && mouseY <= y + size/2;
    });

    if (clickedProperty) {
      onPropertySelect(clickedProperty);
    }
  };

  // Zoom controls
  const zoomIn = () => {
    setViewport(prev => ({ ...prev, scale: Math.min(prev.scale * 1.2, 3) }));
  };

  const zoomOut = () => {
    setViewport(prev => ({ ...prev, scale: Math.max(prev.scale / 1.2, 0.3) }));
  };

  const resetView = () => {
    setViewport({ offsetX: 0, offsetY: 0, scale: 1 });
  };

  // Zoom controls are handled internally

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        style={{ display: 'block' }}
      />
      
      {/* Zoom controls overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={zoomIn}
          className="w-10 h-10 bg-hdi-bg-secondary/90 border border-hdi-accent-cyan/30 rounded-lg text-hdi-accent-cyan hover:bg-hdi-accent-cyan/20 transition-all duration-200 flex items-center justify-center backdrop-blur-sm"
        >
          +
        </button>
        <button
          onClick={zoomOut}
          className="w-10 h-10 bg-hdi-bg-secondary/90 border border-hdi-accent-cyan/30 rounded-lg text-hdi-accent-cyan hover:bg-hdi-accent-cyan/20 transition-all duration-200 flex items-center justify-center backdrop-blur-sm"
        >
          −
        </button>
        <button
          onClick={resetView}
          className="w-10 h-10 bg-hdi-bg-secondary/90 border border-hdi-accent-cyan/30 rounded-lg text-hdi-accent-cyan hover:bg-hdi-accent-cyan/20 transition-all duration-200 flex items-center justify-center backdrop-blur-sm text-xs"
        >
          🏠
        </button>
      </div>
      
      {/* Property hover tooltip */}
      {hoveredProperty && (
        <div className="absolute top-4 left-4 bg-hdi-bg-secondary/95 backdrop-blur-sm border border-hdi-accent-cyan/30 rounded-lg p-3 text-sm pointer-events-none">
          {(() => {
            const prop = properties.find(p => p.id === hoveredProperty);
            return prop ? (
              <div>
                <div className="font-semibold text-hdi-text-primary">{prop.address}</div>
                <div className="text-hdi-text-secondary">${prop.marketValue.toLocaleString()}</div>
                <div className="text-hdi-accent-teal capitalize">{prop.propertyType}</div>
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
};