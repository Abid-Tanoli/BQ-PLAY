import express from 'express';
import {
  getLiveMatches,
  getUpcomingMatches,
  getCompletedMatches,
  getAllMatches,
  getMatchDetails,
  getScorecard,
  getCommentary,
  clearCache
} from '../controllers/cricketApiController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public endpoints (no auth required for viewing scores)
router.get('/live', getLiveMatches);
router.get('/upcoming', getUpcomingMatches);
router.get('/completed', getCompletedMatches);
router.get('/all', getAllMatches);
router.get('/match/:matchId', getMatchDetails);
router.get('/match/:matchId/scorecard', getScorecard);
router.get('/match/:matchId/commentary', getCommentary);
router.post('/cache/clear', protect, requireAdmin, clearCache);

export default router;
