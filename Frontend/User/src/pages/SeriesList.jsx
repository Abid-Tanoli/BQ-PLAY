import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import Header from "../components/Header";

export default function SeriesList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => { loadEvents(); }, []);

  const loadEvents = async () => {
    try {
      const res = await api.get("/events");
      setEvents(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const filtered = filter ? events.filter(e => e.eventType === filter) : events;
  const types = ["single-match", "series", "tri-series", "tournament", "world-cup", "champions-trophy", "league"];

  return (
    <div className="bg-[#f0f2f5] min-h-screen">
      <Header />
      <div className="bg-gradient-to-r from-[#031d44] via-[#0a2d5e] to-[#031d44] text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Series & Tournaments</h1>
          <p className="text-blue-200 text-sm">Browse all cricket events, series and championships</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
          <button onClick={() => setFilter("")} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${!filter ? "bg-[#031d44] text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>All ({events.length})</button>
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap capitalize ${filter === t ? "bg-[#031d44] text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              {t.replace('-', ' ')} ({events.filter(e => e.eventType === t).length})
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(ev => (
              <Link key={ev._id} to={`/series/${ev.slug || ev._id}`} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 hover:shadow-xl transition-all group">
                <div className="aspect-[4/3] bg-gradient-to-br from-[#031d44] to-blue-700 flex items-center justify-center p-6 relative">
                  {ev.logo ? (
                    <img src={ev.logo} alt={ev.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-6xl font-black text-white/80">{ev.name?.charAt(0)}</span>
                  )}
                  <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${ev.status === "live" ? "bg-red-600 text-white animate-pulse" : ev.status === "completed" ? "bg-green-600 text-white" : "bg-blue-500/30 text-blue-200"}`}>{ev.status}</span>
                </div>
                <div className="p-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">{ev.eventType?.replace('-', ' ')}</p>
                  <h3 className="text-base font-black text-[#031d44] uppercase tracking-tight truncate group-hover:text-blue-600 transition-colors">{ev.name}</h3>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 font-bold">
                    <span>{ev.teams?.length || 0} Teams</span>
                    <span>•</span>
                    <span>{ev.matches?.length || 0} Matches</span>
                    {ev.startDate && <><span>•</span><span>{new Date(ev.startDate).toLocaleDateString()}</span></>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center border border-slate-200">
            <span className="text-5xl block mb-4">🏏</span>
            <h4 className="text-xl font-black text-[#031d44] uppercase">No Events Found</h4>
            <p className="text-slate-500 text-sm mt-2">Check back later for upcoming series and tournaments</p>
          </div>
        )}
      </div>
    </div>
  );
}
