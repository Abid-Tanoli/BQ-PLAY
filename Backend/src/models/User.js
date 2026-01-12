import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: {
    type: String,
    enum: ["admin", "scorer", "viewer"],
    default: "viewer",
  },
});

export default mongoose.model("User", userSchema);
