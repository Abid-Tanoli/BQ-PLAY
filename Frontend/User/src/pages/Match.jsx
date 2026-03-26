import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";
import MatchTabs from "../components/MatchTabs";
import { initSocket, joinMatchRoom, leaveMatchRoom } from "../services/socket";

const Match = () => {
  const { matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const socket = initSocket();

    const loadMatch = async () => {
      try {
        const res = await api.get(`/matches/${matchId}`);
        if (mounted) setMatch(res.data);
      } catch (err) {
        console.error("Failed to load match:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadMatch();

    const onMatchUpdated = (updatedMatch) => {
      if (!mounted) return;
      if (updatedMatch._id === matchId) {
        setMatch(updatedMatch);
      }
    };

    const onScoreUpdate = () => loadMatch();
    const onBallUpdate = () => loadMatch();

    socket.on("match:updated", onMatchUpdated);
    socket.on("match:scoreUpdate", onScoreUpdate);
    socket.on("match:ballUpdate", onBallUpdate);
    
    joinMatchRoom(matchId);

    return () => {
      mounted = false;
      leaveMatchRoom(matchId);
      socket.off("match:updated", onMatchUpdated);
      socket.off("match:scoreUpdate", onScoreUpdate);
      socket.off("match:ballUpdate", onBallUpdate);
    };
  }, [matchId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#031d44] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-[#031d44] flex items-center justify-center text-white font-black uppercase tracking-widest">
        Match Signal Lost
      </div>
    );
  }

  return <MatchTabs matchId={matchId} match={match} />;
};

export default Match;