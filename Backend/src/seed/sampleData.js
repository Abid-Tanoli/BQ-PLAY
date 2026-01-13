require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Team = require('../models/Team');
const Player = require('../models/Player');
const Match = require('../models/match');

async function seed() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/bqplay';
  await connectDB(uri);

  await Team.deleteMany({});
  await Player.deleteMany({});
  await Match.deleteMany({});

  const teamA = new Team({ name: 'Abid XI', shortName: 'ABX' });
  const teamB = new Team({ name: 'Tanoli Troopers', shortName: 'TTR' });

  await teamA.save();
  await teamB.save();

  const p1 = new Player({ name: 'A. Batsman', role: 'Batsman', team: teamA._id });
  const p2 = new Player({ name: 'T. Bowler', role: 'Bowler', team: teamB._id });

  await p1.save();
  await p2.save();

  teamA.players.push(p1._id);
  teamB.players.push(p2._id);
  await teamA.save();
  await teamB.save();

  const match = new Match({
    title: 'Abid XI vs Tanoli Troopers',
    venue: 'National Ground',
    startAt: new Date(Date.now() + 3600 * 1000),
    teams: [teamA._id, teamB._id],
    innings: [
      { team: teamA._id },
      { team: teamB._id }
    ],
    status: 'upcoming'
  });

  await match.save();

  console.log('Seed completed');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});