import React, { useState } from 'react';

/**
 * Wagon Wheel Component - Visualizes shot placement and runs scored
 * Shows where batsman scored runs during their innings
 */
export default function WagonWheel({ shots = [], batsmanName = 'Batsman' }) {
  const [selectedShot, setSelectedShot] = useState(null);
  const [filterRuns, setFilterRuns] = useState('all'); // all, 1, 2, 3, 4, 6

  // Group shots by runs
  const getShotsByRuns = (runs) => {
    if (filterRuns === 'all') return shots;
    return shots.filter(s => s.runs === parseInt(filterRuns));
  };

  const currentShots = getShotsByRuns();

  // Calculate stats
  const totalRuns = shots.reduce((sum, s) => sum + s.runs, 0);
  const fours = shots.filter(s => s.runs === 4).length;
  const sixes = shots.filter(s => s.runs === 6).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800">
          {batsmanName}'s Wagon Wheel
        </h3>
        <div className="flex gap-2">
          <select
            value={filterRuns}
            onChange={(e) => setFilterRuns(e.target.value)}
            className="text-xs border border-slate-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Shots</option>
            <option value="1">1 Run</option>
            <option value="2">2 Runs</option>
            <option value="3">3 Runs</option>
            <option value="4">4s Only</option>
            <option value="6">6s Only</option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-500">Total</p>
          <p className="text-lg font-bold text-slate-800">{totalRuns}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-2 text-center">
          <p className="text-xs text-green-600">4s</p>
          <p className="text-lg font-bold text-green-700">{fours}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-2 text-center">
          <p className="text-xs text-purple-600">6s</p>
          <p className="text-lg font-bold text-purple-700">{sixes}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-2 text-center">
          <p className="text-xs text-blue-600">Shots</p>
          <p className="text-lg font-bold text-blue-700">{shots.length}</p>
        </div>
      </div>

      {/* Wagon Wheel Diagram */}
      <div className="relative w-full max-w-sm mx-auto aspect-square">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Outer boundary circle */}
          <circle cx="100" cy="100" r="95" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="4,2" />
          
          {/* 30 yard circle */}
          <circle cx="100" cy="100" r="60" fill="none" stroke="#16a34a" strokeWidth="1" opacity="0.5" />
          
          {/* Pitch area */}
          <rect x="90" y="85" width="20" height="30" fill="#d4a574" stroke="#8b6f47" strokeWidth="1" />
          
          {/* Crease lines */}
          <line x1="85" y1="90" x2="115" y2="90" stroke="white" strokeWidth="1" />
          <line x1="85" y1="110" x2="115" y2="110" stroke="white" strokeWidth="1" />
          
          {/* Field regions (subtle background) */}
          <path d="M 100 100 L 100 10 L 195 100 Z" fill="#f0f9ff" opacity="0.3" />
          <path d="M 100 100 L 195 100 L 100 190 Z" fill="#fef3c7" opacity="0.3" />
          <path d="M 100 100 L 100 190 L 5 100 Z" fill="#f0f9ff" opacity="0.3" />
          <path d="M 100 100 L 5 100 L 100 10 Z" fill="#fef3c7" opacity="0.3" />
          
          {/* Direction labels */}
          <text x="100" y="8" textAnchor="middle" fontSize="6" fill="#64748b" fontWeight="bold">STRAIGHT</text>
          <text x="100" y="195" textAnchor="middle" fontSize="6" fill="#64748b" fontWeight="bold">BACKWARD</text>
          <text x="8" y="100" textAnchor="middle" fontSize="6" fill="#64748b" fontWeight="bold" transform="rotate(-90, 8, 100)">OFF SIDE</text>
          <text x="192" y="100" textAnchor="middle" fontSize="6" fill="#64748b" fontWeight="bold" transform="rotate(90, 192, 100)">ON SIDE</text>
          
          {/* Shot markers */}
          {currentShots.map((shot, index) => {
            const angle = shot.angle || 0; // 0 = straight, positive = off side, negative = on side
            const distance = Math.min(shot.distance || 50, 90); // Distance from center (max 90)
            const radians = (angle - 90) * (Math.PI / 180);
            const x = 100 + distance * Math.cos(radians);
            const y = 100 + distance * Math.sin(radians);
            
            let color = '#64748b'; // Default - grey for 1-3 runs
            let size = 4;
            if (shot.runs === 4) { color = '#22c55e'; size = 6; } // Green for 4s
            if (shot.runs === 6) { color = '#a855f7'; size = 8; } // Purple for 6s
            if (shot.runs === 0) { color = '#ef4444'; size = 3; } // Red for dots
            
            const isSelected = selectedShot === index;
            
            return (
              <g
                key={index}
                onClick={() => setSelectedShot(isSelected ? null : index)}
                className="cursor-pointer"
              >
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? size + 2 : size}
                  fill={color}
                  opacity={isSelected ? 1 : 0.7}
                  stroke="white"
                  strokeWidth="1"
                  className="transition-all duration-200"
                />
                {isSelected && (
                  <text
                    x={x}
                    y={y - 8}
                    textAnchor="middle"
                    fontSize="8"
                    fill="#1e293b"
                    fontWeight="bold"
                  >
                    {shot.runs}
                  </text>
                )}
              </g>
            );
          })}
          
          {/* Batsman position */}
          <circle cx="100" cy="100" r="3" fill="#1e40af" stroke="white" strokeWidth="1" />
        </svg>
      </div>

      {/* Shot details */}
      {selectedShot !== null && currentShots[selectedShot] && (
        <div className="mt-4 bg-slate-50 rounded-lg p-3 text-sm">
          <p className="font-semibold text-slate-700">Shot Details</p>
          <div className="grid grid-cols-2 gap-2 mt-2 text-slate-600">
            <p>Runs: <span className="font-bold">{currentShots[selectedShot].runs}</span></p>
            <p>Over: <span className="font-bold">{currentShots[selectedShot].over}</span></p>
            <p>Position: <span className="font-bold">{currentShots[selectedShot].position || 'N/A'}</span></p>
            <p>Bowler: <span className="font-bold">{currentShots[selectedShot].bowler || 'N/A'}</span></p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 text-xs justify-center">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-purple-600"></div>
          <span className="text-slate-600">6 runs</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-slate-600">4 runs</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-slate-500"></div>
          <span className="text-slate-600">1-3 runs</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-slate-600">Dot ball</span>
        </div>
      </div>
    </div>
  );
}
