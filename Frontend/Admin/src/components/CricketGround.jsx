import React, { useRef, useState } from "react";

// ─── CONSTANTS (400x400 canvas) ───────────────────────────────────────────────
const GW = 400;
const GH = 400;
const CX = 200; // center X — batsman position
const CY = 200; // center Y
const BOUNDARY_RADIUS = 185;   // outer boundary rope
const INNER_CIRCLE_RADIUS = 100; // 30-yard circle
const CLOSE_INFIELD_RADIUS = 50; // close infield / pitch zone

// ─── EXACT FIELD POSITIONS (400x400, off side = left x<200, leg = right x>200) ──
const FIELD_POSITIONS = [
    // Close Infield
    { id: 'wicket_keeper', name: 'Wicket Keeper', x: 200, y: 235 },
    { id: 'slip_1', name: '1st Slip', x: 170, y: 240 },
    { id: 'slip_2', name: '2nd Slip', x: 155, y: 245 },
    { id: 'gully', name: 'Gully', x: 140, y: 230 },
    { id: 'leg_slip', name: 'Leg Slip', x: 228, y: 240 },
    { id: 'leg_gully', name: 'Leg Gully', x: 242, y: 228 },
    { id: 'silly_point', name: 'Silly Point', x: 148, y: 205 },
    { id: 'silly_mid_on', name: 'Silly Mid On', x: 222, y: 195 },
    { id: 'silly_mid_off', name: 'Silly Mid Off', x: 178, y: 195 },
    { id: 'short_leg', name: 'Short Leg', x: 235, y: 210 },
    { id: 'bat_pad', name: 'Bat Pad (Leg)', x: 215, y: 200 },
    // Inner Ring / 30-Yard Circle
    { id: 'point', name: 'Point', x: 110, y: 200 },
    { id: 'backward_point', name: 'Backward Point', x: 115, y: 225 },
    { id: 'cover_point', name: 'Cover Point', x: 120, y: 185 },
    { id: 'cover', name: 'Cover', x: 128, y: 165 },
    { id: 'extra_cover', name: 'Extra Cover', x: 145, y: 148 },
    { id: 'mid_off', name: 'Mid Off', x: 170, y: 138 },
    { id: 'mid_on', name: 'Mid On', x: 230, y: 138 },
    { id: 'mid_wicket', name: 'Mid Wicket', x: 268, y: 155 },
    { id: 'square_leg', name: 'Square Leg', x: 288, y: 200 },
    { id: 'backward_square_leg', name: 'Backward Square Leg', x: 282, y: 222 },
    { id: 'short_fine_leg', name: 'Short Fine Leg', x: 252, y: 252 },
    { id: 'forward_short_leg', name: 'Forward Short Leg', x: 245, y: 185 },
    // Outfield
    { id: 'third_man', name: 'Third Man', x: 122, y: 338 },
    { id: 'fine_leg', name: 'Fine Leg', x: 272, y: 345 },
    { id: 'deep_fine_leg', name: 'Deep Fine Leg', x: 258, y: 368 },
    { id: 'deep_backward_sq', name: 'Deep Backward Sq Leg', x: 348, y: 272 },
    { id: 'deep_square_leg', name: 'Deep Square Leg', x: 365, y: 205 },
    { id: 'deep_mid_wicket', name: 'Deep Mid Wicket', x: 355, y: 138 },
    { id: 'cow_corner', name: 'Cow Corner', x: 328, y: 92 },
    { id: 'long_on', name: 'Long On', x: 260, y: 52 },
    { id: 'straight_hit', name: 'Straight Hit', x: 200, y: 35 },
    { id: 'long_off', name: 'Long Off', x: 138, y: 52 },
    { id: 'deep_extra_cover', name: 'Deep Extra Cover', x: 70, y: 92 },
    { id: 'sweeper_cover', name: 'Sweeper Cover', x: 48, y: 138 },
    { id: 'deep_cover', name: 'Deep Cover', x: 42, y: 175 },
    { id: 'deep_point', name: 'Deep Point', x: 38, y: 205 },
    { id: 'deep_backward_point', name: 'Deep Backward Point', x: 48, y: 245 },
    { id: 'long_stop', name: 'Long Stop', x: 200, y: 375 },
    { id: 'wide_off', name: 'Wide (Off Side)', x: 15, y: 200 },
    { id: 'wide_leg', name: 'Wide (Leg Side)', x: 385, y: 200 },
];

