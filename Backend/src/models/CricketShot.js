import mongoose from "mongoose";

const cricketShotSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ["attacking", "defensive", "glancing", "unorthodox"], required: true },
  description: { type: String, default: "" },
  pitchZone: { type: String, default: "" },
  preferredLine: { type: String, default: "" },
  groundZone: { type: String, default: "" },
  svgPath: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

cricketShotSchema.index({ category: 1, name: 1 });

export default mongoose.models.CricketShot || mongoose.model("CricketShot", cricketShotSchema);