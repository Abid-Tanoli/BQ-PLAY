import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { initSocket } from "../store/socket";

// Filter options like ESPN Cricinfo
const FORMAT_FILTERS = [
  { key: "all", label: "All Formats" },
  { key: "T20", label: "T20" },
  { key: "ODI", label: "ODI" },
  { key: "Test", label: "Test" },
];

const STATUS_FILTERS = [
  { key: "all", label: "All Matches" },
  { key: "live", label: "🔴 Live" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Results" },
];

export default function LiveCricketScores() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formatFilter, setFormatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    loadMatches();
    
    // Set up Socket.IO for real-time updates
    const socket = initSocket();
    socket.emit("join-cricket-live");
    
    socket.on("cricket:liveUpdate", (data) => {
      console.log('[LiveCricket] Real-time update received:', data);
      updateMatchInList(data.data);
      setLastUpdated(new Date());
    });

    return () => {
      socket.off("cricket:liveUpdate");
    };
  }, []);

  // Auto-refresh every 10 seconds (fallback if WebSocket fails)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isLive) {
        loadMatches();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isLive]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get("/cricket/all");
      
      if (response.data.success) {
        setMatches(response.data.data);
        setLastUpdated(new Date());
        setIsLive(true);
      } else {
        setError("Failed to load matches");
      }
    } catch (err) {
      console.error("[LiveCricket] Error loading matches:", err);
      setError(err.response?.data?.message || "Failed to connect to cricket API");
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  };

  const updateMatchInList = (updatedMatch) => {
    setMatches(prev => {
      const index = prev.findIndex(m => m.id === updatedMatch.id);
      if (index >= 0) {
        const newMatches = [...prev];
        newMatches[index] = updatedMatch;
        return newMatches;
      }
      // Add new match if not in list
      return [...prev, updatedMatch];
    });
  };

  // Apply filters
  const getFilteredMatches = () => {
    let filtered = [...matches];

    // Status filter
    if (statusFilter === "live") {
      filtered = filtered.filter(m => m.live || m.status === "live");
    } else if (statusFilter === "upcoming") {
      filtered = filtered.filter(m => !m.live && m.status === "upcoming");
    } else if (statusFilter === "completed") {
      filtered = filtered.filter(m => m.status === "completed");
    }

    // Format filter
    if (formatFilter !== "all") {
      filtered = filtered.filter(m => m.matchType === formatFilter);
    }

    // Sort: live first, then by date
    filtered.sort((a, b) => {
      if (a.live && !b.live) return -1;
      if (!a.live && b.live) return 1;
      return new Date(a.date || a.dateTimeGMT) - new Date(b.date || b.dateTimeGMT);
    });

    return filtered;
  };

  const filteredMatches = getFilteredMatches();
  const liveCount = matches.filter(m => m.live || m.status === "live").length;

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? "bg-gray-900" : "bg-[#f4f5f7]"}`}>
      {/* ESPN-Style Header */}
      <div className={`${darkMode ? "bg-gray-800" : "bg-[#031d44]"} text-white`}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link to="/admin" className="text-xs text-blue-300 hover:text-white transition-colors">Home</Link>
              <span className="text-blue-300 mx-2">›</span>
              <h1 className="text-2xl font-black uppercase tracking-tight">Live Cricket Scores</h1>
              <p className="text-xs text-blue-200/60 mt-1">Real-time scores from external cricket APIs</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-all"
                title="Toggle Dark Mode"
              >
                {darkMode ? "☀️ Light" : "🌙 Dark"}
              </button>
              <button
                onClick={loadMatches}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-xs font-bold transition-all"
              >
                {loading ? "Refreshing..." : "🔄 Refresh"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-slate-200"} border-b shadow-sm sticky top-0 z-10`}>
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            {/* Live Indicator */}
            <div className="flex items-center gap-2">
              {isLive && (
                <>
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                  </span>
                  <span className="text-xs font-bold text-green-600">LIVE</span>
                  <span className="text-xs text-slate-500">•</span>
                </>
              )}
              {liveCount > 0 && (
                <span className="text-xs font-bold text-slate-700">
                  {liveCount} live match{liveCount !== 1 ? 'es' : ''}
                </span>
              )}
              {lastUpdated && (
                <span className="text-[10px] text-slate-500">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>

            {/* API Config Warning */}
            {!isLive && !loading && matches.length === 0 && (
              <div className="text-xs text-amber-600 font-bold">
                ⚠️ Configure CRICKET_API_KEY in .env to enable live scores
              </div>
            )}
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === f.key
                    ? "bg-[#031d44] text-white"
                    : darkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
            <div className={`w-px h-5 ${darkMode ? "bg-gray-600" : "bg-slate-300"} mx-1`}></div>
            {FORMAT_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setFormatFilter(f.key)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  formatFilter === f.key
                    ? "bg-[#031d44] text-white"
                    : darkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
            {(statusFilter !== "all" || formatFilter !== "all") && (
              <button
                onClick={() => { setStatusFilter("all"); setFormatFilter("all"); }}
                className="px-4 py-2 rounded-full text-xs font-bold text-red-600 hover:bg-red-50 whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading && matches.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-32">
            <div className="w-12 h-12 border-4 border-[#031d44] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className={`text-sm font-bold ${darkMode ? "text-gray-400" : "text-slate-600"}`}>Loading live scores...</p>
          </div>
        ) : error && matches.length === 0 ? (
          <div className={`${darkMode ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200"} border-2 rounded-2xl p-8 text-center`}>
            <span className="text-5xl block mb-4">⚠️</span>
            <h3 className={`text-xl font-black ${darkMode ? "text-red-300" : "text-red-800"} uppercase`}>Unable to Load Scores</h3>
            <p className={`text-sm ${darkMode ? "text-red-400" : "text-red-600"} mt-2`}>{error}</p>
            <button
              onClick={loadMatches}
              className="mt-4 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm"
            >
              Try Again
            </button>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-lg p-16 text-center border ${darkMode ? "border-gray-700" : "border-slate-200"}`}>
            <span className="text-5xl block mb-4">🏏</span>
            <h4 className={`text-xl font-black ${darkMode ? "text-gray-300" : "text-[#031d44]"} uppercase`}>No Matches Found</h4>
            <p className={`text-sm ${darkMode ? "text-gray-500" : "text-slate-500"} mt-2`}>
              {statusFilter === "live" ? "No live matches at the moment" : "Try adjusting your filters"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMatches.map(match => (
              <MatchCard key={match.id} match={match} darkMode={darkMode} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Individual Match Card (ESPN Cricinfo style)
function MatchCard({ match, darkMode }) {
  const team1 = match.teams?.team1 || {};
  const team2 = match.teams?.team2 || {};
  const score1 = match.score?.[0];
  const score2 = match.score?.[1];

  // Calculate run rate
  const calculateRunRate = (runs, overs) => {
    if (!overs || overs === 0) return "0.00";
    return (runs / overs).toFixed(2);
  };

  return (
    <div
      className={`block ${darkMode ? "bg-gray-800 hover:bg-gray-750 border-gray-700" : "bg-white hover:border-blue-300 border-slate-200"} rounded-xl border hover:shadow-xl transition-all p-5`}
    >
      {/* Status Label */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {(match.live || match.status === "live") && (
            <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-black flex items-center gap-1">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              LIVE
            </span>
          )}
          {match.status === "completed" && (
            <span className={`px-3 py-1 ${darkMode ? "bg-green-900 text-green-300" : "bg-green-100 text-green-700"} rounded-full text-xs font-black`}>
              RESULT
            </span>
          )}
          {match.status === "upcoming" && (
            <span className={`px-3 py-1 ${darkMode ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-700"} rounded-full text-xs font-black`}>
              UPCOMING
            </span>
          )}
        </div>
        {match.matchType && (
          <span className={`text-[10px] ${darkMode ? "text-gray-500" : "text-slate-400"} font-bold`}>
            {match.matchType}
          </span>
        )}
      </div>

      {/* Match Meta */}
      <div className={`text-[10px] ${darkMode ? "text-gray-500" : "text-slate-500"} font-bold mb-4 flex items-center gap-1`}>
        {match.name && <span>{match.name}</span>}
        {match.venue && <span>• {match.venue}</span>}
      </div>

      {/* Team 1 */}
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3 flex-1">
          {team1.logo ? (
            <img src={team1.logo} alt={team1.shortName} className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <div className={`w-8 h-8 rounded-lg ${darkMode ? "bg-gray-700" : "bg-slate-100"} flex items-center justify-center text-xs font-bold`}>
              {team1.shortName?.substring(0, 2) || "T1"}
            </div>
          )}
          <span className={`text-base font-bold ${darkMode ? "text-gray-200" : "text-slate-800"}`}>
            {team1.shortName || team1.name}
          </span>
        </div>
        {score1 && (
          <div className="text-right">
            <span className={`text-xl font-black ${darkMode ? "text-gray-100" : "text-slate-900"}`}>
              {score1.runs}/{score1.wickets}
            </span>
            <span className={`text-xs ${darkMode ? "text-gray-500" : "text-slate-500"} font-bold ml-2`}>
              ({score1.overs || 0} ov)
            </span>
            {score1.overs && (
              <div className={`text-[10px] ${darkMode ? "text-gray-500" : "text-slate-400"} font-bold`}>
                CRR: {calculateRunRate(score1.runs, score1.overs)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Team 2 */}
      <div className="flex items-center justify-between py-3 border-t border-slate-100">
        <div className="flex items-center gap-3 flex-1">
          {team2.logo ? (
            <img src={team2.logo} alt={team2.shortName} className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <div className={`w-8 h-8 rounded-lg ${darkMode ? "bg-gray-700" : "bg-slate-100"} flex items-center justify-center text-xs font-bold`}>
              {team2.shortName?.substring(0, 2) || "T2"}
            </div>
          )}
          <span className={`text-base font-bold ${darkMode ? "text-gray-200" : "text-slate-800"}`}>
            {team2.shortName || team2.name}
          </span>
        </div>
        {score2 && (
          <div className="text-right">
            <span className={`text-xl font-black ${darkMode ? "text-gray-100" : "text-slate-900"}`}>
              {score2.runs}/{score2.wickets}
            </span>
            <span className={`text-xs ${darkMode ? "text-gray-500" : "text-slate-500"} font-bold ml-2`}>
              ({score2.overs || 0} ov)
            </span>
            {score2.overs && (
              <div className={`text-[10px] ${darkMode ? "text-gray-500" : "text-slate-400"} font-bold`}>
                CRR: {calculateRunRate(score2.runs, score2.overs)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Match Status / Result */}
      {match.result && (
        <div className={`mt-3 pt-3 ${darkMode ? "border-gray-700" : "border-slate-100"} border-t`}>
          <p className={`text-xs font-bold ${
            match.status === "completed"
              ? "text-green-600"
              : match.live || match.status === "live"
                ? "text-red-600"
                : darkMode ? "text-gray-400" : "text-slate-600"
          }`}>
            {match.result}
          </p>
        </div>
      )}

      {/* Toss Info */}
      {match.toss && (
        <div className={`mt-2 text-[10px] ${darkMode ? "text-gray-500" : "text-slate-500"} font-bold`}>
          Toss: {match.toss}
        </div>
      )}

      {/* Required Run Rate (for live matches) */}
      {match.live && match.requiredRunRate && (
        <div className={`mt-2 px-3 py-2 ${darkMode ? "bg-amber-900/20 border-amber-800" : "bg-amber-50 border-amber-200"} border rounded-lg`}>
          <p className={`text-[10px] ${darkMode ? "text-amber-400" : "text-amber-700"} font-bold`}>
            Required Run Rate: {match.requiredRunRate}
          </p>
        </div>
      )}

      {/* Action Links */}
      <div className={`mt-3 pt-3 ${darkMode ? "border-gray-700" : "border-slate-100"} border-t flex items-center gap-4`}>
        <button className={`text-[10px] font-bold ${darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"} transition-colors`}>
          📊 Full Scorecard
        </button>
        <button className={`text-[10px] font-bold ${darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"} transition-colors`}>
          💬 Commentary
        </button>
        <button className={`text-[10px] font-bold ${darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"} transition-colors`}>
          📈 Score Graph
        </button>
      </div>
    </div>
  );
}
