import React, { useState, useEffect } from "react";
import api from "../services/api";
import "./PlayingXISelector.css";

export default function PlayingXISelector({ matchId, match, teams, onClose, onSubmit }) {
  const [selectedTeam, setSelectedTeam] = useState(teams?.[0]?._id || "");
  const [squad15, setSquad15] = useState([]);
  const [selectedXI, setSelectedXI] = useState([]);
  const [twelfthMan, setTwelfthMan] = useState("");
  const [captain, setCaptain] = useState("");
  const [viceCaptain, setViceCaptain] = useState("");
  const [wicketKeepers, setWicketKeepers] = useState([]);
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

      // Get captain, vice-captain, wicket-keepers
      const teamRoles = currentMatch.teamRoles?.find(r => r.team?._id === selectedTeam);
      setCaptain(teamRoles?.captain || "");
      setViceCaptain(teamRoles?.viceCaptain || "");
      setWicketKeepers(teamRoles?.wicketKeepers || []);
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
      if (captain === playerId) setCaptain("");
      if (viceCaptain === playerId) setViceCaptain("");
      if (wicketKeepers.includes(playerId)) {
        setWicketKeepers(wicketKeepers.filter(id => id !== playerId));
      }
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

  const handleCaptainSelect = (playerId) => {
    if (!selectedXI.includes(playerId)) {
      alert("Captain must be in the Playing XI");
      return;
    }
    if (viceCaptain === playerId) {
      alert("Captain cannot be the same as Vice-Captain");
      return;
    }
    setCaptain(captain === playerId ? "" : playerId);
  };

  const handleViceCaptainSelect = (playerId) => {
    if (!selectedXI.includes(playerId)) {
      alert("Vice-Captain must be in the Playing XI");
      return;
    }
    if (captain === playerId) {
      alert("Vice-Captain cannot be the same as Captain");
      return;
    }
    setViceCaptain(viceCaptain === playerId ? "" : playerId);
  };

  const handleWicketKeeperSelect = (playerId) => {
    if (!selectedXI.includes(playerId)) {
      alert("Wicket-Keeper must be in the Playing XI");
      return;
    }
    if (wicketKeepers.includes(playerId)) {
      setWicketKeepers(wicketKeepers.filter(id => id !== playerId));
    } else {
      setWicketKeepers([...wicketKeepers, playerId]);
    }
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
      await Promise.all([
        api.put(`/matches/${matchId}/playing-xi`, {
          teamId: selectedTeam,
          players: selectedXI
        }),
        api.put(`/matches/${matchId}/twelfth-man`, {
          teamId: selectedTeam,
          player: twelfthMan
        }),
        api.put(`/matches/${matchId}/team-roles`, {
          teamId: selectedTeam,
          captain,
          viceCaptain,
          wicketKeepers
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

  const getBadge = (playerId) => {
    const badges = [];
    if (playerId === captain) badges.push("C");
    if (playerId === viceCaptain) badges.push("VC");
    if (wicketKeepers.includes(playerId)) badges.push("WK");
    return badges;
  };

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

          <div className="info-box">
            <p><strong>Instructions:</strong></p>
            <ul>
              <li>Select exactly 11 players for Playing XI</li>
              <li>Choose 1 Captain (C) from Playing XI</li>
              <li>Choose 1 Vice-Captain (VC) from Playing XI</li>
              <li>Choose 1 or more Wicket-Keepers (WK) from Playing XI</li>
              <li>Select 1 Twelfth Man (not in Playing XI)</li>
            </ul>
          </div>

          {loading ? (
            <div className="loading">Loading squad...</div>
          ) : (
            <>
              <div className="xi-section">
                <div className="section-header">
                  <h3>Playing XI ({selectedXI.length}/11)</h3>
                  <div className="roles-summary">
                    <span className="role-badge c-badge">C: {captain ? squad15.find(p => p._id === captain)?.name : "Not selected"}</span>
                    <span className="role-badge vc-badge">VC: {viceCaptain ? squad15.find(p => p._id === viceCaptain)?.name : "Not selected"}</span>
                    <span className="role-badge wk-badge">WK: {wicketKeepers.length > 0 ? wicketKeepers.map(id => squad15.find(p => p._id === id)?.name).join(", ") : "Not selected"}</span>
                  </div>
                </div>
                <div className="players-grid">
                  {squad15.map(player => {
                    const badges = getBadge(player._id);
                    const isSelected = selectedXI.includes(player._id);
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

                        {isSelected && (
                          <div className="selected-badge">XI</div>
                        )}
                      </div>
                    );
                  })}
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
                        <div className="selected-badge twelfth">12th</div>
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
            disabled={selectedXI.length !== 11 || !twelfthMan || !captain || !viceCaptain || wicketKeepers.length === 0}
          >
            Confirm Playing XI
          </button>
        </div>
      </div>
    </div>
  );
}
