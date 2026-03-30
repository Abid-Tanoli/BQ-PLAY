import React, { useState, useEffect } from "react";
import api from "../services/api";
import "./PlayingXISelector.css";

export default function PlayingXISelector({ matchId, match, teams, onClose, onSubmit }) {
  const [selectedTeam, setSelectedTeam] = useState(teams?.[0]?._id || "");
  const [squad15, setSquad15] = useState([]);
  const [selectedXI, setSelectedXI] = useState([]);
  const [twelfthMan, setTwelfthMan] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedTeam && match) {
      loadSquadAndXI();
    }
  }, [selectedTeam, match]);

  const loadSquadAndXI = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/matches/${matchId}`);
      const currentMatch = res.data;
      
      // Get squad15 for selected team
      const teamSquad = currentMatch.squad15?.find(s => s.team?._id === selectedTeam);
      const players = teamSquad?.players || [];
      setSquad15(players);
      
      // Get current XI for selected team
      const teamXI = currentMatch.playingXI?.find(x => x.team?._id === selectedTeam);
      setSelectedXI(teamXI?.players?.map(p => p._id) || []);
      
      // Get 12th man
      const team12th = currentMatch.twelfthMan?.find(t => t.team?._id === selectedTeam);
      setTwelfthMan(team12th?.player?._id || "");
    } catch (err) {
      console.error("Failed to load squad/XI:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerSelect = (playerId) => {
    if (selectedXI.includes(playerId)) {
      setSelectedXI(selectedXI.filter(id => id !== playerId));
      if (twelfthMan === playerId) setTwelfthMan("");
    } else {
      if (selectedXI.length < 11) {
        setSelectedXI([...selectedXI, playerId]);
      } else {
        alert("Maximum 11 players can be selected");
      }
    }
  };

  const handleTwelfthManSelect = (playerId) => {
    if (selectedXI.includes(playerId)) {
      alert("12th man must not be in playing XI");
      return;
    }
    setTwelfthMan(playerId === twelfthMan ? "" : playerId);
  };

  const handleSubmit = async () => {
    if (selectedXI.length !== 11) {
      alert("Please select exactly 11 players");
      return;
    }

    if (!twelfthMan) {
      alert("Please select a 12th man");
      return;
    }

    try {
      await Promise.all([
        api.put(`/matches/${matchId}/playing-xi`, {
          teamId: selectedTeam,
          players: selectedXI
        }),
        api.put(`/matches/${matchId}/twelfth-man`, {
          teamId: selectedTeam,
          player: twelfthMan
        })
      ]);
      if (onSubmit) onSubmit();
      onClose();
    } catch (err) {
      console.error("Failed to set playing XI:", err);
      alert("Failed to set playing XI. Please try again.");
    }
  };

  const selectedPlayerObjects = squad15.filter(p => selectedXI.includes(p._id));
  const availableFor12th = squad15.filter(p => !selectedXI.includes(p._id));

  return (
    <div className="xi-modal-overlay">
      <div className="xi-modal">
        <div className="modal-header">
          <h2>Select Playing XI (11 players + 12th man)</h2>
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

          {loading ? (
            <div className="loading">Loading squad...</div>
          ) : (
            <>
              <div className="xi-section">
                <div className="section-header">
                  <h3>Playing XI ({selectedXI.length}/11)</h3>
                </div>
                <div className="players-grid">
                  {squad15.map(player => (
                    <div
                      key={player._id}
                      className={`player-card ${selectedXI.includes(player._id) ? 'selected' : ''}`}
                      onClick={() => handlePlayerSelect(player._id)}
                    >
                      <div className="player-name">{player.name}</div>
                      <div className="player-role">{player.playingRole}</div>
                      {selectedXI.includes(player._id) && (
                        <div className="selected-badge">XI</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="xi-section">
                <div className="section-header">
                  <h3>12th Man (1)</h3>
                </div>
                <div className="players-grid">
                  {availableFor12th.map(player => (
                    <div
                      key={player._id}
                      className={`player-card ${twelfthMan === player._id ? 'selected' : ''}`}
                      onClick={() => handleTwelfthManSelect(player._id)}
                    >
                      <div className="player-name">{player.name}</div>
                      <div className="player-role">{player.playingRole}</div>
                      {twelfthMan === player._id && (
                        <div className="selected-badge">12th</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit}
            disabled={selectedXI.length !== 11 || !twelfthMan}
          >
            Confirm Playing XI
          </button>
        </div>
      </div>
    </div>
  );
}