// ─── SHOT DETECTION (Part 3 logic) ───────────────────────────────────────────
function detectShot(clickX, clickY) {
    const dx = clickX - CX;
    const dy = CY - clickY; // flip Y so up = positive
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angleRad = Math.atan2(dx, dy); // 0 = straight (toward sightscreen/top)
    const angleDeg = (angleRad * 180 / Math.PI + 360) % 360;
    const side = dx < 0 ? 'off side' : 'leg side';

    let zone, shotType;
    if (distance > BOUNDARY_RADIUS) {
        zone = 'over_boundary';
    } else if (distance > INNER_CIRCLE_RADIUS) {
        zone = 'outfield';
    } else if (distance > INNER_CIRCLE_RADIUS * 0.8 || distance > CLOSE_INFIELD_RADIUS) {
        zone = 'inner_ring';
    } else {
        zone = 'close_infield';
    }
    shotType = 'running'; // Defaulting to running, user selects runs manually

    let direction = '';
    // Direction detection removed as per user request to not auto-detect

    // Find the nearest field position for labeling
    let nearestPos = null, nearestDist = Infinity;
    FIELD_POSITIONS.forEach(pos => {
        const pd = Math.sqrt((clickX - pos.x) ** 2 + (clickY - pos.y) ** 2);
        if (pd < nearestDist) { nearestDist = pd; nearestPos = pos; }
    });

    // Shot name based on angle + zone
    const shotName = getShotName(angleDeg, shotType, side);

    return { distance, angleDeg, zone, shotType, direction, side, nearestPos, shotName };
}

function getShotName(angleDeg, shotType, side) {
    if (angleDeg >= 337.5 || angleDeg < 22.5) return 'Straight Shot';
    if (angleDeg < 67.5) return side === 'off side' ? 'Off-Side Shot' : 'On-Side Shot';
    if (angleDeg < 112.5) return 'Cover/Extra Cover Area';
    if (angleDeg < 157.5) return 'Point/Gully Area';
    if (angleDeg < 202.5) return 'Third Man/Fine Leg Area';
    if (angleDeg < 247.5) return 'Fine Leg/Square Leg Area';
    if (angleDeg < 292.5) return 'Mid-Wicket/Square Leg Area';
    return 'Mid-On/Long-On Area';
}

// Zone label & color
function getZoneStyle(zone) {
    switch (zone) {
        case 'over_boundary': return { color: '#a855f7', label: 'Over Boundary', bg: 'rgba(168,85,247,0.15)' };
        case 'outfield': return { color: '#3b82f6', label: 'Outfield', bg: 'rgba(59,130,246,0.12)' };
        case 'inner_ring': return { color: '#22c55e', label: 'Inner Ring', bg: 'rgba(34,197,94,0.08)' };
        default: return { color: '#ff6b35', label: 'Infield', bg: 'rgba(255,107,53,0.08)' };
    }
}

