<template>
  <div :class="isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'" class="min-h-screen flex flex-col font-sans transition-colors duration-300">
    
    <header :class="isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'" class="border-b p-4 flex flex-wrap justify-between items-center shadow-md gap-4">
      <h1 class="text-xl font-bold tracking-wide text-indigo-500 flex items-center gap-2">
        <span>🕌</span> Prizren Connect <span class="text-xs bg-indigo-500/20 text-indigo-500 px-2 py-0.5 rounded-full border border-indigo-500/30">Pro v2.5</span>
      </h1>
      
      <div class="flex items-center gap-3 flex-wrap">
        <div :class="isDarkMode ? 'bg-gray-900/60 border-gray-700' : 'bg-gray-200/60 border-gray-300'" class="flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono">
          <span>⚡</span> Ping: <span :class="ping < 100 ? 'text-green-500' : 'text-amber-500'">{{ ping }}ms</span>
        </div>

        <div :class="isDarkMode ? 'bg-gray-900/60 border-gray-700' : 'bg-gray-200/60 border-gray-300'" class="flex items-center gap-2 px-3 py-1.5 rounded-full border">
          <span class="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
          <span class="text-sm font-medium">Canlı: <strong class="text-green-500">{{ onlineCount }}</strong></span>
        </div>

        <button @click="isDarkMode = !isDarkMode" class="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 transition-all text-sm" title="Temayı Değiştir">
          {{ isDarkMode ? '☀️ Aydınlık' : '🌙 Karanlık' }}
        </button>
      </div>
    </header>

    <div v-if="showSetupScreen" class="flex-1 flex items-center justify-center p-4">
      <div :class="isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'" class="p-6 rounded-2xl border shadow-xl max-w-md w-full space-y-4">
        <h2 class="text-xl font-bold text-center text-indigo-500">Profilini Ayarla 🕌</h2>
        
        <div>
          <label class="block text-xs font-semibold mb-1 text-gray-400">Instagram Kullanıcı Adın (İsteğe Bağlı)</label>
          <div class="relative">
            <span class="absolute left-3 top-2.5 text-gray-500 text-sm">@</span>
            <input v-model="myInstagram" type="text" placeholder="edibobaj" :class="isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'" class="w-full pl-8 pr-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold mb-1 text-gray-400">Bulunduğun Ülke / Bölge</label>
          <select v-model="myCountry" :class="isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'" class="w-full px-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="🇽🇰 Kosova">Kosova 🇽🇰</option>
            <option value="🇹🇷 Türkiye">Türkiye 🇹🇷</option>
            <option value="🇦🇱 Arnavutluk">Arnavutluk 🇦🇱</option>
            <option value="🌍 Diğer">Diğer / Uluslararası 🌍</option>
          </select>
        </div>

        <button @click="startApp" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-md active:scale-95">
          Bağlantıyı Başlat 🚀
        </button>
      </div>
    </div>

    <div v-else-if="isLoading" class="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div class="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
      <h2 class="text-xl font-semibold text-indigo-500">Şadırvan'a Hat Çekiliyor...</h2>
      <p class="text-gray-400 text-xs max-w-xs mt-1">Render sunucusu ücretsiz plandan dolayı uyuyor olabilir, lütfen ayrılma...</p>
    </div>

    <main v-else class="flex-1 flex flex-col md:flex-row p-4 gap-4 max-h-[calc(100vh-73px)] overflow-hidden">
      
      <div class="flex-1 flex flex-col gap-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 min-h-[280px]">
          
          <div :class="isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'" class="relative rounded-2xl overflow-hidden border shadow-inner flex items-center justify-center">
            <video ref="localVideo" autoplay playsinline muted :style="localVideoStyle" class="w-full h-full object-cover scale-x-[-1] transition-all duration-300"></video>
            
            <span class="absolute bottom-3 left-3 bg-gray-900/80 px-2.5 py-1 rounded-lg text-xs font-semibold text-white border border-gray-700 backdrop-blur-sm flex items-center gap-1">
              <span>{{ myCountry.split(' ')[0] }}</span> Ben
            </span>

            <div class="absolute top-3 right-3 flex gap-1 bg-gray-900/70 p-1 rounded-xl backdrop-blur-sm border border-gray-700">
              <button v-for="f in filters" :key="f.id" @click="activeFilter = f.id" :class="activeFilter === f.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'" class="text-[11px] px-2 py-1 rounded-md font-medium transition-all">
                {{ f.name }}
              </button>
            </div>
          </div>

          <div :class="isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'" class="relative rounded-2xl overflow-hidden border shadow-inner flex items-center justify-center">
            <video v-show="isMatched" ref="remoteVideo" autoplay playsinline class="w-full h-full object-cover"></video>
            
            <div v-if="!isMatched" class="absolute inset-0 flex flex-col items-center justify-center bg-gray-800/90 backdrop-blur-sm p-4 text-center">
              <div class="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p class="text-indigo-400 font-medium text-sm">Şadırvanda biri aranıyor...</p>
            </div>

            <div v-if="isMatched" class="absolute bottom-3 left-3 flex items-center gap-2">
              <span class="bg-indigo-950/80 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-300 border border-indigo-500/30 backdrop-blur-sm flex items-center gap-1">
                <span>{{ remoteCountry.split(' ')[0] || '🌍' }}</span> Yabancı
              </span>
              <a v-if="remoteInstagram" :href="'https://instagram.com/' + remoteInstagram" target="_blank" class="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs px-2.5 py-1 rounded-lg font-bold shadow-md flex items-center gap-1 transform active:scale-95 transition-all">
                📸 @{{ remoteInstagram }}
              </a>
            </div>

            <button v-if="isMatched" @click="takeSnapshot" class="absolute top-3 right-3 bg-gray-900/80 hover:bg-gray-900 text-white p-2 rounded-xl text-xs border border-gray-700 transition-all shadow-md active:scale-95" title="Anı Yakala (Fotoğraf Çek)">
              📸 Fotoğraf Çek
            </button>
          </div>
        </div>

        <div :class="isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'" class="p-4 rounded-2xl border flex flex-wrap justify-center items-center gap-3 shadow-lg">
          <button @click="toggleAudio" :class="isMuted ? 'bg-red-500' : 'bg-gray-600 hover:opacity-90'" class="p-3 rounded-xl font-medium text-white shadow-md transition-all text-sm">
            {{ isMuted ? '🔇 Sesi Aç' : '🎙️ Sesi Kapat' }}
          </button>

          <button v-if="isMatched" @click="toggleScreenShare" :class="isScreenSharing ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-500'" class="p-3 rounded-xl font-medium text-white shadow-md transition-all text-sm flex items-center gap-1.5">
            🖥️ {{ isScreenSharing ? 'Ekranı Kapat' : 'Ekranı Paylaş' }}
          </button>

          <button @click="handleSkip" class="bg-gradient-to-r from-amber-500 to-red-500 hover:opacity-95 px-8 py-3 rounded-xl font-bold text-white shadow-md transition-all text-sm transform active:scale-95">
            ⏭️ Sıradakine Geç (Skip)
          </button>
          
          <button @click="handleReport" v-if="isMatched" class="border border-red-500 text-red-500 hover:bg-red-500/10 p-3 rounded-xl text-xs font-semibold transition-all">
            🚨 Rapor Et
          </button>
        </div>
      </div>

      <div :class="isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'" class="w-full md:w-80 rounded-2xl border flex flex-col shadow-xl h-[350px] md:h-auto">
        
        <div class="p-3 border-b border-gray-700/40 flex items-center justify-between text-xs font-semibold">
          <span class="text-gray-400">💬 CANLI SOHBET</span>
          <span v-if="isRemoteTyping" class="text-indigo-400 animate-pulse font-medium flex items-center gap-1">
            ✍️ Yabancı yazıyor<span class="dot-loader">...</span>
          </span>
        </div>

        <div ref="chatContainer" class="flex-1 p-4 overflow-y-auto space-y-3 flex flex-col">
          <div v-for="(msg, index) in messages" :key="index"
            :class="msg.sender === 'me' ? 'self-end bg-indigo-600 text-white rounded-br-none' : msg.sender === 'system' ? 'self-center bg-gray-500/10 text-gray-400 text-xs rounded-full px-3 py-1 border border-gray-500/20' : 'self-start bg-gray-500/20 text-sm rounded-bl-none'"
            class="max-w-[85%] rounded-2xl px-3.5 py-1.5 text-sm shadow-sm break-words whitespace-pre-wrap"
          >
            <p>{{ msg.text }}</p>
          </div>
        </div>

        <div v-if="isMatched" class="px-2 py-1 border-t border-gray-700/30 bg-gray-500/5 flex justify-around text-base">
          <button v-for="emoji in ['👋', '😂', '🔥', '👍', '❤️', '🕌']" :key="emoji" @click="sendEmoji(emoji)" class="hover:scale-125 transition-transform active:scale-95">{{ emoji }}</button>
        </div>

        <form @submit.prevent="sendMessage" class="p-3 border-t border-gray-700/30 flex gap-2">
          <input 
            v-model="newMessage" 
            @input="notifyTyping"
            :disabled="!isMatched"
            type="text" 
            placeholder="Bir şeyler karala..." 
            :class="isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black'"
            class="flex-1 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 border"
          />
          <button type="submit" :disabled="!isMatched || !newMessage.trim()" class="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 rounded-xl text-xs font-semibold transition-all active:scale-95 disabled:opacity-40">
            Gönder
          </button>
        </form>
      </div>

    </main>

    <canvas ref="snapshotCanvas" class="hidden"></canvas>
  </div>
