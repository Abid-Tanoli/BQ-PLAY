import React, { useRef, useState } from "react";

const FIELD_ZONES = [
  { id: "slip", label: "Slip", x: 75, y: 20, side: "off" },
  { id: "gully", label: "Gully", x: 65, y: 25, side: "off" },
  { id: "point", label: "Point", x: 25, y: 35, side: "off" },
  { id: "cover", label: "Cover", x: 30, y: 25, side: "off" },
  { id: "extra_cover", label: "Extra Cover", x: 40, y: 20, side: "off" },
  { id: "third_man", label: "Third Man", x: 80, y: 30, side: "off" },
  { id: "deep_point", label: "Deep Point", x: 20, y: 45, side: "off" },
  { id: "deep_cover", label: "Deep Cover", x: 25, y: 15, side: "off" },
  { id: "long_off", label: "Long Off", x: 50, y: 8, side: "off" },
  { id: "mid_off", label: "Mid Off", x: 55, y: 25, side: "off" },
  { id: "mid_wicket", label: "Mid Wicket", x: 70, y: 45, side: "on" },
  { id: "deep_mid_wicket", label: "Deep Mid Wicket", x: 75, y: 55, side: "on" },
  { id: "square_leg", label: "Square Leg", x: 70, y: 55, side: "on" },
  { id: "fine_leg", label: "Fine Leg", x: 80, y: 40, side: "on" },
  { id: "deep_square_leg", label: "Deep Square Leg", x: 75, y: 65, side: "on" },
  { id: "mid_on", label: "Mid On", x: 50, y: 40, side: "on" },
  { id: "long_on", label: "Long On", x: 50, y: 55, side: "on" },
  { id: "cow_corner", label: "Cow Corner", x: 65, y: 65, side: "on" },
  { id: "wide_mid_on", label: "Wide Mid On", x: 40, y: 45, side: "on" },
  { id: "wide_mid_off", label: "Wide Mid Off", x: 45, y: 20, side: "off" },
  { id: "short_mid_wicket", label: "Short Mid Wicket", x: 65, y: 40, side: "on" },
  { id: "short_cover", label: "Short Cover", x: 35, y: 30, side: "off" },
  { id: "deep_backward_square_leg", label: "Deep Bwd Sq Leg", x: 70, y: 75, side: "on" },
  { id: "backward_point", label: "Backward Point", x: 30, y: 45, side: "off" },
  { id: "short_fine_leg", label: "Short Fine Leg", x: 75, y: 35, side: "on" },
];

export default function CricketFieldMap({ onFieldClick, selectedZone }) {
  const svgRef = useRef(null);
  const [hoveredZone, setHoveredZone] = useState(null);

  const handleClick = (e) => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Find nearest zone
    let nearestZone = null;
    let nearestDist = Infinity;

    for (const zone of FIELD_ZONES) {
      const dist = Math.sqrt(Math.pow(x - zone.x, 2) + Math.pow(y - zone.y, 2));
      if (dist < nearestDist && dist < 15) {
        nearestDist = dist;
        nearestZone = zone;
      }
    }

    if (nearestZone) {
      onFieldClick({
        x: Math.round(x * 100) / 100,
        y: Math.round(y * 100) / 100,
        angle: Math.round(Math.atan2(y - 50, x - 50) * (180 / Math.PI)),
        position: nearestZone.id,
        positionLabel: nearestZone.label,
        side: nearestZone.side,
        distance: nearestDist < 8 ? "infield" : nearestDist < 12 ? "ring" : "deep",
      });
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        className="w-full h-auto rounded-2xl shadow-xl border-2 border-slate-200 cursor-crosshair"
        onClick={handleClick}
      >
        {/* Field background */}
        <ellipse cx="50" cy="50" rx="48" ry="48" fill="#2d5a27" />
        <ellipse cx="50" cy="50" rx="45" ry="45" fill="#3a7a32" />

        {/* Pitch */}
        <rect x="46" y="20" width="8" height="60" rx="1" fill="#d4a76a" opacity="0.9" />
        <rect x="47" y="22" width="6" height="56" rx="0.5" fill="#c99760" />

        {/* Creases */}
        <line x1="44" y1="28" x2="56" y2="28" stroke="white" strokeWidth="0.3" />
        <line x1="44" y1="72" x2="56" y2="72" stroke="white" strokeWidth="0.3" />

        {/* Field zones */}
        {FIELD_ZONES.map((zone) => (
          <g key={zone.id}>
            <circle
              cx={zone.x}
              cy={zone.y}
              r={selectedZone === zone.id ? 4 : 3}
              fill={
                selectedZone === zone.id
                  ? "#3b82f6"
                  : hoveredZone === zone.id
                  ? "#60a5fa"
                  : "rgba(255,255,255,0.3)"
              }
              stroke="white"
              strokeWidth="0.5"
              className="transition-all duration-150"
              onMouseEnter={() => setHoveredZone(zone.id)}
              onMouseLeave={() => setHoveredZone(null)}
            />
            <text
              x={zone.x}
              y={zone.y - 4}
              textAnchor="middle"
              fontSize="2.5"
              fill="white"
              fontWeight="bold"
              style={{ textShadow: "0 0 2px rgba(0,0,0,0.8)" }}
              className="pointer-events-none select-none"
            >
              {zone.label}
            </text>
          </g>
        ))}

        {/* Center circle */}
        <circle cx="50" cy="50" r="3" fill="none" stroke="white" strokeWidth="0.3" opacity="0.5" />

        {/* Instructions */}
        <text x="50" y="95" textAnchor="middle" fontSize="2.5" fill="white" opacity="0.7">
          Click to select field position
        </text>
      </svg>

      {selectedZone && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-xs font-bold text-blue-900">
            Selected: <span className="text-blue-600">{selectedZone}</span>
          </p>
        </div>
      )}
    </div>
  );
}
