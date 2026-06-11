import React, { useState, useEffect } from "react";
import api from "../services/api";

const CATEGORY_COLORS = {
  attacking: { bg: "bg-orange-500", text: "text-orange-500", border: "border-orange-500", label: "ATTACKING" },
  defensive: { bg: "bg-blue-500", text: "text-blue-500", border: "border-blue-500", label: "DEFENSIVE" },
  glancing: { bg: "bg-green-500", text: "text-green-500", border: "border-green-500", label: "GLANCING" },
  unorthodox: { bg: "bg-purple-500", text: "text-purple-500", border: "border-purple-500", label: "UNORTHODOX" },
};

const shotToId = (shot) => shot.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

export default function ShotTypePicker({ isOpen, onClose, onSelect, currentShot }) {
  const [shots, setShots] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [activeTab, setActiveTab] = useState("attacking");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    api.get("/shots")
      .then(res => {
        const data = res.data;
        if (data.grouped) {
          setGrouped(data.grouped);
        } else if (data.shots) {
          const g = { attacking: [], defensive: [], glancing: [], unorthodox: [] };
          data.shots.forEach(s => {
            if (g[s.category]) g[s.category].push(s);
            else g.glancing.push(s);
          });
          setGrouped(g);
        }
        setShots(data.shots || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const categoryOrder = ["attacking", "defensive", "glancing", "unorthodox"];
  const tabs = categoryOrder.filter(cat => grouped[cat]?.length > 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-cric-card w-full max-w-4xl max-h-[85vh] rounded-[2rem] border border-cric-border shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-cric-card z-10 border-b border-cric-border/30 px-8 pt-6 pb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-cric-text uppercase tracking-tight">SELECT SHOT TYPE</h2>
            <p className="text-[9px] font-black text-cric-muted uppercase tracking-[0.3em] mt-1">
              Choose the batting shot played
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-cric-bg hover:bg-red-500 transition-all flex items-center justify-center text-cric-muted hover:text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="p-20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-cric-accent border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="px-8 pt-6 flex gap-2 border-b border-cric-border/20">
              {tabs.map(cat => {
                const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS.attacking;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest rounded-t-xl transition-all ${
                      activeTab === cat
                        ? `${colors.bg} text-white shadow-lg`
                        : "text-cric-muted hover:text-cric-text bg-black/5 dark:bg-white/5"
                    }`}
                  >
                    {colors.label} ({grouped[cat]?.length || 0})
                  </button>
                );
              })}
            </div>

            <div className="p-8 overflow-y-auto max-h-[calc(85vh-220px)] no-scrollbar">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(grouped[activeTab] || []).map(shot => {
                  const shotId = shotToId(shot.name);
                  const isSelected = currentShot && shotToId(currentShot) === shotId;
                  const colors = CATEGORY_COLORS[shot.category] || CATEGORY_COLORS.attacking;

                  return (
                    <button
                      key={shot._id || shotId}
                      onClick={() => { onSelect(shot.name); onClose(); }}
                      className={`relative p-4 rounded-2xl text-left transition-all border-2 flex flex-col gap-2 ${
                        isSelected
                          ? `bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/30`
                          : `bg-cric-card text-cric-text border-cric-border/40 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/10`
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center">
                          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${colors.bg}`} />
                        <h4 className={`text-sm font-black uppercase leading-tight ${isSelected ? "text-white" : "text-cric-text"}`}>
                          {shot.name}
                        </h4>
                      </div>
                      {shot.description && (
                        <p className={`text-[10px] leading-relaxed ${isSelected ? "text-white/80" : "text-cric-muted"}`}>
                          {shot.description}
                        </p>
                      )}
                      {shot.groundZone && (
                        <span className={`inline-block self-start mt-1 text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-wider ${
                          isSelected ? "bg-white/20 text-white" : "bg-black/10 text-cric-muted"
                        }`}>
                          {shot.groundZone.replace(/-/g, " ")}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        <div className="sticky bottom-0 bg-cric-card border-t border-cric-border/30 px-8 py-4 flex justify-between items-center">
          <p className="text-[9px] font-black text-cric-muted uppercase tracking-[0.3em]">
            Click a shot to select
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-orange-500 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-orange-600 transition-all"
          >
            USE THIS SHOT
          </button>
        </div>
      </div>
    </div>
  );
}
