// Compatibility endpoint: keep legacy clients on the same scoring engine and
// socket/event path as the primary /matches/:matchId/score route.
export { updateScore as addBall } from "./scoreController.js";
