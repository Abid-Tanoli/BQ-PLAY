import React, { useState, useEffect } from "react";
import api from "../services/api";
import "./SquadSelectionModal.css";

export default function SquadSelectionModal({ matchId, teams, onClose, onSubmit }) {
  const [selectedTeam, setSelectedTeam] = useState(teams?.[0]?._id || "");
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
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
      setSelectedPlayers([]); // Reset selection when team changes
    } catch (err) {
      console.error("Failed to load team players:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerSelect = (playerId) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
    } else {
      if (selectedPlayers.length < 15) {
        setSelectedPlayers([...selectedPlayers, playerId]);
      } else {
        alert("Maximum 15 players can be selected");
      }
    }
  };

  const handleSubmit = async () => {
    if (selectedPlayers.length !== 15) {
      alert("Please select exactly 15 players");
      return;
    }

    try {
      await api.put(`/matches/${matchId}/squad15`, {
        teamId: selectedTeam,
        players: selectedPlayers
      });
      if (onSubmit) onSubmit();
      onClose();
    } catch (err) {
      console.error("Failed to set squad:", err);
      alert("Failed to set squad. Please try again.");
    }
  };

  return (
    <div className="squad-modal-overlay">
      <div className="squad-modal">
        <div className="modal-header">
          <h2>Select 15-Player Squad</h2>
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

          <div className="players-list">
            <div className="players-header">
              <h3>Players ({selectedPlayers.length}/15)</h3>
            </div>

            {loading ? (
              <div className="loading">Loading players...</div>
            ) : (
              <div className="players-grid">
                {availablePlayers.map(player => (
                  <div
                    key={player._id}
                    className={`player-card ${selectedPlayers.includes(player._id) ? 'selected' : ''}`}
                    onClick={() => handlePlayerSelect(player._id)}
                  >
                    <div className="player-name">{player.name}</div>
                    <div className="player-role">{player.playingRole}</div>
                    <div className="checkbox">
                      {selectedPlayers.includes(player._id) && '✓'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit}
            disabled={selectedPlayers.length !== 15}
          >
            Set Squad (15 players)
          </button>
        </div>
      </div>
    </div>
  );
}
