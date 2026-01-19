import Match from "../models/match.js";

export const getMatches = async (req, res) => {
  try {
    const matches = await Match.find().lean();
    return res.json(matches);
  } catch (err) {
    console.error("getMatches error:", err);
    return res.status(500).json({ message: "Failed to fetch matches" });
  }
};

export const getMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id).lean();

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    return res.json(match);
  } catch (err) {
    console.error("getMatch error:", err);
    return res.status(500).json({ message: "Failed to fetch match" });
  }
};

export const createMatch = async (req, res) => {
  try {
    const match = await Match.create(req.body);
    return res.status(201).json(match);
  } catch (err) {
    console.error("createMatch error:", err);
    return res.status(400).json({ message: "Failed to create match" });
  }
};

export const updateMatch = async (req, res) => {
  try {
    const match = await Match.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    return res.json(match);
  } catch (err) {
    console.error("updateMatch error:", err);
    return res.status(400).json({ message: "Failed to update match" });
  }
};

export const deleteMatch = async (req, res) => {
  try {
    const match = await Match.findByIdAndDelete(req.params.id);

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    return res.json({ message: "Match deleted successfully" });
  } catch (err) {
    console.error("deleteMatch error:", err);
    return res.status(500).json({ message: "Failed to delete match" });
  }
};

export const setMOM = async (req, res) => {
  try {
    const match = await Match.findByIdAndUpdate(
      req.params.id,
      { manOfTheMatch: req.body.manOfTheMatch },
      { new: true }
    );

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    return res.json(match);
  } catch (err) {
    console.error("setMOM error:", err);
    return res.status(400).json({ message: "Failed to set MOM" });
  }
};

export const getMatchStats = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id).lean();

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    const batting = (match.innings || []).flatMap(
      (inn) => inn.batting || []
    );

    const bowling = (match.innings || []).flatMap(
      (inn) => inn.bowling || []
    );

    const topScorers = batting
      .map((b) => ({
        name: b.name || b.playerName || "Unknown",
        runs: Number(b.runs || 0),
        balls: Number(b.balls || 0),
        fours: Number(b.fours || 0),
        sixes: Number(b.sixes || 0),
      }))
      .sort((a, b) => b.runs - a.runs)
      .slice(0, 10);

    const topBowlers = bowling
      .map((b) => ({
        name: b.name || b.playerName || "Unknown",
        wickets: Number(b.wickets || 0),
        runs: Number(b.runs || 0),
        overs: b.overs ?? "-",
      }))
      .sort((a, b) => b.wickets - a.wickets || a.runs - b.runs)
      .slice(0, 10);

    return res.json({
      topScorers,
      topBowlers,
      partnerships: match.partnerships || [],
    });
  } catch (err) {
    console.error("getMatchStats error:", err);
    return res.status(500).json({ message: "Failed to compute match stats" });
  }
};
