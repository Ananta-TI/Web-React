// src/components/Chatbot/Chatbot.jsx
import React, { useState, useRef, useEffect, useContext, useMemo } from "react";
import { MessageCircle, Send, X, Bot, User, Volume2, VolumeX, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeContext } from "../../context/ThemeContext";
// Import library Fuse untuk pencarian pintar (fuzzy matching)
import Fuse from 'fuse.js'; 
import ChatbotModel from '../../Data/chatbot_model.json';
import AlienIcon from './AlienIcon';

const Chatbot = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const TRAINED_MODEL = ChatbotModel;
  
  const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [suggestions, setSuggestions] = useState([
    "Siapa Ananta?", "Proyek terbaru", "Teknologi yang digunakan", "Sertifikat networking"
  ]);

  // --- MEMORI KONTEKS YANG LEBIH BAIK ---
  // Bot akan ingat topik dan entitas terakhir yang dibicarakan
  const [context, setContext] = useState({
    lastTopic: null, // 'identity', 'projects', 'technology', dll.
    lastEntities: [], // array of entities mentioned
  });
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // --- INISIALISASI MESIN PENCARI PINTAR (dengan useMemo untuk performa) ---
  const qaFuse = useMemo(() => new Fuse(TRAINED_MODEL.qa_pairs, {
    keys: ['question'],
    threshold: 0.4, // 0.0 = sempurna, 1.0 = cocok apa saja
    includeScore: true,
  }), [TRAINED_MODEL.qa_pairs]);

  const playNotificationSound = () => {
    if (!isSoundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  // --- LOGIKA "OTAK PALSU" YANG LEBIH PINTAR DAN LUWES ---
// --- LOGIKA "OTAK PALSU" YANG LEBIH PINTAR DAN LUWES ---
const thinkAndRespond = (userMessage) => {
  const lowerMessage = userMessage.toLowerCase();
  
  // 1. Cari tahu topik utama dari pertanyaan dengan pendekatan yang lebih luwes
  let topic = 'general';
  if (lowerMessage.includes('siapa') || lowerMessage.includes('nama') || lowerMessage.includes('identitas') || lowerMessage.includes('usia') || lowerMessage.includes('tinggal')) topic = 'identity';
  if (lowerMessage.includes('proyek') || lowerMessage.includes('project') || lowerMessage.includes('portfolio') || lowerMessage.includes('karya') || lowerMessage.includes('bikin') || lowerMessage.includes('buat')) topic = 'projects';
  if (lowerMessage.includes('teknologi') || lowerMessage.includes('tech') || lowerMessage.includes('stack') || lowerMessage.includes('framework') || lowerMessage.includes('gunakan')) topic = 'technology';
  if (lowerMessage.includes('sertifikat') || lowerMessage.includes('certificate') || lowerMessage.includes('ccna') || lowerMessage.includes('udemy') || lowerMessage.includes('mtcna')) topic = 'certificates';
  if (lowerMessage.includes('kabar') || lowerMessage.includes('apa kabar') || lowerMessage.includes('gimana') || lowerMessage.includes('bagaimana')) topic = 'status';

  // 2. Ekstrak entitas (kata benda penting) untuk mendapatkan konteks lebih spesifik
  const entities = [];
  const allEntities = [
      // Dari data projects
      ...Object.values(TRAINED_MODEL.projects).flat(),
      // Dari data certificates
      ...TRAINED_MODEL.certificates["Sertifikat Programming"][0].description,
      ...TRAINED_MODEL.certificates["Sertifikat Networking & Security"][0].description,
      // Dari response_db general (kata kunci teknologi)
      "react", "tailwindcss", "vite", "supabase", "laravel", "gsap", "firebase", "unity", "flowbite", "uiverse", "rest api", "sdk", "lstm", "mtcna", "ccna", "udemy", "ananta"
  ];
  allEntities.forEach(entity => {
      if (typeof entity === 'string' && lowerMessage.includes(entity.toLowerCase())) {
          entities.push(entity);
      }
  });

  // 3. Cari jawaban spesifik di qa_pairs dulu (prioritas tertinggi)
  const qaResult = qaFuse.search(userMessage);
  if (qaResult.length > 0 && qaResult[0].score < 0.4) {
    setContext({ lastTopic: qaResult[0].item.category, lastEntities: entities });
    return qaResult[0].item.answer;
  }
  
  // 4. Jika tidak ada, coba "merangkai" jawaban berdasarkan topik dan entitas yang dikenali
  let response = "";
  switch (topic) {
    case 'identity':
      response = `Oh, kamu mau tahu tentang Ananta ya? ${TRAINED_MODEL.response_db.identity[Math.floor(Math.random() * TRAINED_MODEL.response_db.identity.length)]}`;
      break;
    case 'projects':
      if (entities.length > 0) {
        const entity = entities[0];
        response = `Tentu, saya tahu proyek ${entity}. Itu adalah salah satu karya Ananta yang cukup menarik. ${TRAINED_MODEL.response_db.projects[0]}`;
      } else {
        response = `Ananta punya banyak proyek lho! Mulai dari website sampai aplikasi mobile. ${TRAINED_MODEL.response_db.projects[0]}`;
      }
      break;
    case 'technology':
      if (entities.length > 0) {
          const entity = entities[0];
          const techInfo = TRAINED_MODEL.response_db.general.find(res => res.toLowerCase().includes(entity.toLowerCase()));
          response = techInfo || `Ananta sering pakai ${entity} untuk proyek-proyeknya. Itu teknologi yang modern dan keren!`;
      } else {
          response = `Untuk teknologi, Ananta suka dengan tools yang modern. ${TRAINED_MODEL.response_db.technology[0]}`;
      }
      break;
    case 'certificates':
      if (entities.length > 0) {
          const entity = entities[0];
          response = `Iya, Ananta punya sertifikat ${entity}. Dia memang rajin belajar dan mengembangkan skill-nya. ${TRAINED_MODEL.response_db.certificates[0]}`;
      } else {
          response = `Ananta punya banyak sertifikat dari berbagai platform lho! ${TRAINED_MODEL.response_db.certificates[0]}`;
      }
      break;
    case 'status':
      if (lowerMessage.includes('ananta')) {
          response = `Kabar Ananta baik-baik saja! ${TRAINED_MODEL.response_db.ananta_status[Math.floor(Math.random() * TRAINED_MODEL.response_db.ananta_status.length)]}`;
      } else {
          response = `Kabar saya baik, terima kasih sudah tanya! 😊 Ada yang bisa saya bantu soal Ananta?`;
      }
      break;
    default:
      // Fallback yang lebih cerdas
      if (entities.length > 0) {
          response = `Oh, kamu bicara tentang ${entities.join(', ')} ya? Itu terkait dengan proyek atau teknologi yang Ananta gunakan. Ada yang spesifik mau kamu tahu?`;
      } else {
          response = `Hmm, saya belum paham maksud kamu. Mungkin kamu mau tanya tentang siapa Ananta, proyeknya, atau teknologi yang dia gunakan?`;
      }
  }

  // Update konteks untuk percakapan selanjutnya
  setContext({ lastTopic: topic, lastEntities: entities });
  return response;
};
  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue; // Simpan input sebelum di-reset
    setInputValue("");
    setIsTyping(true);
    playNotificationSound();

    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: thinkAndRespond(currentInput), // Panggil fungsi "otak" baru
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay 1-2 detik untuk efek mengetik
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

const toggleChat = () => {
  setIsOpen(!isOpen);
  
  // Tambahkan pengecekan: Jika chat dibuka DAN pesan masih kosong (0)
  if (!isOpen && messages.length === 0) {
    const welcomeMessage = {
      id: 1, // Gunakan ID statis untuk pesan pertama
      text: `👋 Hai! Saya ${TRAINED_MODEL.personality_data['Nama panggilan'] || 'asisten virtual'}. Ada yang bisa saya bantu hari ini? 😊`,
      sender: "bot",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }
};

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  // Update suggestions berdasarkan input dan konteks
  useEffect(() => {
    const casualSuggestions = ["Kok kok kok kok!", "Halo halo kakak!", "Pagi kabar?", "Apa kabar?", "Lagi gimana?", "Kok gak nyambun ni?"];
    const anantaStatusSuggestions = ["Gimana kabar Ananta?", "Apa kabar Ananta?", "Ananta lagi apa?", "Ananta sibuk kah?", "Ananta sehat?"];
    const botIdentitySuggestions = ["Siapa kamu?", "Kamu siapa?", "Apa kamu bot?", "Kamu dibuat pakai apa?", "Kamu punya nama?"];
    
    if (inputValue.length > 0) {
      const lowerInput = inputValue.toLowerCase();
      
      if (lowerInput.includes("kok") || lowerInput.includes("nyambung")) {
        setSuggestions(casualSuggestions);
      } else if (lowerInput.includes("ananta") && (
          lowerInput.includes("kabar") || lowerInput.includes("apa") || lowerInput.includes("lagi") || lowerInput.includes("sibuk") || lowerInput.includes("sehat")
        )) {
        setSuggestions(anantaStatusSuggestions);
      } else if (lowerInput.includes("kamu") || lowerInput.includes("siapa") || lowerInput.includes("bot")) {
        setSuggestions(botIdentitySuggestions);
      } else {
        setSuggestions(["Siapa Ananta?", "Proyek terbaru", "Teknologi yang digunakan", "Sertifikat networking"]);
      }
    } else {
        // Kembalikan ke default jika input kosong
        setSuggestions(["Siapa Ananta?", "Proyek terbaru", "Teknologi yang digunakan", "Sertifikat networking"]);
    }
  }, [inputValue]);

  useEffect(() => {
    console.log("Chatbot model loaded:", TRAINED_MODEL);
  }, []);

 return (
    <div className="fixed bottom-15 right-4 md:bottom-6 md:right-6 z-40">
      {/* Chat Button */}
      <motion.button
        onClick={toggleChat}
        className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-2xl transition-all relative ${
          isDarkMode ? "bg-zinc-800 text-white border border-zinc-700" : "bg-white text-black border border-gray-200"
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X size={28} /> : <AlienIcon size={45} className="md:w-[58px]" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            // Penyesuaian Lebar & Tinggi Responsif
            className={`absolute bottom-20 right-0 
              w-[calc(100vw-2rem)] sm:w-[380px] md:w-[400px] 
              h-[70vh] md:h-[36rem] max-h-[600px]
              rounded-2xl shadow-2xl overflow-hidden flex flex-col 
              ${isDarkMode ? "bg-zinc-800 border border-zinc-700" : "bg-white border-gray-200"}`}
          >
            {/* Header */}
            <div className={`p-4 flex items-center justify-between ${
              isDarkMode ? "bg-zinc-900 border-b border-zinc-700" : "bg-gray-50 border-b border-gray-200"
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 flex items-center justify-center">
                  <Bot size={20} className="text-white" />
                </div>
                <div className="overflow-hidden">
                  <h3 className={`font-semibold truncate text-sm md:text-base ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    Asisten Ananta
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <p className={`text-[10px] md:text-xs truncate ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
                      Online | AI Based
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                  className={`p-2 rounded-lg transition-colors ${isSoundEnabled ? "text-blue-500" : "text-gray-400"}`}
                >
                  {isSoundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>
                <button
                  onClick={toggleChat}
                  className="p-2 md:hidden text-gray-400" // Tombol close tambahan untuk mobile
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area - Flex Grow agar dinamis */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-end gap-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.sender === "bot" && (
                    <div className="w-7 h-7 rounded-full bg-zinc-200 flex-shrink-0 flex items-center justify-center mb-1">
                      <Bot size={14} className="text-zinc-700" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] md:max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                      message.sender === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : isDarkMode
                        ? "bg-zinc-700 text-zinc-100 rounded-bl-none"
                        : "bg-gray-100 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <p className="leading-relaxed">{message.text}</p>
                    <p className={`text-[10px] mt-1.5 opacity-70 ${message.sender === "user" ? "text-right" : "text-left"}`}>
                      {message.timestamp.toLocaleTimeString('id-ID', { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className={`px-4 py-3 rounded-2xl rounded-bl-none ${isDarkMode ? "bg-zinc-700" : "bg-gray-100"}`}>
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions - Horizontal Scroll on Mobile */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 px-4 pb-3 pt-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`whitespace-nowrap text-[11px] md:text-xs px-3 py-1.5 rounded-full border transition-all active:scale-95 ${
                    isDarkMode
                      ? "bg-zinc-800 border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm"
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className={`p-3 md:p-4 border-t ${isDarkMode ? "border-zinc-700 bg-zinc-900/50" : "border-gray-100 bg-white"}`}>
              <div className="flex items-center gap-2 bg-transparent">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tulis pesan..."
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                    isDarkMode
                      ? "bg-zinc-800 text-white placeholder-zinc-500"
                      : "bg-gray-100 text-gray-900 placeholder-gray-400"
                  }`}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-md ${
                    inputValue.trim() 
                      ? "bg-blue-600 hover:bg-blue-700 text-white scale-100" 
                      : "bg-gray-300 text-gray-500 scale-95 cursor-not-allowed"
                  }`}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default Chatbot;