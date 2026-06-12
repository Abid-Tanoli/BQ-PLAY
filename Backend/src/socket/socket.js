import { Server } from "socket.io";

let io;

const matchRoom = (matchId) => `match-${matchId}`;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true
    },
    transports: ["websocket"],
    pingTimeout: 120000,
    pingInterval: 30000,
    connectTimeout: 30000,
    maxHttpBufferSize: 1e6,
  });

  io.on("connection", (socket) => {
    const clientIp = socket.handshake.address;
    console.log(`[SOCKET] connect  id=${socket.id} ip=${clientIp} transport=${socket.conn.transport.name}`);

    socket.conn.on("upgrade", (transport) => {
      console.log(`[SOCKET] upgrade  id=${socket.id} transport=${transport.name}`);
    });

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`[SOCKET] join     id=${socket.id} room=${roomId}`);
    });

    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);
    });

    socket.on("join-match", (matchId) => {
      socket.join(matchRoom(matchId));
      socket.join(matchId);
      console.log(`[SOCKET] join     id=${socket.id} match=${matchId}`);
    });

    socket.on("leave-match", (matchId) => {
      socket.leave(matchRoom(matchId));
      socket.leave(matchId);
    });

    socket.on("join-teams", () => { socket.join("teams"); });
    socket.on("join-players", () => { socket.join("players"); });
    socket.on("join-cricket-live", () => { socket.join("cricket-live"); });

    socket.on("JOIN_IMATCH", ({ matchId, id } = {}) => {
      const roomId = matchId || id;
      if (!roomId) return;
      socket.join(`imatch_${roomId}`);
      socket.join(`m_${roomId}`);
    });

    socket.on("LEAVE_IMATCH", ({ matchId, id } = {}) => {
      const roomId = matchId || id;
      if (!roomId) return;
      socket.leave(`imatch_${roomId}`);
      socket.leave(`m_${roomId}`);
    });

    socket.on("JOIN_MATCH", ({ matchId, id } = {}) => {
      const roomId = matchId || id;
      if (!roomId) return;
      socket.join(`imatch_${roomId}`);
      socket.join(`m_${roomId}`);
    });

    socket.on("LEAVE_MATCH", ({ matchId, id } = {}) => {
      const roomId = matchId || id;
      if (!roomId) return;
      socket.leave(`imatch_${roomId}`);
      socket.leave(`m_${roomId}`);
    });

    socket.on("JOIN", ({ matchId, id } = {}) => {
      const roomId = matchId || id;
      if (!roomId) return;
      socket.join(`imatch_${roomId}`);
      socket.join(`m_${roomId}`);
    });

    socket.on("LEAVE", ({ matchId, id } = {}) => {
      const roomId = matchId || id;
      if (!roomId) return;
      socket.leave(`imatch_${roomId}`);
      socket.leave(`m_${roomId}`);
    });

    socket.on("match:updateList", () => {
      io.emit("match:updateList");
    });

    socket.on("disconnect", (reason) => {
      console.log(`[SOCKET] disconnect id=${socket.id} reason=${reason}`);
    });
  });

  console.log("✅ Socket.IO initialized successfully (websocket-only)");
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized! Call initSocket first.");
  }
  return io;
};

// ─── SCORING EVENTS ────────────────────────────────────────────────

export function emitBallRecorded(matchId, data) {
  if (!io) return;
  const payload = { matchId, ...data };
  io.to(matchRoom(matchId)).emit("ball:recorded", payload);
  console.log(`[SOCKET] emit     match=${matchId} event=ball:recorded striker=${data.strikerId} runs=${data.runs}`);
}

export function emitScoreUpdate(matchId, data) {
  if (!io) return;
  io.to(matchRoom(matchId)).emit("score:update", { matchId, ...data });
}

export function emitStrikeChanged(matchId, data) {
  if (!io) return;
  io.to(matchRoom(matchId)).emit("strike:changed", { matchId, ...data });
  console.log(`[SOCKET] emit     match=${matchId} event=strike:changed striker=${data.strikerId} nonStriker=${data.nonStrikerId}`);
}

export function emitOverCompleted(matchId, data) {
  if (!io) return;
  io.to(matchRoom(matchId)).emit("over:completed", { matchId, ...data });
  console.log(`[SOCKET] emit     match=${matchId} event=over:completed over=${data.overNumber}`);
}

export function emitInningsEnd(matchId, data) {
  if (!io) return;
  io.to(matchRoom(matchId)).emit("innings:end", { matchId, ...data });
}

export function emitMatchEnd(matchId, data) {
  if (!io) return;
  io.to(matchRoom(matchId)).emit("match:end", { matchId, ...data });
  io.emit("match:updateList");
}

export function emitWicketAlert(matchId, data) {
  if (!io) return;
  io.to(matchRoom(matchId)).emit("WICKET_ALERT", data);
}

export function emitMilestoneAlert(matchId, data) {
  if (!io) return;
  io.to(matchRoom(matchId)).emit("MILESTONE_ALERT", data);
}

// ─── LEGACY EVENTS (keep for backward compat, remove after migration) ────

export const emitMatchUpdate = (matchId, data) => {
  if (io) io.to(matchRoom(matchId)).emit("match:update", data);
};

export const emitBallUpdate = (matchId, data) => {
  if (io) io.to(matchRoom(matchId)).emit("BALL_UPDATE", data);
};

export const emitBallWithCommentary = (matchId, data) => {
  if (io) io.to(matchRoom(matchId)).emit("match:ballWithCommentary", data);
};

export const emitAICommentary = (matchId, data) => {
  if (io) io.to(matchRoom(matchId)).emit("match:aiCommentary", data);
};

export const emitMatchStatusChange = (matchId, data) => {
  if (io) io.to(matchRoom(matchId)).emit("MATCH_STATUS_CHANGE", data);
};

export const emitInningsComplete = (matchId, data) => {
  if (io) io.to(matchRoom(matchId)).emit("INNINGS_COMPLETE", data);
};

export const emitMatchResult = (matchId, data) => {
  if (io) io.to(matchRoom(matchId)).emit("MATCH_RESULT", data);
};

export const emitFieldClick = (matchId, data) => {
  if (io) io.to(matchRoom(matchId)).emit("match:fieldClick", data);
};

export const emitDRSUpdate = (matchId, data) => {
  if (io) io.to(matchRoom(matchId)).emit("DRS_UPDATE", data);
};

export const emitReviewDecision = (matchId, data) => {
  if (io) io.to(matchRoom(matchId)).emit("REVIEW_DECISION", data);
};

export const emitUmpireSignal = (matchId, signal) => {
  if (io) io.to(matchRoom(matchId)).emit("UMPIRE_SIGNAL", { signal, timestamp: new Date() });
};

export const emitTeamUpdate = (team) => {
  if (io) { io.to("teams").emit("team:updated", team); }
};

export const emitTeamCreated = (team) => {
  if (io) { io.to("teams").emit("team:created", team); }
};

export const emitTeamDeleted = (teamId) => {
  if (io) { io.to("teams").emit("team:deleted", { id: teamId }); }
};

export const emitPlayerUpdate = (player) => {
  if (io) { io.to("players").emit("player:updated", player); }
};

export const emitCricketLiveUpdate = (data) => {
  if (io) { io.to("cricket-live").emit("cricket:liveUpdate", data); }
};
