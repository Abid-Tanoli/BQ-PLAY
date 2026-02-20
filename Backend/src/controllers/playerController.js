import Player from "../models/Player.js";
import { getIO } from "../socket/socket.js";

export const getPlayers = async (req, res) => {
  const { page = 1, limit = 10, search = "", team = "", Campus = "" } = req.query;
  const query = {};

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }
  if (team) {
    query.team = team;
  }
  if (Campus) {
    query.Campus = { $regex: Campus, $options: "i" };
  }

  const skip = (page - 1) * limit;
  const totalPlayers = await Player.countDocuments(query);
  const players = await Player.find(query)
    .populate("team", "name")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.json({
    players,
    totalPlayers,
    totalPages: Math.ceil(totalPlayers / limit),
    currentPage: Number(page),
  });
};

export const getPlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id).populate("team", "name");
    if (!player) return res.status(404).json({ message: "Player not found" });
    res.json(player);
  } catch (err) {
    res.status(500).json({ message: "Error fetching player" });
  }
};

export const createPlayer = async (req, res) => {
  const player = await Player.create(req.body);
  const populated = await Player.findById(player._id).populate("team", "name");
  getIO()?.emit("players:updated");
  res.status(201).json(populated);
};

export const updatePlayer = async (req, res) => {
  const player = await Player.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  ).populate("team", "name");
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