export default function CricketGround({ onShotSelect, selectedRuns, activeZone }) {
    const svgRef = useRef(null);
    const [hoverInfo, setHoverInfo] = useState(null);
    const [clickEffect, setClickEffect] = useState(null);

    const handleClick = (e) => {
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        // Scale from rendered size to SVG 400x400 space
        const sx = (e.clientX - rect.left) * (GW / rect.width);
        const sy = (e.clientY - rect.top) * (GH / rect.height);

        const info = detectShot(sx, sy);

        setClickEffect({ x: sx, y: sy, zone: info.zone, key: Date.now() });
        setTimeout(() => setClickEffect(null), 700);

        // Auto-set runs removed as per user request
        let autoRuns = null;

        onShotSelect({
            x: sx, y: sy,
            angle: Math.round(info.angleDeg),
            distance: Math.round(info.distance),
            direction: info.direction,
            shotName: info.shotName,
            zone: info.zone,
            shotType: info.shotType,
            side: info.side,
            nearestPosition: info.nearestPos?.name || '',
            autoRuns,
        });
    };

    const handleMouseMove = (e) => {
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const sx = (e.clientX - rect.left) * (GW / rect.width);
        const sy = (e.clientY - rect.top) * (GH / rect.height);
        const info = detectShot(sx, sy);
        setHoverInfo(info);
    };

    const hoverStyle = hoverInfo ? getZoneStyle(hoverInfo.zone) : null;
    const activeStyle = activeZone ? getZoneStyle(activeZone.zone) : null;

    return (
        <div className="flex flex-col items-center gap-2">
            {/* Zone Legend */}
            <div className="flex flex-wrap gap-3 justify-center text-[9px] font-black uppercase tracking-widest">
                {[
                    { color: 'bg-purple-500', label: 'Over Boundary' },
                    { color: 'bg-blue-500', label: 'Outfield' },
                    { color: 'bg-green-500', label: 'Inner Ring' },
                    { color: 'bg-[#ff6b35]', label: 'Infield' },
                ].map(z => (
                    <span key={z.label} className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${z.color}`} />
                        <span className="text-slate-500">{z.label}</span>
                    </span>
                ))}
            </div>

            {/* SVG Ground */}
            <div className="relative w-full" style={{ maxWidth: 340, aspectRatio: '1' }}>
                <svg
                    ref={svgRef}
                    viewBox={`0 0 ${GW} ${GH}`}
                    width="100%"
                    height="100%"
                    className="cursor-crosshair select-none"
                    onClick={handleClick}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setHoverInfo(null)}
                >
                    <defs>
                        <radialGradient id="gGrd" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#1a5c38" />
                            <stop offset="65%" stopColor="#155032" />
                            <stop offset="100%" stopColor="#0d3820" />
                        </radialGradient>
                        <radialGradient id="infGrd" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#1e6b42" />
                            <stop offset="100%" stopColor="#1a5e38" />
                        </radialGradient>
                    </defs>

                    {/* Ground base */}
                    <ellipse cx={CX} cy={CY} rx={BOUNDARY_RADIUS} ry={BOUNDARY_RADIUS - 5} fill="url(#gGrd)" />

                    {/* Hover zone overlay */}
                    {hoverInfo && (
                        <ellipse
                            cx={CX} cy={CY}
                            rx={hoverInfo.zone === 'over_boundary' ? BOUNDARY_RADIUS :
                                hoverInfo.zone === 'outfield' ? BOUNDARY_RADIUS - 5 :
                                    hoverInfo.zone === 'inner_ring' ? INNER_CIRCLE_RADIUS :
                                        CLOSE_INFIELD_RADIUS}
                            ry={hoverInfo.zone === 'over_boundary' ? BOUNDARY_RADIUS - 5 :
                                hoverInfo.zone === 'outfield' ? BOUNDARY_RADIUS - 10 :
                                    hoverInfo.zone === 'inner_ring' ? INNER_CIRCLE_RADIUS :
                                        CLOSE_INFIELD_RADIUS}
                            fill={hoverStyle?.bg || 'transparent'}
                            className="pointer-events-none transition-all"
                        />
                    )}

                    {/* Outer boundary rope */}
                    <ellipse cx={CX} cy={CY} rx={BOUNDARY_RADIUS} ry={BOUNDARY_RADIUS - 5}
                        fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="3" strokeDasharray="8 5" />

                    {/* 30-yard inner circle */}
                    <circle cx={CX} cy={CY} r={INNER_CIRCLE_RADIUS}
                        fill="url(#infGrd)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="5 4" />

                    {/* Mowing stripes (subtle) */}
                    {[-6, -4, -2, 0, 2, 4, 6].map(i => (
                        <line key={i}
                            x1={CX + i * 22} y1={CY - BOUNDARY_RADIUS + 10}
                            x2={CX + i * 22} y2={CY + BOUNDARY_RADIUS - 10}
                            stroke="rgba(255,255,255,0.03)" strokeWidth="14"
                        />
                    ))}

                    {/* Direction labels (outfield) */}
                    {[
                        { label: 'Straight', x: CX, y: 22 },
                        { label: 'Long Off', x: 130, y: 42 },
                        { label: 'Long On', x: 268, y: 42 },
                        { label: 'Cover', x: 58, y: 120 },
                        { label: 'Mid Wkt', x: 340, y: 120 },
                        { label: 'Point', x: 30, y: 200 },
                        { label: 'Sq Leg', x: 362, y: 200 },
                        { label: '3rd Man', x: 90, y: 352 },
                        { label: 'Fine Leg', x: 285, y: 358 },
                    ].map(d => (
                        <text key={d.label} x={d.x} y={d.y}
                            textAnchor="middle" fill="rgba(255,255,255,0.28)"
                            fontSize="9" fontWeight="700" fontFamily="sans-serif">
                            {d.label}
                        </text>
                    ))}

                    {/* Pitch rectangle */}
                    <rect x={CX - 8} y={CY - 36} width={16} height={72} fill="#c8a46d" rx={3} />
                    {/* Crease lines */}
                    <line x1={CX - 9} y1={CY - 20} x2={CX + 9} y2={CY - 20} stroke="white" strokeWidth="1.2" />
                    <line x1={CX - 9} y1={CY + 20} x2={CX + 9} y2={CY + 20} stroke="white" strokeWidth="1.2" />
                    {/* Stumps — bowler end (bottom) */}
                    {[-3, 0, 3].map((ox, i) => (
                        <rect key={`b${i}`} x={CX + ox - 1} y={CY + 36} width={2} height={8} fill="white" rx={0.5} />
                    ))}
                    {/* Stumps — batting end (top of pitch) */}
                    {[-3, 0, 3].map((ox, i) => (
                        <rect key={`t${i}`} x={CX + ox - 1} y={CY - 44} width={2} height={8} fill="white" rx={0.5} />
                    ))}

                    {/* Batsman marker */}
                    <circle cx={CX} cy={CY + 22} r={5} fill="#ff6b35" opacity={0.9} />
                    <text x={CX} y={CY + 36} textAnchor="middle" fill="#ff6b35" fontSize="7" fontWeight="900">BAT</text>

                    {/* FIELD POSITIONS */}
                    {FIELD_POSITIONS.map(pos => {
                        const dx = pos.x - CX, dy = pos.y - CY;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const isClose = dist < 85;
                        const isOutfield = dist > 125;
                        const r = isClose ? 4 : isOutfield ? 5.5 : 5;
                        return (
                            <g key={pos.id}>
                                <circle cx={pos.x} cy={pos.y} r={r + 4}
                                    fill="transparent" className="cursor-pointer"
                                    onClick={(e) => { e.stopPropagation(); handleClick(e); }}
                                />
                                <circle
                                    cx={pos.x} cy={pos.y} r={r}
                                    fill={isClose ? 'rgba(255,107,53,0.7)' : isOutfield ? 'rgba(255,255,255,0.5)' : 'rgba(59,130,246,0.7)'}
                                    stroke="rgba(255,255,255,0.6)"
                                    strokeWidth="1"
                                    className="pointer-events-none"
                                />
                            </g>
                        );
                    })}

                    {/* Active shot marker */}
                    {activeZone && (
                        <>
                            <line x1={CX} y1={CY + 22} x2={activeZone.x} y2={activeZone.y}
                                stroke={activeStyle?.color || '#ff6b35'}
                                strokeWidth="1.5" strokeDasharray="4 3" opacity={0.6}
                            />
                            <circle cx={activeZone.x} cy={activeZone.y} r={7}
                                fill={activeStyle?.color || '#ff6b35'}
                                stroke="white" strokeWidth="1.5" opacity={0.95}
                            />
                        </>
                    )}

                    {/* Click ripple */}
                    {clickEffect && (
                        <circle key={clickEffect.key}
                            cx={clickEffect.x} cy={clickEffect.y} r={6}
                            fill={getZoneStyle(clickEffect.zone).color}
                            opacity={0.7}
                        >
                            <animate attributeName="r" from="6" to="35" dur="0.65s" fill="freeze" />
                            <animate attributeName="opacity" from="0.7" to="0" dur="0.65s" fill="freeze" />
                        </circle>
                    )}
                </svg>

                {/* Hover tooltip */}
                {hoverInfo && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 pointer-events-none z-10">
                        <div
                            className="text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg whitespace-nowrap"
                            style={{ background: getZoneStyle(hoverInfo.zone).color, color: 'white' }}
                        >
                            {getZoneStyle(hoverInfo.zone).label}
                        </div>
                    </div>
                )}
            </div>

            {/* Shot info bar */}
            {activeZone ? (
                <div className="w-full bg-black/30 rounded-2xl p-3 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Shot</span>
                        <span className="text-[10px] font-black" style={{ color: activeStyle?.color }}>
                            {activeZone.zone === 'over_boundary' ? 'Over Boundary' :
                                activeZone.zone === 'outfield' ? 'Outfield' :
                                    activeZone.zone === 'inner_ring' ? 'Inner Ring' : 'Infield'}
                        </span>
                    </div>
                    <div className="text-xs font-bold text-white">{activeZone.shotName}</div>
                    <div className="text-[9px] text-slate-400">
                        {activeZone.side}
                        {activeZone.nearestPosition && ` · near ${activeZone.nearestPosition}`}
                    </div>
                </div>
            ) : (
                <div className="text-[9px] text-slate-600 uppercase tracking-widest font-black">
                    Click anywhere on the ground
                </div>
            )}
        </div>
    );
}
