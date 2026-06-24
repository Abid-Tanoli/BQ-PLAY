import mongoose from "mongoose";
import dotenv from "dotenv";
import Team from "../src/models/Team.js";
import Player from "../src/models/Player.js";
import { assertDestructiveSeedAllowed } from "../src/seed/destructiveGuard.js";

dotenv.config();

// Data fetched from https://bqicl.onrender.com/teams
const OLD_TEAMS = [
  { name: "BAHADURABAD EAGLE", franchise_owner: "Abid Ali Tanoli" },
  { name: "BAHADURABAD UNITED", franchise_owner: "muhammad shah" },
  { name: "CLIFTON 11", franchise_owner: "Ameen Hamza" },
  { name: "IDARAH NOOR E HAQ ROYALS", franchise_owner: "Nehal Memon" }
];

// Data fetched from https://bqicl.onrender.com/players (all 4 pages, deduplicated)
const OLD_PLAYERS = [
  // Page 1
  { tier: "Diamond", name: "TEST", role: "Bowler", campus: "Bahadurabad", style: "right-handed" },
  { tier: "Silver", name: "SURAISH KIRSHAN", role: "Batsman", campus: "Bahadurabad", style: "right-handed" },
  { tier: "Platinum", name: "HASEEB UR REHMAN", role: "All-rounder", campus: "Bahadurabad", style: "right-handed" },
  { tier: "Gold", name: "HAMZA ZAI", role: "All-rounder", campus: "Clifton", style: "right-handed" },
  { tier: "Silver", name: "MUHAMMAD AYAAN", role: "All-rounder", campus: "Bahadurabad", style: "right-handed" },
  { tier: "Diamond", name: "ABDUL SAMI", role: "Bowler", campus: "Idara noor e haq", style: "right-handed" },
  { tier: "Diamond", name: "HAMZA JUNAID", role: "All-rounder", campus: "Bahadurabad", style: "right-handed" },
  { tier: "Silver", name: "HAFIZ USMAN", role: "Bowler", campus: "Clifton", style: "right-handed" },
  { tier: "Silver", name: "M ZEESHAN", role: "All-rounder", campus: "Clifton", style: "right-handed" },
  { tier: "Platinum", name: "AARIJ FARHAN", role: "All-rounder", campus: "Bahadurabad", style: "right-handed" },
  { tier: "Diamond", name: "HAMMAD", role: "Batsman", campus: "Clifton", style: "right-handed" },
  { tier: "Gold", name: "ABDULLAH MIRZA", role: "Bowler", campus: "Idara noor e haq", style: "right-handed" },
  // Page 2
  { tier: "Platinum", name: "HASSAN AZAM", role: "Batsman", campus: "Campus Clifton", style: "right-handed" },
  { tier: "Gold", name: "MOIZ", role: "Batsman", campus: "Campus Idara noor e haq", style: "right-handed" },
  { tier: "Diamond", name: "MONISH", role: "All-rounder", campus: "Campus Bahadurabad", style: "right-handed" },
  { tier: "Silver", name: "MUHAMMAD ALTAF ALTAF", role: "Batsman", campus: "Campus Fossforus", style: "right-handed" },
  { tier: "Silver", name: "MUHAMMAD BILAL", role: "Batsman", campus: "Campus Bahadurabad", style: "right-handed" },
  { tier: "Platinum", name: "MUHAMMAD HASSAAN MAHMOOD", role: "All-rounder", campus: "Campus Bahadurabad", style: "right-handed" },
  { tier: "Silver", name: "KHALID SANWER", role: "Batsman", campus: "Campus Bahadurabad", style: "right-handed" },
  { tier: "Platinum", name: "MOAZZAM", role: "Batsman", campus: "Campus Clifton", style: "right-handed" },
  // Page 3
  { tier: "Gold", name: "MUHAMMAD SAFWAN LAKHANY", role: "Batsman", campus: "Campus Bahadurabad", style: "right-handed" },
  { tier: "Diamond", name: "FAHAD", role: "Batsman", campus: "Campus Bahadurabad", style: "right-handed" },
  { tier: "Silver", name: "MUHAMMAD TARIQ", role: "All-rounder", campus: "Campus Idara noor e haq", style: "right-handed" },
  { tier: "Diamond", name: "MUHAMMAD ZUBAIR", role: "All-rounder", campus: "Campus Clifton", style: "right-handed" },
  { tier: "Silver", name: "HAMZA ATIF", role: "All-rounder", campus: "Campus Clifton", style: "right-handed" },
  { tier: "Silver", name: "SAJID KHAN", role: "Bowler", campus: "Campus Clifton", style: "right-handed" },
  { tier: "Diamond", name: "USAMA", role: "Batsman", campus: "Campus Bahadurabad", style: "right-handed" },
  { tier: "Gold", name: "UZAIR RIZWAN", role: "All-rounder", campus: "Campus Bahadurabad", style: "right-handed" },
  { tier: "Platinum", name: "MUJTABA FAYSAL", role: "All-rounder", campus: "Campus Bahadurabad", style: "right-handed" },
  // Page 4
  { tier: "Silver", name: "MUHAMMAD ANAS", role: "Batsman", campus: "Campus Clifton", style: "right-handed" },
  { tier: "Silver", name: "HUZAIFA ABID", role: "Batsman", campus: "Campus Clifton", style: "right-handed" },
  { tier: "Diamond", name: "M.NEHAL", role: "Wicket-keeper-batsman", campus: "Campus Bahadurabad", style: "right-handed" },
  { tier: "Silver", name: "HAFEEZ UR REHMAN", role: "Batsman", campus: "Campus Bahadurabad", style: "right-handed" },
  { tier: "Silver", name: "ABDUL HANNAN", role: "Batsman", campus: "Campus Bahadurabad", style: "right-handed" },
  { tier: "Gold", name: "AAHID KAMRAN", role: "Batsman", campus: "Campus Bahadurabad", style: "right-handed" }
];

