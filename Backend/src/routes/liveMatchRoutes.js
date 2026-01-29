import express from "express";
import { addBall } from "../controllers/liveMatchController.js";

const router = express.Router();

router.post("/:matchId/ball", addBall);

export default router;