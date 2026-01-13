function initSocket(io) {
  io.on('connection', (socket) => {
    console.log('Client connected', socket.id);

    socket.on('join:match', (matchId) => {
      socket.join(`match_${matchId}`);
    });

    socket.on('leave:match', (matchId) => {
      socket.leave(`match_${matchId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected', socket.id);
    });
  });
}

module.exports = initSocket;