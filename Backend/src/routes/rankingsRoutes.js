import express from 'express';
import {
  getBattingRankings,
  getBowlingRankings,
  getAllRounderRankings
} from '../controllers/rankingsController.js';

const router = express.Router();

router.get('/batting', getBattingRankings);
router.get('/bowling', getBowlingRankings);
router.get('/all-rounder', getAllRounderRankings);

export default router;