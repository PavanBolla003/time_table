
import React, { useState, useRef, useEffect } from 'react';
import { AppState } from '../types';
import { chatWithGemini } from '../geminiService';

interface ChatbotProps {
  state: AppState;
  onUpdateFromAI: (action: string, args: any) => void;
}

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ state, onUpdateFromAI }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: "Hi! I'm your StudiFlow Assistant. I can help you log study time, manage your timetable, or answer questions about your progress. What's on your mind?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    const response = await chatWithGemini(userMsg, state, onUpdateFromAI);
    
    setIsLoading(false);
    setMessages(prev => [...prev, { role: 'ai', content: response || "I'm not sure how to respond to that." }]);
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">StudiFlow AI</h1>
        <p className="text-slate-500">Ask me to log sessions, add schedules, or check stats.</p>
      </header>

      <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Messages area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-slate-100 text-slate-800 rounded-tl-none'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-2xl px-5 py-3 rounded-tl-none flex space-x-1.5 items-center">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-50 bg-slate-50/30">
          <div className="flex items-center space-x-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., Log 2 hours of Math for today"
              className="flex-1 bg-white border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all shadow-sm"
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {['"How much did I study today?"', '"Add History to Monday 3pm-5pm"', '"I studied Physics for 30 min"'].map(prompt => (
          <button 
            key={prompt}
            onClick={() => setInput(prompt.replace(/"/g, ''))}
            className="text-xs font-medium text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Chatbot;
