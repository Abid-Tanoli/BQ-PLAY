import React from "react";
import "./MatchSummary.css";

export default function MatchSummary({ match, teams }) {
  if (!match || match.status !== "completed") {
    return null;
  }

  const inn1 = match.innings[0];
  const inn2 = match.innings[1];
  const team1 = teams?.find(t => t._id === inn1?.team?._id);
  const team2 = teams?.find(t => t._id === inn2?.team?._id);

  const getResultDescription = () => {
    if (!match.result) return "Match Completed";
    return match.result.description || "Match Completed";
  };

  const mvpPlayers = getMVPPlayers(inn1, inn2);

  return (
    <div className="match-summary">
      <div className="summary-container">
        {/* Header */}
        <div className="summary-header">
          <div className="trophy">🏆</div>
          <h2>Match Summary</h2>
        </div>

        {/* Result */}
        <div className="result-section">
          <div className="result-winner">
            {match.result?.winner ? (
              <>
                <div className="winner-team">
                  {match.result.winner?.logo && (
                    <img src={match.result.winner.logo} alt="Winner" className="logo" />
                  )}
                  <h3>{match.result.winner?.name}</h3>
                </div>
                <div className="winner-badge">WINNER</div>
              </>
            ) : (
              <div className="tied">
                <h3>Match Tied</h3>
              </div>
            )}
          </div>
          <div className="result-description">
            <p>{getResultDescription()}</p>
          </div>
        </div>

        {/* Innings Summary */}
        <div className="innings-summary">
          <div className="inning">
            <h4>{team1?.name}</h4>
            <div className="score-block">
              <div className="score">{inn1?.runs}</div>
              <div className="meta">/{inn1?.wickets} • {inn1?.overs}.{inn1?.balls % 6}</div>
            </div>
          </div>
          <div className="inning">
            <h4>{team2?.name}</h4>
            <div className="score-block">
              <div className="score">{inn2?.runs}</div>
              <div className="meta">/{inn2?.wickets} • {inn2?.overs}.{inn2?.balls % 6}</div>
            </div>
          </div>
        </div>

        {/* Player of The Match */}
        {match.manOfMatch && (
          <div className="mom-section">
            <h4>🌟 Player of the Match</h4>
            <div className="mom-card">
              {match.manOfMatch?.imageUrl && (
                <img src={match.manOfMatch.imageUrl} alt={match.manOfMatch.name} className="mom-image" />
              )}
              <div className="mom-info">
                <h3>{match.manOfMatch?.name}</h3>
                <p className="role">{match.manOfMatch?.playingRole}</p>
                <div className="mom-stats">
                  {match.manOfMatch?.stats?.runs >= 0 && (
                    <span className="stat">🏏 {match.manOfMatch.stats.runs} runs</span>
                  )}
                  {match.manOfMatch?.stats?.wickets > 0 && (
                    <span className="stat">🎯 {match.manOfMatch.stats.wickets} wickets</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MVP/Cricinfo Rankings */}
        {mvpPlayers && (
          <div className="mvp-section">
            <h4>⭐ MVP Rankings</h4>
            
            {mvpPlayers.batsmen.length > 0 && (
              <div className="mvp-category">
                <h5>Top Batsmen</h5>
                <div className="player-ranking">
                  {mvpPlayers.batsmen.map((player, idx) => (
                    <div key={idx} className="ranking-item">
                      <span className="rank">#{idx + 1}</span>
                      <span className="name">{player.name}</span>
                      <span className="score">{player.runs} runs</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mvpPlayers.bowlers.length > 0 && (
              <div className="mvp-category">
                <h5>Top Bowlers</h5>
                <div className="player-ranking">
                  {mvpPlayers.bowlers.map((player, idx) => (
                    <div key={idx} className="ranking-item">
                      <span className="rank">#{idx + 1}</span>
                      <span className="name">{player.name}</span>
                      <span className="score">{player.wickets} wickets</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mvpPlayers.allrounders.length > 0 && (
              <div className="mvp-category">
                <h5>All-Rounders</h5>
                <div className="player-ranking">
                  {mvpPlayers.allrounders.map((player, idx) => (
                    <div key={idx} className="ranking-item">
                      <span className="rank">#{idx + 1}</span>
                      <span className="name">{player.name}</span>
                      <span className="score">{player.runs}R • {player.wickets}W</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Key Moments */}
        <div className="key-moments">
          <h4>📊 Key Moments</h4>
          
          {inn1?.fallOfWickets && inn1.fallOfWickets.length > 0 && (
            <div className="moment">
              <h5>{team1?.name} - Wickets</h5>
              <div className="moment-list">
                {inn1.fallOfWickets.map((w, idx) => (
                  <div key={idx} className="moment-item">
                    <span className="number">{w.runs}-{w.wickets}</span>
                    <span className="detail">{w.player?.name} - {w.runsScoredByPlayer}({w.ballsFacedByPlayer}b)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {inn2?.fallOfWickets && inn2.fallOfWickets.length > 0 && (
            <div className="moment">
              <h5>{team2?.name} - Wickets</h5>
              <div className="moment-list">
                {inn2.fallOfWickets.map((w, idx) => (
                  <div key={idx} className="moment-item">
                    <span className="number">{w.runs}-{w.wickets}</span>
                    <span className="detail">{w.player?.name} - {w.runsScoredByPlayer}({w.ballsFacedByPlayer}b)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Toss Info */}
        <div className="toss-info-section">
          <h4>Toss</h4>
          <p>
            <strong>{match.tossWinner?.name}</strong> won the toss and chose to <strong>{match.tossDecision === "bat" ? "BAT" : "BOWL"}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

function getMVPPlayers(inn1, inn2) {
  const allBatters = [...(inn1?.batting || []), ...(inn2?.batting || [])];
  const allBowlers = [...(inn1?.bowling || []), ...(inn2?.bowling || [])];

  const topBatsmen = allBatters
    .filter(b => b.runs > 0)
    .sort((a, b) => b.runs - a.runs)
    .slice(0, 3)
    .map(b => ({
      name: b.player?.name,
      runs: b.runs,
      balls: b.balls,
      strikeRate: b.strikeRate
    }));

  const topBowlers = allBowlers
    .filter(b => b.wickets > 0)
    .sort((a, b) => b.wickets - a.wickets || a.runs - b.runs)
    .slice(0, 3)
    .map(b => ({
      name: b.player?.name,
      wickets: b.wickets,
      runs: b.runs,
      economy: b.economy
    }));

  const allrounders = allBatters
    .filter(b => {
      const bowlingStats = allBowlers.find(bw => bw.player?._id === b.player?._id);
      return b.runs > 20 && bowlingStats && bowlingStats.wickets > 0;
    })
    .slice(0, 3)
    .map(b => {
      const bowlingStats = allBowlers.find(bw => bw.player?._id === b.player?._id);
      return {
        name: b.player?.name,
        runs: b.runs,
        wickets: bowlingStats?.wickets || 0
      };
    });

  return { batsmen: topBatsmen, bowlers: topBowlers, allrounders };
}
