import CricketShot from "../models/CricketShot.js";

const shots = [
  { name: "Cover Drive", category: "attacking", description: "Elegant shot played through the covers", pitchZone: "full", preferredLine: "outside-off", groundZone: "cover" },
  { name: "Straight Drive", category: "attacking", description: "Classic straight-bat shot down the ground", pitchZone: "full", preferredLine: "middle", groundZone: "straight" },
  { name: "On Drive", category: "attacking", description: "Drive through mid-on/on side", pitchZone: "full", preferredLine: "middle", groundZone: "mid-on" },
  { name: "Off Drive", category: "attacking", description: "Drive through the off side", pitchZone: "full", preferredLine: "off-stump", groundZone: "extra-cover" },
  { name: "Square Cut", category: "attacking", description: "Cut shot square of the wicket on off side", pitchZone: "short", preferredLine: "outside-off", groundZone: "point" },
  { name: "Late Cut", category: "attacking", description: "Delayed cut shot played very late", pitchZone: "short", preferredLine: "outside-off", groundZone: "third-man" },
  { name: "Upper Cut", category: "attacking", description: "Cut over the slip cordon", pitchZone: "short", preferredLine: "outside-off", groundZone: "third-man" },
  { name: "Pull Shot", category: "attacking", description: "Powerful pull through mid-wicket", pitchZone: "short", preferredLine: "middle", groundZone: "mid-wicket" },
  { name: "Hook Shot", category: "attacking", description: "Hook shot behind square for short balls", pitchZone: "bouncer", preferredLine: "middle", groundZone: "fine-leg" },
  { name: "Sweep Shot", category: "attacking", description: "Sweeping the ball to the on side", pitchZone: "full", preferredLine: "leg", groundZone: "square-leg" },
  { name: "Reverse Sweep", category: "attacking", description: "Reverse sweep to fine third man", pitchZone: "full", preferredLine: "leg", groundZone: "third-man" },
  { name: "Paddle Sweep", category: "attacking", description: "Soft sweep played fine down the leg side", pitchZone: "full", preferredLine: "leg", groundZone: "fine-leg" },
  { name: "Ramp/Scoop", category: "attacking", description: "Ramping the ball over the keeper", pitchZone: "full", preferredLine: "middle", groundZone: "fine-leg" },
  { name: "Switch Hit", category: "attacking", description: "Reverse stance shot, batter swaps hands", pitchZone: "good", preferredLine: "middle", groundZone: "cover" },
  { name: "Helicopter Shot", category: "attacking", description: "MS Dhoni's signature whip over mid-wicket", pitchZone: "full", preferredLine: "middle", groundZone: "mid-wicket" },
  { name: "Dilscoop", category: "attacking", description: "Scoop over the wicketkeeper's head", pitchZone: "full", preferredLine: "middle", groundZone: "fine-leg" },
  { name: "Slog", category: "attacking", description: "Big heave across the line aiming for six", pitchZone: "good", preferredLine: "middle", groundZone: "mid-wicket" },
  { name: "Forward Defensive", category: "defensive", description: "Forward defensive block", pitchZone: "full", preferredLine: "middle", groundZone: "pitch" },
  { name: "Backward Defensive", category: "defensive", description: "Back foot defensive block", pitchZone: "short", preferredLine: "middle", groundZone: "pitch" },
  { name: "Flick Shot", category: "glancing", description: "Wristy flick off the pads", pitchZone: "full", preferredLine: "leg", groundZone: "mid-wicket" },
  { name: "Leg Glance", category: "glancing", description: "Fine glance down the leg side", pitchZone: "full", preferredLine: "leg", groundZone: "fine-leg" },
  { name: "Nurdle", category: "glancing", description: "Soft single rotated to the on side", pitchZone: "good", preferredLine: "middle", groundZone: "mid-wicket" },
  { name: "Dab", category: "glancing", description: "Late dab to third man for a single", pitchZone: "short", preferredLine: "outside-off", groundZone: "third-man" },
  { name: "Reverse Hit", category: "unorthodox", description: "Opening the face to guide behind point", pitchZone: "good", preferredLine: "outside-off", groundZone: "point" },
  { name: "Lap Shot", category: "unorthodox", description: "Soft lap over short fine leg", pitchZone: "full", preferredLine: "leg", groundZone: "fine-leg" },
  { name: "Ramp", category: "unorthodox", description: "Ramping the ball over the keeper", pitchZone: "full", preferredLine: "middle", groundZone: "fine-leg" },
];

export async function seedCricketShots() {
  const existing = await CricketShot.countDocuments();
  if (existing > 0) {
    console.log(`CricketShots already seeded (${existing} shots). Skipping.`);
    return;
  }
  await CricketShot.insertMany(shots);
  console.log(`Seeded ${shots.length} cricket shots.`);
}