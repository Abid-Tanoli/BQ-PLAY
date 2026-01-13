import mongoose from "mongoose";

const inningsSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  runs: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  overs: { type: Number, default: 0 },
  balls: { type: Number, default: 0 },
  extras: { type: Number, default: 0 },
  status: { type: String, enum: ["upcoming", "live", "completed"], default: "upcoming" },
});

const matchSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    venue: { type: String },
    startAt: { type: Date },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true }],
    innings: [inningsSchema],
    status: { type: String, enum: ["upcoming", "live", "completed"], default: "upcoming" },
    commentary: [{ type: mongoose.Schema.Types.ObjectId, ref: "Commentary" }],
    manOfMatch: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  },
  { timestamps: true }
);

export default mongoose.model("Match", matchSchema);
