import Match from "../models/Match.js";
import Team from "../models/Team.js";
import { getIO } from "../socket/socket.js";

export const getMatches = async (req, res) => {
  try {
    const matches = await Match.find()
      .populate("teams", "name shortName logo")
      .populate("innings.team", "name shortName")
      .populate("result.winner", "name")
      .populate("manOfMatch", "name")
      .sort({ startAt: -1 });

    res.status(200).json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({ 
      message: "Failed to fetch matches", 
      error: error.message 
    });
  }
};

export const getMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate("teams", "name shortName logo players")
      .populate("innings.team", "name shortName")
      .populate("innings.batting.player", "name role")
      .populate("innings.bowling.player", "name role")
      .populate("result.winner", "name")
      .populate("tossWinner", "name")
      .populate("manOfMatch", "name role");

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    res.status(200).json(match);
  } catch (error) {
    console.error("Error fetching match:", error);
    res.status(500).json({ 
      message: "Failed to fetch match", 
      error: error.message 
    });
  }
};

export const createMatch = async (req, res) => {
  try {
    const { title, venue, matchType, startAt, teams } = req.body;

    if (!teams || teams.length !== 2) {
      return res.status(400).json({ 
        message: "Exactly 2 teams are required" 
      });
    }

    if (teams[0] === teams[1]) {
      return res.status(400).json({ 
        message: "Teams must be different" 
      });
    }

    const team1 = await Team.findById(teams[0]);
    const team2 = await Team.findById(teams[1]);

    if (!team1 || !team2) {
      return res.status(404).json({ 
        message: "One or both teams not found" 
      });
    }

    const innings = [
      {
        team: teams[0],
        runs: 0,
        wickets: 0,
        overs: 0,
        balls: 0,
        extras: 0,
        status: "upcoming",
        commentary: [],
        batting: [],
        bowling: []
      },
      {
        team: teams[1],
        runs: 0,
        wickets: 0,
        overs: 0,
        balls: 0,
        extras: 0,
        status: "upcoming",
        commentary: [],
        batting: [],
        bowling: []
      }
    ];

    const match = new Match({
      title: title || `${team1.name} vs ${team2.name}`,
      venue: venue || "",
      matchType: matchType || "T20",
      startAt,
      teams,
      innings,
      status: "upcoming"
    });

    await match.save();

    await match.populate("teams", "name shortName logo");
    await match.populate("innings.team", "name shortName");

    try {
      const io = getIO();
      io.emit("match:created", match);
      io.emit("match:updateList");
    } catch (socketError) {
      console.log("Socket not available:", socketError.message);
    }

    res.status(201).json({ 
      match, 
      message: "Match created successfully" 
    });
  } catch (error) {
    console.error("Error creating match:", error);
    res.status(400).json({ 
      message: "Failed to create match", 
      error: error.message 
    });
  }
};

export const updateMatch = async (req, res) => {
  try {
    const { title, venue, matchType, startAt, teams, status } = req.body;

    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (teams && teams.length === 2) {
      if (teams[0] === teams[1]) {
        return res.status(400).json({ 
          message: "Teams must be different" 
        });
      }

      const team1 = await Team.findById(teams[0]);
      const team2 = await Team.findById(teams[1]);

      if (!team1 || !team2) {
        return res.status(404).json({ 
          message: "One or both teams not found" 
        });
      }

      if (match.innings.length >= 2) {
        match.innings[0].team = teams[0];
        match.innings[1].team = teams[1];
      }

      match.teams = teams;
      match.title = title || `${team1.name} vs ${team2.name}`;
    }

    if (title !== undefined) match.title = title;
    if (venue !== undefined) match.venue = venue;
    if (matchType !== undefined) match.matchType = matchType;
    if (startAt !== undefined) match.startAt = startAt;
    if (status !== undefined) match.status = status;

    await match.save();

    await match.populate("teams", "name shortName logo");
    await match.populate("innings.team", "name shortName");

    try {
      const io = getIO();
      io.emit("match:updated", match);
      io.emit("match:updateList");
    } catch (socketError) {
      console.log("Socket not available:", socketError.message);
    }

    res.status(200).json({ 
      match, 
      message: "Match updated successfully" 
    });
  } catch (error) {
    console.error("Error updating match:", error);
    res.status(400).json({ 
      message: "Failed to update match", 
      error: error.message 
    });
  }
};

export const deleteMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    await Match.findByIdAndDelete(req.params.id);

    try {
      const io = getIO();
      io.emit("match:deleted", { id: req.params.id });
      io.emit("match:updateList");
    } catch (socketError) {
      console.log("Socket not available:", socketError.message);
    }

    res.status(200).json({ message: "Match deleted successfully" });
  } catch (error) {
    console.error("Error deleting match:", error);
    res.status(500).json({ 
      message: "Failed to delete match", 
      error: error.message 
    });
  }
};

export const setMOM = async (req, res) => {
  try {
    const { playerId } = req.body;

    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    match.manOfMatch = playerId;
    await match.save();

    await match.populate("manOfMatch", "name role");
    await match.populate("teams", "name shortName logo");

    try {
      const io = getIO();
      io.emit("match:updated", match);
    } catch (socketError) {
      console.log("Socket not available:", socketError.message);
    }

    res.status(200).json({ 
      match, 
      message: "Man of the Match set successfully" 
    });
  } catch (error) {
    console.error("Error setting MOM:", error);
    res.status(400).json({ 
      message: "Failed to set Man of the Match", 
      error: error.message 
    });
  }
};

export const getMatchStats = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate("teams", "name shortName")
      .populate("innings.batting.player", "name")
      .populate("innings.bowling.player", "name");

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    const stats = {
      matchId: match._id,
      title: match.title,
      status: match.status,
      teams: match.teams,
      innings: match.innings.map(inn => ({
        team: inn.team,
        totalRuns: inn.runs,
        totalWickets: inn.wickets,
        overs: `${inn.overs}.${inn.balls}`,
        extras: inn.extras,
        topBatsmen: inn.batting
          .sort((a, b) => b.runs - a.runs)
          .slice(0, 3)
          .map(b => ({
            player: b.player,
            runs: b.runs,
            balls: b.balls,
            strikeRate: b.strikeRate
          })),
        topBowlers: inn.bowling
          .sort((a, b) => b.wickets - a.wickets)
          .slice(0, 3)
          .map(b => ({
            player: b.player,
            wickets: b.wickets,
            runs: b.runs,
            overs: b.overs,
            economy: b.economy
          }))
      })),
      result: match.result,
      manOfMatch: match.manOfMatch
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching match stats:", error);
    res.status(500).json({ 
      message: "Failed to fetch match statistics", 
      error: error.message 
    });
  }
};

export const updateMatchStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["upcoming", "live", "completed"].includes(status)) {
      return res.status(400).json({ 
        message: "Invalid status. Must be: upcoming, live, or completed" 
      });
    }

    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    match.status = status;
    await match.save();

    await match.populate("teams", "name shortName logo");

    try {
      const io = getIO();
      io.emit("match:statusChanged", { matchId: match._id, status });
      io.emit("match:updated", match);
      io.emit("match:updateList");
    } catch (socketError) {
      console.log("Socket not available:", socketError.message);
    }

    res.status(200).json({ 
      match, 
      message: `Match status updated to ${status}` 
    });
  } catch (error) {
    console.error("Error updating match status:", error);
    res.status(400).json({ 
      message: "Failed to update match status", 
      error: error.message 
    });
  }
};