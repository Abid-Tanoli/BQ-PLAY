import Player from '../models/Player.js';
import Match from '../models/match.js';

export const getBattingRankings = async (req, res) => {
  try {
    const { tournamentId, limit = 20 } = req.query;

    let query = {};
    if (tournamentId) {
      const matches = await Match.find({ tournament: tournamentId });
      const matchIds = matches.map(m => m._id);
      
      // This would need more complex aggregation in real implementation
      query = { _id: { $in: [] } }; // Placeholder
    }

    const players = await Player.find(query)
      .populate('team', 'name shortName logo')
      .limit(parseInt(limit));

    // Calculate batting average, strike rate etc from match data
    const rankings = players.map((player, index) => ({
      rank: index + 1,
      player: {
        _id: player._id,
        name: player.name,
        team: player.team
      },
      matches: player.stats?.matches || 0,
      innings: player.stats?.innings || 0,
      runs: player.stats?.runs || 0,
      highScore: player.stats?.highScore || 0,
      average: player.stats?.average || 0,
      strikeRate: player.stats?.strikeRate || 0,
      fifties: player.stats?.fifties || 0,
      hundreds: player.stats?.hundreds || 0
    }));

    // Sort by runs
    rankings.sort((a, b) => b.runs - a.runs);
    rankings.forEach((r, i) => r.rank = i + 1);

    res.status(200).json(rankings);
  } catch (error) {
    console.error('Error fetching batting rankings:', error);
    res.status(500).json({ 
      message: 'Failed to fetch batting rankings', 
      error: error.message 
    });
  }
};

export const getBowlingRankings = async (req, res) => {
  try {
    const { tournamentId, limit = 20 } = req.query;

    const players = await Player.find()
      .populate('team', 'name shortName logo')
      .limit(parseInt(limit));

    const rankings = players.map((player, index) => ({
      rank: index + 1,
      player: {
        _id: player._id,
        name: player.name,
        team: player.team
      },
      matches: player.stats?.matches || 0,
      innings: player.stats?.innings || 0,
      wickets: player.stats?.wickets || 0,
      average: player.stats?.bowlingAverage || 0,
      economy: player.stats?.economy || 0,
      strikeRate: player.stats?.bowlingStrikeRate || 0,
      best: player.stats?.bestBowling || '0/0',
      fourWickets: player.stats?.fourWickets || 0,
      fiveWickets: player.stats?.fiveWickets || 0
    }));

    rankings.sort((a, b) => b.wickets - a.wickets);
    rankings.forEach((r, i) => r.rank = i + 1);

    res.status(200).json(rankings);
  } catch (error) {
    console.error('Error fetching bowling rankings:', error);
    res.status(500).json({ 
      message: 'Failed to fetch bowling rankings', 
      error: error.message 
    });
  }
};

export const getAllRounderRankings = async (req, res) => {
  try {
    const { tournamentId, limit = 20 } = req.query;

    const players = await Player.find()
      .populate('team', 'name shortName logo')
      .limit(parseInt(limit));

    const rankings = players.map((player, index) => {
      const battingPoints = (player.stats?.runs || 0) * 1;
      const bowlingPoints = (player.stats?.wickets || 0) * 20;
      const totalPoints = battingPoints + bowlingPoints;

      return {
        rank: index + 1,
        player: {
          _id: player._id,
          name: player.name,
          team: player.team
        },
        matches: player.stats?.matches || 0,
        runs: player.stats?.runs || 0,
        wickets: player.stats?.wickets || 0,
        points: totalPoints
      };
    });

    rankings.sort((a, b) => b.points - a.points);
    rankings.forEach((r, i) => r.rank = i + 1);

    res.status(200).json(rankings);
  } catch (error) {
    console.error('Error fetching all-rounder rankings:', error);
    res.status(500).json({ 
      message: 'Failed to fetch all-rounder rankings', 
      error: error.message 
    });
  }
};