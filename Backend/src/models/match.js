import mongoose from "mongoose";

const inningsSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  runs: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  overs: { type: Number, default: 0 },
  balls: { type: Number, default: 0 },
  extras: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ["upcoming", "live", "completed"], 
    default: "upcoming" 
  },
  commentary: [{
    text: { type: String },
    timestamp: { type: Date, default: Date.now },
    over: { type: Number },
    ball: { type: Number }
  }],
  batting: [{
    player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
    runs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 },
    fours: { type: Number, default: 0 },
    sixes: { type: Number, default: 0 },
    strikeRate: { type: Number, default: 0 }
  }],
  bowling: [{
    player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
    overs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    economy: { type: Number, default: 0 }
  }]
});

const matchSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true, 
      trim: true 
    },
    venue: { 
      type: String,
      default: "" 
    },
    matchType: {
      type: String,
      enum: ["T20", "ODI", "Test"],
      default: "T20"
    },
    startAt: { 
      type: Date,
      required: true 
    },
    teams: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Team", 
      required: true 
    }],
    innings: [inningsSchema],
    status: { 
      type: String, 
      enum: ["upcoming", "live", "completed"], 
      default: "upcoming" 
    },
    result: {
      winner: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
      margin: { type: String },
      description: { type: String }
    },
    tossWinner: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    tossDecision: { type: String, enum: ["bat", "bowl"] },
    manOfMatch: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

matchSchema.index({ status: 1, startAt: -1 });
matchSchema.index({ teams: 1 });

const Match = mongoose.models.Match || mongoose.model("Match", matchSchema);

export default Match;