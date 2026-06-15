import express from "express";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import validateObjectId from "../middleware/validateObjectId.js";
import {
  getMatches,
  getMatch,
  createMatch,
  updateMatch,
  deleteMatch,
  setMOM,
  getMatchStats,
  getMatchLiveStats,
  getMatchSummary,
  getMatchPartnershipsSummary,
  getMatchSquads,
  updateMatchStatus,
  setPlayingXI,
  setOpeners,
  updateToss,
  setSquad15,
  setTwelfthMan,
  setBowlingXI,
  setTeamRoles
} from "../controllers/matchController.js";
import {
  updateScore,
  resolveTie,
  startSuperOverInnings,
  editCommentary,
  handleFieldClick,
  revertLastBall,
  setBowler,
  generateAICommentary,
  useStrategicTimeout,
  recordDRSReview,
  resetMatch,
  editBall,
  retireBatsman
} from "../controllers/scoreController.js";
import {
  endInnings,
  startNextInnings,
  reduceOvers,
  resetInnings
} from "../controllers/inningsController.js";
import {
  getMatchPartnerships,
  getActivePartnership,
  getWagonWheelData,
  getMatchAnalytics,
  getMatchGraphData,
  getMatchBoundaries,
  getMatchReviews,
  getMatchCommentary,
  assignMatchOfficial,
  getMatchOfficials,
  updateMatchOfficial,
  triggerUmpireSignal,
  updateMatchStatusOfficial
} from "../controllers/analyticsController.js";

import Match from "../models/Match.js";

const router = express.Router();
const adminOnly = [protect, requireAdmin];

router.get("/", getMatches);
router.get("/:id", validateObjectId("id"), getMatch);
router.get("/:id/stats", validateObjectId("id"), getMatchStats);
router.get("/:id/live-stats", validateObjectId("id"), getMatchLiveStats);
router.get("/:id/summary", validateObjectId("id"), getMatchSummary);
router.get("/:id/partnerships", validateObjectId("id"), getMatchPartnershipsSummary);
router.get("/:id/squads", validateObjectId("id"), getMatchSquads);
router.get("/:id/partnerships/:inning", validateObjectId("id"), getMatchPartnerships);
router.get("/:id/partnerships/:inning/active", validateObjectId("id"), getActivePartnership);
router.get("/:id/wagon-wheel/:inning", validateObjectId("id"), getWagonWheelData);
router.get("/:id/wagon-wheel/:inning/:batsmanId", validateObjectId("id"), validateObjectId("batsmanId"), getWagonWheelData);
router.get("/:id/analytics", validateObjectId("id"), getMatchAnalytics);
router.get("/:id/graph-data", validateObjectId("id"), getMatchGraphData);
router.get("/:id/boundaries", validateObjectId("id"), getMatchBoundaries);
router.get("/:id/drs", validateObjectId("id"), getMatchReviews);
router.get("/:id/commentary", validateObjectId("id"), getMatchCommentary);
router.get("/:id/officials", validateObjectId("id"), getMatchOfficials);

router.post("/", ...adminOnly, createMatch);
router.post("/:matchId/score", ...adminOnly, validateObjectId("matchId"), updateScore);
router.post("/:matchId/end-innings", ...adminOnly, validateObjectId("matchId"), endInnings);
router.post("/:matchId/start-next-innings", ...adminOnly, validateObjectId("matchId"), startNextInnings);
router.post("/:matchId/reduce-overs", ...adminOnly, validateObjectId("matchId"), reduceOvers);
router.post("/:matchId/resolve-tie", ...adminOnly, validateObjectId("matchId"), resolveTie);
router.post("/:matchId/start-super-over", ...adminOnly, validateObjectId("matchId"), startSuperOverInnings);
router.put("/:matchId/edit-commentary", ...adminOnly, validateObjectId("matchId"), editCommentary);
router.post("/:matchId/field-click", ...adminOnly, validateObjectId("matchId"), handleFieldClick);
router.post("/:matchId/revert-ball", ...adminOnly, validateObjectId("matchId"), revertLastBall);
router.post("/:matchId/set-bowler", ...adminOnly, validateObjectId("matchId"), setBowler);
router.post("/:matchId/ai-commentary", ...adminOnly, validateObjectId("matchId"), generateAICommentary);
router.post("/:matchId/timeout", ...adminOnly, validateObjectId("matchId"), useStrategicTimeout);
router.post("/:matchId/drs", ...adminOnly, validateObjectId("matchId"), recordDRSReview);
router.post("/:matchId/reset-innings", ...adminOnly, validateObjectId("matchId"), resetInnings);
router.post("/:matchId/reset-match", ...adminOnly, validateObjectId("matchId"), resetMatch);
router.post("/:matchId/retire-batsman", ...adminOnly, validateObjectId("matchId"), retireBatsman);
router.put("/:matchId/edit-ball", ...adminOnly, validateObjectId("matchId"), editBall);
router.post("/:matchId/officials", ...adminOnly, validateObjectId("matchId"), assignMatchOfficial);
router.put("/:matchId/officials/:userId", ...adminOnly, validateObjectId("matchId"), validateObjectId("userId"), updateMatchOfficial);
router.post("/:matchId/umpire-signal", ...adminOnly, validateObjectId("matchId"), triggerUmpireSignal);
router.put("/:matchId/official-status", ...adminOnly, validateObjectId("matchId"), updateMatchStatusOfficial);

router.put("/:id", ...adminOnly, validateObjectId("id"), updateMatch);
router.put("/:id/status", ...adminOnly, validateObjectId("id"), updateMatchStatus);
router.put("/:id/mom", ...adminOnly, validateObjectId("id"), setMOM);
router.put("/:matchId/playing-xi", ...adminOnly, validateObjectId("matchId"), setPlayingXI);
router.put("/:matchId/openers", ...adminOnly, validateObjectId("matchId"), setOpeners);
router.put("/:matchId/format", ...adminOnly, validateObjectId("matchId"), async (req, res) => {
  try {
    const { matchId } = req.params;
    const { matchFormat, totalOvers, powerplayEnabled, powerplayOvers } = req.body;
    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });
    match.matchType = matchFormat;
    match.totalOvers = totalOvers;
    if (!match.powerplayConfig) match.powerplayConfig = {};
    match.powerplayConfig.enabled = powerplayEnabled;
    match.powerplayConfig.overs = powerplayOvers || 0;
    await match.save();
    res.json({ match, message: "Match format updated" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
router.put("/:matchId/toss", ...adminOnly, validateObjectId("matchId"), updateToss);
router.put("/:matchId/squad15", ...adminOnly, validateObjectId("matchId"), setSquad15);
router.put("/:matchId/twelfth-man", ...adminOnly, validateObjectId("matchId"), setTwelfthMan);
router.put("/:matchId/bowling-xi", ...adminOnly, validateObjectId("matchId"), setBowlingXI);
router.put("/:matchId/team-roles", ...adminOnly, validateObjectId("matchId"), setTeamRoles);

router.delete("/:id", ...adminOnly, validateObjectId("id"), deleteMatch);

export default router;
