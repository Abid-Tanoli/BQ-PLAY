import express from 'express';
import {
  getTournaments,
  getTournament,
  createTournament,
  updateTournament,
  deleteTournament,
  getTournamentPointsTable,
  updatePointsTable,
  getTournamentFixtures
} from '../controllers/Tournamentcontroller.js';

const router = express.Router();

router.get('/', getTournaments);
router.get('/:id', getTournament);
router.get('/:id/points-table', getTournamentPointsTable);
router.get('/:id/fixtures', getTournamentFixtures);

router.post('/', createTournament);
router.post('/update-points', updatePointsTable);

router.put('/:id', updateTournament);
router.delete('/:id', deleteTournament);

export default router;