import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../utils/db.js";
import { seedCricketShots } from "./cricketShots.js";
import { seedFieldingPositions } from "./fieldingPositions.js";

dotenv.config();

async function seedMasterData() {
  try {
    await connectDB();
    await seedCricketShots();
    await seedFieldingPositions();
    console.log("Master data seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

seedMasterData();