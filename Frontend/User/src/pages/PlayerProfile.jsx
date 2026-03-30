import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";
import Header from "../components/Header";
import { getStoredUser, logout as doLogout } from "../pages/auth/auth";

export default function PlayerProfile() {
  const { playerId } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const user = getStoredUser();
    setAuthUser(user);

    api.get(`/players/${playerId}`)
      .then(res => {
        setPlayer(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch player:", err);
        setLoading(false);
      });
  }, [playerId]);

  const handleLogout = () => { doLogout(); setAuthUser(null); };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 font-black uppercase tracking-widest text-sm">Player not found</p>
          <Link to="/players" className="text-blue-600 hover:underline text-sm mt-2 block">Back to Players</Link>
        </div>
      </div>
    );
  }

  const stats = player.stats || {};
  const playingRole = player.playingRole || player.role || 'Player';
  const battingStyle = player.battingStyle || 'Right-hand bat';
  const bowlingStyle = player.bowlingStyle || 'Right-arm medium';

  // Calculate career stats
  const battingAverage = stats.innings > 0 && (stats.innings - stats.notOuts) > 0
    ? (stats.runs / (stats.innings - stats.notOuts)).toFixed(2)
    : '0.00';

  const bowlingAverage = stats.wickets > 0
    ? ((stats.runsConceded || 0) / stats.wickets).toFixed(2)
    : '0.00';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <Header
        user={authUser}
        onShowLogin={() => { }}
        onShowRegister={() => { }}
        onLogout={handleLogout}
      />

      {/* Player Header - Cricinfo Style */}
      <div className="bg-[#031d44] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full -mr-48 -mt-48 blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 py-8 relative">
          <Link to="/players" className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-bold">Back to Players</span>
          </Link>

          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Player Image */}
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-3xl bg-white/10 border-2 border-white/20 overflow-hidden flex-shrink-0">
              {player.imageUrl ? (
                <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                  <span className="text-6xl font-black text-white/30">{player.name?.charAt(0)}</span>
                </div>
              )}
            </div>

            {/* Player Info */}
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic mb-2">
                {player.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="px-4 py-1.5 bg-red-600 text-white rounded-full text-xs font-black uppercase tracking-widest">
                  {playingRole}
                </span>
                {player.team && (
                  <span className="px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full text-xs font-bold uppercase tracking-widest">
                    {player.team.name}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <p className="text-[10px] font-black uppercase text-blue-200 tracking-widest mb-1">Batting</p>
                  <p className="text-sm font-bold">{battingStyle}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <p className="text-[10px] font-black uppercase text-blue-200 tracking-widest mb-1">Bowling</p>
                  <p className="text-sm font-bold">{bowlingStyle}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <p className="text-[10px] font-black uppercase text-blue-200 tracking-widest mb-1">Born</p>
                  <p className="text-sm font-bold">{player.age || 'N/A'}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <p className="text-[10px] font-black uppercase text-blue-200 tracking-widest mb-1">Teams</p>
                  <p className="text-sm font-bold">{player.team?.name || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
              <p className="text-4xl font-black text-white mb-1">{stats.runs || 0}</p>
              <p className="text-[10px] font-black uppercase text-blue-200 tracking-widest">Runs</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
              <p className="text-4xl font-black text-white mb-1">{stats.wickets || 0}</p>
              <p className="text-[10px] font-black uppercase text-blue-200 tracking-widest">Wickets</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
              <p className="text-4xl font-black text-white mb-1">{stats.strikeRate || '0.00'}</p>
              <p className="text-[10px] font-black uppercase text-blue-200 tracking-widest">Strike Rate</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
              <p className="text-4xl font-black text-white mb-1">{stats.economy || '0.00'}</p>
              <p className="text-[10px] font-black uppercase text-blue-200 tracking-widest">Economy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'batting', label: 'Batting' },
              { key: 'bowling', label: 'Bowling' },
              { key: 'matches', label: 'Matches' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 text-sm font-black uppercase tracking-widest border-b-2 transition-colors ${activeTab === tab.key
                    ? 'border-red-600 text-[#031d44]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Batting Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-[#031d44] px-6 py-4">
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Batting Career</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-600">Matches</span>
                    <span className="text-lg font-black text-[#031d44]">{stats.matches || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-600">Innings</span>
                    <span className="text-lg font-black text-[#031d44]">{stats.innings || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-600">Runs</span>
                    <span className="text-lg font-black text-[#031d44]">{stats.runs || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-600">Average</span>
                    <span className="text-lg font-black text-[#031d44]">{battingAverage}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-600">Strike Rate</span>
                    <span className="text-lg font-black text-[#031d44]">{stats.strikeRate || '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-600">High Score</span>
                    <span className="text-lg font-black text-[#031d44]">{stats.highScore || '0'}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-600">50s / 100s</span>
                    <span className="text-lg font-black text-[#031d44]">{stats.fifties || 0} / {stats.hundreds || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-sm font-bold text-slate-600">4s / 6s</span>
                    <span className="text-lg font-black text-[#031d44]">{stats.fours || 0} / {stats.sixes || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bowling Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-[#031d44] px-6 py-4">
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Bowling Career</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-600">Wickets</span>
                    <span className="text-lg font-black text-[#031d44]">{stats.wickets || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-600">Average</span>
                    <span className="text-lg font-black text-[#031d44]">{bowlingAverage}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-600">Economy</span>
                    <span className="text-lg font-black text-[#031d44]">{stats.economy || '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-600">Best Bowling</span>
                    <span className="text-lg font-black text-[#031d44]">{stats.bestBowling || '0/0'}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-600">4 Wicket Hauls</span>
                    <span className="text-lg font-black text-[#031d44]">{stats.fourWickets || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-600">5 Wicket Hauls</span>
                    <span className="text-lg font-black text-[#031d44]">{stats.fiveWickets || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-sm font-bold text-slate-600">Dot Balls</span>
                    <span className="text-lg font-black text-[#031d44]">{stats.dotBalls || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'batting' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-[#031d44] px-6 py-4">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Detailed Batting Stats</h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                      <th className="py-3">Format</th>
                      <th className="py-3 text-center">Mat</th>
                      <th className="py-3 text-center">Inns</th>
                      <th className="py-3 text-center">NO</th>
                      <th className="py-3 text-center">Runs</th>
                      <th className="py-3 text-center">HS</th>
                      <th className="py-3 text-center">Ave</th>
                      <th className="py-3 text-center">SR</th>
                      <th className="py-3 text-center">100s</th>
                      <th className="py-3 text-center">50s</th>
                      <th className="py-3 text-center">4s</th>
                      <th className="py-3 text-center">6s</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <tr className="hover:bg-slate-50">
                      <td className="py-4 font-bold text-[#031d44]">T20</td>
                      <td className="py-4 text-center font-bold text-slate-600">{stats.matches || 0}</td>
                      <td className="py-4 text-center font-bold text-slate-600">{stats.innings || 0}</td>
                      <td className="py-4 text-center font-bold text-slate-600">{stats.notOuts || 0}</td>
                      <td className="py-4 text-center font-black text-[#031d44]">{stats.runs || 0}</td>
                      <td className="py-4 text-center font-bold text-slate-600">{stats.highScore || '0'}</td>
                      <td className="py-4 text-center font-bold text-slate-600">{battingAverage}</td>
                      <td className="py-4 text-center font-bold text-slate-600">{stats.strikeRate || '0.00'}</td>
                      <td className="py-4 text-center font-bold text-slate-600">{stats.hundreds || 0}</td>
                      <td className="py-4 text-center font-bold text-slate-600">{stats.fifties || 0}</td>
                      <td className="py-4 text-center font-bold text-slate-600">{stats.fours || 0}</td>
                      <td className="py-4 text-center font-bold text-slate-600">{stats.sixes || 0}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bowling' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-[#031d44] px-6 py-4">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Detailed Bowling Stats</h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                      <th className="py-3">Format</th>
                      <th className="py-3 text-center">Mat</th>
                      <th className="py-3 text-center">Inns</th>
                      <th className="py-3 text-center">Overs</th>
                      <th className="py-3 text-center">Wkts</th>
                      <th className="py-3 text-center">BBI</th>
                      <th className="py-3 text-center">Ave</th>
                      <th className="py-3 text-center">Econ</th>
                      <th className="py-3 text-center">SR</th>
                      <th className="py-3 text-center">4w</th>
                      <th className="py-3 text-center">5w</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <tr className="hover:bg-slate-50">
                      <td className="py-4 font-bold text-[#031d44]">T20</td>
                      <td className="py-4 text-center font-bold text-slate-600">{stats.matches || 0}</td>
                      <td className="py-4 text-center font-bold text-slate-600">{stats.innings || 0}</td>
                      <td className="py-4 text-center font-bold text-slate-600">{Math.floor((stats.balls || 0) / 6)}.{(stats.balls || 0) % 6}</td>
                      <td className="py-4 text-center font-black text-[#031d44]">{stats.wickets || 0}</td>
                      <td className="py-4 text-center font-bold text-slate-600">{stats.bestBowling || '0/0'}</td>
                      <td className="py-4 text-center font-bold text-slate-600">{bowlingAverage}</td>
                      <td className="py-4 text-center font-bold text-slate-600">{stats.economy || '0.00'}</td>
                      <td className="py-4 text-center font-bold text-slate-600">-</td>
                      <td className="py-4 text-center font-bold text-slate-600">{stats.fourWickets || 0}</td>
                      <td className="py-4 text-center font-bold text-slate-600">{stats.fiveWickets || 0}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-[#031d44] px-6 py-4">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Recent Matches</h3>
            </div>
            <div className="p-6">
              <p className="text-slate-500 text-sm text-center py-8">Match history will appear here after matches are played</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
