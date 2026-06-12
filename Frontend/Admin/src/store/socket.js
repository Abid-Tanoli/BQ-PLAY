import { io } from "socket.io-client";

const SOCKET_KEY = "__BQ_PLAY_ADMIN_SOCKET__";
let socket = globalThis[SOCKET_KEY] || null;

const setSocket = (nextSocket) => {
  socket = nextSocket;
  globalThis[SOCKET_KEY] = nextSocket;
};

export const initSocket = () => {
  if (socket?.connected) return socket;

  if (socket) {
    // Previous socket exists but disconnected — remove stale listeners before reconnecting
    socket.removeAllListeners();
    socket.connect();
    return socket;
  }

  const url = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
  socket = io(url, {
    transports: ["websocket"],
    reconnection: true,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
    reconnectionAttempts: Infinity,
    timeout: 30000,
    autoConnect: true,
    withCredentials: true,
  });
  setSocket(socket);

  socket.on("connect", () => {
    console.log(`[SOCKET] connect    id=${socket.id}`);
  });
  socket.on("disconnect", (reason) => {
    console.log(`[SOCKET] disconnect id=${socket?.id} reason=${reason}`);
    if (reason === "io server disconnect" || reason === "transport close") {
      // Server restarted — reconnect is automatic via socket.io-client
    }
  });
  socket.on("connect_error", (error) => {
    if (!socket?.connected) {
      console.warn(`[SOCKET] error      ${error.message}`);
    }
  });
  socket.on("reconnect", (attemptNumber) => {
    console.log(`[SOCKET] reconnect  id=${socket.id} after ${attemptNumber} attempts`);
  });
  socket.io.on("reconnect_attempt", (attempt) => {
    console.log(`[SOCKET] reconnect_attempt #${attempt}`);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) return initSocket();
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log("[SOCKET] manual disconnect");
    socket.removeAllListeners();
    socket.disconnect();
    setSocket(null);
  }
};

export const isSocketConnected = () => {
  return socket && socket.connected;
};

export const emitSocket = (event, data) => {
  if (isSocketConnected()) {
    socket.emit(event, data);
    return true;
  }
  console.warn(`[SOCKET] cannot emit ${event} — not connected`);
  return false;
};

// HMR: do NOT disconnect — just remove listeners so they're re-attached on re-render.
// Socket.IO keeps the underlying WebSocket alive across HMR.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (socket) {
      socket.removeAllListeners();
    }
  });
}

export default { initSocket, getSocket, disconnectSocket, isSocketConnected, emitSocket };
