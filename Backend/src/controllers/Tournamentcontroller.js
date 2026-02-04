import Tournament from "../models/Tournament.js";
import Match from "../models/match.js";
import Team from "../models/Team.js";
import { getIO } from "../socket/socket.js";

export const getTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find()
      .populate("teams", "name shortName logo")
      .populate("winner", "name shortName logo")
      .populate("runnerUp", "name shortName logo")
      .sort({ startDate: -1 });

    res.status(200).json(tournaments);
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    res.status(500).json({ 
      message: "Failed to fetch tournaments", 
      error: error.message 
    });
  }
};

export const getTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate("teams", "name shortName logo players")
      .populate("matches")
      .populate("pointsTable.team", "name shortName logo")
      .populate("winner", "name shortName logo")
      .populate("runnerUp", "name shortName logo");

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    res.status(200).json(tournament);
  } catch (error) {
    console.error("Error fetching tournament:", error);
    res.status(500).json({ 
      message: "Failed to fetch tournament", 
      error: error.message 
    });
  }
};

export const createTournament = async (req, res) => {
  try {
    const { name, shortName, type, startDate, endDate, teams, venue, format } = req.body;

    if (!teams || teams.length < 2) {
      return res.status(400).json({ 
        message: "At least 2 teams are required" 
      });
    }

    // Initialize points table for all teams
    const pointsTable = teams.map(teamId => ({
      team: teamId,
      matchesPlayed: 0,
      won: 0,
      lost: 0,
      tied: 0,
      noResult: 0,
      points: 0,
      netRunRate: 0,
      for: 0,
      against: 0
    }));

    const tournament = new Tournament({
      name,
      shortName: shortName || name.substring(0, 10).toUpperCase(),
      type: type || "league",
      startDate,
      endDate,
      teams,
      venue: venue || "",
      format: format || "T20",
      pointsTable,
      status: "upcoming"
    });

    await tournament.save();
    await tournament.populate("teams", "name shortName logo");

    try {
      const io = getIO();
      io.emit("tournament:created", tournament);
    } catch (socketError) {
      console.log("Socket not available:", socketError.message);
    }

    res.status(201).json({ 
      tournament, 
      message: "Tournament created successfully" 
    });
  } catch (error) {
    console.error("Error creating tournament:", error);
    res.status(400).json({ 
      message: "Failed to create tournament", 
      error: error.message 
    });
  }
};

export const updateTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    Object.assign(tournament, req.body);
    await tournament.save();
    await tournament.populate("teams", "name shortName logo");

    try {
      const io = getIO();
      io.emit("tournament:updated", tournament);
    } catch (socketError) {
      console.log("Socket not available:", socketError.message);
    }

    res.status(200).json({ 
      tournament, 
      message: "Tournament updated successfully" 
    });
  } catch (error) {
    console.error("Error updating tournament:", error);
    res.status(400).json({ 
      message: "Failed to update tournament", 
      error: error.message 
    });
  }
};

export const deleteTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    // Delete all associated matches
    if (tournament.matches && tournament.matches.length > 0) {
      await Match.deleteMany({ _id: { $in: tournament.matches } });
    }

    await Tournament.findByIdAndDelete(req.params.id);

    try {
      const io = getIO();
      io.emit("tournament:deleted", { id: req.params.id });
    } catch (socketError) {
      console.log("Socket not available:", socketError.message);
    }

    res.status(200).json({ message: "Tournament deleted successfully" });
  } catch (error) {
    console.error("Error deleting tournament:", error);
    res.status(500).json({ 
      message: "Failed to delete tournament", 
      error: error.message 
    });
  }
};

export const getTournamentPointsTable = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate("pointsTable.team", "name shortName logo");

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    // Sort by points, then by net run rate
    const sortedTable = [...tournament.pointsTable].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.netRunRate - a.netRunRate;
    });

    res.status(200).json(sortedTable);
  } catch (error) {
    console.error("Error fetching points table:", error);
    res.status(500).json({ 
      message: "Failed to fetch points table", 
      error: error.message 
    });
  }
};

export const updatePointsTable = async (req, res) => {
  try {
    const { tournamentId, matchId } = req.body;

    const tournament = await Tournament.findById(tournamentId);
    const match = await Match.findById(matchId);

    if (!tournament || !match) {
      return res.status(404).json({ message: "Tournament or match not found" });
    }

    if (match.status !== "completed") {
      return res.status(400).json({ message: "Match is not completed yet" });
    }

    // Update points table based on match result
    const team1 = match.teams[0];
    const team2 = match.teams[1];
    
    const team1Entry = tournament.pointsTable.find(
      entry => entry.team.toString() === team1.toString()
    );
    const team2Entry = tournament.pointsTable.find(
      entry => entry.team.toString() === team2.toString()
    );

    if (!team1Entry || !team2Entry) {
      return res.status(400).json({ message: "Teams not found in tournament" });
    }

    // Update matches played
    team1Entry.matchesPlayed += 1;
    team2Entry.matchesPlayed += 1;

    const innings1 = match.innings[0];
    const innings2 = match.innings[1];

    team1Entry.for += innings1.runs;
    team1Entry.against += innings2.runs;
    team2Entry.for += innings2.runs;
    team2Entry.against += innings1.runs;

    // Calculate net run rate
    const calculateNRR = (entry) => {
      const runRate = entry.for / (entry.matchesPlayed * tournament.totalOvers || 20);
      const runsConceded = entry.against / (entry.matchesPlayed * tournament.totalOvers || 20);
      return runRate - runsConceded;
    };

    if (match.result.resultType === "tie") {
      team1Entry.tied += 1;
      team2Entry.tied += 1;
      team1Entry.points += 1;
      team2Entry.points += 1;
    } else if (match.result.resultType === "no result") {
      team1Entry.noResult += 1;
      team2Entry.noResult += 1;
      team1Entry.points += 1;
      team2Entry.points += 1;
    } else if (match.result.winner) {
      if (match.result.winner.toString() === team1.toString()) {
        team1Entry.won += 1;
        team1Entry.points += 2;
        team2Entry.lost += 1;
      } else {
        team2Entry.won += 1;
        team2Entry.points += 2;
        team1Entry.lost += 1;
      }
    }

    team1Entry.netRunRate = calculateNRR(team1Entry);
    team2Entry.netRunRate = calculateNRR(team2Entry);

    await tournament.save();

    try {
      const io = getIO();
      io.emit("tournament:pointsTableUpdated", tournament);
    } catch (socketError) {
      console.log("Socket not available:", socketError.message);
    }

    res.status(200).json({ 
      tournament, 
      message: "Points table updated successfully" 
    });
  } catch (error) {
    console.error("Error updating points table:", error);
    res.status(400).json({ 
      message: "Failed to update points table", 
      error: error.message 
    });
  }
};

export const getTournamentFixtures = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    const matches = await Match.find({ tournament: req.params.id })
      .populate("teams", "name shortName logo")
      .populate("result.winner", "name")
      .sort({ startAt: 1 });

    res.status(200).json(matches);
  } catch (error) {
    console.error("Error fetching fixtures:", error);
    res.status(500).json({ 
      message: "Failed to fetch fixtures", 
      error: error.message 
    });
  }
};