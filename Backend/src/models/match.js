import mongoose from "mongoose";

const ballSchema = new mongoose.Schema({
  ballNumber: { type: Number, required: true },
  batsmanOnStrike: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  batsmanNonStrike: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  bowler: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  runs: { type: Number, default: 0 },
  isWide: { type: Boolean, default: false },
  isNoBall: { type: Boolean, default: false },
  isBye: { type: Boolean, default: false },
  isLegBye: { type: Boolean, default: false },
  isWicket: { type: Boolean, default: false },
  wicketType: { 
    type: String, 
    enum: ["bowled", "caught", "lbw", "run out", "stumped", "hit wicket", ""] 
  },
  dismissedPlayer: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  fielder: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  commentary: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now }
});

const overSchema = new mongoose.Schema({
  overNumber: { type: Number, required: true },
  bowler: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  balls: [ballSchema],
  runsScored: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  maidenOver: { type: Boolean, default: false },
  summary: { type: String, default: "" }
});

const batsmanStatsSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
  runs: { type: Number, default: 0 },
  balls: { type: Number, default: 0 },
  fours: { type: Number, default: 0 },
  sixes: { type: Number, default: 0 },
  strikeRate: { type: Number, default: 0 },
  isOut: { type: Boolean, default: false },
  dismissalType: { type: String, default: "" },
  dismissedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  fielder: { type: mongoose.Schema.Types.ObjectId, ref: "Player" }
});

const bowlerStatsSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
  overs: { type: Number, default: 0 },
  balls: { type: Number, default: 0 },
  maidens: { type: Number, default: 0 },
  runs: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  wides: { type: Number, default: 0 },
  noBalls: { type: Number, default: 0 },
  economy: { type: Number, default: 0 }
});

const inningsSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  battingOrder: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }],
  runs: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  overs: { type: Number, default: 0 },
  balls: { type: Number, default: 0 },
  extras: {
    wides: { type: Number, default: 0 },
    noBalls: { type: Number, default: 0 },
    byes: { type: Number, default: 0 },
    legByes: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  currentBatsman1: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  currentBatsman2: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  onStrikeBatsman: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  currentBowler: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  status: { 
    type: String, 
    enum: ["upcoming", "live", "completed", "innings-break"], 
    default: "upcoming" 
  },
  oversHistory: [overSchema],
  batting: [batsmanStatsSchema],
  bowling: [bowlerStatsSchema],
  fallOfWickets: [{
    runs: { type: Number },
    wickets: { type: Number },
    player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
    overs: { type: Number }
  }],
  runRate: { type: Number, default: 0 },
  requiredRunRate: { type: Number, default: 0 },
  target: { type: Number, default: 0 }
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
      enum: ["6 Overs", "8 Overs", "T10", "T20", "ODI", "Test"],
      default: "T20"
    },
    totalOvers: {
      type: Number,
      default: 20
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
    currentInnings: {
      type: Number,
      default: 0
    },
    status: { 
      type: String, 
      enum: ["upcoming", "live", "innings-break", "completed"], 
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
    highlights: [{
      type: { type: String },
      description: { type: String },
      over: { type: Number },
      timestamp: { type: Date, default: Date.now }
    }]
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

matchSchema.index({ status: 1, startAt: -1 });
matchSchema.index({ teams: 1 });

matchSchema.pre('save', function(next) {
  if (this.isModified('matchType')) {
    switch(this.matchType) {
      case '6 Overs': this.totalOvers = 6; break;
      case '8 Overs': this.totalOvers = 8; break;
      case 'T10': this.totalOvers = 10; break;
      case 'T20': this.totalOvers = 20; break;
      case 'ODI': this.totalOvers = 50; break;
      case 'Test': this.totalOvers = 90; break;
      default: this.totalOvers = 20;
    }
  }
  next();
});

const Match = mongoose.models.Match || mongoose.model("Match", matchSchema);

export default Match;