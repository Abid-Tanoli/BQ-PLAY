import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./FlexibleRankings.css";

export default function FlexibleRankings({ tournamentId }) {
  const navigate = useNavigate();
  const [rankingType, setRankingType] = useState("batting");
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRankings();
  }, [rankingType, tournamentId]);

  const loadRankings = async () => {
    setLoading(true);
    try {
      let endpoint = "";
      if (tournamentId) {
        // Tournament-specific rankings
        endpoint = `/tournaments/${tournamentId}`;
      } else {
        // Overall rankings
        endpoint = `/players`;
      }

      const res = await api.get(endpoint);
      const players = Array.isArray(res.data) ? res.data : res.data.players || [];

      const ranked = calculateRankings(players, rankingType);
      setRankings(ranked);
    } catch (err) {
      console.error("Failed to load rankings:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateRankings = (players, type) => {
    let sorted = [...players];

    switch (type) {
      case "batting":
        // Sort by runs, then by strike rate
        sorted = sorted
          .filter(p => p.stats?.runs > 0)
          .sort((a, b) => {
            if (b.stats.runs !== a.stats.runs) {
              return b.stats.runs - a.stats.runs;
            }
            return (b.stats.strikeRate || 0) - (a.stats.strikeRate || 0);
          });
        break;

      case "bowling":
        // Sort by wickets, then by economy
        sorted = sorted
          .filter(p => p.stats?.wickets > 0)
          .sort((a, b) => {
            if (b.stats.wickets !== a.stats.wickets) {
              return b.stats.wickets - a.stats.wickets;
            }
            return (a.stats.economy || 0) - (b.stats.economy || 0);
          });
        break;

      case "allrounder":
        // Filter players with both runs and wickets
        // Score = (runs / 100) + (wickets * 5)
        sorted = sorted
          .filter(p => p.stats?.runs > 20 && p.stats?.wickets > 0)
          .map(p => ({
            ...p,
            allrounderScore:
              (p.stats.runs / 100) * 50 + p.stats.wickets * 50
          }))
          .sort((a, b) => b.allrounderScore - a.allrounderScore);
        break;

      case "batting-ar":
        // Batting all-rounder: Primarily bat, secondarily bowl
        sorted = sorted
          .filter(p => {
            const isBatter = p.stats?.runs > 100 || p.playingRole?.includes("Batsman");
            const isBowler = p.stats?.wickets > 2;
            return isBatter && isBowler;
          })
          .sort((a, b) => b.stats.runs - a.stats.runs);
        break;

      case "bowling-ar":
        // Bowling all-rounder: Primarily bowl, secondarily bat
        sorted = sorted
          .filter(p => {
            const isBowler = p.stats?.wickets > 5 || p.playingRole?.includes("Bowler");
            const isBatter = p.stats?.runs > 50;
            return isBowler && isBatter;
          })
          .sort((a, b) => b.stats.wickets - a.stats.wickets);
        break;

      case "avg":
        // Batting average: min 3 innings
        sorted = sorted
          .filter(p => (p.stats?.innings || 0) >= 3 && p.stats?.average > 0)
          .sort((a, b) => (b.stats.average || 0) - (a.stats.average || 0));
        break;

      case "economy":
        // Best economy rate: min 2 overs
        sorted = sorted
          .filter(p => (p.stats?.overs || 0) >= 2)
          .sort((a, b) => (a.stats.economy || 0) - (b.stats.economy || 0));
        break;

      default:
        break;
    }

    return sorted.slice(0, 50); // Top 50
  };

  const getRankingTitle = () => {
    const titles = {
      batting: "🏏 Top Batsmen",
      bowling: "🎯 Top Bowlers",
      allrounder: "⭐ Top All-Rounders",
      "batting-ar": "🏏⚡ Batting All-Rounders",
      "bowling-ar": "🎯⚡ Bowling All-Rounders",
      avg: "📊 Best Batting Average",
      economy: "💨 Best Economy Rate"
    };
    return titles[rankingType] || "Rankings";
  };

  const getStatDisplay = (player, type) => {
    switch (type) {
      case "batting":
        return {
          primary: `${player.stats?.runs || 0} runs`,
          secondary: `SR: ${player.stats?.strikeRate || 0}`
        };
      case "bowling":
        return {
          primary: `${player.stats?.wickets || 0} wickets`,
          secondary: `Econ: ${player.stats?.economy || 0}`
        };
      case "allrounder":
        return {
          primary: `${player.stats?.runs || 0}R • ${player.stats?.wickets || 0}W`,
          secondary: `Score: ${(player.allrounderScore || 0).toFixed(1)}`
        };
      case "batting-ar":
        return {
          primary: `${player.stats?.runs || 0} runs`,
          secondary: `${player.stats?.wickets || 0} wickets`
        };
      case "bowling-ar":
        return {
          primary: `${player.stats?.wickets || 0} wickets`,
          secondary: `${player.stats?.runs || 0} runs`
        };
      case "avg":
        return {
          primary: `Avg: ${(player.stats?.average || 0).toFixed(2)}`,
          secondary: `${player.stats?.innings || 0} inns`
        };
      case "economy":
        return {
          primary: `Econ: ${(player.stats?.economy || 0).toFixed(2)}`,
          secondary: `${player.stats?.overs || 0} overs`
        };
      default:
        return { primary: "", secondary: "" };
    }
  };

  return (
    <div className="flexible-rankings">
      <div className="rankings-header">
        <h2>Player Rankings</h2>
        <p className="subtitle">Click on any player to view detailed profile</p>
      </div>

      <div className="ranking-filters">
        <button
          className={`filter-btn ${rankingType === "batting" ? "active" : ""}`}
          onClick={() => setRankingType("batting")}
        >
          🏏 Batting
        </button>
        <button
          className={`filter-btn ${rankingType === "bowling" ? "active" : ""}`}
          onClick={() => setRankingType("bowling")}
        >
          🎯 Bowling
        </button>
        <button
          className={`filter-btn ${rankingType === "allrounder" ? "active" : ""}`}
          onClick={() => setRankingType("allrounder")}
        >
          ⭐ All-Rounder
        </button>
        <button
          className={`filter-btn ${rankingType === "batting-ar" ? "active" : ""}`}
          onClick={() => setRankingType("batting-ar")}
        >
          🏏⚡ Batting AR
        </button>
        <button
          className={`filter-btn ${rankingType === "bowling-ar" ? "active" : ""}`}
          onClick={() => setRankingType("bowling-ar")}
        >
          🎯⚡ Bowling AR
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading rankings...</div>
      ) : rankings.length === 0 ? (
        <div className="empty-state">
          <p>No players found for {getRankingTitle().toLowerCase()}</p>
        </div>
      ) : (
        <>
          <div className="rankings-title">{getRankingTitle()}</div>
          <div className="rankings-list">
            {rankings.map((player, idx) => {
              const stats = getStatDisplay(player, rankingType);
              return (
                <div
                  key={player._id}
                  className="ranking-card"
                  onClick={() => navigate(`/player-profile/${player._id}`)}
                >
                  <div className="rank-badge">#{idx + 1}</div>

                  <div className="player-info">
                    {player.imageUrl && (
                      <img
                        src={player.imageUrl}
                        alt={player.name}
                        className="player-image"
                      />
                    )}
                    <div className="player-details">
                      <div className="player-name">{player.name}</div>
                      <div className="player-role">{player.playingRole}</div>
                    </div>
                  </div>

                  <div className="player-stats">
                    <div className="stat-primary">{stats.primary}</div>
                    <div className="stat-secondary">{stats.secondary}</div>
                  </div>

                  <div className="view-profile">→</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
