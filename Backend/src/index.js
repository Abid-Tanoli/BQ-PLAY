import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./utils/db.js";
import { initSocket } from "./socket/socket.js";

import authRoutes from "./routes/authRoutes.js";
import playerRoutes from "./routes/playerRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import liveMatchRoutes from "./routes/liveMatchRoutes.js"

dotenv.config();

const app = express();
connectDB();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/admin/matches", adminRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/livematch", liveMatchRoutes)

app.use(errorHandler);

const server = http.createServer(app);
const io = initSocket(server);

app.use((req, res, next) => {
  req.io = io;
  next();
});

server.listen(5000, () => {
  console.log("🚀 Backend running on port 5000");
});
