<template>
  <div class="fixed inset-0 bg-slate-950 text-slate-50 flex flex-col font-sans overflow-hidden select-none">
    
    <header class="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-slate-950/80 to-transparent backdrop-blur-sm z-30 px-4 flex justify-between items-center">
      <div class="flex items-center space-x-2.5">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-black text-sm tracking-wider shadow-md shadow-indigo-500/20">
          PZ
        </div>
        <div>
          <h1 class="text-sm font-bold tracking-tight bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
            Prizren Connect
          </h1>
          <p class="text-[10px] text-indigo-400 font-medium tracking-wide uppercase">Shadrvan Link</p>
        </div>
      </div>
      
      <div class="flex items-center space-x-1.5 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-full backdrop-blur-md">
        <span class="w-2 h-2 rounded-full animate-pulse" :class="isConnected ? 'bg-emerald-500' : 'bg-amber-500'"></span>
        <span class="text-[11px] font-semibold text-slate-300">
          {{ isConnected ? 'Server Connected' : 'Connecting...' }}
        </span>
      </div>
    </header>

    <main class="flex-1 w-full h-full relative flex flex-col md:flex-row bg-slate-950">
      
      <div class="flex-1 h-full relative bg-slate-900 flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-slate-900">
        
        <video id="remoteVideo" autoplay playsinline :class="{'hidden': !isMatched}" class="w-full h-full object-cover"></video>

        <div v-if="!isMatched" class="absolute inset-0 z-10 flex flex-col items-center justify-center space-y-4 bg-slate-950/40 backdrop-blur-2xl">
          <div class="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shadow-xl text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" :class="{'animate-spin text-indigo-500': status.includes('Searching')}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="text-center">
            <p class="text-xs font-semibold text-slate-300 tracking-wide">{{ status }}</p>
            <p class="text-[11px] text-slate-500 mt-0.5">Looking around Prizren</p>
          </div>
        </div>

        <div class="absolute bottom-24 md:bottom-6 left-4 z-20 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800/60 text-xs font-medium flex items-center space-x-1.5">
          <span :class="isMatched ? 'text-emerald-400' : 'text-rose-400'">●</span>
          <span class="text-slate-200 font-semibold">{{ isMatched ? 'Connected with Stranger' : 'Stranger' }}</span>
        </div>
      </div>

      <div class="absolute bottom-24 right-4 w-28 aspect-[3/4] md:relative md:bottom-0 md:right-0 md:w-1/2 md:h-full md:aspect-auto bg-slate-950 rounded-2xl md:rounded-none border border-slate-800 md:border-0 shadow-2xl overflow-hidden z-20 transition-all duration-300">
        <video id="localVideo" autoplay playsinline muted class="w-full h-full object-cover scale-x-[-1]"></video>
        <div class="absolute bottom-2 left-2 md:bottom-6 md:left-6 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-800/60 text-[10px] md:text-xs font-medium text-slate-300">
          You
        </div>
      </div>

    </main>

    <footer class="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent z-30 px-6 flex justify-center items-center">
      <div class="flex items-center space-x-3 w-full max-w-md">
        
        <button @click="stopSearch" class="h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 hover:bg-rose-950/30 hover:border-rose-900/50 active:scale-95 text-slate-400 hover:text-rose-400 transition-all duration-200 flex items-center justify-center shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <button @click="findNextStranger" class="flex-1 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 active:scale-[0.98] text-white font-bold text-sm tracking-wide transition-all duration-200 shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-2">
          <span>{{ isMatched ? 'NEXT STRANGER' : 'START MATCHING' }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
        
      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { io } from 'socket.io-client'
import { Peer } from 'peerjs'

const socket = ref(null)
const peer = ref(null)
const localStream = ref(null)
const currentCall = ref(null)

const isConnected = ref(false)
const isMatched = ref(false)
const status = ref('Allow camera access to start...')
const myPeerId = ref(null)

// ÇEVRE DEĞİŞKENİ: Vercel'e yüklediğinde VITE_BACKEND_URL adıyla Render linkini ekleyebilirsin.
// Eğer yereldeysen otomatik olarak http://localhost:3000 adresine bağlanır.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

onMounted(async () => {
  // 1. Kamerayı Aç
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    localStream.value = stream
    const localVideo = document.getElementById('localVideo')
    if (localVideo) localVideo.srcObject = stream
    status.value = 'Ready to match!'
  } catch (error) {
    console.error("Camera access error:", error)
    status.value = 'Camera error! Check browser permissions.'
    return
  }

  // 2. Dinamik URL ile Sokete Bağlan
  console.log('🔌 Connecting to backend at:', BACKEND_URL)
  socket.value = io(BACKEND_URL)

  socket.value.on('connect', () => {
    console.log('✅ Connected to Socket.io server. ID:', socket.value.id)
    isConnected.value = true
  })

  socket.value.on('disconnect', () => {
    console.log('❌ Disconnected from server')
    isConnected.value = false
    resetVideos()
  })

  // 3. PeerJS Kararlı Bulut Bağlantısı
  peer.value = new Peer(undefined, {
    debug: 2
  })

  peer.value.on('open', (id) => {
    myPeerId.value = id
    console.log('📡 PeerJS Cloud Server ready. My Peer ID:', id)
  })

  peer.value.on('error', (err) => {
    console.error('🚨 PeerJS Error:', err)
  })

  // Gelen Aramaları Karşıla
  peer.value.on('call', (call) => {
    console.log('📞 Receiving call from stranger...')
    currentCall.value = call
    call.answer(localStream.value)
    
    call.on('stream', (remoteStream) => {
      console.log('🎥 Stream received from caller!')
      isMatched.value = true
      setTimeout(() => {
        const remoteVideo = document.getElementById('remoteVideo')
        if (remoteVideo) remoteVideo.srcObject = remoteStream
      }, 100)
    })
  })

  // Eşleşme Gerçekleştiğinde Karşıyı Ara
  socket.value.on('matched', ({ remotePeerId }) => {
    console.log('🔗 Match found! Dialing Peer:', remotePeerId)
    status.value = 'Connecting to stranger...'
    
    const call = peer.value.call(remotePeerId, localStream.value)
    currentCall.value = call

    call.on('stream', (remoteStream) => {
      console.log('🎥 Stream received from callee!')
      isMatched.value = true
      setTimeout(() => {
        const remoteVideo = document.getElementById('remoteVideo')
        if (remoteVideo) remoteVideo.srcObject = remoteStream
      }, 100)
    })
  })
})

const findNextStranger = () => {
  if (!socket.value || !myPeerId.value) {
    alert("Connection not ready. Please refresh.")
    return
  }

  console.log('⏭️ Skipping current match...')
  if (currentCall.value) {
    currentCall.value.close()
  }

  isMatched.value = false
  status.value = 'Searching for someone...'
  
  socket.value.emit('leave-match')
  socket.value.emit('find-match', myPeerId.value)
}

const stopSearch = () => {
  console.log('🛑 Stopping match.')
  if (currentCall.value) currentCall.value.close()
  if (socket.value) socket.value.emit('leave-match')
  resetVideos()
}

const resetVideos = () => {
  isMatched.value = false
  status.value = 'Ready to match!'
  const remoteVideo = document.getElementById('remoteVideo')
  if (remoteVideo) remoteVideo.srcObject = null
}
</script>

<style scoped>
@media (max-width: 768px) {
  #localVideo {
    object-fit: cover;
  }
}
</style>