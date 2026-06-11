import express from "express";
import CricketShot from "../models/CricketShot.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const shots = await CricketShot.find({ isActive: true }).sort({ category: 1, name: 1 });
    const grouped = {
      attacking: shots.filter(s => s.category === "attacking"),
      defensive: shots.filter(s => s.category === "defensive"),
      glancing: shots.filter(s => s.category === "glancing" || s.category === "unorthodox"),
    };
    res.json({ shots, grouped });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const shot = await CricketShot.findById(req.params.id);
    if (!shot) return res.status(404).json({ message: "Shot not found" });
    res.json(shot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", protect, requireAdmin, async (req, res) => {
  try {
    const shot = await CricketShot.create(req.body);
    res.status(201).json(shot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/:id", protect, requireAdmin, async (req, res) => {
  try {
    const shot = await CricketShot.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!shot) return res.status(404).json({ message: "Shot not found" });
    res.json(shot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;