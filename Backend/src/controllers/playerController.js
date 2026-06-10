import Player from "../models/Player.js";
import Team from "../models/Team.js";
import { getIO } from "../socket/socket.js";

const isTransientDbError = (error) => (
  error?.name === "MongooseError" ||
  error?.name === "MongoServerSelectionError" ||
  error?.name === "MongoNetworkTimeoutError" ||
  /timed out|buffering|not connected/i.test(error?.message || "")
);

export const getPlayers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", team = "", campus = "", category, subCategory, ageGroup, organization, city } = req.query;
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const safePage = Math.max(Number(page) || 1, 1);
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
        { organization: { $regex: search, $options: "i" } }
      ];
    }
    if (team) query.team = team;
    if (campus) query.campus = { $regex: campus, $options: "i" };
    if (category) query.category = category;
    if (subCategory) query.subCategory = { $regex: subCategory, $options: "i" };
    if (ageGroup) query.ageGroup = ageGroup;
    if (organization) query.organization = { $regex: organization, $options: "i" };
    if (city) query["address.city"] = { $regex: city, $options: "i" };

    const skip = (safePage - 1) * safeLimit;
    const [totalPlayers, players] = await Promise.all([
      Player.countDocuments(query).maxTimeMS(5000),
      Player.find(query)
        .populate("team", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .maxTimeMS(5000)
        .lean()
    ]);

    res.json({
      players,
      totalPlayers,
      totalPages: Math.ceil(totalPlayers / safeLimit),
      currentPage: safePage,
    });
  } catch (error) {
    if (isTransientDbError(error)) {
      return res.json({ players: [], totalPlayers: 0, totalPages: 0, currentPage: Number(req.query.page || 1) });
    }
    res.status(500).json({ message: "Failed to fetch players", error: error.message });
  }
};

export const getPlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id).populate("team", "name");
    if (!player) return res.status(404).json({ message: "Player not found" });
    res.json(player);
  } catch (err) {
    res.status(500).json({ message: "Error fetching player" });
  }
};

export const createPlayer = async (req, res) => {
  try {
    const player = await Player.create(req.body);
    const populated = await Player.findById(player._id).populate("team", "name");

    // If a team was assigned, add this player to the team's players array
    if (player.team) {
      await Team.findByIdAndUpdate(
        player.team,
        { $addToSet: { players: player._id } }
      );
    }

    getIO()?.emit("players:updated");
    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating player" });
  }
};

export const updatePlayer = async (req, res) => {
  try {
    const existing = await Player.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Player not found" });

    const oldTeamId = existing.team?.toString();
    const newTeamId = req.body.team?.toString();

    const player = await Player.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("team", "name");

    // If team changed, update the teams' players arrays
    if (oldTeamId !== newTeamId) {
      // Remove from old team
      if (oldTeamId) {
        await Team.findByIdAndUpdate(
          oldTeamId,
          { $pull: { players: player._id } }
        );
      }
      // Add to new team
      if (newTeamId) {
        await Team.findByIdAndUpdate(
          newTeamId,
          { $addToSet: { players: player._id } }
        );
      }
    }

    getIO()?.emit("players:updated");
    res.json(player);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating player" });
  }
};

export const deletePlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (player?.team) {
      await Team.findByIdAndUpdate(
        player.team,
        { $pull: { players: player._id } }
      );
    }
    await Player.findByIdAndDelete(req.params.id);
    getIO()?.emit("players:updated");
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting player" });
  }
};

export const bulkDeletePlayers = async (req, res) => {
  try {
    const { playerIds } = req.body;

    if (!playerIds || !Array.isArray(playerIds) || playerIds.length === 0) {
      return res.status(400).json({ message: "Player IDs array is required" });
    }

    // Get all players to be deleted to find their teams
    const players = await Player.find({ _id: { $in: playerIds } });

    // Get unique team IDs
    const teamIds = [...new Set(
      players
        .filter(p => p.team)
        .map(p => p.team.toString())
    )];

    // Remove players from their teams
    for (const teamId of teamIds) {
      await Team.findByIdAndUpdate(
        teamId,
        { $pull: { players: { $in: playerIds } } }
      );
    }

    // Delete all players
    const result = await Player.deleteMany({ _id: { $in: playerIds } });

    getIO()?.emit("players:updated");
    res.json({
      message: "Players deleted successfully",
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting players" });
  }
};

export const getPlayerRanking = async (req, res) => {
  const players = await Player.find().populate("team", "name");

  const ranked = players.map(p => {
    const points =
      (p.stats.runs * 1) +
      (p.stats.wickets * 25);
    return { ...p._doc, rankingPoints: points };
  });

  ranked.sort((a, b) => b.rankingPoints - a.rankingPoints);
  res.json(ranked);
};
