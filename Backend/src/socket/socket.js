import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:5174"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log("⚡ Client connected:", socket.id);

    socket.on("joinRoom", (matchId) => socket.join(matchId));
    socket.on("leaveRoom", (matchId) => socket.leave(matchId));

    socket.on("match:updateList", () => io.emit("match:updateList"));

    socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
  });

  return io;
};

export const getIO = () => io;
