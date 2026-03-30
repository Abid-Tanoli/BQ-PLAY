import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { getStoredUser, logout as doLogout } from "../pages/auth/auth";

export default function PointsTable() {
  const [table, setTable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const user = getStoredUser();
    setAuthUser(user);

    // Fetch points table from tournament endpoint
    // First fetch tournaments to get the active one, then fetch points table
    const fetchPointsTable = async () => {
      try {
        // Try to get active tournament
        const tournamentsRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/tournaments`);
        const tournaments = await tournamentsRes.json();

        if (Array.isArray(tournaments) && tournaments.length > 0) {
          // Use first tournament (or find active one)
          const activeTournament = tournaments[0];
          const pointsRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/tournaments/${activeTournament._id}/points-table`);
          const data = await pointsRes.json();
          setTable(Array.isArray(data) ? data : []);
        } else {
          setTable([]);
        }
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch points table:", err);
        setLoading(false);
        setTable([]);
      }
    };

    fetchPointsTable();
  }, []);

  const handleLogout = () => { doLogout(); setAuthUser(null); };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <Header
        user={authUser}
        onShowLogin={() => { }}
        onShowRegister={() => { }}
        onLogout={handleLogout}
      />

      {/* Hero Section */}
      <div className="bg-[#031d44] text-white py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full -mr-48 -mt-48 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <h1 className="text-5xl font-black uppercase tracking-tighter italic mb-4">Standings</h1>
          <p className="text-blue-200/60 font-black uppercase tracking-widest text-sm">Official League Points Table • Road to the Finals</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Fetching Standings...</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-[#031d44] text-white">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Rank</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Franchise</th>
                  <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest text-center">Played</th>
                  <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest text-center text-green-400">Won</th>
                  <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest text-center text-red-400">Lost</th>
                  <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest text-center">NRR</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-center bg-blue-600/20">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 italic">
                {table.length > 0 ? table.map((t, i) => (
                  <tr key={t._id || t.team?._id} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-6 font-black text-slate-200 text-xl group-hover:text-blue-600 transition-colors">#{i + 1}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2">
                          {t.team?.logo ? <img src={t.team.logo} className="w-full h-full object-contain" /> : <div className="w-full h-full bg-[#031d44] rounded-lg flex items-center justify-center font-black text-white text-xs">{t.team?.name?.charAt(0)}</div>}
                        </div>
                        <span className="font-black text-slate-800 uppercase tracking-tighter italic">{t.team?.name || t.team}</span>
                      </div>
                    </td>
                    <td className="px-4 py-6 font-bold text-slate-600 text-center">{t.matchesPlayed || t.played || 0}</td>
                    <td className="px-4 py-6 font-black text-green-600 text-center">{t.won || 0}</td>
                    <td className="px-4 py-6 font-black text-red-600 text-center">{t.lost || 0}</td>
                    <td className="px-4 py-6 font-bold text-slate-400 text-center italic">{t.netRunRate || t.nrr || "0.000"}</td>
                    <td className="px-8 py-6 font-black text-blue-600 text-2xl text-center bg-blue-50/50">{t.points || 0}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="px-8 py-32 text-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <h4 className="text-xl font-black text-[#031d44] uppercase tracking-tighter italic">Standings TBD</h4>
                      <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-2">Season officially starting soon. Stay tuned for data.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <h4 className="text-sm font-black text-amber-800 uppercase tracking-widest mb-1 italic">Qualification System</h4>
            <p className="text-amber-700/60 text-xs uppercase font-black uppercase tracking-tighter leading-relaxed">The Top Four (4) franchises at the end of the regular season will qualify for the knockouts. In case of tied points, Net Run Rate (NRR) will be the primary tie-breaker.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
