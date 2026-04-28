import React from "react";

const POSITIONS = [
    // Off side
    { id: "slip", label: "Slip", x: 160, y: 280 },
    { id: "gully", label: "Gully", x: 110, y: 260 },
    { id: "point", label: "Point", x: 60, y: 200 },
    { id: "backward_point", label: "Backward Point", x: 50, y: 240 },
    { id: "cover", label: "Cover", x: 80, y: 150 },
    { id: "short_cover", label: "Short Cover", x: 140, y: 170 },
    { id: "extra_cover", label: "Extra Cover", x: 110, y: 100 },
    { id: "deep_cover", label: "Deep Cover", x: 40, y: 80 },
    { id: "mid_off", label: "Mid Off", x: 160, y: 130 },
    { id: "long_off", label: "Long Off", x: 100, y: 30 },
    { id: "third_man", label: "Third Man", x: 40, y: 340 },

    // Leg side
    { id: "mid_on", label: "Mid On", x: 240, y: 130 },
    { id: "long_on", label: "Long On", x: 300, y: 30 },
    { id: "short_mid_wicket", label: "Short Mid Wicket", x: 260, y: 170 },
    { id: "mid_wicket", label: "Mid Wicket", x: 320, y: 150 },
    { id: "cow_corner", label: "Cow Corner", x: 360, y: 100 },
    { id: "deep_mid_wicket", label: "Deep Mid Wicket", x: 360, y: 60 },
    { id: "square_leg", label: "Square Leg", x: 340, y: 200 },
    { id: "deep_square_leg", label: "Deep Square Leg", x: 380, y: 240 },
    { id: "short_fine_leg", label: "Short Fine Leg", x: 290, y: 260 },
    { id: "fine_leg", label: "Fine Leg", x: 340, y: 300 },
    { id: "deep_backward_square_leg", label: "Deep Backward Square Leg", x: 340, y: 360 },
];

export default function CricketFieldMap({ onFieldClick, selectedZone }) {
    const handlePosClick = (pos) => {
        onFieldClick({
            position: pos.id,
            positionLabel: pos.label,
            x: pos.x,
            y: pos.y
        });
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative w-[400px] h-[400px] bg-[#2d6a4f] rounded-full shadow-2xl overflow-hidden border-8 border-[#1b4332]">
                <svg width="400" height="400" viewBox="0 0 400 400" className="absolute inset-0">
                    {/* Inner Ring */}
                    <circle cx="200" cy="200" r="120" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="5,5" />
                    
                    {/* Pitch */}
                    <rect x="190" y="140" width="20" height="120" fill="#bc8f8f" />
                    <line x1="190" y1="160" x2="210" y2="160" stroke="white" strokeWidth="1" />
                    <line x1="190" y1="240" x2="210" y2="240" stroke="white" strokeWidth="1" />
                    
                    {/* Bowler/Striker indicators */}
                    <circle cx="200" cy="145" r="3" fill="white" />
                    <rect x="197" y="250" width="6" height="2" fill="white" />
                </svg>

                {/* Fielding Buttons */}
                {POSITIONS.map((pos) => (
                    <button
                        key={pos.id}
                        onClick={() => handlePosClick(pos)}
                        title={pos.label}
                        className={`absolute w-4 h-4 rounded-full border-2 border-white transition-all transform -translate-x-1/2 -translate-y-1/2 group ${
                            selectedZone === pos.id 
                            ? "bg-[#ff6b35] scale-150 shadow-[0_0_15px_#ff6b35]" 
                            : "bg-white/80 hover:bg-white hover:scale-125"
                        }`}
                        style={{ left: pos.x, top: pos.y }}
                    >
                        <span className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[8px] px-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity font-bold">
                            {pos.label}
                        </span>
                    </button>
                ))}
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2 rounded-full shadow-lg">
                <p className="text-sm font-black text-white uppercase tracking-widest">
                    Selected: <span className="text-[#ff6b35]">{POSITIONS.find(p => p.id === selectedZone)?.label || "None"}</span>
                </p>
            </div>
        </div>
    );
}
