import express from "express";
import { addBall } from "../controllers/liveMatchController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import validateObjectId from "../middleware/validateObjectId.js";

const router = express.Router();

router.post("/:matchId/ball", protect, requireAdmin, validateObjectId("matchId"), addBall);

export default router;
