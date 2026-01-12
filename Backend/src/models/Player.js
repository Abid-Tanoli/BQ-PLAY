import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
  name: String,
  team: String,
  role: String,
  stats: {
    runs: Number,
    wickets: Number,
    strikeRate: Number,
    economy: Number,
  },
});

export default mongoose.model("Player", playerSchema);
