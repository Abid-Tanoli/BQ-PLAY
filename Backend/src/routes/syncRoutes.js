import { Router } from "express";
import {
  getAvailableSeries,
  syncSeries,
  syncMatch,
  syncLiveScores,
  syncAll,
  getSyncLog,
} from "../controllers/syncController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();
const adminOnly = [protect, requireAdmin];

router.get("/series", getAvailableSeries);
router.get("/log", ...adminOnly, getSyncLog);
router.post("/series/:slug/:seriesId", ...adminOnly, syncSeries);
router.post("/match/:seriesSlug/:seriesId/:slug/:matchId", ...adminOnly, syncMatch);
router.post("/live", ...adminOnly, syncLiveScores);
router.post("/all", ...adminOnly, syncAll);

export default router;
