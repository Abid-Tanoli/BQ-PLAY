import Player from "../models/Player.js";
import { getIO } from "../socket/socket.js";

export const getPlayers = async (req, res) => {
  const players = await Player.find().populate("team", "name");
  res.json(players);
};

export const createPlayer = async (req, res) => {
  const player = await Player.create(req.body);
  getIO()?.emit("players:updated");
  res.status(201).json(player);
};

export const updatePlayer = async (req, res) => {
  const player = await Player.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  getIO()?.emit("players:updated");
  res.json(player);
};

export const deletePlayer = async (req, res) => {
  await Player.findByIdAndDelete(req.params.id);
  getIO()?.emit("players:updated");
  res.json({ message: "Deleted" });
};

export const getPlayerRanking = async (req, res) => {
  const players = await Player.find().populate("team", "name");

  const ranked = players.map(p => {
    const points =
      (p.stats.runs * 1) +
      (p.stats.wickets * 25);
    return { ...p._doc, rankingPoints: points };
  });

  ranked.sort((a, b) => b.rankingPoints - a.rankingPoints);
  res.json(ranked);
};
