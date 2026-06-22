import mongoose from "mongoose";

const fieldingPositionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ["infield", "outfield", "slip_cordon"], default: "infield" },
  side: { type: String, enum: ["off", "on", "both"], default: "off" },
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

fieldingPositionSchema.index({ category: 1, name: 1 });

export default mongoose.models.FieldingPosition || mongoose.model("FieldingPosition", fieldingPositionSchema);