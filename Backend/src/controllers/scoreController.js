import Match from "../models/Match.js";
import { getIO } from "../socket/socket.js";

export const updateScore = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { 
      inningsIndex, 
      runs = 0, 
      wickets = 0, 
      balls = 1, 
      extras = 0, 
      commentaryText = "" 
    } = req.body;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (!match.innings || !match.innings[inningsIndex]) {
      return res.status(400).json({ 
        message: "Invalid innings index" 
      });
    }

    const innings = match.innings[inningsIndex];

    innings.runs += runs;
    
    innings.wickets += wickets;
    
    innings.extras += extras;

    if (balls > 0) {
      innings.balls += balls;
      
      if (innings.balls >= 6) {
        const completedOvers = Math.floor(innings.balls / 6);
        innings.overs += completedOvers;
        innings.balls = innings.balls % 6;
      }
    }

    if (commentaryText) {
      innings.commentary = innings.commentary || [];
      innings.commentary.push({
        text: commentaryText,
        timestamp: new Date(),
        over: innings.overs,
        ball: innings.balls
      });
    }

    if (innings.status === "upcoming") {
      innings.status = "live";
    }

    if (match.status === "upcoming") {
      match.status = "live";
    }

    await match.save();

    await match.populate("teams", "name shortName logo");
    await match.populate("innings.team", "name shortName");

    try {
      const io = getIO();
      
      io.to(matchId).emit("match:update", {
        matchId,
        inningsIndex,
        innings: match.innings[inningsIndex],
        status: match.status
      });

      io.to(matchId).emit("match:scoreUpdate", {
        matchId,
        runs: innings.runs,
        wickets: innings.wickets,
        overs: innings.overs,
        balls: innings.balls
      });

      if (commentaryText) {
        io.to(matchId).emit("match:commentary", {
          matchId,
          inningsIndex,
          commentary: innings.commentary[innings.commentary.length - 1]
        });
      }

      io.emit("match:updated", match);
      io.emit("match:updateList");
    } catch (socketError) {
      console.log("Socket not available:", socketError.message);
    }

    res.status(200).json({ 
      match,
      innings: match.innings[inningsIndex],
      message: "Score updated successfully" 
    });
  } catch (error) {
    console.error("Error updating score:", error);
    res.status(400).json({ 
      message: "Failed to update score", 
      error: error.message 
    });
  }
};

export const endInnings = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { inningsIndex } = req.body;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (!match.innings || !match.innings[inningsIndex]) {
      return res.status(400).json({ 
        message: "Invalid innings index" 
      });
    }

    match.innings[inningsIndex].status = "completed";

    if (match.innings[inningsIndex + 1]) {
      match.innings[inningsIndex + 1].status = "live";
    } else {
      match.status = "completed";
      
      const inn1 = match.innings[0];
      const inn2 = match.innings[1];
      
      if (inn1.runs > inn2.runs) {
        match.result = {
          winner: inn1.team,
          margin: `${inn1.runs - inn2.runs} runs`,
          description: `${inn1.team.name} won by ${inn1.runs - inn2.runs} runs`
        };
      } else if (inn2.runs > inn1.runs) {
        match.result = {
          winner: inn2.team,
          margin: `${10 - inn2.wickets} wickets`,
          description: `${inn2.team.name} won by ${10 - inn2.wickets} wickets`
        };
      } else {
        match.result = {
          margin: "Match tied",
          description: "Match ended in a tie"
        };
      }
    }

    await match.save();
    await match.populate("teams", "name shortName logo");
    await match.populate("innings.team", "name shortName");

    try {
      const io = getIO();
      io.to(matchId).emit("innings:ended", {
        matchId,
        inningsIndex,
        matchStatus: match.status
      });
      io.emit("match:updated", match);
      io.emit("match:updateList");
    } catch (socketError) {
      console.log("Socket not available:", socketError.message);
    }

    res.status(200).json({ 
      match,
      message: "Innings ended successfully" 
    });
  } catch (error) {
    console.error("Error ending innings:", error);
    res.status(400).json({ 
      message: "Failed to end innings", 
      error: error.message 
    });
  }
};