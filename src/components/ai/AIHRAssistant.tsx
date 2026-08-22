import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, RotateCcw, Loader2 } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { SuggestedQuestions } from './SuggestedQuestions';
import { api } from '../../lib/api';

interface Message {
  id: string;
  text: string;
  isAi: boolean;
  timestamp: Date;
  actionType?: string;
}

interface AIHRAssistantProps {
  onNavigate: (tab: string) => void;
}

export const AIHRAssistant: React.FC<AIHRAssistantProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "Hello! I'm your AI HR Assistant. I can help you check your attendance, leave balances, payslips, and other HR data. How can I assist you today?",
      isAi: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      isAi: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await api.askAIAssistant(text);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: res.answer,
        isAi: true,
        timestamp: new Date(),
        actionType: res.actionType
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: err.message || "I couldn't retrieve the information right now. Please try again later.",
        isAi: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: Date.now().toString(),
        text: "Conversation cleared. How can I assist you?",
        isAi: true,
        timestamp: new Date()
      }
    ]);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
            aria-label="Open AI Assistant"
          >
            <Bot className="w-7 h-7" />
          </button>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200" style={{ height: '600px', maxHeight: 'calc(100vh - 48px)' }}>
          
          {/* Header */}
          <div className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div>
                <h3 className="font-bold text-sm">AI HR Assistant</h3>
                <p className="text-[10px] text-indigo-200 font-medium">Internal Corporate Data Access</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={handleClear}
                className="p-1.5 hover:bg-indigo-700 rounded-lg transition text-indigo-100"
                title="Clear Conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button 
                onClick={handleClose}
                className="p-1.5 hover:bg-indigo-700 rounded-lg transition text-indigo-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-50 dark:bg-slate-950/50 relative">
            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} onNavigate={(tab) => {
                onNavigate(tab);
                handleClose();
              }} />
            ))}
            
            {messages.length === 1 && (
              <SuggestedQuestions onSelect={(q) => handleSend(q)} />
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs px-2 mt-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Assistant is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputValue);
              }}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about attendance, leaves, payroll..."
                disabled={isLoading}
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
