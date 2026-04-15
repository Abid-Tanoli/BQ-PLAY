import express from "express";
import {
  getPlayers,
  createPlayer,
  getPlayerRanking,
  getPlayer,
  updatePlayer,
  deletePlayer,
  bulkDeletePlayers,
} from "../controllers/playerController.js";
import {
  getBattingRankings,
  getBowlingRankings,
  getAllRounderRankings,
  getPlayerRankings
} from "../controllers/rankingsController.js";
import validate from "../middleware/validate.js";
import { createPlayerSchema } from "../validators/playerValidators.js";

const router = express.Router();

router.get("/", getPlayers);
router.get("/ranking", getPlayerRanking);
router.get("/rankings/batting", getBattingRankings);
router.get("/rankings/bowling", getBowlingRankings);
router.get("/rankings/all-rounder", getAllRounderRankings);
router.get("/rankings", getPlayerRankings);
router.get("/:id", getPlayer);

router.post("/", validate(createPlayerSchema), createPlayer);
router.post("/bulk-delete", bulkDeletePlayers);
router.put("/:id", updatePlayer);
router.delete("/:id", deletePlayer);

export default router;