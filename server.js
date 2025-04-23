const { createServer } = require('http');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  // In-memory store for lobby participants
  const lobbyParticipants = {};

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Host joins lobby room
    socket.on('join-lobby-host', ({ lobbyId }) => {
      socket.join(lobbyId);
      // Send current participants to the host
      io.to(lobbyId).emit('participants-update', lobbyParticipants[lobbyId] || []);
    });

    // Participant joins lobby
    socket.on('join-lobby', ({ lobbyId, participant }) => {
        console.log('Participant joined lobby:', lobbyId, participant);
      socket.join(lobbyId);
      if (!lobbyParticipants[lobbyId]) lobbyParticipants[lobbyId] = [];
      // Prevent duplicate participants by id
      if (!lobbyParticipants[lobbyId].some(p => p.id === participant.id)) {
        lobbyParticipants[lobbyId].push(participant);
      }
      io.to(lobbyId).emit('participants-update', lobbyParticipants[lobbyId]);
    });

    // Handle disconnect (optional: remove participant if you track socket-participant mapping)
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // Optional: clean up participant from lobbies
    });
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
