import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

import connectDB from "./utils/db.js";

import matchRoutes from "./routes/matchRoutes.js";
import playerRoutes from "./routes/playerRoutes.js";
import userRoutes from "./routes/userRoutes.js";


connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
     methods: ["GET", "POST"]
  },
});

app.use(cors());
app.use(express.json());

app.use("/api/matches", matchRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/users", userRoutes);

io.on("connection", (socket) => {
  console.log("Socket Connected:", socket.id);

  socket.on("joinMatch", (matchId) => {
    socket.join(matchId);
    console.log(`User joined match: ${matchId}`);
  });

  socket.on("scoreUpdate", (data) => {
    io.to(data.matchId).emit("updateScoreboard", data);
  });

  socket.on("commentaryUpdate", (data) => {
    io.to(data.matchId).emit("updateCommentary", data);
  });

  socket.on("disconnect", () => {
    console.log("Socket Disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Backend running on port ${PORT}`)
);
