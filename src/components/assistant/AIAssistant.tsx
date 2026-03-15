'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Bot, Sparkles } from 'lucide-react';
import { AIChatMessage } from '@/types';
import { mockAIResponses } from '@/data/mockLevels';

interface AIAssistantProps {
  currentTopic?: string;
}

export default function AIAssistant({ currentTopic }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '你好！我是你的 AI 学习助手\n\n有什么想问的吗？',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getAIResponse = (userMessage: string): string => {
    const lower = userMessage.toLowerCase();
    for (const [keyword, response] of Object.entries(mockAIResponses)) {
      if (keyword !== 'default' && lower.includes(keyword)) return response;
    }
    return mockAIResponses['default'];
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: AIChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: getAIResponse(userMsg.content),
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  };

  return (
    <>
      {/* FAB button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92, y: 3 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl flex items-center justify-center z-40 cursor-pointer text-white bg-primary"
        style={{ boxShadow: '0 5px 0 #6B47C6', border: '2px solid #6B47C6' }}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-80 h-[450px] flex flex-col z-50 overflow-hidden rounded-3xl bg-white border-2 border-duo-gray"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b-2 border-duo-gray">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/20"
                  style={{ boxShadow: '0 2px 0 #D4C5F5' }}
                >
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-duo-text">AI 学习助手</h3>
                  <p className="text-xs font-semibold text-duo-grayDark">随时为你解答疑惑</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer bg-muted"
              >
                <X className="w-4 h-4 text-duo-grayDark" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-muted">
              {messages.map(message => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-sm font-semibold ${
                      message.role === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-background text-duo-text border-2 border-duo-gray'
                    }`}
                    style={
                      message.role === 'user'
                        ? { borderRadius: '16px 16px 4px 16px' }
                        : { borderRadius: '16px 16px 16px 4px' }
                    }
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="p-3 rounded-2xl bg-white border-2 flex gap-1 border-duo-gray">
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <motion.span
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay }}
                        className="w-2 h-2 rounded-full bg-primary"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Current topic badge */}
            {currentTopic && (
              <div className="px-4 py-2 border-t-2 border-duo-gray bg-primary/20">
                <p className="text-xs font-extrabold flex items-center gap-1.5 text-primary">
                  <Sparkles className="w-3 h-3" />
                  当前学习：{currentTopic}
                </p>
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t-2 bg-white border-duo-gray">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="输入你的问题..."
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 focus:outline-none border-duo-gray text-duo-text bg-muted"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.93, y: 2 }}
                  onClick={handleSend}
                  className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer text-white flex-shrink-0 bg-primary"
                  style={{ boxShadow: '0 3px 0 #6B47C6' }}
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
