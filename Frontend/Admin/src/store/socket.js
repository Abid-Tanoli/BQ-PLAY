import { io } from "socket.io-client";

let socket;

export const initSocket = () => {
  if (!socket) {
    const url = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    socket = io(url, { transports: ["websocket", "polling"] });
  }
  return socket;
};

export const getSocket = () => socket;