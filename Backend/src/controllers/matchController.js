// import Match from "../models/Match.js";
// import Commentary from "../models/Commentary.js";

// export const updateScore = async (io, req, res) => {
//   const match = await Match.findById(req.params.id);
//   const innings = match.innings[req.body.inningsIndex];

//   innings.runs += req.body.runs;
//   innings.wickets += req.body.wickets;
//   innings.balls += req.body.balls;

//   if (innings.balls >= 6) {
//     innings.overs++;
//     innings.balls -= 6;
//   }

//   await match.save();

//   if (req.body.commentary) {
//     const c = await Commentary.create({
//       match: match._id,
//       text: req.body.commentary
//     });
//     match.commentary.push(c._id);
//     await match.save();
//   }

//   io.to(match._id.toString()).emit("match:update", match);
//   res.json(match);
// };
