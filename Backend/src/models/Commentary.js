import mongoose from "mongoose";

const commentarySchema = new mongoose.Schema(
  {
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    over: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Commentary", commentarySchema);
