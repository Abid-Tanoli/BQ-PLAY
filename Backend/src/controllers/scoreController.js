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
    const {
      inningsIndex = 0,
      runs = 0,
      wickets = 0,
      balls = 1,
      extras = 0,
      commentaryText = ""
    } = req.body;

    const match = await Match.findById(id);
    if (!match) return res.status(404).json({ message: "Match not found" });

    match.innings = match.innings || [];
    match.innings[inningsIndex] = match.innings[inningsIndex] || {
      team: match.teams[inningsIndex],
      runs: 0,
      wickets: 0,
      overs: 0,
      balls: 0,
      extras: 0,
      commentary: []
    };

    const innings = match.innings[inningsIndex];

    innings.runs += runs;
    innings.wickets += wickets;
    innings.balls += balls;
    innings.extras += extras;

    innings.overs = Math.floor(innings.balls / 6);
    innings.balls = innings.balls % 6;

    if (commentaryText) {
      const comment = { text: commentaryText, createdAt: new Date() };
      innings.commentary.push(comment);

      match.commentary = match.commentary || [];
      match.commentary.push(comment);
    }

    match.status = "live";

    await match.save();

    try {
      const io = req.app?.get("io");
      if (io) {
        io.to(id).emit("match:update", {
          matchId: id,
          inningsIndex,
          innings,
          status: match.status
        });

        if (commentaryText) {
          io.to(id).emit("match:commentary", {
            matchId: id,
            commentary: innings.commentary.slice(-1)[0],
          });
        }
      }
    } catch (err) {
      console.warn("Socket emit failed (maybe not initialized):", err.message);
    }

    return res.json({ message: "Score updated successfully", match });
  } catch (err) {
    console.error("updateScore error:", err);
    return res.status(500).json({ message: "Failed to update score" });
  }
};
