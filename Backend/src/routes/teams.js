const express = require('express');
const router = express.Router();
const teamsController = require('../controllers/teamsController');

router.get('/', teamsController.listTeams);
router.post('/', teamsController.createTeam);

module.exports = router;