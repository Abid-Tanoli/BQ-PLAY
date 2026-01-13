import express from "express";
import { listTeams, createTeam } from '../controllers/teamsController.js';

const router = express.Router();

router.get('/', listTeams);
router.post('/', createTeam);

export default router;
