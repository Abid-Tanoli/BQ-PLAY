// import { Server } from 'socket.io';
// import http from 'http';

// let io;

// export function initSocket(server) {
//   io = new Server(server, {
//     cors: {
//       origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
//       methods: ['GET', 'POST'],
//       credentials: true
//     }
//   });

//   io.on('connection', (socket) => {
//     console.log('✅ New client connected:', socket.id);

//     socket.on('join-room', (roomId) => {
//       socket.join(roomId);
//       console.log(`👥 Client ${socket.id} joined room: ${roomId}`);
//     });

//     socket.on('leave-room', (roomId) => {
//       socket.leave(roomId);
//       console.log(`👋 Client ${socket.id} left room: ${roomId}`);
//     });

//     socket.on('send-message', (data) => {
//       console.log('📩 Message received:', data);
//       io.to(data.roomId).emit('receive-message', data);
//     });

//     socket.on('disconnect', () => {
//       console.log('👋 Client disconnected:', socket.id);
//     });
//   });

//   return io;
// }

// export function getIo() {
//   if (!io) {
//     throw new Error('Socket.io server not initialized');
//   }
//   return io;
// }