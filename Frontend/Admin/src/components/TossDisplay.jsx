import React, { useState } from "react";
import api from "../services/api";
import "./TossDisplay.css";

export default function TossDisplay({ match, teams, onUpdate }) {
  const [showTossModal, setShowTossModal] = useState(false);
  const [tossWinner, setTossWinner] = useState(match?.tossWinner?._id || "");
  const [tossDecision, setTossDecision] = useState(match?.tossDecision || "bat");
  const [loading, setLoading] = useState(false);

  const handleTossSubmit = async () => {
    if (!tossWinner) {
      alert("Please select toss winner");
      return;
    }

    setLoading(true);
    try {
      await api.put(`/matches/${match._id}/toss`, {
        tossWinnerId: tossWinner,
        decision: tossDecision
      });
      setShowTossModal(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Failed to update toss:", err);
      alert("Failed to update toss. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!match) return null;

  const tossWinnerTeam = teams?.find(t => t._id === match.tossWinner?._id);
  const bowlingTeam = teams?.find(t => t._id !== match.tossWinner?._id);

  return (
    <>
      <div className="toss-display">
        {match.tossWinner ? (
          <div className="toss-info">
            <div className="toss-winner">
              🏆 <strong>{tossWinnerTeam?.name || "Team"}</strong> won the toss
            </div>
            <div className="toss-decision">
              {match.tossDecision === "bat" ? (
                <span className="bat">🏏 <strong>{tossWinnerTeam?.name}</strong> chose to <strong>BAT</strong></span>
              ) : (
                <span className="bowl">🎯 <strong>{tossWinnerTeam?.name}</strong> chose to <strong>BOWL</strong></span>
              )}
            </div>
            <button 
              className="btn-edit-toss"
              onClick={() => {
                setTossWinner(match.tossWinner?._id);
                setTossDecision(match.tossDecision);
                setShowTossModal(true);
              }}
            >
              Edit Toss
            </button>
          </div>
        ) : (
          <div className="no-toss">
            <button 
              className="btn-set-toss"
              onClick={() => setShowTossModal(true)}
            >
              🏆 Set Toss Result
            </button>
          </div>
        )}
      </div>

      {showTossModal && (
        <div className="toss-modal-overlay">
          <div className="toss-modal">
            <div className="modal-header">
              <h2>Set Toss Result</h2>
              <button className="close-btn" onClick={() => setShowTossModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Toss Winner:</label>
                <select 
                  value={tossWinner} 
                  onChange={(e) => setTossWinner(e.target.value)}
                >
                  <option value="">-- Select Team --</option>
                  {teams?.map(team => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Winning Team Chose to:</label>
                <div className="radio-group">
                  <label>
                    <input 
                      type="radio" 
                      name="decision" 
                      value="bat" 
                      checked={tossDecision === "bat"}
                      onChange={(e) => setTossDecision(e.target.value)}
                    />
                    <span>🏏 BAT First</span>
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="decision" 
                      value="bowl" 
                      checked={tossDecision === "bowl"}
                      onChange={(e) => setTossDecision(e.target.value)}
                    />
                    <span>🎯 BOWL First</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowTossModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleTossSubmit}
                disabled={!tossWinner || loading}
              >
                {loading ? "Saving..." : "Set Toss"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
