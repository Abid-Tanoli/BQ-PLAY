import Match from "../models/match.js";
import Player from "../models/Player.js";
import { getIO } from "../socket/socket.js";

export const updateScore = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { 
      inningsIndex,
      runs = 0,
      isWide = false,
      isNoBall = false,
      isBye = false,
      isLegBye = false,
      isWicket = false,
      wicketType = "",
      dismissedPlayerId = null,
      fielderId = null,
      batsmanOnStrikeId,
      batsmanNonStrikeId,
      bowlerId,
      commentaryText = ""
    } = req.body;

    const match = await Match.findById(matchId)
      .populate("teams", "name shortName logo")
      .populate("innings.team", "name shortName")
      .populate("innings.currentBatsman1", "name")
      .populate("innings.currentBatsman2", "name")
      .populate("innings.currentBowler", "name")
      .populate("innings.batting.player", "name")
      .populate("innings.bowling.player", "name");

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (!match.innings || !match.innings[inningsIndex]) {
      return res.status(400).json({ message: "Invalid innings index" });
    }

    const innings = match.innings[inningsIndex];
    
    // Initialize overs history if not exists
    if (!innings.oversHistory) {
      innings.oversHistory = [];
    }

    // Get current over or create new one
    let currentOverNumber = Math.floor(innings.balls / 6);
    let currentOver = innings.oversHistory.find(o => o.overNumber === currentOverNumber);
    
    if (!currentOver) {
      currentOver = {
        overNumber: currentOverNumber,
        bowler: bowlerId,
        balls: [],
        runsScored: 0,
        wickets: 0,
        maidenOver: false,
        summary: ""
      };
      innings.oversHistory.push(currentOver);
    }

    // Calculate ball number in current over
    const ballNumberInOver = (innings.balls % 6) + 1;

    // Calculate actual runs (excluding wides and no balls from batsman)
    let batsmanRuns = runs;
    let extraRuns = 0;
    
    if (isWide) {
      extraRuns = 1 + runs; // Wide + any runs
      batsmanRuns = 0;
      innings.extras.wides += 1 + runs;
    } else if (isNoBall) {
      extraRuns = 1 + runs; // No ball + any runs
      innings.extras.noBalls += 1 + runs;
    } else if (isBye) {
      extraRuns = runs;
      batsmanRuns = 0;
      innings.extras.byes += runs;
    } else if (isLegBye) {
      extraRuns = runs;
      batsmanRuns = 0;
      innings.extras.legByes += runs;
    }

    innings.extras.total = 
      innings.extras.wides + 
      innings.extras.noBalls + 
      innings.extras.byes + 
      innings.extras.legByes;

    // Update total runs
    innings.runs += batsmanRuns + extraRuns;
    currentOver.runsScored += batsmanRuns + extraRuns;

    // Update batsman stats
    let batsmanOnStrike = innings.batting.find(
      b => b.player.toString() === batsmanOnStrikeId
    );

    if (!batsmanOnStrike) {
      batsmanOnStrike = {
        player: batsmanOnStrikeId,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        strikeRate: 0,
        isOut: false
      };
      innings.batting.push(batsmanOnStrike);
    }

    // Only count balls for batsman if not wide
    if (!isWide) {
      batsmanOnStrike.balls += 1;
      batsmanOnStrike.runs += batsmanRuns;
      
      if (batsmanRuns === 4) batsmanOnStrike.fours += 1;
      if (batsmanRuns === 6) batsmanOnStrike.sixes += 1;
      
      batsmanOnStrike.strikeRate = 
        batsmanOnStrike.balls > 0 
          ? ((batsmanOnStrike.runs / batsmanOnStrike.balls) * 100).toFixed(2)
          : 0;
    }

    // Update bowler stats
    let bowler = innings.bowling.find(
      b => b.player.toString() === bowlerId
    );

    if (!bowler) {
      bowler = {
        player: bowlerId,
        overs: 0,
        balls: 0,
        maidens: 0,
        runs: 0,
        wickets: 0,
        wides: 0,
        noBalls: 0,
        economy: 0
      };
      innings.bowling.push(bowler);
    }

    bowler.runs += batsmanRuns + extraRuns;
    if (isWide) bowler.wides += 1;
    if (isNoBall) bowler.noBalls += 1;

    // Only increment ball count if not wide or no-ball
    if (!isWide && !isNoBall) {
      bowler.balls += 1;
      innings.balls += 1;
      
      // Check if over is complete
      if (innings.balls % 6 === 0) {
        innings.overs += 1;
        bowler.overs = Math.floor(bowler.balls / 6);
        
        // Check for maiden over
        if (currentOver.runsScored === 0) {
          currentOver.maidenOver = true;
          bowler.maidens += 1;
        }
      }
    }

    // Calculate economy
    const bowlerOvers = bowler.balls / 6;
    bowler.economy = bowlerOvers > 0 ? (bowler.runs / bowlerOvers).toFixed(2) : 0;

    // Handle wicket
    if (isWicket) {
      innings.wickets += 1;
      currentOver.wickets += 1;
      bowler.wickets += 1;

      if (dismissedPlayerId) {
        const dismissedBatsman = innings.batting.find(
          b => b.player.toString() === dismissedPlayerId
        );
        if (dismissedBatsman) {
          dismissedBatsman.isOut = true;
          dismissedBatsman.dismissalType = wicketType;
          dismissedBatsman.dismissedBy = bowlerId;
          if (fielderId) dismissedBatsman.fielder = fielderId;
        }

        // Add to fall of wickets
        innings.fallOfWickets.push({
          runs: innings.runs,
          wickets: innings.wickets,
          player: dismissedPlayerId,
          overs: innings.overs + (innings.balls % 6) / 10
        });
      }
    }

    // Generate commentary if not provided
    let commentary = commentaryText;
    if (!commentary) {
      commentary = generateCommentary({
        runs: batsmanRuns,
        isWide,
        isNoBall,
        isBye,
        isLegBye,
        isWicket,
        wicketType,
        batsmanOnStrike,
        bowler
      });
    }

    // Create ball record
    const ball = {
      ballNumber: ballNumberInOver,
      batsmanOnStrike: batsmanOnStrikeId,
      batsmanNonStrike: batsmanNonStrikeId,
      bowler: bowlerId,
      runs: batsmanRuns,
      isWide,
      isNoBall,
      isBye,
      isLegBye,
      isWicket,
      wicketType: isWicket ? wicketType : "",
      dismissedPlayer: dismissedPlayerId,
      fielder: fielderId,
      commentary,
      timestamp: new Date()
    };

    currentOver.balls.push(ball);

    // Update current batsmen
    innings.currentBatsman1 = batsmanOnStrikeId;
    innings.currentBatsman2 = batsmanNonStrikeId;
    innings.currentBowler = bowlerId;

    // Swap strike on odd runs (1, 3, 5) or end of over
    if ((batsmanRuns % 2 !== 0 || innings.balls % 6 === 0) && !isWicket) {
      innings.onStrikeBatsman = innings.onStrikeBatsman?.toString() === batsmanOnStrikeId
        ? batsmanNonStrikeId
        : batsmanOnStrikeId;
    } else {
      innings.onStrikeBatsman = batsmanOnStrikeId;
    }

    // Calculate run rates
    const totalOvers = innings.overs + (innings.balls % 6) / 6;
    innings.runRate = totalOvers > 0 ? (innings.runs / totalOvers).toFixed(2) : 0;

    // Calculate required run rate for second innings
    if (inningsIndex === 1 && match.innings[0]) {
      const target = match.innings[0].runs + 1;
      innings.target = target;
      const remainingRuns = target - innings.runs;
      const remainingOvers = match.totalOvers - totalOvers;
      innings.requiredRunRate = remainingOvers > 0 
        ? (remainingRuns / remainingOvers).toFixed(2) 
        : 0;
    }

    // Update match and innings status
    if (innings.status === "upcoming") {
      innings.status = "live";
    }

    if (match.status === "upcoming") {
      match.status = "live";
    }

    // Check if over is complete
    const isOverComplete = innings.balls % 6 === 0 && !isWide && !isNoBall;

    if (isOverComplete) {
      // Generate over summary
      currentOver.summary = generateOverSummary(currentOver);
    }

    // Check if innings should end
    const shouldEndInnings = 
      innings.wickets >= 10 || 
      innings.overs >= match.totalOvers ||
      (inningsIndex === 1 && innings.runs > innings.target);

    await match.save();

    // Populate all references before sending
    await match.populate([
      { path: "innings.batting.player", select: "name role" },
      { path: "innings.bowling.player", select: "name role" },
      { path: "innings.currentBatsman1", select: "name" },
      { path: "innings.currentBatsman2", select: "name" },
      { path: "innings.currentBowler", select: "name" },
      { path: "innings.oversHistory.balls.batsmanOnStrike", select: "name" },
      { path: "innings.oversHistory.balls.batsmanNonStrike", select: "name" },
      { path: "innings.oversHistory.balls.bowler", select: "name" },
      { path: "innings.oversHistory.bowler", select: "name" }
    ]);

    try {
      const io = getIO();
      
      // Emit ball update
      io.to(matchId).emit("match:ballUpdate", {
        matchId,
        inningsIndex,
        ball,
        currentOver: currentOver.overNumber,
        ballNumber: ballNumberInOver,
        isOverComplete
      });

      // Emit score update
      io.to(matchId).emit("match:scoreUpdate", {
        matchId,
        runs: innings.runs,
        wickets: innings.wickets,
        overs: innings.overs,
        balls: innings.balls,
        runRate: innings.runRate,
        requiredRunRate: innings.requiredRunRate
      });

      // Emit over complete if applicable
      if (isOverComplete) {
        io.to(matchId).emit("match:overComplete", {
          matchId,
          inningsIndex,
          over: currentOver
        });
      }

      // Emit match update
      io.emit("match:updated", match);
      io.emit("match:updateList");

      // Check for innings end
      if (shouldEndInnings) {
        io.to(matchId).emit("match:inningsEnd", {
          matchId,
          inningsIndex,
          suggestion: "End innings?"
        });
      }
    } catch (socketError) {
      console.log("Socket not available:", socketError.message);
    }

    res.status(200).json({ 
      match,
      innings: match.innings[inningsIndex],
      currentOver,
      ball,
      isOverComplete,
      shouldEndInnings,
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

    const match = await Match.findById(matchId)
      .populate("teams", "name shortName logo")
      .populate("innings.team", "name shortName");

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (!match.innings || !match.innings[inningsIndex]) {
      return res.status(400).json({ message: "Invalid innings index" });
    }

    const currentInnings = match.innings[inningsIndex];
    currentInnings.status = "completed";

    if (match.innings[inningsIndex + 1]) {
      match.innings[inningsIndex + 1].status = "upcoming";
      match.innings[inningsIndex + 1].target = currentInnings.runs + 1;
      match.status = "innings-break";
      match.currentInnings = inningsIndex + 1;
    } else {
      match.status = "completed";
      
      const inn1 = match.innings[0];
      const inn2 = match.innings[1];
      
      if (inn1.runs > inn2.runs) {
        const runMargin = inn1.runs - inn2.runs;
        match.result = {
          winner: inn1.team,
          margin: `${runMargin} runs`,
          description: `${inn1.team.name} won by ${runMargin} runs`
        };
      } else if (inn2.runs > inn1.runs) {
        const wicketsLeft = 10 - inn2.wickets;
        const ballsLeft = (match.totalOvers * 6) - ((inn2.overs * 6) + inn2.balls);
        const oversLeft = Math.floor(ballsLeft / 6);
        const ballsRemaining = ballsLeft % 6;
        
        let marginText = `${wicketsLeft} wickets`;
        if (ballsLeft > 0) {
          marginText += ` (${ballsLeft} balls remaining)`;
        }
        
        match.result = {
          winner: inn2.team,
          margin: marginText,
          description: `${inn2.team.name} won by ${wicketsLeft} wickets`
        };
      } else {
        match.result = {
          margin: "Match tied",
          description: "Match ended in a tie"
        };
      }
    }

    await match.save();

    await match.populate([
      { path: "innings.batting.player", select: "name role" },
      { path: "innings.bowling.player", select: "name role" },
      { path: "result.winner", select: "name shortName logo" }
    ]);

    try {
      const io = getIO();
      
      io.to(matchId).emit("innings:ended", {
        matchId,
        inningsIndex,
        matchStatus: match.status,
        nextInnings: inningsIndex + 1 < match.innings.length
      });
      
      io.emit("match:updated", match);
      io.emit("match:updateList");
    } catch (socketError) {
      console.log("Socket not available:", socketError.message);
    }

    res.status(200).json({ 
      match,
      message: match.status === "completed" 
        ? "Match completed successfully"
        : "Innings ended successfully" 
    });
  } catch (error) {
    console.error("Error ending innings:", error);
    res.status(400).json({ 
      message: "Failed to end innings", 
      error: error.message 
    });
  }
};

