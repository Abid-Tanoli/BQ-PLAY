import express from 'express';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  setEventSquad,
  getEventSquad,
  addMatchToEvent,
  changeEventSquadPlayer
} from '../controllers/eventController.js';

const router = express.Router();

router.get('/', getEvents);
router.get('/:id', getEvent);
router.post('/', createEvent);
router.post('/:eventId/squad', setEventSquad);
router.put('/:eventId/squad/change-player', changeEventSquadPlayer);
router.post('/:eventId/matches', addMatchToEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
router.get('/:eventId/squad', getEventSquad);
router.get('/:eventId/squad/:teamId', getEventSquad);

export default router;
