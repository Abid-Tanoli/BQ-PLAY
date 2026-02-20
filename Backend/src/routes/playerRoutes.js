import express from "express";
import {
  getPlayers,
  createPlayer,
  getPlayerRanking,
  getPlayer,
  updatePlayer,
  deletePlayer,
} from "../controllers/playerController.js";
import validate from "../middleware/validate.js";
import { createPlayerSchema } from "../validators/playerValidators.js";

const router = express.Router();

router.get("/", getPlayers);
router.get("/ranking", getPlayerRanking);
router.get("/:id", getPlayer);

router.post("/", validate(createPlayerSchema), createPlayer);
router.put("/:id", updatePlayer);
router.delete("/:id", deletePlayer);

export default router;