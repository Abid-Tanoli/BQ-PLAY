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

router.get("/", getPlayers);
router.get("/ranking", getPlayerRanking);

// apply Zod validation to create player route
router.post("/", validate(createPlayerSchema), createPlayer);
router.put("/:id", updatePlayer);
router.delete("/:id", deletePlayer);

export default router;