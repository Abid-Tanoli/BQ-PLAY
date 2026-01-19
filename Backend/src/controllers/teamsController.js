// import Team from '../models/Team.js';

// export const listTeams = async (req, res) => {
//   const teams = await Team.find().populate('players');
//   res.json(teams);
// };

// export const createTeam = async (req, res) => {
//   const { name, shortName } = req.body;
//   const team = new Team({ name, shortName });
//   await team.save();
//   res.status(201).json(team);
// };
