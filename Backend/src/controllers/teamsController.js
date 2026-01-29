import Team from "../models/Team.js";

export const listTeams = async (req, res) => {
  try {
    const teams = await Team.find();
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch teams", error });
  }
};

export const getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.status(200).json(team);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch team", error });
  }
};

export const createTeam = async (req, res) => {
  try {
    const { name, shortName } = req.body;

    const team = new Team({ name, shortName });
    await team.save();

    res.status(201).json(team);
  } catch (error) {
    res.status(400).json({ message: "Failed to create team", error });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.status(200).json(team);
  } catch (error) {
    res.status(400).json({ message: "Failed to update team", error });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.status(200).json({ message: "Team deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete team", error });
  }
};
