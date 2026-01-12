import express from "express";
import {
  getPlayers,
  createPlayer,
  getPlayerRanking,
  updatePlayer,
  deletePlayer,
} from "../controllers/playerController.js";

const router = express.Router();

router.get("/", getPlayers);
router.get("/ranking", getPlayerRanking);

router.post("/", createPlayer);
router.put("/:id", updatePlayer);
router.delete("/:id", deletePlayer);

export default router;
