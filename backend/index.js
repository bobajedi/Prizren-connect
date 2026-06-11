import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();

// Hem yerelde hem de Vercel'deki canlı sitende çalışması için CORS ayarı
app.use(cors({
  origin: "*", // Güvenlik amacıyla test sürecinde tüm bağlantılara izin veriyoruz
}));

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let waitingUsers = [];

io.on('connection', (socket) => {
  console.log(`👤 A user connected: ${socket.id}`);

  socket.on('find-match', (peerId) => {
    socket.peerId = peerId;
    // Kendisi hariç bekleyen birini bul
    const stranger = waitingUsers.find(user => user.id !== socket.id);

    if (stranger) {
      // Havuzdan eşleşen kişiyi çıkar
      waitingUsers = waitingUsers.filter(user => user.id !== stranger.id);

      // İki tarafı birbiriyle el sıkıştır
      socket.emit('matched', { remotePeerId: stranger.peerId, remoteSocketId: stranger.id });
      stranger.emit('matched', { remotePeerId: socket.peerId, remoteSocketId: socket.id });
      console.log(`🔗 Matched: ${socket.id} ↔️ ${stranger.id}`);
    } else {
      // Havuzda kimse yoksa sıraya ekle
      if (!waitingUsers.some(user => user.id === socket.id)) {
        waitingUsers.push({ id: socket.id, peerId: peerId });
        console.log(`⏳ User ${socket.id} added to waiting pool.`);
      }
    }
  });

  socket.on('leave-match', () => {
    waitingUsers = waitingUsers.filter(user => user.id !== socket.id);
    console.log(`🏃 User ${socket.id} left the pool.`);
  });

  socket.on('disconnect', () => {
    waitingUsers = waitingUsers.filter(user => user.id !== socket.id);
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// Render.com portu dinamik verir, eğer yoksa yerelde 3000'i kullanır
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Prizren Connect Server running on port ${PORT}`);
});