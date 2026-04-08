import Event from "../models/Event.js";
import Match from "../models/match.js";
import Team from "../models/Team.js";
import { getIO } from "../socket/socket.js";

export const getEvents = async (req, res) => {
  try {
    const { eventType, status } = req.query;
    const query = {};
    if (eventType) query.eventType = eventType;
    if (status) query.status = status;

    const events = await Event.find(query)
      .populate("teams", "name shortName logo")
      .populate("matches")
      .populate("winner", "name shortName logo")
      .populate("runnerUp", "name shortName logo")
      .sort({ startDate: -1 });

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events", error: error.message });
  }
};

export const getEvent = async (req, res) => {
  try {
    const { id } = req.params;
    let event;

    // Support both ID and slug lookup
    if (id.length === 24) {
      event = await Event.findById(id)
        .populate("teams", "name shortName logo players")
        .populate("matches")
        .populate("eventSquads.team", "name shortName logo")
        .populate("eventSquads.players", "name role playingRole imageUrl battingStyle bowlingStyle")
        .populate("eventSquads.captain", "name")
        .populate("eventSquads.viceCaptain", "name")
        .populate("eventSquads.wicketKeepers", "name")
        .populate("pointsTable.team", "name shortName logo")
        .populate("winner", "name shortName logo")
        .populate("runnerUp", "name shortName logo");
    } else {
      event = await Event.findOne({ slug: id })
        .populate("teams", "name shortName logo players")
        .populate("matches")
        .populate("eventSquads.team", "name shortName logo")
        .populate("eventSquads.players", "name role playingRole imageUrl battingStyle bowlingStyle")
        .populate("eventSquads.captain", "name")
        .populate("eventSquads.viceCaptain", "name")
        .populate("eventSquads.wicketKeepers", "name")
        .populate("pointsTable.team", "name shortName logo")
        .populate("winner", "name shortName logo")
        .populate("runnerUp", "name shortName logo");
    }

    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch event", error: error.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { name, shortName, eventType, teams, format, startDate, endDate, venue, description, totalMatches, overs } = req.body;

    if (!name || !eventType) {
      return res.status(400).json({ message: "Name and event type are required" });
    }

    if (eventType !== "single-match" && (!teams || teams.length < 2)) {
      return res.status(400).json({ message: "At least 2 teams are required" });
    }

    // Initialize points table for multi-team events
    let pointsTable = [];
    if (["series", "tri-series", "tournament", "world-cup", "champions-trophy", "league"].includes(eventType)) {
      pointsTable = teams.map(teamId => ({
        team: teamId,
        matchesPlayed: 0, won: 0, lost: 0, tied: 0, noResult: 0,
        points: 0, netRunRate: 0, for: 0, against: 0, wicketsFor: 0, wicketsAgainst: 0, seriesForm: []
      }));
    }

    const event = new Event({
      name,
      shortName: shortName || name.substring(0, 10).toUpperCase(),
      eventType,
      teams: teams || [],
      format: format || "T20",
      totalMatches: totalMatches || 0,
      oversPerInnings: overs || (format === "Tape Ball" ? 8 : 20),
      startDate,
      endDate,
      venue: venue || "",
      description: description || "",
      pointsTable,
      status: "upcoming"
    });

    await event.save();
    await event.populate("teams", "name shortName logo");

    try { getIO().emit("event:created", event); } catch { }

    res.status(201).json({ event, message: "Event created successfully" });
  } catch (error) {
    res.status(400).json({ message: "Failed to create event", error: error.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    Object.assign(event, req.body);
    await event.save();
    await event.populate("teams", "name shortName logo");

    try { getIO().emit("event:updated", event); } catch { }

    res.status(200).json({ event, message: "Event updated successfully" });
  } catch (error) {
    res.status(400).json({ message: "Failed to update event", error: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Delete associated matches
    if (event.matches && event.matches.length > 0) {
      await Match.deleteMany({ _id: { $in: event.matches } });
    }

    await Event.findByIdAndDelete(req.params.id);
    try { getIO().emit("event:deleted", { id: req.params.id }); } catch { }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete event", error: error.message });
  }
};

// Event Squad Management (11-20 players per team)
export const setEventSquad = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { teamId, players, captain, viceCaptain, wicketKeepers } = req.body;

    if (!players || players.length < 11 || players.length > 20) {
      return res.status(400).json({ message: "Event squad size must be between 11 and 20 players" });
    }
    if (!captain) return res.status(400).json({ message: "Captain is required" });
    if (!viceCaptain) return res.status(400).json({ message: "Vice-captain is required" });
    if (!wicketKeepers || wicketKeepers.length === 0) return res.status(400).json({ message: "At least one wicket-keeper is required" });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const isTeamInEvent = event.teams.some(t => t.toString() === teamId.toString());
    if (!isTeamInEvent) return res.status(400).json({ message: "Team is not part of this event" });

    const existingSquad = event.eventSquads.find(s => s.team.toString() === teamId.toString());
    if (existingSquad) {
      existingSquad.players = players;
      existingSquad.captain = captain;
      existingSquad.viceCaptain = viceCaptain;
      existingSquad.wicketKeepers = wicketKeepers;
    } else {
      event.eventSquads.push({ team: teamId, players, captain, viceCaptain, wicketKeepers });
    }

    await event.save();
    await event.populate("eventSquads.team", "name shortName logo");
    await event.populate("eventSquads.players", "name role playingRole");

    try { getIO().emit("event:squadUpdated", { eventId, teamId }); } catch { }

    res.status(200).json({ message: "Event squad set successfully", event });
  } catch (error) {
    res.status(500).json({ message: "Failed to set event squad", error: error.message });
  }
};

export const getEventSquad = async (req, res) => {
  try {
    const { eventId, teamId } = req.params;
    const event = await Event.findById(eventId)
      .populate("eventSquads.team", "name shortName logo")
      .populate("eventSquads.players", "name role playingRole imageUrl battingStyle bowlingStyle");

    if (!event) return res.status(404).json({ message: "Event not found" });

    if (teamId) {
      const squad = event.eventSquads.find(s => s.team?._id?.toString() === teamId || s.team?.toString() === teamId);
      if (!squad) return res.status(404).json({ message: "Squad not found for this team" });
      return res.status(200).json(squad);
    }

    res.status(200).json(event.eventSquads);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch event squad", error: error.message });
  }
};

// Add match to event
export const addMatchToEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { matchId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (!event.matches.includes(matchId)) {
      event.matches.push(matchId);
      await event.save();
    }

    // Update the match to reference this event
    await Match.findByIdAndUpdate(matchId, { tournament: eventId });

    await event.populate("matches");
    res.status(200).json({ message: "Match added to event", event });
  } catch (error) {
    res.status(500).json({ message: "Failed to add match to event", error: error.message });
  }
};
