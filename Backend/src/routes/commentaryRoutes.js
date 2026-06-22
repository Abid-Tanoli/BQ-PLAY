import express from "express";
import { generateCommentaryForBall } from "../services/commentaryService.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", protect, requireAdmin, async (req, res) => {
  try {
    const commentary = await generateCommentaryForBall(req.body);
    res.json({ commentary });
  } catch (error) {
    console.error("Commentary generation error:", error);
    res.json({ commentary: generateFallbackCommentary(req.body) });
  }
});

function generateFallbackCommentary(data) {
  const { bowlerName, batsmanName, runs, isWicket, pitchLength, pitchLine, shotType, groundZone, fieldedByName, fieldedByPosition } = data;
  let text = `${bowlerName} to ${batsmanName}.`;
  if (pitchLength && pitchLine) text += ` ${pitchLength} delivery ${pitchLine}.`;
  if (shotType) text += ` Plays the ${shotType}`;
  if (groundZone) text += ` towards ${groundZone.replace("-", " ")}`;
  if (fieldedByName) text += ` ${fieldedByName} at ${fieldedByPosition || "the fielding position"} gives chase.`;
  if (isWicket) text += ` AND IT'S A WICKET!`;
  else if (runs === 6) text += ` and it sails over the ropes for SIX!`;
  else if (runs === 4) text += ` and it races away to the boundary for FOUR!`;
  else if (runs === 0) text += ` no run, well bowled.`;
  return text;
}

export default router;
