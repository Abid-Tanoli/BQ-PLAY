import React, { useRef, useState, useCallback } from "react";
import "./PitchMap.css";

// ─── CONSTANTS ─────────────────────────────────────────────────────────────────
const SVG_W = 260;
const SVG_H = 520;
const PITCH_X = 60;
const PITCH_Y = 40;
const PITCH_W = 140;
const PITCH_H = 440;

// Line zones (X positions across the pitch width)
const LINE_ZONES = [
    { id: "wide_outside_off", label: "Wide Outside Off", xMin: 0, xMax: 0.10 },
    { id: "outside_off", label: "Outside Off", xMin: 0.10, xMax: 0.25 },
    { id: "off_stump", label: "Off Stump", xMin: 0.25, xMax: 0.40, corridor: true },
    { id: "middle_stump", label: "Middle Stump", xMin: 0.40, xMax: 0.60, corridor: true },
    { id: "leg_stump", label: "Leg Stump", xMin: 0.60, xMax: 0.75, corridor: true },
    { id: "outside_leg", label: "Outside Leg", xMin: 0.75, xMax: 0.90 },
    { id: "wide_outside_leg", label: "Wide Outside Leg", xMin: 0.90, xMax: 1.0 },
];

// Length zones (Y positions - top=batsman end, bottom=bowler end)
const LENGTH_ZONES = [
    { id: "full_toss", label: "Full Toss", yMin: 0, yMax: 0.08, dist: "0m" },
    { id: "yorker", label: "Yorker", yMin: 0.08, yMax: 0.18, dist: "2m" },
    { id: "full", label: "Full", yMin: 0.18, yMax: 0.35, dist: "3-4m" },
    { id: "good_length", label: "Good Length", yMin: 0.35, yMax: 0.55, dist: "5-6m" },
    { id: "hard_length", label: "Hard Length", yMin: 0.55, yMax: 0.72, dist: "7-8m" },
    { id: "bouncer", label: "Bouncer", yMin: 0.72, yMax: 1.0, dist: "9m+" },
];

const SHOT_TYPES = [
    "Defended", "Driven", "Cut", "Pull", "Flick / Glance",
    "Sweep", "Reverse Sweep", "Lofted / Slog", "Left / Padded Away",
    "Missed / Beaten", "Edged", "No Shot Offered"
];

// Dot color based on outcome
function getDotColor(outcome) {
    if (outcome.wicket) return "#ff2d78";       // hot pink
    if (outcome.runs === 6) return "#3b82f6";   // blue
    if (outcome.runs === 4) return "#84cc16";    // green-gold
    if (outcome.runs >= 1) return "#cbd5e1";     // slightly darker grey
    return "#f1f5f9";                             // light grey (dot ball)
}
function getDotStroke(outcome) {
    if (outcome.wicket) return "#be185d";
    if (outcome.runs === 6) return "#1d4ed8";
    if (outcome.runs === 4) return "#4d7c0f";
    return "#94a3b8";
}

// Map line/length IDs to pixel coordinates
function lineToX(lineId) {
    const zone = LINE_ZONES.find(z => z.id === lineId);
    if (!zone) return PITCH_X + PITCH_W / 2;
    const mid = (zone.xMin + zone.xMax) / 2;
    return PITCH_X + mid * PITCH_W;
}
function lengthToY(lengthId) {
    const zone = LENGTH_ZONES.find(z => z.id === lengthId);
    if (!zone) return PITCH_Y + PITCH_H / 2;
    const mid = (zone.yMin + zone.yMax) / 2;
    return PITCH_Y + mid * PITCH_H;
}

// Pixel position to zone IDs
function xToLine(px) {
    const rel = (px - PITCH_X) / PITCH_W;
    for (const z of LINE_ZONES) {
        if (rel >= z.xMin && rel <= z.xMax) return z.id;
    }
    return rel < 0.5 ? "wide_outside_off" : "wide_outside_leg";
}
function yToLength(py) {
    const rel = (py - PITCH_Y) / PITCH_H;
    for (const z of LENGTH_ZONES) {
        if (rel >= z.yMin && rel <= z.yMax) return z.id;
    }
    return rel < 0.5 ? "full_toss" : "bouncer";
}

