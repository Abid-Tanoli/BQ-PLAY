import Match from "../models/Match.js";

export const addBall = async (req, res) => {
  try {
    const { matchId } = req.params;
    const data = req.body;

    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });

    const innings = match.innings[match.currentInnings];
    if (!innings) return res.status(400).json({ message: "No active innings" });

    innings.runs = (innings.runs || 0) + (data.runs || 0);
    if (data.isWicket) innings.wickets = (innings.wickets || 0) + 1;
    if (!data.isWide && !data.isNoBall) innings.balls = (innings.balls || 0) + 1;
    innings.overs = Math.floor(innings.balls / 6);
    await match.save({ validateModifiedOnly: true });

    res.status(200).json({ success: true, match });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
