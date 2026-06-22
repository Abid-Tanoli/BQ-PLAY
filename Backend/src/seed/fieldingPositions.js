import FieldingPosition from "../models/FieldingPosition.js";

const positions = [
  { name: "Fine Leg", category: "outfield", side: "on", x: 180, y: 40 },
  { name: "Deep Fine Leg", category: "outfield", side: "on", x: 160, y: 30 },
  { name: "Backward Square Leg", category: "infield", side: "on", x: 140, y: 60 },
  { name: "Deep Backward Square", category: "outfield", side: "on", x: 130, y: 50 },
  { name: "Square Leg", category: "infield", side: "on", x: 120, y: 80 },
  { name: "Deep Square Leg", category: "outfield", side: "on", x: 110, y: 70 },
  { name: "Mid-wicket", category: "infield", side: "on", x: 90, y: 100 },
  { name: "Deep Mid-wicket", category: "outfield", side: "on", x: 85, y: 95 },
  { name: "Mid-on", category: "infield", side: "on", x: 70, y: 130 },
  { name: "Deep Mid-on", category: "outfield", side: "on", x: 65, y: 125 },
  { name: "Long-on", category: "outfield", side: "on", x: 55, y: 140 },
  { name: "Long leg", category: "outfield", side: "on", x: 170, y: 25 },
  { name: "Short Fine Leg", category: "infield", side: "on", x: 175, y: 55 },
  { name: "Short Third Man", category: "infield", side: "off", x: 195, y: 50 },
  { name: "Long-off", category: "outfield", side: "off", x: 45, y: 140 },
  { name: "Deep Mid-off", category: "outfield", side: "off", x: 55, y: 120 },
  { name: "Mid-off", category: "infield", side: "off", x: 60, y: 110 },
  { name: "Deep Cover", category: "outfield", side: "off", x: 75, y: 95 },
  { name: "Extra Cover", category: "infield", side: "off", x: 80, y: 100 },
  { name: "Deep Extra Cover", category: "outfield", side: "off", x: 70, y: 90 },
  { name: "Cover", category: "infield", side: "off", x: 90, y: 85 },
  { name: "Cover Point", category: "infield", side: "off", x: 100, y: 75 },
  { name: "Point", category: "infield", side: "off", x: 110, y: 65 },
  { name: "Deep Point", category: "outfield", side: "off", x: 105, y: 55 },
  { name: "Backward Point", category: "infield", side: "off", x: 115, y: 60 },
  { name: "Gully", category: "infield", side: "off", x: 125, y: 50 },
  { name: "Third Man", category: "outfield", side: "off", x: 190, y: 45 },
  { name: "Deep Third Man", category: "outfield", side: "off", x: 195, y: 35 },
  { name: "Sweeper Cover", category: "outfield", side: "off", x: 85, y: 80 },
  { name: "Slip", category: "slip_cordon", side: "off", x: 140, y: 35 },
  { name: "Second Slip", category: "slip_cordon", side: "off", x: 135, y: 38 },
  { name: "Third Slip", category: "slip_cordon", side: "off", x: 130, y: 41 },
  { name: "Fly Slip", category: "slip_cordon", side: "off", x: 145, y: 32 },
  { name: "Leg Slip", category: "slip_cordon", side: "on", x: 160, y: 45 },
  { name: "Short Leg", category: "infield", side: "on", x: 155, y: 65 },
  { name: "Silly Mid-on", category: "infield", side: "on", x: 145, y: 80 },
  { name: "Silly Mid-off", category: "infield", side: "off", x: 135, y: 80 },
  { name: "Silly Point", category: "infield", side: "off", x: 140, y: 70 },
  { name: "Forward Short Leg", category: "infield", side: "on", x: 150, y: 72 },
  { name: "Straight", category: "outfield", side: "both", x: 100, y: 145 },
  { name: "Fine", category: "outfield", side: "off", x: 185, y: 42 },
];

export async function seedFieldingPositions() {
  const existing = await FieldingPosition.countDocuments();
  if (existing > 0) {
    console.log(`Fielding positions already seeded (${existing} positions). Skipping.`);
    return;
  }
  await FieldingPosition.insertMany(positions);
  console.log(`Seeded ${positions.length} fielding positions.`);
}