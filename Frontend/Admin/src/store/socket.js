import { io } from "socket.io-client";

const SOCKET_KEY = "__BQ_PLAY_ADMIN_SOCKET__";
let socket = globalThis[SOCKET_KEY] || null;

const setSocket = (nextSocket) => {
  socket = nextSocket;
  globalThis[SOCKET_KEY] = nextSocket;
};

export const initSocket = () => {
  if (!socket) {
    const url = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    socket = io(url, {
      transports: ["polling", "websocket"],
      upgrade: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 10000,
      autoConnect: true,
      withCredentials: true,
    });
    setSocket(socket);

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });
    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });
    socket.on("connect_error", (error) => {
      if (!socket?.connected) {
        console.error("❌ Socket connection error:", error.message);
      }
    });
    socket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
    });
    socket.on("reconnect_error", (error) => {
      console.error("❌ Socket reconnection error:", error.message);
    });
    socket.on("reconnect_failed", () => {
      console.error("❌ Socket reconnection failed");
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log("🔌 Disconnecting socket...");
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
  } else {
    console.warn("Socket not connected, cannot emit:", event);
    return false;
  }
};

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  });
}

export default { initSocket, getSocket, disconnectSocket, isSocketConnected, emitSocket };
