import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, FileText, ChevronDown } from 'lucide-react';
import { chatWithAssistant } from '../services/api';

export default function DiagnosisChatbot({ docContext }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello. I can help translate your medical logs, discharge summaries, or answer questions about your diagnosis in plain English. How can I assist you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg = inputValue.trim();
    const newMessages = [...messages, { role: 'user', text: userMsg }];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      const reply = await chatWithAssistant(newMessages, docContext);
      setIsTyping(false);
      setMessages([
        ...newMessages,
        { role: 'assistant', text: reply }
      ]);
    } catch (err) {
      setIsTyping(false);
      setMessages([
        ...newMessages,
        { role: 'assistant', text: "I'm sorry, I'm having trouble connecting to the clinical engine. Please check your connection and try again." }
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {/* Chat Window */}
      <div 
        className={`bg-charcoal text-cream w-[90vw] sm:w-[400px] h-[500px] max-h-[80vh] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] mb-6 flex flex-col border border-white/10 overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100 visible' : 'scale-90 opacity-0 invisible'}`}
      >
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(false)}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-moss/20 flex items-center justify-center border border-moss/50">
              <Bot className="w-4 h-4 text-moss" />
            </div>
            <div>
              <h3 className="font-serif italic text-lg leading-none">Clinical Assistant</h3>
              <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest mt-1">Status: Active</p>
            </div>
          </div>
          <button className="text-white/40 hover:text-white transition-colors">
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border ${msg.role === 'user' ? 'bg-cream/10 border-cream/20' : 'bg-moss/20 border-moss/50'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-cream" /> : <Bot className="w-4 h-4 text-moss" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-moss text-cream rounded-tr-sm' : 'bg-white/5 border border-white/10 rounded-tl-sm text-cream/90'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          
          {isTyping && (
             <div className="flex gap-3">
               <div className="w-8 h-8 rounded-full flex-shrink-0 bg-moss/20 border border-moss/50 flex items-center justify-center">
                 <Bot className="w-4 h-4 text-moss" />
               </div>
               <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-4 flex gap-1 items-center h-[52px]">
                 <span className="w-2 h-2 bg-moss/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                 <span className="w-2 h-2 bg-moss/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                 <span className="w-2 h-2 bg-moss/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="bg-white/5 backdrop-blur-md border-t border-white/10 p-4">
          <div className="relative flex items-end gap-2 bg-black/20 rounded-2xl border border-white/10 p-2 focus-within:border-moss/50 transition-colors">
            <button className="p-2 text-white/40 hover:text-moss transition-colors">
              <FileText className="w-5 h-5" />
            </button>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your diagnosis..."
              className="flex-1 bg-transparent resize-none outline-none text-sm text-cream placeholder-white/30 max-h-32 min-h-[40px] py-2 scrollbar-none"
              rows={1}
            />
            <button 
              onClick={handleSend}
              className={`p-2 rounded-xl transition-all ${inputValue.trim() ? 'bg-moss text-cream' : 'bg-white/5 text-white/30'}`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-charcoal border border-white/10 scale-90 opacity-0' : 'bg-moss hover:bg-moss/90 text-cream scale-100 opacity-100 hover:scale-105'}`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    </div>
  );
}
