// Backend/src/controllers/matchController.js
import Match from "../models/match.js";

/**
 * Return a full match document (used by frontend).
 */
export const getMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id).lean();
    if (!match) return res.status(404).json({ message: "Match not found" });
    return res.json(match);
  } catch (err) {
    console.error("getMatch error:", err);
    return res.status(500).json({ message: "Failed to fetch match" });
  }
};

/**
 * Compute and return basic stats for a match:
 * - topScorers: highest runs in batting arrays
 * - topBowlers: highest wickets from bowling arrays
 * The implementation is defensive — if innings[].batting or innings[].bowling
 * are not present it returns empty arrays.
 */
export const getMatchStats = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id).lean();
    if (!match) return res.status(404).json({ message: "Match not found" });

    // Gather batting entries across innings if present
    const batting = (match.innings || []).flatMap((inn) => inn.batting || []);
    const bowling = (match.innings || []).flatMap((inn) => inn.bowling || []);

    // topScorers by runs
    const topScorers = batting
      .map((b) => ({
        name: b.name || b.playerName || "Unknown",
        runs: Number(b.runs || 0),
        balls: Number(b.balls || "-"),
        fours: Number(b.fours || 0),
        sixes: Number(b.sixes || 0),
      }))
      .sort((a, b) => b.runs - a.runs)
      .slice(0, 10);

    // topBowlers by wickets (then economy)
    const topBowlers = bowling
      .map((b) => ({
        name: b.name || b.playerName || "Unknown",
        wickets: Number(b.wickets || 0),
        runs: Number(b.runs || 0),
        overs: b.overs ?? "-",
      }))
      .sort((a, b) => b.wickets - a.wickets || a.runs - b.runs)
      .slice(0, 10);

    // Partnerships: if stored in match.partnerships or compute nothing
    const partnerships = match.partnerships || [];

    return res.json({
      topScorers,
      topBowlers,
      partnerships,
    });
  } catch (err) {
    console.error("getMatchStats error:", err);
    return res.status(500).json({ message: "Failed to compute match stats" });
  }
};