</template>

<script>
import { io } from 'socket.io-client'

export default {
  data() {
    return {
      // Altyapı ve Durumlar
      socket: null,
      localStream: null,
      screenStream: null,
      peerConnection: null,
      showSetupScreen: true, // İlk başta profil kurulum ekranını gösteriyoruz
      isLoading: false,
      isMatched: false,
      isMuted: false,
      isDarkMode: true, // Tema kontrolü (Özellik 5)
      isScreenSharing: false, // Ekran paylaşım kontrolü (Özellik 3)
      onlineCount: 0,
      ping: 0, // Gecikme süresi (Özellik 10)
      pingInterval: null,

      // Profil Bilgileri (Özellik 2 & Özellik 6)
      myInstagram: '',
      myCountry: '🇽🇰 Kosova',
      remoteInstagram: '',
      remoteCountry: '',

      // Mesajlaşma & Yazıyor Göstergesi (Özellik 9)
      newMessage: '',
      messages: [],
      isRemoteTyping: false,
      typingTimeout: null,

      // Kamera Filtreleri (Özellik 7 & 8)
      activeFilter: 'none',
      filters: [
        { id: 'none', name: 'Normal', style: '' },
        { id: 'vintage', name: 'Vintage', style: 'sepia(0.7) contrast(1.1)' },
        { id: 'noir', name: 'Siyah-Beyaz', style: 'grayscale(1) contrast(1.2)' },
        { id: 'blur', name: 'Arka Plan Sırrı', style: 'blur(4px)' } // Hafif gizlilik filtresi
      ],

      rtcConfig: {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      }
    }
  },
  computed: {
    // Seçilen kamera filtresini canlı olarak yerel videoya basar (Özellik 7 & 8)
    localVideoStyle() {
      const filter = this.filters.find(f => f.id === this.activeFilter)
      return filter ? { filter: filter.style } : {}
    }
  },
  beforeUnmount() {
    if (this.pingInterval) clearInterval(this.pingInterval)
  },
  methods: {
    // Kurulum Ekranını Geçip Uygulamayı Ateşleme
    async startApp() {
      this.showSetupScreen = false
      this.isLoading = true
      await this.initLocalCamera()
      this.initSocketConnection()
      this.startPingChecker() // Gecikme sayacını başlat (Özellik 10)
    },

    // Kamera Optimizasyonu (640x480 Sabitlendi)
    async initLocalCamera() {
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 24 } }
        })
        if (this.$refs.localVideo) this.$refs.localVideo.srcObject = this.localStream
      } catch (error) {
        alert('Kamera izinleri eksik veya engelli.')
      }
    },

    // Soket Altyapısı ve Yeni Eventler
    initSocketConnection() {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
      this.socket = io(backendUrl)

      this.socket.on('connect', () => {
        this.isLoading = false
        this.addSystemMessage('Şadırvan lobisine giriş yapıldı.')
        
        // Girişte backend'e ülke ve instagram bilgilerimizi bildiriyoruz
        this.socket.emit('register-user-info', {
          country: this.myCountry,
          instagram: this.myInstagram
        })
      })

      this.socket.on('user-count', (count) => { this.onlineCount = count })

      // Eşleşme sağlandığında gelen yabancı profil kartını alıyoruz (Özellik 2 & 6)
      this.socket.on('matched', ({ roomId, isOffer, remoteUser }) => {
        this.isMatched = true
        if (remoteUser) {
          this.remoteCountry = remoteUser.country || '🌍 Diğer'
          this.remoteInstagram = remoteUser.instagram || ''
        }
        this.addSystemMessage(`Eşleşme Sağlandı! (${this.remoteCountry})`)
        this.initWebRTC(isOffer)
      })

      // Gerçek Zamanlı Mesajlaşma (Özellik 1 - Metin Okuma Dahil)
      this.socket.on('chat-message', (text) => {
        this.messages.push({ sender: 'them', text })
        this.scrollToBottom()
        
        // Metin Okuma Altyapısı (Özellik 1 - native SpeechSynthesis)
        if ('speechSynthesis' in window && !text.startsWith('👋') && text.length < 50) {
          const utterance = new SpeechSynthesisUtterance(text)
          utterance.lang = 'tr-TR' // Varsayılan Türkçe seslendirme dengesi
          window.speechSynthesis.speak(utterance)
        }
      })

      // Karşı tarafın yazma durumu sinyali (Özellik 9)
      this.socket.on('typing-status', (typing) => {
        this.isRemoteTyping = typing
      })

      this.socket.on('user-disconnected', () => {
        this.addSystemMessage('Yabancı odadan koptu.')
        this.resetWebRTCConnection()
      })

      // Ping Geri Dönüş Eventi (Özellik 10)
      this.socket.on('pong-check', () => {
        this.ping = Date.now() - this.lastPingTime
      })

      // WebRTC Sinyalleri
      this.socket.on('sdp-signal', async (data) => {
        if (!this.peerConnection) return
        if (data.type === 'offer') {
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data))
          const answer = await this.peerConnection.createAnswer()
          await this.peerConnection.setLocalDescription(answer)
          this.socket.emit('sdp-signal', answer)
        } else if (data.type === 'answer') {
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data))
        }
      })

      this.socket.on('ice-signal', async (cand) => {
        if (this.peerConnection && cand) await this.peerConnection.addIceCandidate(new RTCIceCandidate(cand))
      })
    },

    initWebRTC(isOffer) {
      this.peerConnection = new RTCPeerConnection(this.rtcConfig)
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => this.peerConnection.addTrack(track, this.localStream))
      }
      this.peerConnection.ontrack = (e) => {
        if (this.$refs.remoteVideo && e.streams[0]) this.$refs.remoteVideo.srcObject = e.streams[0]
      }
      this.peerConnection.onicecandidate = (e) => {
        if (e.candidate) this.socket.emit('ice-signal', e.candidate)
      }
      if (isOffer) {
        this.peerConnection.onnegotiationneeded = async () => {
          const offer = await this.peerConnection.createOffer()
          await this.peerConnection.setLocalDescription(offer)
          this.socket.emit('sdp-signal', offer)
        }
      }
    },

    // Ping / Sinyal Kalitesi Kontrol Noktası (Özellik 10)
    startPingChecker() {
      this.pingInterval = setInterval(() => {
        if (this.socket && this.socket.connected) {
          this.lastPingTime = Date.now()
          this.socket.emit('ping-check')
        }
      }, 4000)
    },

    // Yazıyor... Bilgisi Gönderme (Özellik 9)
    notifyTyping() {
      if (!this.isMatched) return
      this.socket.emit('typing-status', true)
      clearTimeout(this.typingTimeout)
      this.typingTimeout = setTimeout(() => {
        this.socket.emit('typing-status', false)
      }, 1500)
    },

    // Ekran Paylaşımı Özelliği (Özellik 3)
    async toggleScreenShare() {
      if (!this.isScreenSharing) {
        try {
          this.screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
          const videoTrack = this.screenStream.getVideoTracks()[0]
          
          // Mevcut WebRTC video track'ini ekran track'iyle değiştiriyoruz
          const sender = this.peerConnection.getSenders().find(s => s.track.kind === 'video')
          if (sender) sender.replaceTrack(videoTrack)
          
          this.isScreenSharing = true
          
          // Kullanıcı tarayıcıdan ekran paylaşımını durdurursa tetiklenir
          videoTrack.onended = () => { this.stopScreenShare() }
        } catch (e) {
          console.error('Ekran paylaşımı başlatılamadı:', e)
        }
      } else {
        this.stopScreenShare()
      }
    },
    stopScreenShare() {
      if (this.screenStream) {
        this.screenStream.getTracks().forEach(t => t.stop())
        const videoTrack = this.localStream.getVideoTracks()[0]
        const sender = this.peerConnection.getSenders().find(s => s.track.kind === 'video')
        if (sender && videoTrack) sender.replaceTrack(videoTrack)
      }
      this.isScreenSharing = false
    },

    // Anlık Fotoğraf Çekme (Özellik 4)
    takeSnapshot() {
      const video = this.$refs.remoteVideo
      const canvas = this.$refs.snapshotCanvas
      if (!video || !canvas) return

      const ctx = canvas.getContext('2d')
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
      
      // Uzak videodaki anlık kareyi canvas'a basıyoruz
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Resim URL'i üretip bilgisayara indirtiyoruz
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `prizren-connect-moment-${Date.now()}.png`
      link.href = dataUrl
      link.click()
    },

    // Sohbet Mesaj Gönderimi
    sendMessage() {
      if (!this.newMessage.trim() || !this.isMatched) return
      const text = this.newMessage.trim()
      this.messages.push({ sender: 'me', text })
      this.socket.emit('chat-message', text)
      this.newMessage = ''
      this.socket.emit('typing-status', false)
      this.scrollToBottom()
    },
    sendEmoji(emoji) {
      if (!this.isMatched) return
      this.messages.push({ sender: 'me', text: emoji })
      this.socket.emit('chat-message', emoji)
      this.scrollToBottom()
    },

    handleSkip() {
      this.addSystemMessage('Sıradaki aranıyor...')
      this.resetWebRTCConnection()
      if (this.isScreenSharing) this.stopScreenShare()
      this.socket.emit('skip-user')
    },
    handleReport() {
      alert('Kullanıcı rapor edildi. Yeni eşleşmeye aktarılıyorsunuz.')
      this.handleSkip()
    },

    resetWebRTCConnection() {
      this.isMatched = false
      this.messages = []
      this.isRemoteTyping = false
      this.remoteInstagram = ''
      if (this.peerConnection) { this.peerConnection.close(); this.peerConnection = null }
      if (this.$refs.remoteVideo) this.$refs.remoteVideo.srcObject = null
    },
    toggleAudio() {
      if (this.localStream) {
        const track = this.localStream.getAudioTracks()[0]
        if (track) { track.enabled = !track.enabled; this.isMuted = !track.enabled }
      }
    },
    addSystemMessage(text) {
      this.messages.push({ sender: 'system', text })
      this.scrollToBottom()
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const c = this.$refs.chatContainer
        if (c) c.scrollTop = c.scrollHeight
      })
    }
  }
}
</script>

<style scoped>
/* Yazıyor üç nokta animasyonu (Özellik 9) */
.dot-loader {
  display: inline-block;
  animation: pulseDots 1.4s infinite left;
}
@keyframes pulseDots {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 1; }
}
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #4f46e5; border-radius: 10px; }
</style>