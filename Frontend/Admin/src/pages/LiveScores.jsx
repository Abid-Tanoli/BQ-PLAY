import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchMatches } from "../store/slices/matchesSlice";
import { initSocket } from "../store/socket";
import api from "../services/api";

// Match Categories
const CATEGORY_FILTERS = [
  { key: "all", label: "🏏 All Matches", icon: "🏏" },
  { key: "international", label: "🌍 International", icon: "🌍" },
  { key: "league", label: "🏆 League/Tournament", icon: "🏆" },
  { key: "domestic", label: "🏛️ Domestic", icon: "🏛️" },
  { key: "local-club", label: "🏟️ Local Club", icon: "🏟️" },
];

// International Subcategories
const INTERNATIONAL_SUBCATEGORIES = [
  { key: "all", label: "All International" },
  { key: "test-championship", label: "Test Championship" },
  { key: "odi-world-cup", label: "ODI World Cup" },
  { key: "t20-world-cup", label: "T20 World Cup" },
  { key: "champions-trophy", label: "Champions Trophy" },
  { key: "bilateral-test", label: "Bilateral Test" },
  { key: "bilateral-odi", label: "Bilateral ODI" },
  { key: "bilateral-t20i", label: "Bilateral T20I" },
  { key: "asia-cup", label: "Asia Cup" },
];

// League Subcategories
const LEAGUE_SUBCATEGORIES = [
  { key: "all", label: "All Leagues" },
  { key: "ipl", label: "IPL" },
  { key: "psl", label: "PSL" },
  { key: "bbl", label: "BBL" },
  { key: "cpl", label: "CPL" },
  { key: "t20-blast", label: "T20 Blast" },
  { key: "the-hundred", label: "The Hundred" },
  { key: "other-league", label: "Other League" },
];

// Domestic Subcategories
const DOMESTIC_SUBCATEGORIES = [
  { key: "all", label: "All Domestic" },
  { key: "national-t20", label: "National T20" },
  { key: "national-one-day", label: "National One-Day" },
  { key: "national-first-class", label: "National First-Class" },
  { key: "regional", label: "Regional" },
  { key: "departmental", label: "Departmental" },
];

// Local Club Subcategories
const LOCAL_CLUB_SUBCATEGORIES = [
  { key: "all", label: "All Local" },
  { key: "club-tournament", label: "Club Tournament" },
  { key: "friendly", label: "Friendly Match" },
  { key: "tape-ball", label: "Tape Ball" },
  { key: "hard-ball", label: "Hard Ball" },
  { key: "corporate", label: "Corporate Match" },
  { key: "school-college", label: "School/College" },
];

const FORMAT_FILTERS = [
  { key: "all", label: "All Formats" },
  { key: "T20", label: "T20" },
  { key: "ODI", label: "ODI" },
  { key: "Test", label: "Test" },
  { key: "T10", label: "T10" },
  { key: "Tape Ball", label: "Tape Ball" },
  { key: "6 Overs", label: "6 Overs" },
  { key: "8 Overs", label: "8 Overs" },
];

