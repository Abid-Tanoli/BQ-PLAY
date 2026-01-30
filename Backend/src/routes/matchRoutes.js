import express from "express";
import {
  getMatches,
  getMatch,
  createMatch,
  updateMatch,
  deleteMatch,
  setMOM,
  getMatchStats,
  updateMatchStatus
} from "../controllers/matchController.js";
import { updateScore, endInnings } from "../controllers/scoreController.js";

const router = express.Router();

router.get("/", getMatches);
router.get("/:id", getMatch);
router.get("/:id/stats", getMatchStats);

router.post("/", createMatch);
router.post("/:matchId/score", updateScore);
router.post("/:matchId/end-innings", endInnings);

router.put("/:id", updateMatch);
router.put("/:id/status", updateMatchStatus);
router.put("/:id/mom", setMOM);

router.delete("/:id", deleteMatch);

export default router;