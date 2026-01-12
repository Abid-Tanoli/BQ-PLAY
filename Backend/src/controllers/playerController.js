import Player from "../models/Player.js";

export const getPlayers = async (req, res) => {
  const players = await Player.find();
  res.json(players);
};

export const createPlayer = async (req, res) => {
  const player = await Player.create(req.body);
  res.status(201).json(player);
};

export const updatePlayer = async (req, res) => {
  const player = await Player.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(player);
};

export const deletePlayer = async (req, res) => {
  await Player.findByIdAndDelete(req.params.id);
  res.json({ message: "Player deleted" });
};

export const getPlayerRanking = async (req, res) => {
  const players = await Player.find();
  const ranked = players.map((p) => {
    const batting = (p.stats?.runs || 0) + (p.stats?.strikeRate || 0) * 0.5;
    const bowling = (p.stats?.wickets || 0) * 20 - (p.stats?.economy || 0) * 2;
    return { ...p._doc, rankingPoints: batting + bowling };
  });
  ranked.sort((a, b) => b.rankingPoints - a.rankingPoints);
  res.json(ranked);
};
