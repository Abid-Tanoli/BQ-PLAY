import React from 'react';

const WagonWheel = ({ shots = [], playerName = "Batsman" }) => {
    // Shot placement data normalized to 400x400 SVG
    // Batsman position on 400x400 is approx (200, 320)
    const batsmanX = 200;
    const batsmanY = 320;

    const getColor = (runs) => {
        if (runs >= 6) return '#a855f7'; // Purple for 6s
        if (runs >= 4) return '#3b82f6'; // Blue for 4s
        if (runs > 0) return '#94a3b8';  // Slate for 1s, 2s, 3s
        return 'transparent';
    };

    const scoringShots = shots.filter(s => s.runs > 0);
    
    // Calculate stats
    const stats = scoringShots.reduce((acc, shot) => {
        acc.totalRuns += shot.runs;
        if (shot.runs === 4) acc.fours += 1;
        if (shot.runs === 6) acc.sixes += 1;
        
        // Split based on angle: positive is OFF, negative is ON/LEG
        // Based on fieldPositionMapper: long off = 20, long on = -15
        if (shot.angle >= 0) acc.offSide += shot.runs;
        else acc.legSide += shot.runs;
        
        return acc;
    }, { totalRuns: 0, fours: 0, sixes: 0, offSide: 0, legSide: 0 });

    return (
        <div className="bg-[#0d1b2a] dark:bg-[#020617] rounded-[2.5rem] p-8 shadow-2xl border border-slate-800/50 backdrop-blur-xl relative overflow-hidden fade-in-scale">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-[#ff6b35] text-[10px] font-black uppercase tracking-[0.4em] mb-1">
                        Statistical Analysis
                    </h3>
                    <h2 className="text-white text-2xl font-black italic tracking-tighter uppercase">
                        Wagon Wheel <span className="text-slate-500 font-normal not-italic mx-2">—</span> {playerName}
                    </h2>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-black text-white italic tracking-tighter">
                        {stats.totalRuns} <span className="text-xs text-slate-500 font-bold not-italic tracking-normal">RUNS</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {/* SVG Visualization */}
                <div className="relative aspect-square max-w-[360px] mx-auto group">
                    <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                        <defs>
                            <radialGradient id="fieldGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                <stop offset="0%" stopColor="#1a365d" />
                                <stop offset="100%" stopColor="#0d1b2a" />
                            </radialGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                                <feMerge>
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Outer Boundary */}
                        <circle cx="200" cy="200" r="195" fill="url(#fieldGrad)" stroke="#1e293b" strokeWidth="2" />
                        <circle cx="200" cy="200" r="198" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />

                        {/* Labels */}
                        <text x="200" y="30" textAnchor="middle" className="fill-slate-500 text-[10px] font-black uppercase tracking-widest">SIGHTSCREEN</text>
                        <text x="30" y="200" textAnchor="middle" transform="rotate(-90 30,200)" className="fill-slate-500 text-[10px] font-black uppercase tracking-widest">OFF SIDE</text>
                        <text x="370" y="200" textAnchor="middle" transform="rotate(90 370,200)" className="fill-slate-500 text-[10px] font-black uppercase tracking-widest">LEG SIDE</text>

                        {/* Inner Ring (30 Yard) */}
                        <circle cx="200" cy="200" r="110" fill="none" stroke="#ffffff08" strokeWidth="1" strokeDasharray="10 5" />

                        {/* Pitch */}
                        <rect x="188" y="140" width="24" height="120" fill="#cc9b6d20" rx="4" />
                        <rect x="190" y="145" width="20" height="110" fill="#cc9b6d40" rx="2" />

                        {/* Shots */}
                        {scoringShots.map((shot, idx) => {
                            // Convert polar coordinates (angle, distance) to Cartesian (x, y)
                            // distance: 0-100, angle: -180 to 180 (0 = straight)
                            // Boundary radius in SVG is 195
                            const angleRad = (shot.angle || 0) * (Math.PI / 180);
                            const distScale = (shot.distance || 0) / 100;
                            const r = distScale * 195;
                            
                            // Calculate tx, ty relative to batsman (200, 320)
                            // 0 degrees = straight up (dy = -r, dx = 0)
                            const tx = batsmanX + r * Math.sin(angleRad);
                            const ty = batsmanY - r * Math.cos(angleRad);
                            
                            const color = getColor(shot.runs);
                            
                            return (
                                <g key={idx} className="hover:opacity-100 opacity-80 transition-all duration-300">
                                    <line 
                                        x1={batsmanX} 
                                        y1={batsmanY} 
                                        x2={tx} 
                                        y2={ty} 
                                        stroke={color} 
                                        strokeWidth={shot.runs >= 4 ? 3 : 1} 
                                        strokeLinecap="round"
                                        className="draw-line-anim"
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                        filter={shot.runs >= 4 ? "url(#glow)" : ""}
                                    />
                                    {shot.runs >= 4 && (
                                        <circle 
                                            cx={tx} 
                                            cy={ty} 
                                            r={shot.runs === 6 ? 5 : 3.5} 
                                            fill={color} 
                                            className="animate-pulse"
                                            filter="url(#glow)"
                                        />
                                    )}
                                </g>
                            );
                        })}

                        {/* Batsman Marker */}
                        <circle cx={batsmanX} cy={batsmanY} r="8" fill="#ff6b35" filter="url(#glow)" />
                        <circle cx={batsmanX} cy={batsmanY} r="12" fill="none" stroke="#ff6b35" strokeWidth="1" className="animate-ping" style={{ animationDuration: '3s' }} />
                    </svg>
                </div>

                {/* Stats & Legend */}
                <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Off Side</div>
                            <div className="text-2xl font-black text-white italic">{stats.offSide} <span className="text-xs text-blue-400 not-italic">runs</span></div>
                            <div className="w-full h-1 bg-slate-800 rounded-full mt-2">
                                <div 
                                    className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                                    style={{ width: `${(stats.offSide / stats.totalRuns) * 100 || 0}%` }}
                                />
                            </div>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Leg Side</div>
                            <div className="text-2xl font-black text-white italic">{stats.legSide} <span className="text-xs text-purple-400 not-italic">runs</span></div>
                            <div className="w-full h-1 bg-slate-800 rounded-full mt-2">
                                <div 
                                    className="h-full bg-purple-500 rounded-full transition-all duration-1000" 
                                    style={{ width: `${(stats.legSide / stats.totalRuns) * 100 || 0}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-[#a855f7] shadow-[0_0_10px_#a855f7]"></div>
                                <span className="text-sm font-bold text-slate-300">Sixes</span>
                            </div>
                            <span className="text-lg font-black text-white">{stats.sixes}</span>
                        </div>
                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-[#3b82f6] shadow-[0_0_10px_#3b82f6]"></div>
                                <span className="text-sm font-bold text-slate-300">Fours</span>
                            </div>
                            <span className="text-lg font-black text-white">{stats.fours}</span>
                        </div>
                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-[#94a3b8]"></div>
                                <span className="text-sm font-bold text-slate-300">Singles/Others</span>
                            </div>
                            <span className="text-lg font-black text-white">{scoringShots.length - stats.fours - stats.sixes}</span>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium uppercase tracking-wider">
                            Visualization based on precise shot placement data collected via Scorer Pro Admin. Lines represent strike trajectory from pitch to field zone.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WagonWheel;
