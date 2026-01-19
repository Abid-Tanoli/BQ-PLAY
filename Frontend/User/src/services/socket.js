import { io as clientIo } from "socket.io-client";

let socket = null;

export function initSocket() {
  if (socket) return socket;
  const SERVER = process.env.REACT_APP_API_SOCKET || (window.location.origin.replace(/:\d+$/, ":5000"));
  socket = clientIo(SERVER, {
    transports: ["websocket"],
  });
  socket.on("connect", () => {
    console.log("Socket connected", socket.id);
  });
  socket.on("connect_error", (err) => {
    console.warn("Socket connect_error", err.message);
  });
  return socket;
}

export function joinMatchRoom(matchId) {
  const s = initSocket();
  s.emit("joinMatch", matchId);
}

export function leaveMatchRoom(matchId) {
  if (!socket) return;
  socket.emit("leaveMatch", matchId);
}

export default {
  initSocket,
  joinMatchRoom,
  leaveMatchRoom,
};