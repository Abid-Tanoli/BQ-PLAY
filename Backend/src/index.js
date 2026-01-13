import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

import connectDB from "./utils/db.js";

import matchRoutes from "./routes/matchRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import playerRoutes from "./routes/playerRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import * as matchController from "./controllers/matchController.js";

/* =========================
   CONNECT DATABASE
========================= */
connectDB();

/* =========================
   APP + SERVER
========================= */
const app = express();
const server = http.createServer(app);

/* =========================
   SOCKET.IO
========================= */
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  socket.on("joinMatch", (matchId) => {
    socket.join(matchId);
    console.log(`📡 User joined match room: ${matchId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

/* =========================
   MIDDLEWARES
========================= */
app.use(cors());
app.use(express.json());

/* =========================
   ROUTES
========================= */
app.use("/api/matches", matchRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/users", userRoutes);

/* =========================
   LIVE SCORE ROUTE (needs io)
========================= */
app.post(
  "/api/matches/:id/score",
  (req, res) => matchController.updateScore(io, req, res)
);

/* =========================
   SERVER LISTEN
========================= */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
