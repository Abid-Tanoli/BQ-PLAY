import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    type: {
      type: String,
      enum: ["international_team", "league_team", "incubation_team"],
      default: "league_team"
    },
    category: {
      type: String,
      default: ""
      // For international: country name (e.g., "Pakistan")
      // For league: league name (e.g., "PSL", "IPL")
      // For incubation: group name (e.g., "AL-Khidmat BanoQabil Incubation")
    },
    ownername: {
      type: String,
      trim: true,
      default: ""
    },
    logo: {
      type: String,
      default: ""
    },
    shortName: {
      type: String,
      trim: true,
      default: ""
    },
    media: [
      {
        url: String,
        caption: String,
        addedAt: Date
      }
    ],
    players: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player"
    }],
    // Additional metadata for incubation teams
    incubationGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IncubationGroup"
    },
    isInternal: {
      type: Boolean,
      default: false
    },
    tags: [{
      type: String
    }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field to dynamically fetch players assigned to this team
teamSchema.virtual('playerList', {
  ref: 'Player',
  localField: '_id',
  foreignField: 'team'
});

// Index for efficient category queries
teamSchema.index({ type: 1 });
teamSchema.index({ category: 1 });
teamSchema.index({ incubationGroup: 1 });

export default mongoose.model("Team", teamSchema);