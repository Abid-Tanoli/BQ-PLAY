import mongoose from "mongoose";

const ballSchema = new mongoose.Schema({
  matchId: { type: mongoose.Schema.Types.ObjectId, ref: "Match", required: true },
  over: Number,
  ball: Number,
  batsman: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  bowler: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  batsmanName: { type: String, default: "" },
  bowlerName: { type: String, default: "" },
  runs: { type: Number, default: 0 },
  extraType: { type: String, enum: ["wide", "no_ball", "bye", "leg_bye", "penalty", null], default: null },
  extraRuns: { type: Number, default: 0 },
  isWide: Boolean,
  isNoBall: Boolean,
  isBye: Boolean,
  isLegBye: Boolean,
  isWicket: Boolean,
  wicketType: String,
  fielderName: { type: String, default: "" },
  commentary: String
}, { timestamps: true });

ballSchema.index({ matchId: 1, over: 1, ball: 1 });

export default mongoose.models.Ball || mongoose.model("Ball", ballSchema);
