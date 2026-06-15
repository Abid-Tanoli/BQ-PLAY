import express from 'express';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';
import validateObjectId from '../middleware/validateObjectId.js';
import {
  getOverallRankings,
  getCategoryRankings,
  getCrossCategoryRankings,
  getTeamPlayerRankings,
  getPlayerRankings,
  recomputeRankings,
  recomputeTeamRanking,
} from '../controllers/rankingController.js';

const router = express.Router();
const adminOnly = [protect, requireAdmin];

router.get('/overall', getOverallRankings);
router.get('/category/:categoryId', validateObjectId('categoryId'), getCategoryRankings);
router.get('/cross-category', getCrossCategoryRankings);
router.get('/players', getPlayerRankings);
router.get('/players/team/:teamId', validateObjectId('teamId'), getTeamPlayerRankings);
router.post('/recompute', ...adminOnly, recomputeRankings);
router.post('/recompute/:teamId', ...adminOnly, validateObjectId('teamId'), recomputeTeamRanking);

export default router;
