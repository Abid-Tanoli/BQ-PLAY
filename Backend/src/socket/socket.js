// socket/socket.js
export default function initSocket(io) {
  io.on("connection", (socket) => {
    socket.on("joinMatch", (matchId) => {
      socket.join(matchId);
    });
  });
}
