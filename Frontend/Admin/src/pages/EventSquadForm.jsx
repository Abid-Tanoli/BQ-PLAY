import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function EventSquadForm() {
  const { eventId, teamId } = useParams();
  const navigate = useNavigate();

  console.log('=== EventSquadForm Component Loaded ===');
  console.log('Event ID from URL:', eventId);
  console.log('Team ID from URL:', teamId);

  const [event, setEvent] = useState(null);
  const [team, setTeam] = useState(null);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [existingSquad, setExistingSquad] = useState(null);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [captain, setCaptain] = useState("");
  const [viceCaptain, setViceCaptain] = useState("");
  const [wicketKeepers, setWicketKeepers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [eventId, teamId]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch event
      const eventRes = await api.get(`/events/${eventId}`);
      const eventData = eventRes.data;
      setEvent(eventData);

      // Find team data from event
      const teamData = eventData.teams?.find(t => t._id === teamId);
      if (!teamData) {
        alert("Team not found in this event");
        navigate(`/admin/events/${eventId}`);
        return;
      }
      setTeam(teamData);

      // Fetch existing squad if any
      try {
        const squadRes = await api.get(`/events/${eventId}/squad/${teamId}`);
        if (squadRes.data) {
          setExistingSquad(squadRes.data);
          setSelectedPlayers(squadRes.data.players?.map(p => p._id) || []);
          setCaptain(squadRes.data.captain || "");
          setViceCaptain(squadRes.data.viceCaptain || "");
          setWicketKeepers(squadRes.data.wicketKeepers || []);
        }
      } catch (err) {
        // No existing squad, that's ok
      }

      // Fetch team with populated players
      try {
        const teamRes = await api.get(`/teams/${teamId}`);
        if (teamRes.data && teamRes.data.players) {
          setTeamPlayers(teamRes.data.players);
        } else {
          setTeamPlayers([]);
        }
      } catch (err) {
        console.error("Failed to fetch team players:", err);
        setTeamPlayers([]);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load data");
      navigate(`/admin/events/${eventId}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerToggle = (playerId) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
      if (captain === playerId) setCaptain("");
      if (viceCaptain === playerId) setViceCaptain("");
      setWicketKeepers(wicketKeepers.filter(id => id !== playerId));
    } else {
      if (selectedPlayers.length >= 20) {
        alert("Maximum 20 players allowed");
        return;
      }
      setSelectedPlayers([...selectedPlayers, playerId]);
    }
  };

  const handleSave = async () => {
    if (selectedPlayers.length < 11) {
      alert("Please select at least 11 players");
      return;
    }
    if (!captain) {
      alert("Please select a captain");
      return;
    }
    if (!viceCaptain) {
      alert("Please select a vice-captain");
      return;
    }
    if (wicketKeepers.length === 0) {
      alert("Please select at least one wicket-keeper");
      return;
    }

    try {
      setSaving(true);
      await api.post(`/events/${eventId}/squad`, {
        teamId,
        players: selectedPlayers,
        captain,
        viceCaptain,
        wicketKeepers,
      });
      alert("Squad saved successfully!");
      navigate(`/admin/events/${eventId}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save squad");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event || !team) {
    return null;
  }

  return (
    <div className="space-y-6 bg-[#f8fafc] min-h-screen p-6">
      {/* Header */}
      <div className="bg-[#031d44] p-6 rounded-2xl shadow-xl text-white">
        <button
          onClick={() => navigate(`/admin/events/${eventId}`)}
          className="text-blue-200 hover:text-white text-sm font-bold mb-3 block"
        >
          ← Back to Event Details
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Set Event Squad</h2>
            <p className="text-blue-200/60 text-sm mt-1 font-medium">
              {event.name} - {team.name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-200/60">Selected Players</p>
            <p className="text-3xl font-black">
              {selectedPlayers.length}
              <span className="text-sm text-blue-200/60">/20</span>
            </p>
          </div>
        </div>
      </div>

      {/* Selection Info */}
      <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-blue-600">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-bold text-slate-800">
            {selectedPlayers.length >= 11 ? (
              <span className="text-green-600">✓ Minimum 11 players met</span>
            ) : (
              <span className="text-amber-600">⚠ Need at least {11 - selectedPlayers.length} more player(s)</span>
            )}
          </span>
          <div className="flex flex-wrap gap-4 text-xs">
            <span className={`font-bold ${captain ? "text-blue-600" : "text-slate-400"}`}>
              C: {captain ? teamPlayers.find(p => p._id === captain)?.name : "Not selected"}
            </span>
            <span className={`font-bold ${viceCaptain ? "text-green-600" : "text-slate-400"}`}>
              VC: {viceCaptain ? teamPlayers.find(p => p._id === viceCaptain)?.name : "Not selected"}
            </span>
            <span className={`font-bold ${wicketKeepers.length > 0 ? "text-orange-600" : "text-slate-400"}`}>
              WK: {wicketKeepers.length > 0 ? wicketKeepers.map(id => teamPlayers.find(p => p._id === id)?.name).join(", ") : "Not selected"}
            </span>
          </div>
        </div>
      </div>

      {/* Players Grid */}
      {teamPlayers.length > 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-sm font-black text-slate-800 uppercase mb-4">Select Players (11-20)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {teamPlayers.map(player => {
              const isSelected = selectedPlayers.includes(player._id);
              const isCaptain = captain === player._id;
              const isViceCaptain = viceCaptain === player._id;
              const isWK = wicketKeepers.includes(player._id);

              return (
                <div
                  key={player._id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                    ? "bg-blue-50 border-blue-400 ring-2 ring-blue-200"
                    : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  onClick={() => handlePlayerToggle(player._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-800 truncate">{player.name}</p>
                      <p className="text-xs text-slate-500">{player.playingRole || player.role || "Player"}</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      {isSelected && (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCaptain(isCaptain ? "" : player._id);
                            }}
                            className={`px-2 py-1 rounded text-xs font-bold ${isCaptain ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                              }`}
                            title="Captain"
                          >
                            C
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViceCaptain(isViceCaptain ? "" : player._id);
                            }}
                            className={`px-2 py-1 rounded text-xs font-bold ${isViceCaptain ? "bg-green-600 text-white" : "bg-green-100 text-green-600 hover:bg-green-200"
                              }`}
                            title="Vice-Captain"
                          >
                            VC
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isWK) {
                                setWicketKeepers(wicketKeepers.filter(id => id !== player._id));
                              } else {
                                setWicketKeepers([...wicketKeepers, player._id]);
                              }
                            }}
                            className={`px-2 py-1 rounded text-xs font-bold ${isWK ? "bg-orange-600 text-white" : "bg-orange-100 text-orange-600 hover:bg-orange-200"
                              }`}
                            title="Wicket-Keeper"
                          >
                            WK
                          </button>
                        </div>
                      )}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-300"
                          }`}
                      >
                        {isSelected ? "✓" : ""}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-16 text-center border border-slate-200">
          <span className="text-5xl block mb-4">👥</span>
          <h4 className="text-xl font-black text-[#031d44] uppercase">No Players Available</h4>
          <p className="text-slate-500 text-sm mt-2">This team doesn't have any players. Add players to the team first.</p>
          <button
            onClick={() => navigate("/admin/teams")}
            className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm"
          >
            Go to Teams
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate(`/admin/events/${eventId}`)}
          className="flex-1 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-black text-sm uppercase tracking-widest"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || selectedPlayers.length < 11 || !captain || !viceCaptain || wicketKeepers.length === 0}
          className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Squad"}
        </button>
      </div>
    </div>
  );
}
