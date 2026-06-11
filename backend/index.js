const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
// Vercel'den gelen bağlantılara tam izin veriyoruz
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

// Aktif eşleşme bekleyen kullanıcıların havuzu
let waitingUsers = [];
// Aktif konuşma odaları veri tabanı (Hangi soket hangi odada?)
const activeRooms = new Map();

io.on('connection', (socket) => {
    console.log(`Yeni kullanıcı bağlandı: ${socket.id}`);

    // Her yeni giriş yapıldığında toplam canlı sayısını herkese üfle
    io.emit('user-count', io.engine.clientsCount);

    // 1. ÖZELLİK: Kullanıcı profil bilgilerini kaydetme (Instagram & Ülke)
    socket.on('register-user-info', (data) => {
        socket.userData = {
            country: data.country || '🌍 Diğer',
            instagram: data.instagram || ''
        };
        console.log(`${socket.id} profil kaydı:`, socket.userData);
        
        // Profilini kaydettiği an sıraya sokuyoruz
        addToQueue(socket);
    });

    // 2. ÖZELLİK: Gerçek Zamanlı Metin Mesajı Taşıyıcısı
    socket.on('chat-message', (text) => {
        const roomId = activeRooms.get(socket.id);
        if (roomId) {
            // Mesajı odadaki diğer kullanıcıya fırlat
            socket.to(roomId).emit('chat-message', text);
        }
    });

    // 3. ÖZELLİK: Yazıyor... (Typing...) Durumunu İletme
    socket.on('typing-status', (isTyping) => {
        const roomId = activeRooms.get(socket.id);
        if (roomId) {
            socket.to(roomId).emit('typing-status', isTyping);
        }
    });

    // 4. ÖZELLİK: Bağlantı Kalitesi (Ping-Pong) Robotu
    socket.on('ping-check', () => {
        socket.emit('pong-check');
    });

    // WebRTC Sinyalleşme Köprüsü (SDP Paketleri)
    socket.on('sdp-signal', (data) => {
        const roomId = activeRooms.get(socket.id);
        if (roomId) {
            socket.to(roomId).emit('sdp-signal', data);
        }
    });

    // WebRTC Sinyalleşme Köprüsü (ICE Adayları)
    socket.on('ice-signal', (candidate) => {
        const roomId = activeRooms.get(socket.id);
        if (roomId) {
            socket.to(roomId).emit('ice-signal', candidate);
        }
    });

    // 5. ÖZELLİK: Sıradakine Geç (Skip) Mekanizması
    socket.on('skip-user', () => {
        leaveCurrentRoom(socket);
        addToQueue(socket);
    });

    // Kullanıcı sekmeyi kapatırsa veya interneti koparsa
    socket.on('disconnect', () => {
        console.log(`Kullanıcı ayrıldı: ${socket.id}`);
        leaveCurrentRoom(socket);
        // Havuzdan temizle
        waitingUsers = waitingUsers.filter(user => user.id !== socket.id);
        // Kalan herkese güncel canlı sayısını bildir
        io.emit('user-count', io.engine.clientsCount);
    });
});

// Kullanıcıyı Eşleşme Havuzuna Sokma ve Eşleştirme Algoritması
function addToQueue(socket) {
    // Eğer kullanıcı zaten sıradaysa tekrar ekleme
    if (waitingUsers.some(user => user.id === socket.id)) return;

    if (waitingUsers.length > 0) {
        // Havuzda bekleyen biri var! Hemen eşleştir
        const partner = waitingUsers.shift(); 
        const roomId = `room_${socket.id}_${partner.id}`;

        socket.join(roomId);
        partner.join(roomId);

        activeRooms.set(socket.id, roomId);
        activeRooms.set(partner.id, roomId);

        // İki tarafa da eşleştiklerini ve karşı tarafın profilini pasla
        socket.emit('matched', { roomId, isOffer: true, remoteUser: partner.userData });
        partner.emit('matched', { roomId, isOffer: false, remoteUser: socket.userData });

        console.log(`Oda kuruldu: ${roomId}`);
    } else {
        // Havuz boş, sıraya girip birini beklemeye başla
        waitingUsers.push(socket);
        console.log(`${socket.id} sıraya girdi. Bekleyen sayısı: ${waitingUsers.length}`);
    }
}

// Mevcut Odadan Güvenli Çıkış Fonksiyonu
function leaveCurrentRoom(socket) {
    const roomId = activeRooms.get(socket.id);
    if (roomId) {
        // Odadaki diğer kişiye partnerinin koptuğunu haber ver
        socket.to(roomId).emit('user-disconnected');
        
        // Odayı dağıt ve kayıtları sil
        activeRooms.delete(socket.id);
        
        // Soketi odadan çıkar
        socket.leave(roomId);
    }
}

// Render için port ayarı
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Şadırvan Backend Sunucusu ${PORT} portunda cayır cayır çalışıyor...`);
});