const STATUS_FILTERS = [
  { key: "all", label: "All Status" },
  { key: "live", label: "🔴 Live" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Results" },
];

export default function LiveScores() {
  const dispatch = useDispatch();
  const { matches, loading } = useSelector((state) => state.matches);
  const [events, setEvents] = useState([]);

  // Filter States
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subcategoryFilter, setSubcategoryFilter] = useState("all");
  const [formatFilter, setFormatFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // UI States
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);

  useEffect(() => {
    dispatch(fetchMatches());
    loadEvents();

    const socket = initSocket();
    socket.on("match:updated", () => dispatch(fetchMatches()));
    socket.on("match:created", () => dispatch(fetchMatches()));
    return () => { socket.off("match:updated"); socket.off("match:created"); };
  }, [dispatch]);

  const loadEvents = async () => {
    try { setEvents((await api.get("/events")).data); } catch { }
  };

  const getEventForMatch = (match) => {
    if (!match.tournament) return null;
    return events.find(e => e._id === match.tournament._id || e._id === match.tournament) || null;
  };

  // Group matches by series
  const groupMatchesBySeries = (matchList) => {
    const groups = {};
    matchList.forEach(m => {
      const evt = getEventForMatch(m);
      const key = evt ? `evt_${evt._id}` : "standalone";
      if (!groups[key]) groups[key] = { event: evt, matches: [] };
      groups[key].matches.push(m);
    });
    return Object.values(groups);
  };

  // Get subcategories based on selected category
  const getSubcategories = () => {
    switch (categoryFilter) {
      case "international":
        return INTERNATIONAL_SUBCATEGORIES;
      case "league":
        return LEAGUE_SUBCATEGORIES;
      case "domestic":
        return DOMESTIC_SUBCATEGORIES;
      case "local-club":
        return LOCAL_CLUB_SUBCATEGORIES;
      default:
        return [];
    }
  };

  // Apply filters
  const getFilteredMatches = () => {
    let filtered = [...matches];

    console.log('[LiveScores] Total matches:', matches.length);
    console.log('[LiveScores] Categories:', matches.map(m => ({ type: m.matchType, category: m.matchCategory, subcategory: m.matchSubcategory })));

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(m => m.matchCategory === categoryFilter);
    }

    // Subcategory filter
    if (subcategoryFilter !== "all") {
      filtered = filtered.filter(m => m.matchSubcategory === subcategoryFilter);
    }

    // Status filter
    if (statusFilter === "live") filtered = filtered.filter(m => m.status === "live");
    else if (statusFilter === "upcoming") filtered = filtered.filter(m => m.status === "upcoming" || m.status === "scheduled");
    else if (statusFilter === "completed") filtered = filtered.filter(m => m.status === "completed" || m.status === "abandoned");

    // Format filter
    if (formatFilter !== "all") {
      filtered = filtered.filter(m => m.matchType === formatFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
      filtered = filtered.filter(m => {
        const d = new Date(m.startAt); d.setHours(0, 0, 0, 0);
        if (dateFilter === "today") return d.getTime() === today.getTime();
        if (dateFilter === "tomorrow") return d.getTime() === tomorrow.getTime();
        if (dateFilter === "yesterday") return d.getTime() === yesterday.getTime();
        return true;
      });
    }

    return filtered;
  };

  const filteredMatches = getFilteredMatches();
  const seriesGroups = groupMatchesBySeries(filteredMatches);

  // Sort: live first, then by date
  seriesGroups.forEach(g => {
    g.matches.sort((a, b) => {
      if (a.status === "live" && b.status !== "live") return -1;
      if (b.status === "live" && a.status !== "live") return 1;
      return new Date(a.startAt) - new Date(b.startAt);
    });
  });

  // Count matches by category
  const categoryCounts = {
    all: matches.length,
    international: matches.filter(m => m.matchCategory === "international").length,
    league: matches.filter(m => m.matchCategory === "league").length,
    domestic: matches.filter(m => m.matchCategory === "domestic").length,
    "local-club": matches.filter(m => m.matchCategory === "local-club").length,
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7]">
      {/* ESPN-Style Header */}
      <div className="bg-[#031d44] text-white">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <Link to="/admin" className="text-xs text-blue-300 hover:text-white transition-colors">Home</Link>
              <span className="text-blue-300 mx-2">›</span>
              <h1 className="text-lg font-black uppercase tracking-tight">Live Cricket Score</h1>
            </div>
            <div className="flex gap-2">
              <Link to="/admin/events" className="text-xs font-bold text-blue-300 hover:text-white bg-white/10 px-3 py-1.5 rounded-full">Events</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 space-y-3">

          {/* Row 1: Status + Format + Date */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {STATUS_FILTERS.map(f => (
              <button key={f.key} onClick={() => setStatusFilter(f.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${statusFilter === f.key ? "bg-[#031d44] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {f.label}
              </button>
            ))}
            <div className="w-px h-5 bg-slate-300 mx-1"></div>
            {FORMAT_FILTERS.map(f => (
              <button key={f.key} onClick={() => setFormatFilter(f.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${formatFilter === f.key ? "bg-[#031d44] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Row 2: Category Filters */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-slate-200 pt-3">
            {CATEGORY_FILTERS.map(f => (
              <button key={f.key} onClick={() => { setCategoryFilter(f.key); setSubcategoryFilter("all"); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${categoryFilter === f.key ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md" : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"}`}>
                <span>{f.icon}</span>
                <span>{f.label}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${categoryFilter === f.key ? "bg-white/20" : "bg-slate-200"}`}>
                  {categoryCounts[f.key]}
                </span>
              </button>
            ))}
          </div>

          {/* Row 3: Subcategory Filters (only show if category selected) */}
          {categoryFilter !== "all" && getSubcategories().length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-slate-200 pt-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Subcategory:</span>
              {getSubcategories().map(f => (
                <button key={f.key} onClick={() => setSubcategoryFilter(f.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${subcategoryFilter === f.key ? "bg-blue-100 text-blue-700 border border-blue-300" : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"}`}>
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {/* Row 4: Date Filter + Reset */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {[
                { key: "all", label: "All Dates" },
                { key: "yesterday", label: "Yesterday" },
                { key: "today", label: "Today" },
                { key: "tomorrow", label: "Tomorrow" }
              ].map(f => (
                <button key={f.key} onClick={() => setDateFilter(f.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${dateFilter === f.key ? "bg-[#031d44] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                  {f.label}
                </button>
              ))}
            </div>
            {(statusFilter !== "all" || formatFilter !== "all" || categoryFilter !== "all" || subcategoryFilter !== "all" || dateFilter !== "all") && (
              <button onClick={() => { setStatusFilter("all"); setFormatFilter("all"); setCategoryFilter("all"); setSubcategoryFilter("all"); setDateFilter("all"); }}
                className="px-3 py-1.5 rounded-full text-xs font-bold text-red-600 hover:bg-red-50 whitespace-nowrap flex items-center gap-1">
                <span>✕</span>
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-[#031d44] border-t-transparent rounded-full animate-spin" /></div>
        ) : filteredMatches.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500 font-bold">No matches found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-6">
            {seriesGroups.map((group, idx) => (
              <SeriesSection key={idx} group={group} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Series Section
function SeriesSection({ group }) {
  const { event, matches } = group;

  return (
    <div>
      {event ? (
        <div className="flex items-center justify-between py-2 mb-2 border-b border-slate-200">
          <Link to={`/admin/events/${event._id}`} className="text-sm font-bold text-[#031d44] hover:text-blue-600 transition-colors flex items-center gap-2">
            {event.logo && <img src={event.logo} alt={event.name} className="w-5 h-5 rounded object-cover" />}
            {event.name}
          </Link>
          <Link to={`/admin/events/${event._id}`} className="text-xs font-bold text-blue-600 hover:text-blue-700">See all →</Link>
        </div>
      ) : (
        <div className="flex items-center justify-between py-2 mb-2 border-b border-slate-200">
          <span className="text-sm font-bold text-[#031d44]">Other Matches</span>
        </div>
      )}

      <div className="space-y-3">
        {matches.map(m => <MatchCard key={m._id} match={m} />)}
      </div>
    </div>
  );
}

// Match Card Component
function MatchCard({ match }) {
  const team1 = match.teams?.[0] || {};
  const team2 = match.teams?.[1] || {};
  const inn1 = match.innings?.[0];
  const inn2 = match.innings?.[1];

  // Category badge
  const getCategoryBadge = (category) => {
    const badges = {
      "international": { bg: "bg-purple-100", text: "text-purple-700", label: "🌍 International" },
      "league": { bg: "bg-blue-100", text: "text-blue-700", label: "🏆 League" },
      "domestic": { bg: "bg-green-100", text: "text-green-700", label: "🏛️ Domestic" },
      "local-club": { bg: "bg-orange-100", text: "text-orange-700", label: "🏟️ Local Club" },
    };
    return badges[category] || { bg: "bg-slate-100", text: "text-slate-700", label: "Other" };
  };

  const categoryBadge = getCategoryBadge(match.matchCategory);

  let statusLabel = "";
  let statusClass = "";
  const matchDate = new Date(match.startAt);
  const now = new Date();
  const isStarted = matchDate <= now;

  if (match.status === "live") {
    statusLabel = "Live";
    statusClass = "text-red-600 font-black";
  } else if (match.status === "completed") {
    statusLabel = "Result";
    statusClass = "text-slate-800 font-bold";
  } else if (match.status === "abandoned") {
    statusLabel = "Abandoned";
    statusClass = "text-slate-500 font-bold";
  } else if (match.status === "upcoming" || match.status === "scheduled") {
    if (isStarted) {
      statusLabel = `Starts ${matchDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
      matchDate.setHours(0, 0, 0, 0);
      if (matchDate.getTime() === today.getTime()) {
        statusLabel = `Today, ${matchDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
      } else if (matchDate.getTime() === tomorrow.getTime()) {
        statusLabel = `Tomorrow, ${matchDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
      } else {
        statusLabel = matchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + `, ${matchDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
      }
    }
    statusClass = "text-slate-500 font-bold";
  }

  return (
    <Link to={`/admin/live/${match._id}`} className="block bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all p-4">
      {/* Status Label + Badges */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {match.status === "live" && <span className="inline-block w-2 h-2 bg-red-600 rounded-full mr-1 animate-pulse"></span>}
          <span className={`text-xs ${statusClass}`}>{statusLabel}</span>
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${categoryBadge.bg} ${categoryBadge.text}`}>
            {categoryBadge.label}
          </span>
          {match.matchSubcategory && match.matchSubcategory !== "all" && (
            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600 uppercase">
              {match.matchSubcategory.replace(/-/g, ' ')}
            </span>
          )}
        </div>
        {match.matchType && <span className="text-[10px] text-slate-400 font-bold">{match.matchType}</span>}
      </div>

      {/* Match Meta */}
      <div className="text-[10px] text-slate-500 font-bold mb-3 flex items-center gap-1">
        {match.matchNumber && <span>Match {match.matchNumber}</span>}
        {match.venue && <span>• {match.venue}</span>}
        {match.tournament?.name && <span>• {match.tournament.name}</span>}
      </div>

      {/* Team 1 */}
      <div className="flex items-center justify-between py-1.5">
        <div className="flex items-center gap-2">
          {team1.logo && <img src={team1.logo} alt={team1.name} className="w-5 h-5 rounded-full object-cover" />}
          <span className="text-sm font-bold text-slate-800">{team1.shortName || team1.name}</span>
        </div>
        {inn1 && (
          <span className="text-sm font-black text-slate-900">
            {inn1.runs}/{inn1.wickets}
            <span className="text-xs text-slate-500 font-bold ml-1">({inn1.overs}{inn1.balls > 0 ? `.${inn1.balls % 6}` : ''} ov)</span>
          </span>
        )}
      </div>

      {/* Team 2 */}
      <div className="flex items-center justify-between py-1.5">
        <div className="flex items-center gap-2">
          {team2.logo && <img src={team2.logo} alt={team2.name} className="w-5 h-5 rounded-full object-cover" />}
          <span className="text-sm font-bold text-slate-800">{team2.shortName || team2.name}</span>
        </div>
        {inn2 && (
          <span className="text-sm font-black text-slate-900">
            {inn2.runs}/{inn2.wickets}
            <span className="text-xs text-slate-500 font-bold ml-1">({inn2.overs}{inn2.balls > 0 ? `.${inn2.balls % 6}` : ''} ov)</span>
          </span>
        )}
      </div>

      {/* Result / Match State */}
      {match.result?.description && (
        <div className="mt-2 pt-2 border-t border-slate-100">
          <p className="text-xs font-bold text-green-700">{match.result.description}</p>
        </div>
      )}
      {match.status === "upcoming" && !inn1 && (
        <div className="mt-2 pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500 font-bold">Match yet to begin</p>
        </div>
      )}

      {/* Action Links */}
      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-3">
        <Link to={`/admin/scorecard/${match._id}`} className="text-[10px] font-bold text-blue-600 hover:text-blue-700">Scorecard</Link>
        <Link to={`/admin/live/${match._id}`} className="text-[10px] font-bold text-blue-600 hover:text-blue-700">Live Blog</Link>
        <Link to={`/admin/live/${match._id}`} className="text-[10px] font-bold text-blue-600 hover:text-blue-700">Manage</Link>
      </div>
    </Link>
  );
}
