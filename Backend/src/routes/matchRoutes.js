import express from "express";
import {
  getMatches,
  getMatch,
  createMatch,
  updateMatch,
  deleteMatch,
  setMOM,
} from "../controllers/matchController.js";

const router = express.Router();

router.get("/", getMatches);
router.get("/:id", getMatch);

router.post("/", createMatch);
router.put("/:id", updateMatch);
router.delete("/:id", deleteMatch);

router.put("/mom/:id", setMOM);

export default router;
