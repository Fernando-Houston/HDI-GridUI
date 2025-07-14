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
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

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
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    
    checkMobile();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('orientationchange', resizeCanvas);
    };
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

  // Touch event handlers for mobile
  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch) => {
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 1) {
      // Single touch - start dragging
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - viewport.offsetX,
        y: touch.clientY - viewport.offsetY
      });
    } else if (e.touches.length === 2) {
      // Two fingers - prepare for pinch zoom
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      setLastTouchDistance(distance);
      setIsDragging(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 1 && isDragging) {
      // Single touch - pan
      const touch = e.touches[0];
      setViewport(prev => ({
        ...prev,
        offsetX: touch.clientX - dragStart.x,
        offsetY: touch.clientY - dragStart.y
      }));
    } else if (e.touches.length === 2) {
      // Two fingers - pinch zoom
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      
      if (lastTouchDistance > 0) {
        const scaleFactor = distance / lastTouchDistance;
        const newScale = Math.max(0.3, Math.min(3, viewport.scale * scaleFactor));
        
        // Get center point between fingers
        const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        
        // Adjust viewport to zoom towards finger center
        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const canvasCenterX = rect.width / 2;
          const canvasCenterY = rect.height / 2;
          
          const offsetAdjustX = (centerX - canvasCenterX) * (scaleFactor - 1) * 0.1;
          const offsetAdjustY = (centerY - canvasCenterY) * (scaleFactor - 1) * 0.1;
          
          setViewport(prev => ({
            ...prev,
            scale: newScale,
            offsetX: prev.offsetX - offsetAdjustX,
            offsetY: prev.offsetY - offsetAdjustY
          }));
        }
      }
      
      setLastTouchDistance(distance);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 0) {
      // All fingers lifted
      if (isDragging && e.changedTouches.length === 1) {
        // Check if this was a tap (minimal movement)
        const touch = e.changedTouches[0];
        const canvas = canvasRef.current;
        
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const touchX = touch.clientX - rect.left;
          const touchY = touch.clientY - rect.top;
          
          // Find tapped property
          const tappedProperty = properties.find(property => {
            const x = property.gridPosition.x * viewport.scale + viewport.offsetX;
            const y = property.gridPosition.y * viewport.scale + viewport.offsetY;
            const size = property.gridPosition.size * viewport.scale;
            
            return touchX >= x - size/2 && touchX <= x + size/2 &&
                   touchY >= y - size/2 && touchY <= y + size/2;
          });
          
          if (tappedProperty) {
            onPropertySelect(tappedProperty);
          }
        }
      }
      
      setIsDragging(false);
      setLastTouchDistance(0);
    } else if (e.touches.length === 1) {
      // One finger remaining - restart single touch
      setLastTouchDistance(0);
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
        onMouseDown={!isMobile ? handleMouseDown : undefined}
        onMouseMove={!isMobile ? handleMouseMove : undefined}
        onMouseUp={!isMobile ? handleMouseUp : undefined}
        onMouseLeave={!isMobile ? handleMouseUp : undefined}
        onClick={!isMobile ? handleClick : undefined}
        onTouchStart={isMobile ? handleTouchStart : undefined}
        onTouchMove={isMobile ? handleTouchMove : undefined}
        onTouchEnd={isMobile ? handleTouchEnd : undefined}
        style={{ 
          display: 'block',
          touchAction: 'none' // Prevent default touch behaviors
        }}
      />
      
      {/* Zoom controls overlay - hide on mobile since pinch-to-zoom works */}
      <div className={`absolute top-4 right-4 flex flex-col gap-2 ${isMobile ? 'hidden' : 'flex'}`}>
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

      {/* Mobile instructions */}
      {isMobile && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-hdi-bg-secondary/90 backdrop-blur-sm border border-hdi-accent-cyan/20 rounded-full px-4 py-2 text-hdi-text-secondary text-sm z-10 pointer-events-none">
          👆 Tap properties • 🤏 Pinch to zoom • ✋ Drag to pan
        </div>
      )}
      
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