// Remove duplicates by name (keep first occurrence)
const seen = new Set();
const UNIQUE_PLAYERS = OLD_PLAYERS.filter(p => {
  const key = p.name.trim().toUpperCase();
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

async function importData() {
  try {
    assertDestructiveSeedAllowed("Old data import");
    console.log("🔌 Connecting to database...");
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Connected to MongoDB");

    console.log(`📦 Found ${OLD_TEAMS.length} teams and ${UNIQUE_PLAYERS.length} unique players`);

    // Clear existing data
    console.log("🗑️ Clearing existing teams and players...");
    await Team.deleteMany({});
    await Player.deleteMany({});

    // Create teams
    console.log("\n🏏 Creating teams...");
    const teamMap = {};

    for (const oldTeam of OLD_TEAMS) {
      const team = await Team.create({
        name: oldTeam.name.trim(),
        ownername: oldTeam.franchise_owner.trim(),
        shortName: generateShortName(oldTeam.name),
        logo: "",
        players: []
      });

      teamMap[oldTeam.name.trim().toUpperCase()] = team._id;
      console.log(`  ✅ Created team: ${team.name} (ID: ${team._id})`);
    }

    // Assign players to teams by campus, then create players
    console.log("\n👤 Creating players and assigning to teams...");

    // Campus → Team mapping
    const campusTeamMap = {
      "CAMPUS CLIFTON": "CLIFTON 11",
      "CLIFTON": "CLIFTON 11",
      "CAMPUS IDARA NOOR E HAQ": "IDARAH NOOR E HAQ ROYALS",
      "IDARA NOOR E HAQ": "IDARAH NOOR E HAQ ROYALS",
      "CAMPUS BAHADURABAD": "BAHADURABAD EAGLE",
      "BAHADURABAD": "BAHADURABAD EAGLE",
      "CAMPUS FOSSFORUS": null // No matching team
    };

    // Track how many players assigned to each Bahadurabad team (to split evenly)
    let bahadurabadCounter = 0;

    for (const oldPlayer of UNIQUE_PLAYERS) {
      const campusKey = oldPlayer.campus.trim().toUpperCase();
      let assignedTeamName = campusTeamMap[campusKey];

      // Split Bahadurabad players between EAGLE and UNITED
      if (assignedTeamName === "BAHADURABAD EAGLE") {
        assignedTeamName = bahadurabadCounter % 2 === 0 ? "BAHADURABAD EAGLE" : "BAHADURABAD UNITED";
        bahadurabadCounter++;
      }

      const teamId = assignedTeamName ? teamMap[assignedTeamName] : null;

      const player = await Player.create({
        name: oldPlayer.name.trim(),
        role: mapRole(oldPlayer.role),
        playingRole: mapPlayingRole(oldPlayer.role),
        battingStyle: mapBattingStyle(oldPlayer.style),
        bowlingStyle: "Not Applicable",
        Campus: normalizeCampus(oldPlayer.campus),
        imageUrl: "",
        team: teamId || null,
        stats: {
          runs: 0,
          wickets: 0,
          strikeRate: 0,
          economy: 0,
          matches: 0,
          innings: 0,
          notOuts: 0,
          highScore: 0,
          average: 0,
          fifties: 0,
          hundreds: 0,
          bowlingAverage: 0,
          bestBowling: "0-0",
          fourWickets: 0,
          fiveWickets: 0,
          dotBalls: 0
        }
      });

      // Update team's players array
      if (teamId) {
        await Team.findByIdAndUpdate(teamId, {
          $push: { players: player._id }
        });
      }

      const teamLabel = teamId ? assignedTeamName : "No Team";
      console.log(`  ✅ ${player.name} (${oldPlayer.tier}) → ${teamLabel}`);
    }

    // Print final summary
    console.log("\n📊 Final Team Rosters:");
    const teams = await Team.find().populate("players", "name role Campus");
    for (const team of teams) {
      console.log(`\n  🏆 ${team.name} (${team.players.length} players):`);
      for (const p of team.players) {
        console.log(`     - ${p.name} (${p.role}) [${p.Campus}]`);
      }
    }

    console.log("\n🎉 Import completed successfully!");
    console.log(`📊 Summary: ${teams.length} teams, ${UNIQUE_PLAYERS.length} unique players imported`);

    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error importing data:", error.message);
    process.exit(1);
  }
}

function generateShortName(teamName) {
  const name = teamName.toUpperCase().trim();
  if (name.includes("EAGLE")) return "BE";
  if (name.includes("UNITED")) return "BU";
  if (name.includes("CLIFTON")) return "C11";
  if (name.includes("IDARAH") || name.includes("NOOR")) return "INR";
  return name.split(" ").map(w => w[0]).join("").substring(0, 4);
}

function normalizeCampus(campus) {
  if (!campus) return "";
  const c = campus.trim();
  if (!c.startsWith("Campus ")) return "Campus " + c.charAt(0).toUpperCase() + c.slice(1);
  return c;
}

function mapRole(oldRole) {
  if (!oldRole) return "Batsman";
  const role = oldRole.toLowerCase();
  if (role.includes("wicket")) return "Wicket-Keeper";
  if (role.includes("bowl")) return "Bowler";
  if (role.includes("bat") && !role.includes("all")) return "Batsman";
  if (role.includes("all")) return "All-Rounder";
  return "Batsman";
}

function mapPlayingRole(oldRole) {
  if (!oldRole) return "Batsman";
  const role = oldRole.toLowerCase();
  if (role.includes("wicket")) return "Wicket-Keeper";
  if (role.includes("bowl")) return "Bowler";
  if (role.includes("bat") && !role.includes("all")) return "Batsman";
  if (role.includes("all")) return "All-Rounder";
  return "Batsman";
}

function mapBattingStyle(style) {
  if (!style) return "Right-handed";
  if (style.toLowerCase().includes("left")) return "Left-handed";
  return "Right-handed";
}

importData();
