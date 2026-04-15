import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { api } from "../services/api";
import { initAuthFromStorage, getStoredUser, logout as doLogout } from "../pages/auth/auth";

export default function InternationalTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const user = getStoredUser();
    setAuthUser(user);
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await api.get("/categories/teams/international");
      setTeams(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch international teams:", err);
      setLoading(false);
    }
  };

  const handleLogout = () => { doLogout(); setAuthUser(null); };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 text-slate-900 dark:text-white font-sans">
      <Header user={authUser} onLogout={handleLogout} />

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="flex items-center gap-4 mb-2">
            <Link to="/teams" className="text-blue-200 hover:text-white text-sm font-bold">← Back to Categories</Link>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">🌍 International Teams</h1>
          <p className="text-blue-200/60 font-black uppercase tracking-widest text-sm mt-2">National cricket teams from around the world</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teams.map((team) => (
              <div key={team._id} className="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                      {team.logo ? (
                        <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full bg-blue-600 rounded-lg flex items-center justify-center font-black text-white text-lg">
                          {team.shortName || team.name?.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">{team.name}</h3>
                      <span className="text-[9px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full uppercase">International</span>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm border-t pt-4">
                    <span className="text-slate-500">Players</span>
                    <span className="font-bold">{team.players?.length || 0}</span>
                  </div>

                  <Link to={`/players?team=${team._id}`} className="block mt-4 py-3 bg-slate-50 dark:bg-slate-700 group-hover:bg-blue-600 group-hover:text-white text-slate-800 dark:text-white text-center rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                    View Squad →
                  </Link>
                </div>
              </div>
            ))}

            {teams.length === 0 && (
              <div className="col-span-full text-center py-20 text-slate-400">
                <p className="font-black uppercase tracking-widest text-xs">No international teams registered yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
