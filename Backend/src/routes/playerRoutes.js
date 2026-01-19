import express from "express";
import {
  getPlayers,
  createPlayer,
  getPlayerRanking,
  updatePlayer,
  deletePlayer,
} from "../controllers/playerController.js";

import validate from "../middleware/validate.js";
import { createPlayerSchema } from "../validators/playerValidators.js";

const router = express.Router();

router.get("/allplayers", getPlayers);
router.get("/allplayers/ranking", getPlayerRanking);

router.post("/player", validate(createPlayerSchema), createPlayer);
router.put("/player/:id", updatePlayer);
router.delete("/player/:id", deletePlayer);

export default router;