export const startNextInnings = async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (match.status !== "innings-break") {
      return res.status(400).json({ message: "Match is not in innings break" });
    }

    const nextInnings = match.innings[match.currentInnings];
    if (nextInnings) {
      nextInnings.status = "live";
      match.status = "live";
      
      await match.save();

      try {
        const io = getIO();
        io.to(matchId).emit("innings:started", {
          matchId,
          inningsIndex: match.currentInnings
        });
        io.emit("match:updated", match);
      } catch (socketError) {
        console.log("Socket not available:", socketError.message);
      }

      res.status(200).json({ 
        match,
        message: "Next innings started successfully" 
      });
    } else {
      res.status(400).json({ message: "No next innings found" });
    }
  } catch (error) {
    console.error("Error starting next innings:", error);
    res.status(400).json({ 
      message: "Failed to start next innings", 
      error: error.message 
    });
  }
};

function generateCommentary({ runs, isWide, isNoBall, isBye, isLegBye, isWicket, wicketType }) {
  if (isWicket) {
    switch(wicketType) {
      case "bowled": return `OUT! Bowled! The stumps are shattered!`;
      case "caught": return `OUT! Caught! Great catch!`;
      case "lbw": return `OUT! LBW! Finger goes up!`;
      case "run out": return `OUT! Run out! Direct hit!`;
      case "stumped": return `OUT! Stumped! Lightning quick work!`;
      default: return `OUT! Wicket!`;
    }
  }

  if (isWide) return `Wide ball! Extra runs for the batting team`;
  if (isNoBall) return `No ball! Free hit coming up`;
  if (isBye) return `${runs} byes! Keeper couldn't collect`;
  if (isLegBye) return `${runs} leg byes! Off the pads`;

  switch(runs) {
    case 0: return `Dot ball. Good bowling`;
    case 1: return `Single taken. Rotates strike`;
    case 2: return `Two runs! Good running between the wickets`;
    case 3: return `Three runs! Excellent running`;
    case 4: return `FOUR! Boundary! Beautiful shot!`;
    case 6: return `SIX! Maximum! That's huge!`;
    default: return `${runs} runs scored`;
  }
}

function generateOverSummary(over) {
  const runs = over.runsScored;
  const wickets = over.wickets;
  
  let summary = `${runs} run${runs !== 1 ? 's' : ''}`;
  
  if (wickets > 0) {
    summary += `, ${wickets} wicket${wickets !== 1 ? 's' : ''}`;
  }
  
  if (over.maidenOver) {
    summary = `Maiden over!`;
  }

  const ballsStr = over.balls.map(b => {
    if (b.isWicket) return 'W';
    if (b.isWide) return 'Wd';
    if (b.isNoBall) return 'Nb';
    return b.runs.toString();
  }).join(' ');

  return `${summary} (${ballsStr})`;
}