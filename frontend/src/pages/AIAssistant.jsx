// src/pages/AIAssistant.jsx
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, Send, Bot, User, AlertCircle } from 'lucide-react';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi! I'm your VoltPod AI. I have access to live booking data and current station availability. Ask me anything — like 'Which fast charger is free right now?' or 'Where is the cheapest charging in MP Nagar?'" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/ai/chat', 
        { prompt: userMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessages(prev => [...prev, { role: 'ai', text: res.data.reply }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'error', text: 'Sorry, I am having trouble connecting to the network right now.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-hidden p-8 bg-[#f4f5f8] dark:bg-[#0a0f1a] transition-colors duration-300">
      <div className="max-w-4xl mx-auto h-full flex flex-col bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/10">
          <div className="p-2 bg-indigo-600 rounded-xl text-white">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">VoltPod AI</h1>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">Live Network Assistant</p>
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              
              {/* Avatar */}
              <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white ${
                msg.role === 'user' ? 'bg-indigo-600' : 
                msg.role === 'error' ? 'bg-red-500' : 'bg-gradient-to-br from-[#00d4ff] to-[#00ff88]'
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : 
                 msg.role === 'error' ? <AlertCircle className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[75%] p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : msg.role === 'error'
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 rounded-tl-none border border-red-100 dark:border-red-800'
                  : 'bg-gray-50 dark:bg-[#0a0f1a] text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-800'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#00ff88] flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#0a0f1a] border border-gray-100 dark:border-gray-800 rounded-tl-none flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-[#111827] border-t border-gray-100 dark:border-gray-800">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about live availability, prices, or routes..." 
              className="w-full bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-gray-700 rounded-2xl py-4 pl-6 pr-16 text-gray-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-xl transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default AIAssistant;