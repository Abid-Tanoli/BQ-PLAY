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
      commentaryText = "",
      customCommentary = false
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

    if (!innings.oversHistory) {
      innings.oversHistory = [];
    }

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

    const ballNumberInOver = (innings.balls % 6) + 1;

    let batsmanRuns = runs;
    let extraRuns = 0;

    if (isWide) {
      extraRuns = 1 + runs;
      batsmanRuns = 0;
      innings.extras.wides += 1 + runs;
    } else if (isNoBall) {
      extraRuns = 1 + runs;
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

    innings.runs += batsmanRuns + extraRuns;
    currentOver.runsScored += batsmanRuns + extraRuns;

    // Get player names for commentary
    const batsmanOnStrike = await Player.findById(batsmanOnStrikeId);
    const bowlerPlayer = await Player.findById(bowlerId);

    let batsmanOnStrikeStats = innings.batting.find(
      b => b.player.toString() === batsmanOnStrikeId
    );

    if (!batsmanOnStrikeStats) {
      batsmanOnStrikeStats = {
        player: batsmanOnStrikeId,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        strikeRate: 0,
        isOut: false
      };
      innings.batting.push(batsmanOnStrikeStats);
    }

    if (!isWide) {
      batsmanOnStrikeStats.balls += 1;
      batsmanOnStrikeStats.runs += batsmanRuns;

      if (batsmanRuns === 4) batsmanOnStrikeStats.fours += 1;
      if (batsmanRuns === 6) batsmanOnStrikeStats.sixes += 1;

      batsmanOnStrikeStats.strikeRate =
        batsmanOnStrikeStats.balls > 0
          ? ((batsmanOnStrikeStats.runs / batsmanOnStrikeStats.balls) * 100).toFixed(2)
          : 0;
    }

    let bowlerStats = innings.bowling.find(
      b => b.player.toString() === bowlerId
    );

    if (!bowlerStats) {
      bowlerStats = {
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
      innings.bowling.push(bowlerStats);
    }

    bowlerStats.runs += batsmanRuns + extraRuns;
    if (isWide) bowlerStats.wides += 1;
    if (isNoBall) bowlerStats.noBalls += 1;

    if (!isWide && !isNoBall) {
      bowlerStats.balls += 1;
      innings.balls += 1;

      if (innings.balls % 6 === 0) {
        innings.overs += 1;
        bowlerStats.overs = Math.floor(bowlerStats.balls / 6);

        if (currentOver.runsScored === 0) {
          currentOver.maidenOver = true;
          bowlerStats.maidens += 1;
        }
      }
    }

    const bowlerOvers = bowlerStats.balls / 6;
    bowlerStats.economy = bowlerOvers > 0 ? (bowlerStats.runs / bowlerOvers).toFixed(2) : 0;

    if (isWicket) {
      innings.wickets += 1;
      currentOver.wickets += 1;
      bowlerStats.wickets += 1;

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

        innings.fallOfWickets.push({
          runs: innings.runs,
          wickets: innings.wickets,
          player: dismissedPlayerId,
          overs: innings.overs + (innings.balls % 6) / 10
        });
      }
    }

    // Generate detailed commentary
    let commentary = commentaryText;
    if (!customCommentary || !commentary) {
      commentary = generateDetailedCommentary({
        runs: batsmanRuns,
        isWide,
        isNoBall,
        isBye,
        isLegBye,
        isWicket,
        wicketType,
        batsmanName: batsmanOnStrike?.name || "Batsman",
        bowlerName: bowlerPlayer?.name || "Bowler",
        currentScore: innings.runs,
        currentWickets: innings.wickets,
        overNumber: currentOverNumber,
        ballNumber: ballNumberInOver
      });
    }

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

    innings.currentBatsman1 = batsmanOnStrikeId;
    innings.currentBatsman2 = batsmanNonStrikeId;
    innings.currentBowler = bowlerId;

    if ((batsmanRuns % 2 !== 0 || innings.balls % 6 === 0) && !isWicket) {
      innings.onStrikeBatsman = innings.onStrikeBatsman?.toString() === batsmanOnStrikeId
        ? batsmanNonStrikeId
        : batsmanOnStrikeId;
    } else {
      innings.onStrikeBatsman = batsmanOnStrikeId;
    }

    const totalOvers = innings.overs + (innings.balls % 6) / 6;
    innings.runRate = totalOvers > 0 ? (innings.runs / totalOvers).toFixed(2) : 0;

    if (inningsIndex === 1 && match.innings[0]) {
      const target = match.innings[0].runs + 1;
      innings.target = target;
      const remainingRuns = target - innings.runs;
      const remainingOvers = match.totalOvers - totalOvers;
      innings.requiredRunRate = remainingOvers > 0
        ? (remainingRuns / remainingOvers).toFixed(2)
        : 0;
    }

    if (innings.status === "upcoming") {
      innings.status = "live";
    }

    if (match.status === "upcoming") {
      match.status = "live";
    }

    const isOverComplete = innings.balls % 6 === 0 && !isWide && !isNoBall;

    if (isOverComplete) {
      currentOver.summary = generateOverSummary(currentOver);
    }

    const isSuperOver = match.result.resultType === "super_over";
    const wicketLimit = isSuperOver ? 2 : 10;

    const shouldEndInnings =
      innings.wickets >= wicketLimit ||
      innings.overs >= match.totalOvers ||
      (inningsIndex === 1 && match.innings.length === 2 && innings.runs >= innings.target) ||
      (inningsIndex === 3 && innings.runs >= innings.target);

    await match.save();

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

      io.to(matchId).emit("match:ballUpdate", {
        matchId,
        inningsIndex,
        ball,
        currentOver: currentOver.overNumber,
        ballNumber: ballNumberInOver,
        isOverComplete
      });

      io.to(matchId).emit("match:scoreUpdate", {
        matchId,
        runs: innings.runs,
        wickets: innings.wickets,
        overs: innings.overs,
        balls: innings.balls,
        runRate: innings.runRate,
        requiredRunRate: innings.requiredRunRate
      });

      if (isOverComplete) {
        io.to(matchId).emit("match:overComplete", {
          matchId,
          inningsIndex,
          over: currentOver
        });
      }

      io.emit("match:updated", match);
      io.emit("match:updateList");

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
    } else if (match.result.resultType === "super_over") {
      // Handle Super Over phased endings
      if (inningsIndex === 2) {
        // First innings of Super Over ended
        match.status = "pending_tie_resolution";
        match.result.description = "Super Over: First innings complete";
      } else if (inningsIndex === 3) {
        // Second innings of Super Over ended
        match.status = "completed";
        const innSO1 = match.innings[2];
        const innSO2 = match.innings[3];

        if (innSO1.runs > innSO2.runs) {
          match.result.winner = innSO1.team;
          match.result.description = `${innSO1.team.name} won the Super Over`;
        } else if (innSO2.runs > innSO1.runs) {
          match.result.winner = innSO2.team;
          match.result.description = `${innSO2.team.name} won the Super Over`;
        } else {
          // Double Super Over? For now, just declared tie or user can start another?
          // Cricket rules usually say most boundaries, but let's keep it simple.
          match.result.description = "Super Over ended in a tie";
        }
      }
    } else {
      match.status = "completed";

      const inn1 = match.innings[0];
      const inn2 = match.innings[1];

      if (inn1.runs > inn2.runs) {
        const runMargin = inn1.runs - inn2.runs;
        match.result = {
          winner: inn1.team,
          margin: `${runMargin} runs`,
          description: `${inn1.team.name} won by ${runMargin} runs`,
          resultType: "normal"
        };
      } else if (inn2.runs > inn1.runs) {
        const wicketsLeft = 10 - inn2.wickets;
        const ballsLeft = (match.totalOvers * 6) - ((inn2.overs * 6) + inn2.balls);

        match.result = {
          winner: inn2.team,
          margin: `${wicketsLeft} wickets`,
          description: `${inn2.team.name} won by ${wicketsLeft} wickets (${ballsLeft} balls remaining)`,
          resultType: "normal"
        };
      } else {
        match.status = "pending_tie_resolution";
        match.tieResolution = "pending";
        match.result = {
          margin: "Match tied",
          description: "Match ended in a tie - Resolution pending",
          resultType: "tie"
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

export const reduceOvers = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { newTotalOvers } = req.body;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (newTotalOvers >= match.totalOvers) {
      return res.status(400).json({
        message: "New overs must be less than current total overs"
      });
    }

    const oldTotalOvers = match.totalOvers;
    match.totalOvers = newTotalOvers;

    // If we are in the 2nd innings, we need to recalculate the target
    // Using a simplified DRS-like logic: Target = (Team1Runs * NewTotalOvers / OldTotalOvers) + 1
    if (match.currentInnings === 1 && match.innings[0] && match.innings[1]) {
      const inn1 = match.innings[0];
      const inn2 = match.innings[1];

      // Simplified DLS formula
      const newTarget = Math.floor((inn1.runs * newTotalOvers / oldTotalOvers)) + 1;
      inn2.target = newTarget;

      const totalOversFaced = inn2.overs + (inn2.balls % 6) / 6;
      const remainingOvers = newTotalOvers - totalOversFaced;
      const remainingRuns = newTarget - inn2.runs;

      inn2.requiredRunRate = remainingOvers > 0
        ? (remainingRuns / remainingOvers).toFixed(2)
        : 0;
    }

    await match.save();

    try {
      const io = getIO();
      io.to(matchId).emit("match:oversReduced", {
        matchId,
        newTotalOvers,
        newTarget: match.innings[1]?.target
      });
      io.emit("match:updated", match);
    } catch (socketError) {
      console.log("Socket not available:", socketError.message);
    }

    res.status(200).json({
      match,
      message: `Match overs reduced to ${newTotalOvers}`
    });
  } catch (error) {
    console.error("Error reducing overs:", error);
    res.status(400).json({
      message: "Failed to reduce overs",
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

function generateDetailedCommentary({
  runs,
  isWide,
  isNoBall,
  isBye,
  isLegBye,
  isWicket,
  wicketType,
  batsmanName,
  bowlerName,
  currentScore,
  currentWickets,
  overNumber,
  ballNumber
}) {
  const prefix = `${overNumber}.${ballNumber}`;

  if (isWicket) {
    const wicketCommentaries = {
      "bowled": [
        `BOWLED! What a delivery from ${bowlerName}! The stumps are shattered! ${batsmanName} departs.`,
        `OUT! Timber! ${bowlerName} gets through the defense of ${batsmanName}. The off stump goes cartwheeling.`,
        `BOWLED! Cleaned him up! ${batsmanName} has no answer to that one from ${bowlerName}.`
      ],
      "caught": [
        `OUT! Caught! ${batsmanName} holes out. Great catch! ${bowlerName} gets the breakthrough.`,
        `CAUGHT! In the air... and taken! ${batsmanName} can't believe it. ${bowlerName} strikes!`,
        `OUT! Wonderful catch! ${batsmanName} goes for the big shot but finds the fielder. ${bowlerName} is delighted.`
      ],
      "lbw": [
        `OUT! LBW! The finger goes up! ${batsmanName} has to go. ${bowlerName} gets the wicket.`,
        `PLUMB! That looked out and the umpire agrees. ${batsmanName} is gone lbw to ${bowlerName}.`,
        `OUT! Dead in front! ${batsmanName} caught plumb in front. ${bowlerName} celebrates.`
      ],
      "run out": [
        `RUN OUT! Direct hit! ${batsmanName} is well short of the crease! What a throw!`,
        `OUT! Run out! Terrible mix-up and ${batsmanName} has to walk back.`,
        `RUN OUT! Lightning quick throw and ${batsmanName} is gone! Brilliant fielding!`
      ],
      "stumped": [
        `STUMPED! Quick as a flash! ${batsmanName} is out of his crease and the keeper whips off the bails!`,
        `OUT! Stumped! Beaten by the turn and the keeper does the rest. ${batsmanName} departs.`,
        `STUMPED! Superb glovework! ${batsmanName} is caught short. ${bowlerName} gets his man.`
      ]
    };

    const comments = wicketCommentaries[wicketType] || [
      `OUT! ${batsmanName} has to go! ${bowlerName} strikes!`
    ];
    return `${prefix}\n${comments[Math.floor(Math.random() * comments.length)]}`;
  }

  if (isWide) {
    const wideComments = [
      `Wide! ${bowlerName} strays down the leg side. Extra run for the batting team.`,
      `WIDE! That's way outside the tramline. Free run.`,
      `Wide ball! ${bowlerName} loses his line. Pressure showing.`
    ];
    return `${prefix}\n${wideComments[Math.floor(Math.random() * wideComments.length)]}`;
  }

  if (isNoBall) {
    const noballs = [
      `No ball! ${bowlerName} oversteps. Free hit coming up!`,
      `NO BALL! That's a big overstep from ${bowlerName}. Free hit next ball.`,
      `No ball! ${bowlerName} will have to bowl that again.`
    ];
    return `${prefix}\n${noballs[Math.floor(Math.random() * noballs.length)]}`;
  }

  if (isBye) {
    return `${prefix}\n${runs} ${runs === 1 ? 'bye' : 'byes'}! The keeper couldn't collect. ${bowlerName} won't be happy.`;
  }

  if (isLegBye) {
    return `${prefix}\n${runs} leg ${runs === 1 ? 'bye' : 'byes'}! Off the pads and away.`;
  }

  const runCommentaries = {
    0: [
      `Dot ball. Solid defense from ${batsmanName}.`,
      `No run. Good bowling from ${bowlerName}, ${batsmanName} respects it.`,
      `DOT! ${bowlerName} beats ${batsmanName} outside off. Good ball.`,
      `Defended solidly by ${batsmanName}. No run.`
    ],
    1: [
      `Single taken. ${batsmanName} rotates the strike nicely.`,
      `One run. Good running between the wickets.`,
      `They take a quick single. Alert running from ${batsmanName}.`,
      `Pushed into the gap for a single.`
    ],
    2: [
      `Two runs! Good running between the wickets from ${batsmanName}.`,
      `They scamper back for the second. Excellent running.`,
      `TWO! ${batsmanName} places it well and comes back for two.`,
      `A couple of runs. Well run.`
    ],
    3: [
      `THREE RUNS! Excellent running from the batsmen!`,
      `They run three! ${batsmanName} pushes for the third and makes it.`,
      `Three runs! Superb fitness on display.`
    ],
    4: [
      `FOUR! Beautiful shot from ${batsmanName}! That raced away to the boundary!`,
      `BOUNDARY! ${batsmanName} finds the gap perfectly! Four runs!`,
      `FOUR! What a stroke! ${batsmanName} is in fine form!`,
      `FOUR! Cracking shot from ${batsmanName}! ${bowlerName} under pressure now.`,
      `BOUNDARY! ${batsmanName} leans into it and sends it racing past the fielder!`
    ],
    6: [
      `SIX! MASSIVE! ${batsmanName} launches it into the stands! What a shot!`,
      `MAXIMUM! ${batsmanName} goes big and clears the boundary with ease!`,
      `SIX! That's huge! ${batsmanName} is taking on ${bowlerName} here!`,
      `BANG! SIX! ${batsmanName} smashes it out of the park!`,
      `SIX! Clean strike from ${batsmanName}! That went a long way!`
    ]
  };

  const comments = runCommentaries[runs] || [`${runs} runs scored.`];
  return `${prefix}\n${bowlerName} to ${batsmanName}, ${comments[Math.floor(Math.random() * comments.length)]}`;
}

function generateOverSummary(over) {
  const runs = over.runsScored;
  const wickets = over.wickets;

  let summary = `${runs} ${runs === 1 ? 'run' : 'runs'}`;

  if (wickets > 0) {
    summary += `, ${wickets} ${wickets === 1 ? 'wicket' : 'wickets'}`;
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

export const resolveTie = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { resolution } = req.body; // "declared_tie" or "super_over"

    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });

    if (match.status !== "pending_tie_resolution") {
      return res.status(400).json({ message: "Match is not pending tie resolution" });
    }

    if (resolution === "declared_tie") {
      match.status = "completed";
      match.tieResolution = "declared_tie";
      match.result.description = "Match ended in a tie";
      await match.save();
    } else if (resolution === "super_over") {
      match.tieResolution = "super_over";
      // We don't change match status yet, it stays pending until players are selected or startSuperOver is called
      await match.save();
    } else {
      return res.status(400).json({ message: "Invalid resolution type" });
    }

    try {
      const io = getIO();
      io.to(matchId).emit("match:tieResolved", { matchId, resolution });
      io.emit("match:updated", match);
    } catch (err) { }

    res.status(200).json({ match, message: `Tie resolved as ${resolution}` });
  } catch (error) {
    res.status(400).json({ message: "Failed to resolve tie", error: error.message });
  }
};

export const startSuperOverInnings = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { batsmenIds, bowlerId } = req.body;

    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });

    if (match.status !== "pending_tie_resolution" || match.tieResolution !== "super_over") {
      return res.status(400).json({ message: "Match is not ready for Super Over selection" });
    }

    // Determine which SO innings this is (1st or 2nd)
    const isFirstSO = match.innings.length === 2;
    const isSecondSO = match.innings.length === 3;

    if (!isFirstSO && !isSecondSO) {
      return res.status(400).json({ message: "Invalid state for starting Super Over innings" });
    }

    let battingTeamId, bowlingTeamId;

    if (isFirstSO) {
      // 2nd innings team from full match bats first in SO
      battingTeamId = match.innings[1].team;
      bowlingTeamId = match.innings[0].team;
    } else {
      // 1st innings team from full match bats second in SO
      battingTeamId = match.innings[0].team;
      bowlingTeamId = match.innings[1].team;
    }

    // Initialize the new SO innings
    const newInnings = {
      team: battingTeamId,
      battingOrder: batsmenIds,
      status: "live",
      runs: 0,
      wickets: 0,
      overs: 0,
      balls: 0,
      currentBatsman1: batsmenIds[0],
      currentBatsman2: batsmenIds[1],
      onStrikeBatsman: batsmenIds[0],
      currentBowler: bowlerId,
      extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalties: 0, total: 0 },
      batting: batsmenIds.map(id => ({ player: id, runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, isOut: false })),
      bowling: [{ player: bowlerId, overs: 0, balls: 0, maidens: 0, runs: 0, wickets: 0, wides: 0, noBalls: 0, economy: 0 }]
    };

    match.innings.push(newInnings);
    match.status = "live";
    match.currentInnings = match.innings.length - 1;
    match.totalOvers = 1;
    match.result.resultType = "super_over";

    if (isFirstSO) {
      match.result.description = "Super Over: 1st Innings in progress";
    } else {
      match.result.description = "Super Over: 2nd Innings in progress";
      // Set target for 2nd SO innings
      match.innings[match.currentInnings].target = match.innings[2].runs + 1;
    }

    await match.save();

    try {
      const io = getIO();
      io.to(matchId).emit("match:superOverStarted", { matchId, inningsIndex: match.currentInnings });
      io.emit("match:updated", match);
    } catch (err) { }

    res.status(200).json({ match, message: `Super Over Innings ${isFirstSO ? 1 : 2} started` });
  } catch (error) {
    res.status(400).json({ message: "Failed to start Super Over innings", error: error.message });
  }
};