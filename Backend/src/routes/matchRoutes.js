import express from "express";
import {
  getMatches,
  getMatch,
  createMatch,
  updateMatch,
  deleteMatch,
  setMOM,
  getMatchStats,
} from "../controllers/matchController.js";

import { updateScore } from "../controllers/scoreController.js";

const router = express.Router();

router.get("/", getMatches);
router.get("/:id", getMatch);

router.post("/", createMatch);
router.post("/:id/score", updateScore);

router.put("/:id", updateMatch);
router.get("/:id/stats", getMatchStats);

router.delete("/:id", deleteMatch);
router.put("/mom/:id", setMOM);

export default router;