import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EnhancedScoreboard.css";

export default function EnhancedScoreboard({ match, onSelectPlayer, selectedPlayerId }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("batting");

  if (!match || !match.innings || match.innings.length === 0) {
    return <div className="scoreboard-placeholder">No match data available</div>;
  }

  const currentInningsIdx = match.currentInnings || 0;
  const currentInnings = match.innings[currentInningsIdx];
  const battingTeam = currentInnings.team;

  if (!currentInnings) {
    return <div className="scoreboard-placeholder">Match not started</div>;
  }

  const batting = currentInnings.batting || [];
  const bowling = currentInnings.bowling || [];
  const playingXI = match.playingXI?.find(x => x.team?._id === battingTeam._id)?.players || [];
  const playedPlayers = new Set(batting.map(b => b.player?._id || b.player));
  const yetToBat = playingXI.filter(p => !playedPlayers.has(p._id));

  const bowlingTeamId = match.teams.find(t => t._id !== battingTeam._id)?._id;
  const bowlingTeamPlayers = match.playingXI?.find(x => x.team?._id === bowlingTeamId)?.players || [];

  return (
    <div className="enhanced-scoreboard">
      {/* Header with Score */}
      <div className="scoreboard-header">
        <div className="team-info">
          {battingTeam?.logo && <img src={battingTeam.logo} alt={battingTeam.name} className="team-logo" />}
          <h3>{battingTeam?.name}</h3>
        </div>
        <div className="score-display">
          <div className="runs">{currentInnings.runs}</div>
          <div className="wickets">{currentInnings.wickets}</div>
          <div className="overs">{currentInnings.overs}.{currentInnings.balls % 6}</div>
        </div>
        <div className="run-rate">
          <div className="label">RR</div>
          <div className="value">{currentInnings.runRate}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="scoreboard-tabs">
        <button 
          className={`tab ${activeTab === 'batting' ? 'active' : ''}`}
          onClick={() => setActiveTab('batting')}
        >
          Batting
        </button>
        <button 
          className={`tab ${activeTab === 'bowling' ? 'active' : ''}`}
          onClick={() => setActiveTab('bowling')}
        >
          Bowling
        </button>
      </div>

      {/* Content */}
      <div className="scoreboard-content">
        {activeTab === 'batting' ? (
          <div className="batting-section">
            {/* Batting Stats Table */}
            <div className="stats-table">
              <table>
                <thead>
                  <tr>
                    <th>Batsman</th>
                    <th>R</th>
                    <th>B</th>
                    <th>4</th>
                    <th>6</th>
                    <th>SR</th>
                    <th>0s</th>
                  </tr>
                </thead>
                <tbody>
                  {batting.map((batter, idx) => (
                    <tr 
                      key={idx}
                      className={`${batter.isOut ? 'out' : ''} ${selectedPlayerId === batter.player?._id ? 'selected' : ''}`}
                      onClick={() => navigate(`/player-profile/${batter.player?._id}`)}
                    >
                      <td className="player-name">
                        <strong>{batter.player?.name}</strong>
                        {batter.isOut && <span className="status">(c) {batter.dismissalType}</span>}
                      </td>
                      <td>{batter.runs}</td>
                      <td>{batter.balls}</td>
                      <td>{batter.fours}</td>
                      <td>{batter.sixes}</td>
                      <td>{batter.strikeRate}</td>
                      <td><span className="dot-balls">{batter.dotBalls || 0}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Yet to Bat */}
            {yetToBat.length > 0 && (
              <div className="yet-to-bat">
                <h4>Yet to bat</h4>
                <div className="player-list">
                  {yetToBat.map((player, idx) => (
                    <div 
                      key={idx}
                      className="player-item"
                      onClick={() => navigate(`/player-profile/${player._id}`)}
                    >
                      <span className="player-name">{player.name}</span>
                      <span className="player-role">{player.playingRole}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extras Summary */}
            <div className="extras-summary">
              <div className="extra-item">
                <span>Wides</span>
                <span className="value">{currentInnings.extras?.wides || 0}</span>
              </div>
              <div className="extra-item">
                <span>No Balls</span>
                <span className="value">{currentInnings.extras?.noBalls || 0}</span>
              </div>
              <div className="extra-item">
                <span>Byes</span>
                <span className="value">{currentInnings.extras?.byes || 0}</span>
              </div>
              <div className="extra-item">
                <span>Leg Byes</span>
                <span className="value">{currentInnings.extras?.legByes || 0}</span>
              </div>
              <div className="extra-item total">
                <span>Total Extras</span>
                <span className="value">{currentInnings.extras?.total || 0}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bowling-section">
            {/* Bowling Stats Table */}
            <div className="stats-table">
              <table>
                <thead>
                  <tr>
                    <th>Bowler</th>
                    <th>O</th>
                    <th>M</th>
                    <th>R</th>
                    <th>W</th>
                    <th>ECON</th>
                    <th>0s</th>
                    <th>WD</th>
                    <th>NB</th>
                  </tr>
                </thead>
                <tbody>
                  {bowling.map((bowler, idx) => (
                    <tr 
                      key={idx}
                      onClick={() => navigate(`/player-profile/${bowler.player?._id}`)}
                    >
                      <td className="player-name">
                        <strong>{bowler.player?.name}</strong>
                      </td>
                      <td>{bowler.overs}</td>
                      <td>{bowler.maidens}</td>
                      <td>{bowler.runs}</td>
                      <td>{bowler.wickets}</td>
                      <td>{bowler.economy}</td>
                      <td><span className="dot-balls">{bowler.dotBalls || 0}</span></td>
                      <td>{bowler.wides}</td>
                      <td>{bowler.noBalls}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bowlers Available */}
            {bowlingTeamPlayers.length > 0 && (
              <div className="bowlers-available">
                <h4>Bowlers Available (from Playing XI)</h4>
                <div className="player-list">
                  {bowlingTeamPlayers.map((player, idx) => {
                    const hasBowled = bowling.some(b => b.player?._id === player._id);
                    return (
                      <div 
                        key={idx}
                        className={`player-item ${hasBowled ? 'has-bowled' : ''}`}
                        onClick={() => navigate(`/player-profile/${player._id}`)}
                      >
                        <span className="player-name">{player.name}</span>
                        <span className="player-role">{player.playingRole}</span>
                        {!hasBowled && <span className="badge">Available</span>}
                        {hasBowled && <span className="badge bowled">Bowled</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
