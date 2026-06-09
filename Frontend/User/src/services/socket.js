import { io as clientIo } from "socket.io-client";

const SOCKET_KEY = "__BQ_PLAY_USER_SOCKET__";
let socket = globalThis[SOCKET_KEY] || null;

const setSocket = (nextSocket) => {
  socket = nextSocket;
  globalThis[SOCKET_KEY] = nextSocket;
};

export function initSocket() {
  if (socket) return socket;

  const SERVER = import.meta.env.VITE_SOCKET_URL || (import.meta.env.DEV ? "http://localhost:5000" : window.location.origin);

  socket = clientIo(SERVER, {
    transports: ["polling", "websocket"],
    upgrade: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
    withCredentials: true,
  });
  setSocket(socket);

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("connect_error", (err) => {
    if (!socket?.connected) {
      console.warn("Socket connect_error:", err.message);
    }
  });

  return socket;
}

export function getSocket() {
  return initSocket();
}

export function joinMatchRoom(matchId) {
  const s = initSocket();
  s.emit("join-match", matchId);
}

export function leaveMatchRoom(matchId) {
  if (!socket) return;
  socket.emit("leave-match", matchId);
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    setSocket(null);
  }
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  });
}

export default {
  initSocket,
  joinMatchRoom,
  leaveMatchRoom,
  disconnectSocket,
};
