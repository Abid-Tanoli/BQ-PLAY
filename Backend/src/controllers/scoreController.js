import Match from "../models/match.js";

/**
 * POST /api/matches/:id/score
 * Body example:
 * {
 *   "inningsIndex": 0,
 *   "runs": 4,
 *   "wickets": 0,
 *   "balls": 1,
 *   "extras": 0,
 *   "commentaryText": "Beautiful cover drive! 4 runs."
 * }
 */
export const updateScore = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { inningsIndex = 0, runs, wickets, balls, extras, commentaryText } = req.body;

    const match = await Match.findById(id);
    if (!match) return res.status(404).json({ message: "Match not found" });

    match.innings = match.innings || [];
    match.innings[inningsIndex] = match.innings[inningsIndex] || { team: match.teams[inningsIndex] };

    const innings = match.innings[inningsIndex];

    if (typeof runs === "number") innings.runs = (innings.runs || 0) + runs;
    if (typeof wickets === "number") innings.wickets = (innings.wickets || 0) + wickets;
    if (typeof balls === "number") innings.balls = (innings.balls || 0) + balls;
    if (typeof extras === "number") innings.extras = (innings.extras || 0) + extras;

    if (commentaryText) {
      match.commentary = match.commentary || [];
      match.commentary.push({
        text: commentaryText,
        createdAt: new Date(),
      });
    }

    match.status = "live";

    await match.save();

    try {
      const io = req.app && req.app.get && req.app.get("io");
      if (io) {
        io.to(id).emit("match:update", { matchId: id, inningsIndex, innings: match.innings, status: match.status });
        if (commentaryText) {
          io.to(id).emit("match:commentary", {
            matchId: id,
            commentary: match.commentary.slice(-1)[0],
          });
        }
      }
    } catch (err) {
      console.warn("Socket emit failed (maybe not initialized):", err.message);
    }

    return res.json({ message: "Score updated", match });
  } catch (err) {
    console.error("updateScore error:", err);
    return res.status(500).json({ message: "Failed to update score" });
  }
};