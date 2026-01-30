import express from 'express';
import {
  listTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  addPlayersToTeam,
  removePlayersFromTeam
} from '../controllers/teamsController.js';

const router = express.Router();

router.get('/', listTeams);
router.get('/:id', getTeam);
router.post('/', createTeam);
router.put('/:id', updateTeam);
router.delete('/:id', deleteTeam);

router.post('/:id/players', addPlayersToTeam);
router.delete('/:id/players', removePlayersFromTeam);

export default router;