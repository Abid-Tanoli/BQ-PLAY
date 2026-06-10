import React from 'react';
import { SHOTS, SHOT_CATEGORIES } from '../data/shotsData';
import ShotDiagram from './ShotDiagram';

export default function ShotReferenceModal({ isOpen, onClose, onSelectShot }) {
  if (!isOpen) return null;

  const categories = Object.entries(SHOT_CATEGORIES);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="bg-cric-card w-full max-w-6xl max-h-[90vh] rounded-[3rem] border border-cric-border shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-cric-card z-10 border-b border-cric-border/30 px-10 pt-8 pb-6 flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-black font-raj italic uppercase tracking-tighter text-cric-text">
              Select Shot Type
            </h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">
              All Cricket Batting Shots • Categorized Grid
            </p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-full bg-black/10 hover:bg-red-500 transition-all flex items-center justify-center text-cric-text hover:text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)] no-scrollbar">
          <div className="space-y-10">
            {categories.map(([catKey, cat]) => {
              const catShots = SHOTS.filter(s => s.category === catKey);
              if (catShots.length === 0) return null;
              return (
                <div key={catKey}>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-1.5 h-8 rounded-full" style={{ background: cat.color }} />
                    <div>
                      <h3 className="text-xl font-black font-raj italic text-cric-text uppercase tracking-tight">{cat.label}</h3>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{cat.desc}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {catShots.map(shot => (
                      <div
                        key={shot.id}
                        className="group bg-black/[0.03] dark:bg-white/[0.03] border border-cric-border/50 rounded-2xl p-4 hover:border-cric-accent/40 hover:bg-cric-accent/[0.03] transition-all cursor-pointer"
                        onClick={() => { onSelectShot?.(shot); onClose(); }}
                      >
                        <div className="flex justify-center mb-2">
                          <ShotDiagram shot={shot} size={90} />
                        </div>
                        <h4 className="font-black text-sm text-cric-text text-center leading-tight uppercase">{shot.name}</h4>
                        <p className="text-[9px] text-slate-500 text-center mt-1.5 leading-relaxed">{shot.desc}</p>
                        <div className="flex items-center justify-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest"
                            style={{ background: `${cat.color}20`, color: cat.color }}>
                            {cat.label}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 pt-6 border-t border-cric-border/20 text-center">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">
              Tip: Click any shot to auto-select it for scoring
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
