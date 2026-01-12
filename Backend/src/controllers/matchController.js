import Match from "../models/match.js";

// GET all matches
export const getMatches = async (req, res) => {
  const matches = await Match.find().sort({ createdAt: -1 }).populate("manOfMatch");
  res.json(matches);
};

// GET single match
export const getMatch = async (req, res) => {
  const match = await Match.findById(req.params.id).populate("manOfMatch");
  if (!match) return res.status(404).json({ message: "Match not found" });
  res.json(match);
};

// CREATE match
export const createMatch = async (req, res) => {
  const match = await Match.create(req.body);
  res.status(201).json(match);
};

// UPDATE match
export const updateMatch = async (req, res) => {
  const match = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(match);
};

// DELETE match
export const deleteMatch = async (req, res) => {
  await Match.findByIdAndDelete(req.params.id);
  res.json({ message: "Match deleted" });
};

// SET MOM
export const setMOM = async (req, res) => {
  const { playerId } = req.body;
  const match = await Match.findByIdAndUpdate(
    req.params.id,
    { manOfMatch: playerId },
    { new: true }
  ).populate("manOfMatch");

  res.json(match);
};
