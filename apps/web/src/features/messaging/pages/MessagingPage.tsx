import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import { chatApi } from '../api/chat.api';
import type { AssistantMessage } from '@shiftly/shared-types';

export function MessagingPage() {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your Shiftly AI Assistant. How can I help you today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg: AssistantMessage = {
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage(userMsg.content, messages);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Failed to get AI response', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I am having trouble connecting right now. Please try again later.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden max-w-4xl mx-auto">
      <div className="p-4 border-b border-border flex items-center gap-3 bg-muted/10">
        <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-semibold text-lg text-foreground">Shiftly AI Assistant</h2>
          <p className="text-xs text-muted-foreground">Always here to help</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div 
                className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                  isUser 
                    ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                    : 'bg-muted border border-border text-foreground rounded-tl-sm'
                }`}
              >
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <span className={`text-[10px] block mt-2 ${isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-3 mt-1 flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-muted border border-border rounded-2xl rounded-tl-sm px-5 py-3 flex items-center gap-1">
              <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border bg-card">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 bg-background border border-input rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm flex-shrink-0"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
