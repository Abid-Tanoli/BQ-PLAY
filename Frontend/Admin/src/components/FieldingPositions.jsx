import React, { useState } from 'react';

/**
 * Interactive Cricket Fielding Positions Diagram
 * Click on a fielding zone to select where the ball was fielded/caught
 */
export default function FieldingPositions({ onSelectField, selectedZone, disabled = false, showLabels = true }) {
  const [hoveredZone, setHoveredZone] = useState(null);

  // Fielding zones with positions and commentary keywords
  const fieldingZones = {
    // Off side (right-handed batsman)
    off_cover: { name: 'Cover', x: 65, y: 35, region: 'off', keywords: ['cover', 'driven', 'pushed'] },
    off_midoff: { name: 'Mid-off', x: 55, y: 20, region: 'off', keywords: ['mid-off', 'straight', 'back'] },
    off_extra_cover: { name: 'Extra Cover', x: 75, y: 30, region: 'off', keywords: ['extra cover', 'wide of cover'] },
    off_midwicket: { name: 'Mid-wicket', x: 45, y: 55, region: 'on', keywords: ['mid-wicket', 'pulled'] },
    off_mid_on: { name: 'Mid-on', x: 45, y: 20, region: 'on', keywords: ['mid-on', 'straight'] },
    off_square_leg: { name: 'Square Leg', x: 30, y: 55, region: 'on', keywords: ['square leg', 'glanced'] },
    off_backward_point: { name: 'Backward Point', x: 70, y: 45, region: 'off', keywords: ['backward point', 'cut'] },
    off_point: { name: 'Point', x: 80, y: 40, region: 'off', keywords: ['point', 'cut', 'slashed'] },
    off_gully: { name: 'Gully', x: 85, y: 35, region: 'off', keywords: ['gully', 'edge', 'cut'] },
    off_slip: { name: 'Slip', x: 90, y: 30, region: 'off', keywords: ['slip', 'edge', 'outside'] },
    off_third_man: { name: 'Third Man', x: 85, y: 15, region: 'off', keywords: ['third man', 'late cut'] },
    off_fine_leg: { name: 'Fine Leg', x: 80, y: 10, region: 'on', keywords: ['fine leg', 'glanced', 'whipped'] },
    
    // On side (right-handed batsman)
    on_cover: { name: 'Cover', x: 35, y: 35, region: 'on', keywords: ['cover', 'driven'] },
    on_midwicket: { name: 'Mid-wicket', x: 55, y: 55, region: 'on', keywords: ['mid-wicket', 'flicked'] },
    on_square_leg: { name: 'Square Leg', x: 70, y: 55, region: 'on', keywords: ['square leg', 'pulled'] },
    on_backward_square: { name: 'Backward Square', x: 65, y: 65, region: 'on', keywords: ['backward square', 'hooked'] },
    on_deep_backward: { name: 'Deep Backward', x: 60, y: 80, region: 'on', keywords: ['deep', 'hook', 'pull'] },
    on_deep_midwicket: { name: 'Deep Mid-wicket', x: 40, y: 75, region: 'on', keywords: ['deep mid-wicket', 'slog'] },
    on_deep_square: { name: 'Deep Square Leg', x: 75, y: 75, region: 'on', keywords: ['deep square', 'pull'] },
    off_deep_cover: { name: 'Deep Cover', x: 50, y: 75, region: 'off', keywords: ['deep cover', 'lofted'] },
    off_long_off: { name: 'Long-off', x: 50, y: 85, region: 'off', keywords: ['long-off', 'straight hit'] },
    on_long_on: { name: 'Long-on', x: 50, y: 85, region: 'on', keywords: ['long-on', 'straight hit'] },
    off_deep_point: { name: 'Deep Point', x: 85, y: 50, region: 'off', keywords: ['deep point', 'cut'] },
    on_deep_finleg: { name: 'Deep Fine Leg', x: 85, y: 20, region: 'on', keywords: ['deep fine leg', 'glance'] },
  };

  const handleClick = (zoneId, zone) => {
    if (disabled) return;
    if (onSelectField) {
      onSelectField({
        zone: zoneId,
        name: zone.name,
        region: zone.region,
        x: zone.x,
        y: zone.y
      });
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-auto">
        {/* Cricket pitch */}
        <rect x="45" y="40" width="10" height="20" fill="#d4a574" stroke="#8b6f47" strokeWidth="0.5" />
        
        {/* Batting crease */}
        <line x1="42" y1="45" x2="58" y2="45" stroke="white" strokeWidth="0.3" />
        <line x1="42" y1="55" x2="58" y2="55" stroke="white" strokeWidth="0.3" />
        
        {/* Bowling crease */}
        <line x1="42" y1="48" x2="58" y2="48" stroke="white" strokeWidth="0.2" />
        <line x1="42" y1="52" x2="58" y2="52" stroke="white" strokeWidth="0.2" />
        
        {/* Stumps */}
        <rect x="48.5" y="44" width="0.5" height="2" fill="white" />
        <rect x="50" y="44" width="0.5" height="2" fill="white" />
        <rect x="51.5" y="44" width="0.5" height="2" fill="white" />
        
        {/* Field boundary */}
        <ellipse cx="50" cy="50" rx="45" ry="42" fill="none" stroke="#22c55e" strokeWidth="0.5" strokeDasharray="2,1" />
        
        {/* Inner circle (30 yard) */}
        <ellipse cx="50" cy="50" rx="30" ry="28" fill="none" stroke="#16a34a" strokeWidth="0.3" opacity="0.5" />
        
        {/* Fielding zones as clickable circles */}
        {Object.entries(fieldingZones).map(([zoneId, zone]) => {
          const isSelected = selectedZone === zoneId;
          const isHovered = hoveredZone === zoneId;
          
          return (
            <g
              key={zoneId}
              onClick={() => handleClick(zoneId, zone)}
              onMouseEnter={() => setHoveredZone(zoneId)}
              onMouseLeave={() => setHoveredZone(null)}
              className={disabled ? '' : 'cursor-pointer transition-all duration-200'}
              style={{ opacity: disabled ? 0.5 : 1 }}
            >
              {/* Zone circle */}
              <circle
                cx={zone.x}
                cy={zone.y}
                r={isSelected ? 4 : 3}
                fill={isSelected ? '#ef4444' : isHovered ? '#3b82f6' : '#60a5fa'}
                opacity={isSelected ? 1 : 0.7}
                stroke="white"
                strokeWidth="0.5"
                className="transition-all duration-200"
              />
              
              {/* Zone label */}
              {showLabels && (
                <text
                  x={zone.x}
                  y={zone.y - 4}
                  textAnchor="middle"
                  fontSize="2.5"
                  fill={isSelected ? '#dc2626' : '#1e3a8a'}
                  fontWeight="bold"
                  className="pointer-events-none select-none"
                >
                  {zone.name}
                </text>
              )}
            </g>
          );
        })}
        
        {/* Batsman indicator */}
        <circle cx="50" cy="47" r="1.5" fill="#1e40af" stroke="white" strokeWidth="0.3" />
        
        {/* Bowler indicator */}
        <circle cx="50" cy="53" r="1.5" fill="#dc2626" stroke="white" strokeWidth="0.3" />
      </svg>
      
      {/* Legend */}
      <div className="flex justify-center gap-4 mt-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-400 opacity-70"></div>
          <span className="text-slate-600">Fielding Zone</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
          <span className="text-slate-600">Hovered</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-slate-600">Selected</span>
        </div>
      </div>
    </div>
  );
}
