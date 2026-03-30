import React, { useState } from "react";
import api from "../services/api";
import "./CommentaryEditor.css";

export default function CommentaryEditor({ match, matchId, onCommentaryUpdate }) {
  const [editingBall, setEditingBall] = useState(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(false);

  if (!match || !match.innings) {
    return <div className="commentary-placeholder">No match data</div>;
  }

  const currentInningsIdx = match.currentInnings || 0;
  const currentInnings = match.innings[currentInningsIdx];

  if (!currentInnings || !currentInnings.oversHistory) {
    return <div className="commentary-placeholder">No balls bowled yet</div>;
  }

  const handleEditClick = (overIdx, ballIdx, currentCommentary) => {
    setEditingBall({ overIdx, ballIdx });
    setEditText(currentCommentary || "");
  };

  const handleSaveCommentary = async (overIdx, ballIdx) => {
    if (!editText.trim()) {
      alert("Commentary cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const over = currentInnings.oversHistory[overIdx];
      const ball = over.balls[ballIdx];

      await api.put(`/matches/${matchId}/edit-commentary`, {
        inningsIndex: currentInningsIdx,
        overNumber: over.overNumber,
        ballNumber: ball.ballNumber,
        newCommentary: editText
      });

      setEditingBall(null);
      if (onCommentaryUpdate) onCommentaryUpdate();
    } catch (err) {
      console.error("Failed to update commentary:", err);
      alert("Failed to update commentary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="commentary-editor">
      <div className="commentary-header">
        <h3>Ball-by-Ball Commentary</h3>
        <p className="subtitle">Click any commentary to edit</p>
      </div>

      <div className="commentary-list">
        {currentInnings.oversHistory.length === 0 ? (
          <div className="empty-state">
            <p>No balls bowled yet</p>
          </div>
        ) : (
          currentInnings.oversHistory.map((over, overIdx) => (
            <div key={overIdx} className="over-group">
              <div className="over-header">
                <span className="over-number">Over {over.overNumber + 1}</span>
                <span className="over-summary">
                  {over.runsScored} runs
                  {over.wickets > 0 && ` • ${over.wickets} wicket${over.wickets > 1 ? 's' : ''}`}
                  {over.maidenOver && ' • Maiden'}
                </span>
              </div>

              <div className="balls-group">
                {over.balls.map((ball, ballIdx) => {
                  const isEditing =
                    editingBall?.overIdx === overIdx && editingBall?.ballIdx === ballIdx;
                  const ballLabel = `${over.overNumber}.${ball.ballNumber}`;

                  return (
                    <div key={ballIdx} className="ball-commentary">
                      <div className="ball-header">
                        <span className="ball-number">{ballLabel}</span>
                        <span className={`ball-notation ${getBallClass(ball)}`}>
                          {ball.notation}
                        </span>
                      </div>

                      {isEditing ? (
                        <div className="editing-mode">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows={4}
                            placeholder="Enter commentary..."
                            autoFocus
                          />
                          <div className="edit-actions">
                            <button
                              className="btn-save"
                              onClick={() => handleSaveCommentary(overIdx, ballIdx)}
                              disabled={loading}
                            >
                              {loading ? "Saving..." : "Save"}
                            </button>
                            <button
                              className="btn-cancel"
                              onClick={() => setEditingBall(null)}
                              disabled={loading}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="commentary-text"
                          onClick={() => handleEditClick(overIdx, ballIdx, ball.commentary)}
                        >
                          {ball.commentary ? (
                            <>
                              {getCricketCommentary(ball)}
                              <div className="edit-hint">Click to edit</div>
                            </>
                          ) : (
                            <em className="no-commentary">No commentary. Click to add.</em>
                          )}
                        </div>
                      )}

                      <div className="ball-details">
                        {ball.batsmanOnStrike && (
                          <span className="detail">
                            🏏 {ball.batsmanOnStrike?.name}
                          </span>
                        )}
                        {ball.bowler && (
                          <span className="detail">
                            🎯 {ball.bowler?.name}
                          </span>
                        )}
                        {ball.isWide && <span className="detail badge">Wide</span>}
                        {ball.isNoBall && <span className="detail badge">No Ball</span>}
                        {ball.isWicket && (
                          <span className="detail badge wicket">
                            {ball.wicketType}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function getBallClass(ball) {
  if (ball.isWicket) return "wicket";
  if (ball.isWide) return "wide";
  if (ball.isNoBall) return "noball";
  if (ball.runs === 4) return "four";
  if (ball.runs === 6) return "six";
  if (ball.runs === 0) return "dot";
  return "run";
}

function getCricketCommentary(ball) {
  const parts = ball.commentary?.split("\n") || [];
  return parts
    .filter((p) => p.trim())
    .map((p, i) => (
      <p key={i}>{p}</p>
    ));
}
