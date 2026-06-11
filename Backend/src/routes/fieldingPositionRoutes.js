import express from "express";
import FieldingPosition from "../models/FieldingPosition.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const positions = await FieldingPosition.find({ isActive: true }).sort({ category: 1, name: 1 });
    res.json(positions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const pos = await FieldingPosition.findById(req.params.id);
    if (!pos) return res.status(404).json({ message: "Position not found" });
    res.json(pos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", protect, requireAdmin, async (req, res) => {
  try {
    const pos = await FieldingPosition.create(req.body);
    res.status(201).json(pos);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/:id", protect, requireAdmin, async (req, res) => {
  try {
    const pos = await FieldingPosition.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pos) return res.status(404).json({ message: "Position not found" });
    res.json(pos);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;