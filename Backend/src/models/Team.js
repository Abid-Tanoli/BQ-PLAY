import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true,
      unique: true 
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
    players: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Player" 
    }]
  },
  { timestamps: true }
);

export default mongoose.model("Team", teamSchema);