// ─── COMPONENT ─────────────────────────────────────────────────────────────────
export default function PitchMap({
    balls = [],           // Array of ball data objects for the current over
    currentOver = 0,
    onBallSubmit,         // callback(ballData)
    bowlerName = "",
    batsmanName = "",
    viewMode = "this_over", // "this_over" | "full_innings"
}) {
    const svgRef = useRef(null);
    const [selectedLine, setSelectedLine] = useState("");
    const [selectedLength, setSelectedLength] = useState("");
    const [selectedShot, setSelectedShot] = useState("");
    const [clickPos, setClickPos] = useState(null); // {x, y} raw SVG coords
    const [hoverPos, setHoverPos] = useState(null);
    const [ripple, setRipple] = useState(null);

    // Click handler on pitch SVG
    const handlePitchClick = useCallback((e) => {
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const sx = (e.clientX - rect.left) * (SVG_W / rect.width);
        const sy = (e.clientY - rect.top) * (SVG_H / rect.height);

        // Clamp within pitch area
        const cx = Math.max(PITCH_X, Math.min(PITCH_X + PITCH_W, sx));
        const cy = Math.max(PITCH_Y, Math.min(PITCH_Y + PITCH_H, sy));

        setClickPos({ x: cx, y: cy });
        setSelectedLine(xToLine(cx));
        setSelectedLength(yToLength(cy));

        // Ripple animation
        setRipple({ x: cx, y: cy, key: Date.now() });
        setTimeout(() => setRipple(null), 600);
    }, []);

    const handleMouseMove = useCallback((e) => {
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const sx = (e.clientX - rect.left) * (SVG_W / rect.width);
        const sy = (e.clientY - rect.top) * (SVG_H / rect.height);
        if (sx >= PITCH_X && sx <= PITCH_X + PITCH_W && sy >= PITCH_Y && sy <= PITCH_Y + PITCH_H) {
            setHoverPos({ x: sx, y: sy, line: xToLine(sx), length: yToLength(sy) });
        } else {
            setHoverPos(null);
        }
    }, []);

    // When line/length dropdowns change, update click position
    const handleLineChange = (val) => {
        setSelectedLine(val);
        if (val && selectedLength) {
            setClickPos({ x: lineToX(val), y: lengthToY(selectedLength) });
        }
    };
    const handleLengthChange = (val) => {
        setSelectedLength(val);
        if (selectedLine && val) {
            setClickPos({ x: lineToX(selectedLine), y: lengthToY(val) });
        }
    };

    // Compute the pitch-relative % for data
    const getPitchPercent = () => {
        if (!clickPos) return { pitchX: 50, pitchY: 50 };
        return {
            pitchX: Math.round(((clickPos.x - PITCH_X) / PITCH_W) * 100),
            pitchY: Math.round(((clickPos.y - PITCH_Y) / PITCH_H) * 100),
        };
    };

    // Filter balls based on viewMode
    const displayBalls = viewMode === "this_over"
        ? balls.filter(b => {
            const ballOver = parseInt(String(b.ballId).split(".")[0]);
            return ballOver === currentOver;
        })
        : balls;

    // ─── Hover info label ──────────────────────────────────────────────────
    const hoverLineLabel = hoverPos ? LINE_ZONES.find(z => z.id === hoverPos.line)?.label : "";
    const hoverLengthLabel = hoverPos ? LENGTH_ZONES.find(z => z.id === hoverPos.length)?.label : "";

    return (
        <div className="pitchmap-root">
            <div className="pitchmap-header">
                <h4 className="pitchmap-title">PITCH MAP</h4>
                <span className="pitchmap-subtitle">Ball-by-Ball Tracking</span>
            </div>

            {/* SVG Pitch View */}
            <div className="pitchmap-svg-wrap">
                {/* Left labels (length zones) */}
                <div className="pitchmap-labels-left">
                    {LENGTH_ZONES.map(z => (
                        <div key={z.id} className="pitchmap-len-label" style={{
                            top: `${(z.yMin + z.yMax) / 2 * 100}%`,
                        }}>
                            <span className="pitchmap-len-name">{z.label}</span>
                        </div>
                    ))}
                </div>

                {/* SVG */}
                <svg
                    ref={svgRef}
                    viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                    className="pitchmap-svg"
                    onClick={handlePitchClick}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setHoverPos(null)}
                >
                    <defs>
                        <linearGradient id="pm-pitch-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2d5a27" />
                            <stop offset="50%" stopColor="#1e4620" />
                            <stop offset="100%" stopColor="#2d5a27" />
                        </linearGradient>
                        <linearGradient id="pm-corridor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(234,179,8,0.25)" />
                            <stop offset="100%" stopColor="rgba(234,179,8,0.15)" />
                        </linearGradient>
                        <filter id="pm-dot-shadow">
                            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.5" />
                        </filter>
                    </defs>

                    {/* Outfield background */}
                    <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="#1a3a16" rx="12" />

                    {/* Pitch strip */}
                    <rect x={PITCH_X} y={PITCH_Y} width={PITCH_W} height={PITCH_H}
                        fill="url(#pm-pitch-grad)" rx="4" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

                    {/* Corridor of uncertainty (off/middle/leg stump zone) */}
                    {LINE_ZONES.filter(z => z.corridor).map(z => (
                        <rect key={z.id}
                            x={PITCH_X + z.xMin * PITCH_W}
                            y={PITCH_Y}
                            width={(z.xMax - z.xMin) * PITCH_W}
                            height={PITCH_H}
                            fill="url(#pm-corridor)"
                        />
                    ))}

                    {/* Horizontal length zone lines */}
                    {LENGTH_ZONES.slice(1).map(z => (
                        <line key={z.id}
                            x1={PITCH_X} y1={PITCH_Y + z.yMin * PITCH_H}
                            x2={PITCH_X + PITCH_W} y2={PITCH_Y + z.yMin * PITCH_H}
                            stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" strokeDasharray="4 3"
                        />
                    ))}

                    {/* Vertical line zone dividers */}
                    {LINE_ZONES.slice(1).map(z => (
                        <line key={`v-${z.id}`}
                            x1={PITCH_X + z.xMin * PITCH_W} y1={PITCH_Y}
                            x2={PITCH_X + z.xMin * PITCH_W} y2={PITCH_Y + PITCH_H}
                            stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"
                        />
                    ))}

                    {/* Stumps & Crease at batsman's end (TOP) */}
                    {/* Crease line */}
                    <line x1={PITCH_X + 20} y1={PITCH_Y + 24} x2={PITCH_X + PITCH_W - 20} y2={PITCH_Y + 24}
                        stroke="white" strokeWidth="1.5" />
                    {/* Stumps */}
                    {[-6, 0, 6].map((ox, i) => (
                        <rect key={`st-${i}`}
                            x={PITCH_X + PITCH_W / 2 + ox - 1.5} y={PITCH_Y + 10}
                            width="3" height="14" fill="white" rx="1"
                        />
                    ))}
                    {/* Bails */}
                    <rect x={PITCH_X + PITCH_W / 2 - 9} y={PITCH_Y + 9} width="18" height="2.5" fill="#f5f5f5" rx="1" />

                    {/* Bowler's end crease (BOTTOM) */}
                    <line x1={PITCH_X + 20} y1={PITCH_Y + PITCH_H - 24}
                        x2={PITCH_X + PITCH_W - 20} y2={PITCH_Y + PITCH_H - 24}
                        stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                    {[-6, 0, 6].map((ox, i) => (
                        <rect key={`sb-${i}`}
                            x={PITCH_X + PITCH_W / 2 + ox - 1} y={PITCH_Y + PITCH_H - 22}
                            width="2" height="10" fill="rgba(255,255,255,0.4)" rx="0.5"
                        />
                    ))}

                    {/* Line zone labels at bottom */}
                    {LINE_ZONES.map(z => {
                        const cx = PITCH_X + ((z.xMin + z.xMax) / 2) * PITCH_W;
                        return (
                            <text key={`ll-${z.id}`} x={cx} y={PITCH_Y + PITCH_H + 14}
                                textAnchor="middle" fill="rgba(255,255,255,0.4)"
                                fontSize="6" fontWeight="700" fontFamily="Inter, sans-serif"
                                className="pitchmap-zone-text"
                            >
                                {z.id === "off_stump" ? "OFF" :
                                    z.id === "middle_stump" ? "MID" :
                                        z.id === "leg_stump" ? "LEG" :
                                            z.id === "outside_off" ? "O.Off" :
                                                z.id === "outside_leg" ? "O.Leg" :
                                                    z.id === "wide_outside_off" ? "W" :
                                                        z.id === "wide_outside_leg" ? "W" : ""}
                            </text>
                        );
                    })}

                    {/* Hover crosshair */}
                    {hoverPos && (
                        <g className="pitchmap-crosshair">
                            <line x1={hoverPos.x} y1={PITCH_Y} x2={hoverPos.x} y2={PITCH_Y + PITCH_H}
                                stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
                            <line x1={PITCH_X} y1={hoverPos.y} x2={PITCH_X + PITCH_W} y2={hoverPos.y}
                                stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
                        </g>
                    )}

                    {/* Previous ball dots */}
                    {displayBalls.map((b, i) => {
                        const bx = b.pitchX != null ? PITCH_X + (b.pitchX / 100) * PITCH_W : lineToX(b.line);
                        const by = b.pitchY != null ? PITCH_Y + (b.pitchY / 100) * PITCH_H : lengthToY(b.length);
                        const color = getDotColor(b.outcome || { runs: b.runs || 0, wicket: b.isWicket });
                        const stroke = getDotStroke(b.outcome || { runs: b.runs || 0, wicket: b.isWicket });
                        return (
                            <g key={b.ballId || i} filter="url(#pm-dot-shadow)">
                                <circle cx={bx} cy={by} r={7} fill={color} stroke={stroke}
                                    strokeWidth="1.5" opacity="0.92" className="pitchmap-dot" />
                                <text x={bx} y={by + 0.5} textAnchor="middle" dominantBaseline="central"
                                    fill={b.outcome?.wicket || b.isWicket ? "white" : "#1e293b"}
                                    fontSize="7" fontWeight="900" fontFamily="Inter, sans-serif"
                                >
                                    {b.outcome?.wicket || b.isWicket ? "W" :
                                        (b.outcome?.runs ?? b.runs) === 0 ? "•" :
                                            String(b.outcome?.runs ?? b.runs)}
                                </text>
                            </g>
                        );
                    })}

                    {/* Current selection marker */}
                    {clickPos && (
                        <g filter="url(#pm-dot-shadow)">
                            <circle cx={clickPos.x} cy={clickPos.y} r={9}
                                fill="#ff6b35" stroke="white" strokeWidth="2" opacity="0.95"
                                className="pitchmap-active-dot"
                            />
                            <circle cx={clickPos.x} cy={clickPos.y} r={14}
                                fill="none" stroke="#ff6b35" strokeWidth="1.5" opacity="0.4"
                                className="pitchmap-active-ring"
                            />
                        </g>
                    )}

                    {/* Click ripple */}
                    {ripple && (
                        <circle key={ripple.key} cx={ripple.x} cy={ripple.y} r="5"
                            fill="rgba(255,107,53,0.5)" className="pitchmap-ripple"
                        >
                            <animate attributeName="r" from="5" to="30" dur="0.5s" fill="freeze" />
                            <animate attributeName="opacity" from="0.5" to="0" dur="0.5s" fill="freeze" />
                        </circle>
                    )}
                </svg>

                {/* Right labels (distance markers) */}
                <div className="pitchmap-labels-right">
                    {LENGTH_ZONES.map(z => (
                        <div key={z.id} className="pitchmap-dist-label" style={{
                            top: `${(z.yMin + z.yMax) / 2 * 100}%`,
                        }}>
                            <span className="pitchmap-dist-val">{z.dist}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Hover tooltip */}
            {hoverPos && (
                <div className="pitchmap-hover-tip">
                    {hoverLengthLabel} · {hoverLineLabel}
                </div>
            )}

            {/* Dropdowns: Line / Length / Shot Type */}
            <div className="pitchmap-controls">
                <div className="pitchmap-dropdown-row">
                    <div className="pitchmap-dropdown-group">
                        <label className="pitchmap-label">LINE</label>
                        <select value={selectedLine} onChange={e => handleLineChange(e.target.value)}
                            className="pitchmap-select">
                            <option value="">Select Line</option>
                            {LINE_ZONES.map(z => (
                                <option key={z.id} value={z.id}>{z.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="pitchmap-dropdown-group">
                        <label className="pitchmap-label">LENGTH</label>
                        <select value={selectedLength} onChange={e => handleLengthChange(e.target.value)}
                            className="pitchmap-select">
                            <option value="">Select Length</option>
                            {LENGTH_ZONES.map(z => (
                                <option key={z.id} value={z.id}>{z.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="pitchmap-dropdown-group pitchmap-shot-group">
                    <label className="pitchmap-label">SHOT TYPE</label>
                    <select value={selectedShot} onChange={e => setSelectedShot(e.target.value)}
                        className="pitchmap-select">
                        <option value="">Select Shot</option>
                        {SHOT_TYPES.map(s => (
                            <option key={s} value={s.toLowerCase().replace(/[\s\/]/g, '_')}>{s}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Legend */}
            <div className="pitchmap-legend">
                {[
                    { color: "#f1f5f9", border: "#94a3b8", label: "Dot" },
                    { color: "#cbd5e1", border: "#94a3b8", label: "1-3 Runs" },
                    { color: "#84cc16", border: "#4d7c0f", label: "FOUR" },
                    { color: "#3b82f6", border: "#1d4ed8", label: "SIX" },
                    { color: "#ff2d78", border: "#be185d", label: "Wicket" },
                ].map(item => (
                    <div key={item.label} className="pitchmap-legend-item">
                        <span className="pitchmap-legend-dot"
                            style={{ background: item.color, borderColor: item.border }} />
                        <span className="pitchmap-legend-text">{item.label}</span>
                    </div>
                ))}
            </div>

            {/* Selected info bar */}
            {(selectedLine || selectedLength) && (
                <div className="pitchmap-info-bar">
                    <div className="pitchmap-info-row">
                        {selectedLine && (
                            <span className="pitchmap-info-tag pitchmap-info-line">
                                {LINE_ZONES.find(z => z.id === selectedLine)?.label}
                            </span>
                        )}
                        {selectedLength && (
                            <span className="pitchmap-info-tag pitchmap-info-length">
                                {LENGTH_ZONES.find(z => z.id === selectedLength)?.label}
                            </span>
                        )}
                        {selectedShot && (
                            <span className="pitchmap-info-tag pitchmap-info-shot">
                                {SHOT_TYPES.find(s => s.toLowerCase().replace(/[\s\/]/g, '_') === selectedShot) || selectedShot}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Export helpers for parent components
export { LINE_ZONES, LENGTH_ZONES, SHOT_TYPES, getDotColor, lineToX, lengthToY };
