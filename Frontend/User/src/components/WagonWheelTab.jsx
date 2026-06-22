import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { playerName, number } from "../utils/matchHelpers";
import WagonWheel from "./WagonWheel";
import { initSocket, joinMatchRoom, leaveMatchRoom } from "../services/socket";

export default function WagonWheelTab({ match, players }) {
  const [shots, setShots] = useState([]);
  const [selectedBatsman, setSelectedBatsman] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentInnings = match.innings?.[match.currentInnings];
  const battingPlayers = currentInnings?.batting || [];
  const matchId = match?._id;

  const fetchShots = useCallback(async () => {
    if (!matchId) return;
    setLoading(true);
    try {
      const url = selectedBatsman
        ? `/matches/${matchId}/wagon-wheel/${match.currentInnings + 1}/${selectedBatsman}`
        : `/matches/${matchId}/wagon-wheel/${match.currentInnings + 1}`;
      const res = await api.get(url);
      setShots(res.data || []);
    } catch (err) {
      console.error("Failed to load wagon wheel:", err);
    } finally {
      setLoading(false);
    }
  }, [matchId, match.currentInnings, selectedBatsman]);

  useEffect(() => {
    fetchShots();
  }, [fetchShots]);

  useEffect(() => {
    if (!matchId) return;
    const socket = initSocket();
    const handleShotUpdate = (payload = {}) => {
      const payloadMatchId = payload.matchId || payload.match?._id || payload._id;
      if (payloadMatchId && String(payloadMatchId) !== String(matchId)) return;
      fetchShots();
    };

    joinMatchRoom(matchId);
    socket.on("ball:recorded", handleShotUpdate);
    socket.on("match:ballUpdate", handleShotUpdate);
    socket.on("match:ballEdited", handleShotUpdate);
    socket.on("match:ballReverted", handleShotUpdate);

    return () => {
      leaveMatchRoom(matchId);
      socket.off("ball:recorded", handleShotUpdate);
      socket.off("match:ballUpdate", handleShotUpdate);
      socket.off("match:ballEdited", handleShotUpdate);
      socket.off("match:ballReverted", handleShotUpdate);
    };
  }, [matchId, fetchShots]);

  if (loading) {
    return <div className="p-6 sm:p-8 text-center text-cric-muted text-xs sm:text-sm">Loading wagon wheel...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <label htmlFor="batsman-filter" className="text-xs sm:text-sm font-medium text-cric-muted">Filter by Batsman:</label>
        <select
          id="batsman-filter"
          value={selectedBatsman || ""}
          onChange={(e) => setSelectedBatsman(e.target.value || null)}
          className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-cric-border bg-cric-card text-cric-text text-xs sm:text-sm"
        >
          <option value="">All Batsmen</option>
          {battingPlayers.map((b) => (
            <option key={b.player?._id || b.player} value={b.player?._id || b.player}>
              {playerName(b.player, players)}
            </option>
          ))}
        </select>
      </div>

      <WagonWheel 
        shots={shots.map(s => {
          const distVal = typeof s.distance === 'number' ? s.distance :
            s.distance === 'boundary' || s.distance === 'six' ? 90 :
            s.distance === 'outfield' ? 60 : 30;
          return {
            runs: s.runs,
            angle: number(s.direction) > 180 ? number(s.direction) - 360 : number(s.direction),
            distance: distVal,
            position: s.position
          };
        })}
        playerName={selectedBatsman ? battingPlayers.find(p => (p.player?._id || p.player) === selectedBatsman)?.player?.name : "All Shots"}
      />
    </div>
  );
}
