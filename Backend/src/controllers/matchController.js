import Match from "../models/match.js";
import Commentary from "../models/commentary.js";
import Team from "../models/Team.js";

/* =========================
   GET ALL MATCHES
========================= */
export const getMatches = async (req, res) => {
  const matches = await Match.find()
    .sort({ createdAt: -1 })
    .populate("teams")
    .populate("manOfMatch")
    .populate({
      path: "commentary",
      options: { sort: { createdAt: -1 }, limit: 50 },
    });

  res.json(matches);
};

/* =========================
   GET SINGLE MATCH
========================= */
export const getMatch = async (req, res) => {
  const match = await Match.findById(req.params.id)
    .populate("teams")
    .populate("manOfMatch")
    .populate({
      path: "commentary",
      options: { sort: { createdAt: -1 } },
    });

  if (!match) {
    return res.status(404).json({ message: "Match not found" });
  }

  res.json(match);
};

/* =========================
   CREATE MATCH
========================= */
export const createMatch = async (req, res) => {
  const { title, venue, startAt, teamIds } = req.body;

  const teams = await Team.find({ _id: { $in: teamIds } });
  if (teams.length < 2) {
    return res.status(400).json({ message: "At least two teams required" });
  }

  const match = await Match.create({
    title,
    venue,
    startAt,
    teams: teams.map((t) => t._id),
    innings: teams.map((t) => ({
      team: t._id,
    })),
  });

  res.status(201).json(match);
};

/* =========================
   UPDATE MATCH (GENERAL)
========================= */
export const updateMatch = async (req, res) => {
  const match = await Match.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!match) {
    return res.status(404).json({ message: "Match not found" });
  }

  res.json(match);
};

/* =========================
   DELETE MATCH
========================= */
export const deleteMatch = async (req, res) => {
  await Match.findByIdAndDelete(req.params.id);
  res.json({ message: "Match deleted" });
};

/* =========================
   SET MAN OF THE MATCH
========================= */
export const setMOM = async (req, res) => {
  const { playerId } = req.body;

  const match = await Match.findByIdAndUpdate(
    req.params.id,
    { manOfMatch: playerId },
    { new: true }
  ).populate("manOfMatch");

  if (!match) {
    return res.status(404).json({ message: "Match not found" });
  }

  res.json(match);
};

/* =========================
   UPDATE LIVE SCORE (Socket.IO)
   payload:
   { inningsIndex, runs, wickets, balls, extras, commentaryText }
========================= */
export const updateScore = async (io, req, res) => {
  const { id } = req.params;
  const {
    inningsIndex = 0,
    runs = 0,
    wickets = 0,
    balls = 0,
    extras = 0,
    commentaryText,
  } = req.body;

  const match = await Match.findById(id);
  if (!match) {
    return res.status(404).json({ message: "Match not found" });
  }

  const innings = match.innings[inningsIndex];
  if (!innings) {
    return res.status(400).json({ message: "Invalid innings index" });
  }

  innings.runs += Number(runs);
  innings.wickets += Number(wickets);
  innings.extras += Number(extras);
  innings.balls += Number(balls);

  while (innings.balls >= 6) {
    innings.overs += 1;
    innings.balls -= 6;
  }

  innings.status = "live";
  match.status = "live";

  await match.save();

  /* ---- Save Commentary ---- */
  if (commentaryText) {
    const commentary = await Commentary.create({
      match: match._id,
      text: commentaryText,
      over: `${innings.overs}.${innings.balls}`,
    });

    match.commentary.push(commentary._id);
    await match.save();
  }

  /* ---- Emit Live Update ---- */
  const populatedMatch = await Match.findById(id)
    .populate("teams")
    .populate("manOfMatch")
    .populate({
      path: "commentary",
      options: { sort: { createdAt: -1 }, limit: 50 },
    });

  io.emit("match:update", populatedMatch);

  res.json(populatedMatch);
};
