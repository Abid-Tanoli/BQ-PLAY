import express from "express";
import http from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";
import cors from "cors";
import connectDB from "./utils/db.js";
import initSocket from "./socket/socket.js";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import playerRoutes from "./routes/playerRoutes.js"
import matchRoutes from "./routes/matchRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();

connectDB();

app.use(express.json());

const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error("Not allowed by CORS"), false);
    }
    return callback(null, true);
  },
  credentials: false
}));


app.use("/api/auth", authRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
initSocket(io);

app.set("io", io);

server.listen(5000, () => console.log("🔥 Backend running on 5000"));