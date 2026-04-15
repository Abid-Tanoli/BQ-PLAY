import mongoose from "mongoose";
import dotenv from "dotenv";
import Team from "../src/models/Team.js";
import Player from "../src/models/Player.js";

dotenv.config();

async function deletePSLData() {
  try {
    console.log("🔌 Connecting to database...");
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Connected to MongoDB");

    // Find all teams with category "PSL" (case-insensitive)
    const pslTeams = await Team.find({ 
      category: { $regex: /PSL/i } 
    });

    console.log(`\n📊 Found ${pslTeams.length} PSL team(s):`);
    pslTeams.forEach(team => {
      console.log(`  - ${team.name} (ID: ${team._id}, Players: ${team.players?.length || 0})`);
    });

    if (pslTeams.length === 0) {
      console.log("\n✅ No PSL teams found in the database. Nothing to delete.");
      await mongoose.connection.close();
      process.exit(0);
    }

    // Get all player IDs from PSL teams
    const pslPlayerIds = pslTeams
      .filter(team => team.players && team.players.length > 0)
      .flatMap(team => team.players);

    console.log(`\n🗑️ Deleting ${pslPlayerIds.length} player(s) associated with PSL teams...`);
    
    if (pslPlayerIds.length > 0) {
      const deletedPlayers = await Player.deleteMany({ 
        _id: { $in: pslPlayerIds } 
      });
      console.log(`  ✅ Deleted ${deletedPlayers.deletedCount} player(s)`);
    }

    // Delete all PSL teams
    console.log(`\n🗑️ Deleting ${pslTeams.length} PSL team(s)...`);
    const deletedTeams = await Team.deleteMany({ 
      category: { $regex: /PSL/i } 
    });
    console.log(`  ✅ Deleted ${deletedTeams.deletedCount} team(s)`);

    // Summary
    const remainingTeams = await Team.countDocuments({ 
      category: { $regex: /PSL/i } 
    });
    const remainingPlayers = await Player.countDocuments({ 
      _id: { $in: pslPlayerIds } 
    });

    console.log("\n📊 Final Summary:");
    console.log(`  - PSL teams remaining: ${remainingTeams}`);
    console.log(`  - PSL players remaining: ${remainingPlayers}`);
    console.log("\n🎉 All PSL teams and players have been deleted successfully!");

    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error deleting PSL data:", error.message);
    console.error(error);
    process.exit(1);
  }
}

deletePSLData();
