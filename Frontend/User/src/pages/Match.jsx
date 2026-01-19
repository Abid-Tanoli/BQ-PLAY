import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";
import MatchTabs from "../components/MatchTabs";
import { initSocket, joinMatchRoom, leaveMatchRoom } from "../services/socket";

const Match = () => {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    initSocket();

    const load = async () => {
      try {
        const res = await api.get(`/matches/${id}`);
        if (mounted) setMatch(res.data);
      } catch (err) {
        console.error("Failed to load match:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();

    const socket = initSocket();
    const onMatchUpdate = (payload) => {
      if (!mounted) return;
      if (payload.matchId !== id) return;
      setMatch((prev) => {
        const next = prev ? { ...prev } : {};
        if (payload.innings) next.innings = payload.innings;
        if (payload.status) next.status = payload.status;
        return next;
      });
    };
    const onCommentary = (payload) => {
      if (!mounted) return;
      if (payload.matchId !== id) return;
      setMatch((prev) => {
        const next = prev ? { ...prev } : {};
        next.commentary = [...(next.commentary || []), payload.commentary];
        return next;
      });
    };

    socket.on("match:update", onMatchUpdate);
    socket.on("match:commentary", onCommentary);
    joinMatchRoom(id);

    return () => {
      mounted = false;
      leaveMatchRoom(id);
      socket.off("match:update", onMatchUpdate);
      socket.off("match:commentary", onCommentary);
    };
  }, [id]);

  if (loading) {
    return <div className="p-4 text-gray-300">Loading match...</div>;
  }

  return <MatchTabs matchId={id} match={match} />;
};

export default Match;