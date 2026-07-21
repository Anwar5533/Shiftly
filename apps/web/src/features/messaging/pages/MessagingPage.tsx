import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import { chatApi } from '../api/chat.api';
import type { AssistantMessage } from '@shiftly/shared-types';

export function MessagingPage() {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your Shiftly AI Assistant. How can I help you today?',
      timestamp: new Date().toISOString(),
    },
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
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage(userMsg.content, messages);
      setMessages((prev) => [...prev, response]);
    } catch (error) {
      console.error('Failed to get AI response', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I am having trouble connecting right now. Please try again later.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-4xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-3 border-b border-border bg-muted/10 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
          <Bot className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Shiftly AI Assistant</h2>
          <p className="text-xs text-muted-foreground">Always here to help</p>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="mr-3 mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                  isUser
                    ? 'rounded-tr-sm bg-primary text-primary-foreground'
                    : 'rounded-tl-sm border border-border bg-muted text-foreground'
                }`}
              >
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.content}</p>
                <span
                  className={`mt-2 block text-[10px] ${isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="mr-3 mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-border bg-muted px-5 py-3">
              <div className="h-2 w-2 animate-bounce rounded-full bg-primary/40"></div>
              <div
                className="h-2 w-2 animate-bounce rounded-full bg-primary/60"
                style={{ animationDelay: '150ms' }}
              ></div>
              <div
                className="h-2 w-2 animate-bounce rounded-full bg-primary"
                style={{ animationDelay: '300ms' }}
              ></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border bg-card p-4">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 rounded-full border border-input bg-background px-5 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="ml-1 h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
