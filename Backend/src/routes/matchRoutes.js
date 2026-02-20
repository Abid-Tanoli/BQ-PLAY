import express from "express";
import {
  getMatches,
  getMatch,
  createMatch,
  updateMatch,
  deleteMatch,
  setMOM,
  getMatchStats,
  updateMatchStatus,
  setPlayingXI,
  setOpeners,
  getToss
} from "../controllers/matchController.js";
import { updateScore, endInnings, startNextInnings, reduceOvers, resolveTie, startSuperOverInnings } from "../controllers/scoreController.js";

const router = express.Router();

router.get("/", getMatches);
router.get("/:id", getMatch);
router.get("/:id/stats", getMatchStats);

router.post("/", createMatch);
router.post("/:matchId/score", updateScore);
router.post("/:matchId/end-innings", endInnings);
router.post("/:matchId/start-next-innings", startNextInnings);
router.post("/:matchId/reduce-overs", reduceOvers);
router.post("/:matchId/resolve-tie", resolveTie);
router.post("/:matchId/start-super-over", startSuperOverInnings);

router.put("/:id", updateMatch);
router.put("/:id/status", updateMatchStatus);
router.put("/:id/mom", setMOM);
router.put("/:matchId/playing-xi", setPlayingXI);
router.put("/:matchId/openers", setOpeners);
router.put("/:matchId/toss", getToss);

router.delete("/:id", deleteMatch);

export default router;