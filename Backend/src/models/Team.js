import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    ownername: { type: String, required: true, trim: true },
    logo: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Team", teamSchema);
