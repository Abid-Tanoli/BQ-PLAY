import mongoose from "mongoose";

const ballSchema = new mongoose.Schema({
  matchId: { type: mongoose.Schema.Types.ObjectId, ref: "Match", required: true },
  over: Number,
  ball: Number,
  batsman: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  bowler: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  runs: { type: Number, default: 0 },
  isWide: Boolean,
  isNoBall: Boolean,
  isWicket: Boolean,
  commentary: String
}, { timestamps: true });

export default mongoose.model("Ball", ballSchema);
