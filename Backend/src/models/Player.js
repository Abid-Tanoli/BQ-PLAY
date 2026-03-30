import mongoose from "mongoose";

const playerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String },
    playingRole: {
      type: String,
      enum: ["Batsman", "Bowler", "All-Rounder", "Batting-All-Rounder", "Bowling-All-Rounder", "Wicket-Keeper"],
      default: "Batsman"
    },
    battingStyle: {
      type: String,
      enum: ["Right-handed", "Left-handed"],
      default: "Right-handed"
    },
    bowlingStyle: {
      type: String,
      enum: [
        "Right-arm Fast",
        "Right-arm Fast-Medium",
        "Right-arm Medium",
        "Right-arm Medium-Pace",
        "Right-arm Off-break",
        "Right-arm Leg-break",
        "Right-arm Slow",
        "Left-arm Fast",
        "Left-arm Fast-Medium",
        "Left-arm Medium",
        "Left-arm Medium-Pace",
        "Left-arm Orthodox",
        "Left-arm Chinaman",
        "Left-arm Slow",
        "Not Applicable"
      ],
      default: "Not Applicable"
    },
    Campus: { type: String },
    imageUrl: { type: String, default: "" },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    stats: {
      runs: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 },
      strikeRate: { type: Number, default: 0 },
      economy: { type: Number, default: 0 },
      // Extended career stats
      matches: { type: Number, default: 0 },
      innings: { type: Number, default: 0 },
      notOuts: { type: Number, default: 0 },
      highScore: { type: Number, default: 0 },
      average: { type: Number, default: 0 },
      fifties: { type: Number, default: 0 },
      hundreds: { type: Number, default: 0 },
      bowlingAverage: { type: Number, default: 0 },
      bestBowling: { type: String, default: "0-0" },
      fourWickets: { type: Number, default: 0 },
      fiveWickets: { type: Number, default: 0 },
      dotBalls: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Player", playerSchema);
