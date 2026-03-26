import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { getStoredUser, logout as doLogout } from "../pages/auth/auth";

export default function Rankings() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const user = getStoredUser();
    setAuthUser(user);
    
    // Fetch rankings
    fetch(`${import.meta.env.VITE_API_URL}/players/ranking`)
      .then(res => res.json())
      .then(data => {
        setPlayers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch rankings:", err);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => { doLogout(); setAuthUser(null); };

  // Helper to get top players
  const topThree = players.slice(0, 3);
  const rest = players.slice(3);

  const getRankColor = (rank) => {
    if (rank === 1) return "from-amber-400 to-yellow-600";
    if (rank === 2) return "from-slate-300 to-slate-500";
    if (rank === 3) return "from-amber-600 to-amber-800";
    return "from-blue-600 to-blue-800";
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <Header
        user={authUser}
        onShowLogin={() => {}}
        onShowRegister={() => {}}
        onLogout={handleLogout}
      />

      {/* Hero Section */}
      <div className="bg-[#031d44] text-white py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full -mr-48 -mt-48 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <h1 className="text-5xl font-black uppercase tracking-tighter italic mb-4">Elite Leaderboard</h1>
          <p className="text-blue-200/60 font-black uppercase tracking-widest text-sm">Real-time Global Rankings based on Career Performance</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
             <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
             <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Calibrating Standings...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Podium for Top 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
               {topThree[1] && (
                 <div className="order-2 md:order-1 bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 text-center relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                    <div className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-r ${getRankColor(2)}`} />
                    <div className="text-4xl font-black text-slate-200 mb-4 italic">#2</div>
                    <div className="w-24 h-24 mx-auto rounded-3xl bg-slate-50 border border-slate-100 p-2 mb-4 group-hover:scale-110 transition-transform">
                       {topThree[1].imageUrl ? <img src={topThree[1].imageUrl} className="w-full h-full object-cover rounded-2xl" /> : <div className="w-full h-full bg-slate-200 rounded-2xl flex items-center justify-center font-black text-slate-400">{topThree[1].name?.charAt(0)}</div>}
                    </div>
                    <h3 className="text-xl font-black text-[#031d44] uppercase tracking-tighter italic mb-1">{topThree[1].name}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{topThree[1].role || "Player"}</p>
                    <div className="bg-slate-50 rounded-2xl py-3 px-6 inline-block border border-slate-100">
                       <span className="text-2xl font-black text-slate-800">{topThree[1].rankingPoints?.toFixed(1)}</span>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Pts</span>
                    </div>
                 </div>
               )}

               {topThree[0] && (
                 <div className="order-1 md:order-2 bg-white rounded-[3rem] p-10 shadow-2xl border-2 border-amber-400/20 text-center relative overflow-hidden transform md:scale-110 z-10 group hover:shadow-amber-400/10 transition-all duration-500">
                    <div className={`absolute top-0 inset-x-0 h-3 bg-gradient-to-r ${getRankColor(1)}`} />
                    <div className="absolute top-4 right-4 animate-bounce">👑</div>
                    <div className="text-6xl font-black text-amber-100 mb-4 italic">#1</div>
                    <div className="w-32 h-32 mx-auto rounded-[2rem] bg-amber-50 border-2 border-amber-100 p-2 mb-6 group-hover:rotate-3 transition-transform">
                       {topThree[0].imageUrl ? <img src={topThree[0].imageUrl} className="w-full h-full object-cover rounded-[1.5rem]" /> : <div className="w-full h-full bg-amber-200 rounded-[1.5rem] flex items-center justify-center font-black text-amber-600 text-2xl">{topThree[0].name?.charAt(0)}</div>}
                    </div>
                    <h3 className="text-2xl font-black text-[#031d44] uppercase tracking-tighter italic mb-1">{topThree[0].name}</h3>
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-6 px-4 py-1 bg-amber-50 rounded-full inline-block">World Leader</p>
                    <div className="bg-amber-50 rounded-2xl py-4 px-8 inline-block border border-amber-100">
                       <span className="text-3xl font-black text-amber-600">{topThree[0].rankingPoints?.toFixed(1)}</span>
                       <span className="text-xs font-black text-amber-400 uppercase tracking-widest ml-2 italic">Pts</span>
                    </div>
                 </div>
               )}

               {topThree[2] && (
                 <div className="order-3 md:order-3 bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 text-center relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                    <div className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-r ${getRankColor(3)}`} />
                    <div className="text-4xl font-black text-slate-200 mb-4 italic">#3</div>
                    <div className="w-24 h-24 mx-auto rounded-3xl bg-slate-50 border border-slate-100 p-2 mb-4 group-hover:scale-110 transition-transform">
                        {topThree[2].imageUrl ? <img src={topThree[2].imageUrl} className="w-full h-full object-cover rounded-2xl" /> : <div className="w-full h-full bg-slate-200 rounded-2xl flex items-center justify-center font-black text-slate-400">{topThree[2].name?.charAt(0)}</div>}
                    </div>
                    <h3 className="text-xl font-black text-[#031d44] uppercase tracking-tighter italic mb-1">{topThree[2].name}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{topThree[2].role || "Player"}</p>
                    <div className="bg-slate-50 rounded-2xl py-3 px-6 inline-block border border-slate-100">
                       <span className="text-2xl font-black text-slate-800">{topThree[2].rankingPoints?.toFixed(1)}</span>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Pts</span>
                    </div>
                 </div>
               )}
            </div>

            {/* List for the rest */}
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
               <div className="bg-[#031d44] px-8 py-6 flex justify-between items-center text-white">
                  <h3 className="font-black uppercase tracking-widest text-xs">Global Registry • 4-100</h3>
                  <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-blue-300/40">
                     <span>Rank</span>
                     <span className="w-48">Personnel</span>
                     <span className="w-24 text-right">Rating</span>
                  </div>
               </div>
               
               <div className="divide-y divide-slate-50">
                  {rest.map((p, i) => (
                    <div key={p._id} className="p-6 hover:bg-slate-50 flex items-center justify-between transition-colors group cursor-pointer">
                       <div className="flex items-center gap-8 flex-1">
                          <span className="text-xl font-black text-slate-200 italic min-w-[30px] group-hover:text-blue-600 transition-colors">#{i+4}</span>
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-400 text-xs italic">
                                {p.name?.charAt(0)}
                             </div>
                             <div>
                                <h4 className="font-black text-slate-800 uppercase tracking-tighter italic leading-tight">{p.name}</h4>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{p.role || "Prospect"}</p>
                             </div>
                          </div>
                       </div>
                       
                       <div className="text-right">
                          <span className="text-lg font-black text-[#031d44]">{p.rankingPoints?.toFixed(1)}</span>
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-2 italic">Pts</span>
                       </div>
                    </div>
                  ))}
                  {rest.length === 0 && (
                    <div className="p-12 text-center text-slate-400 font-black uppercase tracking-widest text-[10px]">
                       Top 3 dominates the leaderboard. No further personnel recorded.
                    </div>
                  )}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
