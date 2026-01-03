// src/components/Chatbot/Chatbot.jsx
import React, { useState, useRef, useEffect, useContext, useMemo } from "react";
import { MessageCircle, Send, X, Bot, User, Volume2, VolumeX, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeContext } from "../../context/ThemeContext";
// Import library Fuse untuk pencarian pintar (fuzzy matching)
import Fuse from 'fuse.js'; 
import chatbotModel from '../../data/chatbot_model.json';
import AlienIcon from './AlienIcon';

const Chatbot = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const TRAINED_MODEL = chatbotModel;
  
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
    if (!isOpen) {
      const welcomeMessage = {
        id: messages.length + 1,
        text: `👋 Hai! Saya ${TRAINED_MODEL.personality_data['Nama panggilan'] || 'asisten virtual'} Ananta. Ada yang bisa saya bantu hari ini? 😊`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, welcomeMessage]);
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
    <div className="fixed bottom-50 right-6 z-10">
      {/* Chat Button */}
      <motion.button
        onClick={toggleChat}
        className={`w-14 h-14 rounded-full flex cursor-target items-center justify-center shadow-lg transition-colors relative ${
          isDarkMode
            ? "bg-transparent text-white"
            : "bg-transparent  text-black"
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? <X size={24} /> : <AlienIcon size={58} />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`absolute bottom-20 right-0 w-96 h-[36rem] rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
              isDarkMode ? "bg-zinc-800 border border-zinc-700" : "bg-white border-gray-200"
            }`}
          >
            {/* Header */}
            <div className={`p-4 flex items-center justify-between ${
              isDarkMode ? "bg-zinc-900 border-b border-zinc-700" : "bg-gray-50 border-b border-gray-200"
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    Asisten Virtual Ananta
                  </h3>
                  <p className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
                    Trained with Personal Data
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                  className={`p-2 rounded-full transition-colors ${
                    isSoundEnabled
                      ? "text-green-500"
                      : "text-gray-400"
                  }`}
                  title={isSoundEnabled ? "Matikan suara" : "Aktifkan suara"}
                >
                  {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <button
                  onClick={() => {
                    setMessages([{
                      id: 1,
                      text: `👋 Hai! Saya ${TRAINED_MODEL.personality_data['Nama panggilan'] || 'asisten virtual'} Ananta. Ada yang bisa saya bantu hari ini? 😊`,
                      sender: "bot",
                      timestamp: new Date(),
                    }]);
                    setContext({ lastTopic: null, lastEntities: [] }); // Reset konteks
                  }}
                  className={`p-2 rounded-full transition-colors ${
                    isDarkMode ? "hover:bg-zinc-800 text-zinc-300" : "hover:bg-gray-200 text-gray-600"
                  }`}
                  title="Reset chat"
                >
                  <Sparkles size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-2 ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.sender === "bot" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Bot size={16} className="text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-2xl ${
                      message.sender === "user"
                        ? isDarkMode
                          ? "bg-blue-600 text-white"
                          : "bg-blue-500 text-white"
                        : isDarkMode
                        ? "bg-zinc-700 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === "user"
                        ? "text-blue-100"
                        : isDarkMode
                        ? "text-zinc-400"
                        : "text-gray-500"
                    }`}>
                      {message.timestamp.toLocaleTimeString('id-ID', {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  
                  {message.sender === "user" && (
                    <div className="w-8 h-8 rounded-full bg-zinc-600 flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className={`px-3 py-2 rounded-2xl ${
                    isDarkMode ? "bg-zinc-700" : "bg-gray-100"
                  }`}>
                    <div className="flex space-x-1">
                      <div className={`w-2 h-2 rounded-full ${
                        isDarkMode ? "bg-zinc-400" : "bg-gray-400"
                      } animate-pulse`} style={{ animationDelay: "0ms" }}></div>
                      <div className={`w-2 h-2 rounded-full ${
                        isDarkMode ? "bg-zinc-400" : "bg-gray-400"
                      } animate-pulse`} style={{ animationDelay: "200ms" }}></div>
                      <div className={`w-2 h-2 rounded-full ${
                        isDarkMode ? "bg-zinc-400" : "bg-gray-400"
                      } animate-pulse`} style={{ animationDelay: "400ms" }}></div>
                    </div>
                    <p className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-gray-500"} mt-1`}>
                    sedang mengetik...
                    </p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-2 px-4 pb-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`text-xs px-2 py-1 rounded-full transition-all hover:scale-105 ${
                    isDarkMode
                      ? "bg-zinc-700 hover:bg-zinc-600 text-zinc-300"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className={`p-3 border-t ${
              isDarkMode ? "border-zinc-700" : "border-gray-200"
            }`}>
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tanyakan apa saja tentang Ananta..."
                  className={`flex-1 px-3 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode
                      ? "bg-zinc-700 text-white placeholder-zinc-400"
                      : "bg-gray-100 text-gray-900 placeholder-gray-500"
                  }`}
                />
                <button
                  onClick={handleSendMessage}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isDarkMode
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
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