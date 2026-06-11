import React from 'react';

const BoundaryMeter = ({ stats }) => {
    const { sixes = 0, fours = 0, mostSixes = [], mostFours = [] } = stats;

    return (
        <div className="bg-cric-card rounded-2xl shadow-sm border border-cric-border overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
                <h3 className="text-lg font-black uppercase tracking-tight">Boundary Meter</h3>
            </div>

            <div className="grid grid-cols-2 border-b border-cric-border">
                <div className="p-4 text-center border-r border-cric-border">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-2xl">💥</span>
                        <span className="text-xs font-bold text-cric-muted uppercase">6s</span>
                    </div>
                    <p className="text-4xl font-black text-purple-600">{sixes}</p>
                </div>
                <div className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-2xl">🏏</span>
                        <span className="text-xs font-bold text-cric-muted uppercase">4s</span>
                    </div>
                    <p className="text-4xl font-black text-pink-600">{fours}</p>
                </div>
            </div>

            {sixes === 0 && fours === 0 && mostSixes.length === 0 && mostFours.length === 0 && (
                <div className="p-6 text-center">
                    <p className="text-xs font-bold text-cric-muted uppercase">No boundaries recorded yet</p>
                </div>
            )}

            {mostSixes.length > 0 && (
                <div className="p-4 border-b border-cric-border">
                    <h4 className="text-xs font-black text-cric-muted uppercase mb-3">Most 6s</h4>
                    <div className="space-y-2">
                        {mostSixes.slice(0, 5).map((player, idx) => (
                            <div key={player.playerId} className="flex items-center justify-between p-2 bg-cric-bg rounded-lg">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-cric-muted w-6">#{idx + 1}</span>
                                    <div>
                                        <p className="text-sm font-bold text-cric-text">{player.name}</p>
                                        <p className="text-[10px] text-cric-muted">{player.team}</p>
                                    </div>
                                </div>
                                <span className="text-lg font-black text-purple-600">{player.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {mostFours.length > 0 && (
                <div className="p-4">
                    <h4 className="text-xs font-black text-cric-muted uppercase mb-3">Most 4s</h4>
                    <div className="space-y-2">
                        {mostFours.slice(0, 5).map((player, idx) => (
                            <div key={player.playerId} className="flex items-center justify-between p-2 bg-cric-bg rounded-lg">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-cric-muted w-6">#{idx + 1}</span>
                                    <div>
                                        <p className="text-sm font-bold text-cric-text">{player.name}</p>
                                        <p className="text-[10px] text-cric-muted">{player.team}</p>
                                    </div>
                                </div>
                                <span className="text-lg font-black text-pink-600">{player.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BoundaryMeter;
