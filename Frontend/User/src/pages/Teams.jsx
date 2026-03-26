import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { api } from "../services/api"; // Assuming api service exists or just use fetch
import { initAuthFromStorage, getStoredUser, logout as doLogout } from "../pages/auth/auth";

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const user = getStoredUser();
    setAuthUser(user);
    
    // Fetch teams
    fetch(`${import.meta.env.VITE_API_URL}/teams`)
      .then(res => res.json())
      .then(data => {
        setTeams(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch teams:", err);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => { doLogout(); setAuthUser(null); };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <Header
        user={authUser}
        onShowLogin={() => {}} // Handle these if needed
        onShowRegister={() => {}}
        onLogout={handleLogout}
      />

      {/* Hero Section */}
      <div className="bg-[#031d44] text-white py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full -mr-48 -mt-48 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <h1 className="text-5xl font-black uppercase tracking-tighter italic mb-4">Franchises</h1>
          <p className="text-blue-200/60 font-black uppercase tracking-widest text-sm">Official Squads and Team Profiles of the League</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
             <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
             <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Loading Franchises...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teams.map((team) => (
              <div key={team._id} className="group bg-white rounded-[2rem] shadow-sm hover:shadow-2xl border border-slate-100 overflow-hidden transition-all duration-500">
                <div className="p-8">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center p-3 group-hover:scale-110 transition-transform duration-500">
                      {team.logo ? (
                        <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full bg-[#031d44] rounded-xl flex items-center justify-center font-black text-white text-2xl italic italic">
                          {team.shortName || team.name?.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#031d44] uppercase tracking-tighter italic leading-none mb-2">{team.name}</h3>
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider uppercase tracking-widest leading-none">
                        {team.shortName || "Franchise"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                     <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-3">
                        <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Total Players</span>
                        <span className="font-black text-slate-800">{team.players?.length || 0}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-3">
                        <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Owner</span>
                        <span className="font-black text-slate-800 italic">{team.ownername || "TBA"}</span>
                     </div>
                  </div>

                  {/* Player Avatars */}
                  <div className="flex -space-x-2 mb-8 overflow-hidden">
                    {team.players?.slice(0, 8).map((p, i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 grayscale group-hover:grayscale-0 transition-all duration-500">
                         {p.name?.charAt(0)}
                      </div>
                    ))}
                    {(team.players?.length || 0) > 8 && (
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-[#031d44] flex items-center justify-center text-[10px] font-black text-white">
                        +{(team.players?.length || 0) - 8}
                      </div>
                    )}
                  </div>

                  <Link 
                    to={`/players?team=${team._id}`}
                    className="block w-full py-4 bg-slate-50 group-hover:bg-[#031d44] group-hover:text-white text-[#031d44] text-center rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm"
                  >
                    View Roster Profile
                  </Link>
                </div>
              </div>
            ))}

            {teams.length === 0 && (
              <div className="col-span-full py-20 text-center">
                 <p className="text-slate-400 font-black uppercase tracking-widest text-xs italic">No franchises registered yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
