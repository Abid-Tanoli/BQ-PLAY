import { io as clientIo } from "socket.io-client";

const SOCKET_KEY = "__BQ_PLAY_USER_SOCKET__";
let socket = globalThis[SOCKET_KEY] || null;

const setSocket = (nextSocket) => {
  socket = nextSocket;
  globalThis[SOCKET_KEY] = nextSocket;
};

export function initSocket() {
  if (socket?.connected) return socket;

  if (socket) {
    socket.removeAllListeners();
    socket.connect();
    return socket;
  }

  const SERVER = import.meta.env.VITE_SOCKET_URL || (import.meta.env.DEV ? "http://localhost:5000" : window.location.origin);

  socket = clientIo(SERVER, {
    transports: ["websocket"],
    reconnection: true,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
    reconnectionAttempts: Infinity,
    timeout: 30000,
    withCredentials: true,
  });
  setSocket(socket);

  socket.on("connect", () => {
    console.log(`[SOCKET] connect    id=${socket.id}`);
  });

  socket.on("disconnect", (reason) => {
    console.log(`[SOCKET] disconnect id=${socket?.id} reason=${reason}`);
  });

  socket.on("connect_error", (err) => {
    if (!socket?.connected) {
      console.warn(`[SOCKET] error      ${err.message}`);
    }
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log(`[SOCKET] reconnect  id=${socket.id} after ${attemptNumber} attempts`);
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
    socket.removeAllListeners();
    socket.disconnect();
    setSocket(null);
  }
}

// HMR: do NOT disconnect — just clear listeners
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (socket) {
      socket.removeAllListeners();
    }
  });
}

export default {
  initSocket,
  joinMatchRoom,
  leaveMatchRoom,
  disconnectSocket,
};
