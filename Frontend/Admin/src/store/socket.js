import { io } from "socket.io-client";

let socket = null;

export const initSocket = () => {
  if (!socket || !socket.connected) {
    const url = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    
    socket = io(url, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      timeout: 20000,
      autoConnect: true,
      withCredentials: true
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
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
    socket = null;
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

export default { initSocket, getSocket, disconnectSocket, isSocketConnected, emitSocket };