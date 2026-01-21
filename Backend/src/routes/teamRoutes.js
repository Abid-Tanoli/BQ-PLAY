import express from "express";
import { listTeams, createTeam } from '../controllers/teamsController.js';
import Team from "../models/Team.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const teams = await Team.find().sort({ name: 1 });
    res.json(teams);
  } catch (err) {
    console.error("Failed to fetch teams:", err);
    res.status(500).json({ message: "Failed to fetch teams" });
  }
},listTeams);
router.post('/', createTeam);

export default router;
