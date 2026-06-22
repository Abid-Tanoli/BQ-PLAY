import express from "express";
import {
  getCategories,
  getTeamsByType,
  getLeagues,
  getLeagueDetails,
  getIncubationGroups,
  getIncubationGroupDetails,
  createIncubationGroup,
  updateIncubationGroup,
  deleteIncubationGroup,
  addTeamToIncubationGroup
} from "../controllers/categoryController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getCategories);
router.get("/teams/:type", getTeamsByType);
router.get("/leagues", getLeagues);
router.get("/leagues/:leagueId", getLeagueDetails);
router.get("/incubation", getIncubationGroups);
router.get("/incubation/:groupId", getIncubationGroupDetails);

// Admin routes
router.post("/incubation", protect, requireAdmin, createIncubationGroup);
router.put("/incubation/:groupId", protect, requireAdmin, updateIncubationGroup);
router.delete("/incubation/:groupId", protect, requireAdmin, deleteIncubationGroup);
router.post("/incubation/:groupId/teams/:teamId", protect, requireAdmin, addTeamToIncubationGroup);

export default router;
