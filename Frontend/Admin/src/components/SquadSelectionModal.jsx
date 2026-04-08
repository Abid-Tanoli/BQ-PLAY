import React, { useState, useEffect } from "react";
import api from "../services/api";
import "./SquadSelectionModal.css";

export default function SquadSelectionModal({ matchId, teams, onClose, onSubmit }) {
  const [selectedTeam, setSelectedTeam] = useState(teams?.[0]?._id || "");
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [captain, setCaptain] = useState("");
  const [viceCaptain, setViceCaptain] = useState("");
  const [wicketKeepers, setWicketKeepers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedTeam) {
      loadTeamPlayers();
    }
  }, [selectedTeam]);

  const loadTeamPlayers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/teams/${selectedTeam}`);
      const players = res.data.players || [];
      setAvailablePlayers(players);
      setSelectedPlayers([]);
      setCaptain("");
      setViceCaptain("");
      setWicketKeepers([]);
    } catch (err) {
      console.error("Failed to load team players:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerSelect = (playerId) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
      if (captain === playerId) setCaptain("");
      if (viceCaptain === playerId) setViceCaptain("");
      if (wicketKeepers.includes(playerId)) {
        setWicketKeepers(wicketKeepers.filter(id => id !== playerId));
      }
    } else {
      if (selectedPlayers.length < 20) {
        setSelectedPlayers([...selectedPlayers, playerId]);
      } else {
        alert("Maximum 20 players can be selected");
      }
    }
  };

  const handleCaptainSelect = (playerId) => {
    if (!selectedPlayers.includes(playerId)) {
      alert("Player must be in the squad to be captain");
      return;
    }
    setCaptain(captain === playerId ? "" : playerId);
  };

  const handleViceCaptainSelect = (playerId) => {
    if (!selectedPlayers.includes(playerId)) {
      alert("Player must be in the squad to be vice-captain");
      return;
    }
    if (playerId === captain) {
      alert("Vice-captain cannot be the same as captain");
      return;
    }
    setViceCaptain(viceCaptain === playerId ? "" : playerId);
  };

  const handleWicketKeeperSelect = (playerId) => {
    if (!selectedPlayers.includes(playerId)) {
      alert("Player must be in the squad to be wicket-keeper");
      return;
    }
    if (wicketKeepers.includes(playerId)) {
      setWicketKeepers(wicketKeepers.filter(id => id !== playerId));
    } else {
      setWicketKeepers([...wicketKeepers, playerId]);
    }
  };

  const handleSubmit = async () => {
    if (selectedPlayers.length < 11 || selectedPlayers.length > 20) {
      alert("Please select between 11 and 20 players");
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
      await api.put(`/matches/${matchId}/squad15`, {
        teamId: selectedTeam,
        players: selectedPlayers,
        captain,
        viceCaptain,
        wicketKeepers
      });
      if (onSubmit) onSubmit();
      onClose();
    } catch (err) {
      console.error("Failed to set squad:", err);
      alert("Failed to set squad. Please try again.");
    }
  };

  const getBadge = (playerId) => {
    const badges = [];
    if (playerId === captain) badges.push("C");
    if (playerId === viceCaptain) badges.push("VC");
    if (wicketKeepers.includes(playerId)) badges.push("WK");
    return badges;
  };

  return (
    <div className="squad-modal-overlay">
      <div className="squad-modal">
        <div className="modal-header">
          <h2>Select Squad (11-20 Players)</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="team-selector">
            <label>Select Team:</label>
            <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
              {teams?.map(team => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div className="info-box">
            <p><strong>Instructions:</strong></p>
            <ul>
              <li>Select between 11 and 20 players for the squad</li>
              <li>Choose 1 Captain (C) from the squad</li>
              <li>Choose 1 Vice-Captain (VC) from the squad</li>
              <li>Choose 1 or more Wicket-Keepers (WK) from the squad</li>
            </ul>
          </div>

          <div className="players-list">
            <div className="players-header">
              <h3>Players ({selectedPlayers.length}/20)</h3>
              <div className="roles-info">
                <span className="role-badge c-badge">C: {captain ? availablePlayers.find(p => p._id === captain)?.name : "Not selected"}</span>
                <span className="role-badge vc-badge">VC: {viceCaptain ? availablePlayers.find(p => p._id === viceCaptain)?.name : "Not selected"}</span>
                <span className="role-badge wk-badge">WK: {wicketKeepers.length > 0 ? wicketKeepers.map(id => availablePlayers.find(p => p._id === id)?.name).join(", ") : "Not selected"}</span>
              </div>
            </div>

            {loading ? (
              <div className="loading">Loading players...</div>
            ) : (
              <div className="players-grid">
                {availablePlayers.map(player => {
                  const badges = getBadge(player._id);
                  const isSelected = selectedPlayers.includes(player._id);
                  return (
                    <div
                      key={player._id}
                      className={`player-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handlePlayerSelect(player._id)}
                    >
                      <div className="player-name">{player.name}</div>
                      <div className="player-role">{player.playingRole}</div>

                      {isSelected && (
                        <div className="role-selectors" onClick={(e) => e.stopPropagation()}>
                          <button
                            className={`role-btn c-btn ${captain === player._id ? 'active' : ''}`}
                            onClick={() => handleCaptainSelect(player._id)}
                            title="Captain"
                          >
                            C
                          </button>
                          <button
                            className={`role-btn vc-btn ${viceCaptain === player._id ? 'active' : ''}`}
                            onClick={() => handleViceCaptainSelect(player._id)}
                            title="Vice-Captain"
                          >
                            VC
                          </button>
                          <button
                            className={`role-btn wk-btn ${wicketKeepers.includes(player._id) ? 'active' : ''}`}
                            onClick={() => handleWicketKeeperSelect(player._id)}
                            title="Wicket-Keeper"
                          >
                            WK
                          </button>
                        </div>
                      )}

                      <div className="checkbox">
                        {isSelected && '✓'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={selectedPlayers.length < 11 || selectedPlayers.length > 20 || !captain || !viceCaptain || wicketKeepers.length === 0}
          >
            Set Squad (11-20 players)
          </button>
        </div>
      </div>
    </div>
  );
}
