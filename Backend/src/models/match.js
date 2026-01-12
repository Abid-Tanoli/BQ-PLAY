import mongoose from "mongoose";

const commentarySchema = new mongoose.Schema({
  over: Number,
  ball: Number,
  text: String,
  time: { type: Date, default: Date.now },
});

const matchSchema = new mongoose.Schema(
  {
    teamA: String,
    teamB: String,
    venue: String,
    status: {
      type: String,
      enum: ["upcoming", "live", "completed"],
      default: "upcoming",
    },
    score: {
      runs: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 },
      overs: { type: Number, default: 0 },
      balls: { type: Number, default: 0 },
    },
    commentary: [commentarySchema],
    manOfMatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Match", matchSchema);
