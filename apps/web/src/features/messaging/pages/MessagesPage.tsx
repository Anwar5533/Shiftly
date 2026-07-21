import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, MoreVertical, Phone, Video } from 'lucide-react';
import { messagingApi } from '../api/messaging.api';
import type { MockConversation, MockMessage } from '../api/messaging.api';

export default function MessagesPage(): React.ReactElement {
  const [conversations, setConversations] = useState<MockConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MockMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [_isSending, setIsSending] = useState(false);
  const isSendingRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const portal = localStorage.getItem('activePortal') || 'worker';
        const data = await messagingApi.getConversations(portal);
        setConversations(data);
        if (data.length > 0) {
          setActiveConvId(data[0].id);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!activeConvId) return;
    const fetchMessages = async () => {
      const data = await messagingApi.getMessages(activeConvId);
      setMessages(data);
      await messagingApi.markAsRead(activeConvId);
      setConversations(prev => prev.map(c => c.id === activeConvId ? { ...c, unreadCount: 0 } : c));
    };
    fetchMessages();
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content || !activeConvId || isSendingRef.current) return;
    
    isSendingRef.current = true;
    setIsSending(true);
    // Clear immediately to prevent double submissions visually
    setNewMessage('');
    
    try {
      const sentMsg = await messagingApi.sendMessage(activeConvId, content);
      setMessages(prev => [...prev, sentMsg]);
      setConversations(prev => {
        const convs = [...prev];
        const idx = convs.findIndex(c => c.id === activeConvId);
        if (idx !== -1) {
          convs[idx].lastMessage = sentMsg.content;
          convs[idx].lastMessageTime = sentMsg.timestamp;
        }
        return convs;
      });
    } finally {
      isSendingRef.current = false;
      setIsSending(false);
    }
  };

  const activeConv = conversations.find(c => c.id === activeConvId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 h-[calc(100vh-120px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex h-[calc(100vh-140px)] max-h-[800px]">
      
      {/* Conversations List (Left Pane) */}
      <div className="w-full md:w-80 lg:w-96 border-r border-border flex flex-col bg-background/50">
        <div className="p-4 border-b border-border bg-card">
          <h2 className="text-xl font-bold text-foreground mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search messages..." 
              className="w-full pl-9 pr-4 py-2 bg-muted border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => setActiveConvId(conv.id)}
              className={`w-full text-left p-4 flex items-center gap-4 transition-colors border-b border-border/50 hover:bg-muted ${
                activeConvId === conv.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'
              }`}
            >
              <div className="relative">
                {conv.otherUser.avatarUrl ? (
                  <img src={conv.otherUser.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover border border-border" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg border border-primary/20">
                    {conv.otherUser.name.charAt(0)}
                  </div>
                )}
                {conv.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-card">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold text-foreground truncate">{conv.otherUser.name}</h3>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                  {conv.lastMessage}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area (Right Pane) */}
      {activeConv ? (
        <div className="hidden md:flex flex-1 flex-col bg-background/30 relative">
          <div className="p-4 border-b border-border bg-card flex justify-between items-center z-10 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {activeConv.otherUser.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{activeConv.otherUser.name}</h3>
                <p className="text-xs text-muted-foreground capitalize">{activeConv.otherUser.role.toLowerCase()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <button className="p-2 hover:bg-muted hover:text-foreground rounded-full transition-colors"><Phone className="w-5 h-5" /></button>
              <button className="p-2 hover:bg-muted hover:text-foreground rounded-full transition-colors"><Video className="w-5 h-5" /></button>
              <button className="p-2 hover:bg-muted hover:text-foreground rounded-full transition-colors"><MoreVertical className="w-5 h-5" /></button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4 relative">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, var(--foreground) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            {messages.map((msg, i) => {
              const isMe = msg.senderId === 'me';
              const showAvatar = i === 0 || messages[i-1].senderId !== msg.senderId;
              
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                  <div className={`flex max-w-[75%] gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isMe && showAvatar && (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center text-primary font-bold text-xs self-end mb-1">
                        {activeConv.otherUser.name.charAt(0)}
                      </div>
                    )}
                    {!isMe && !showAvatar && <div className="w-8 flex-shrink-0"></div>}
                    
                    <div>
                      <div 
                        className={`px-4 py-2.5 rounded-2xl relative shadow-sm ${
                          isMe 
                            ? 'bg-primary text-primary-foreground rounded-br-sm' 
                            : 'bg-card border border-border text-foreground rounded-bl-sm'
                        }`}
                      >
                        <p className="text-[15px] leading-relaxed">{msg.content}</p>
                      </div>
                      <span className={`text-[10px] text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity block ${isMe ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 bg-card border-t border-border shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
            <form onSubmit={handleSendMessage} className="flex items-end gap-2 relative">
              <textarea 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 max-h-32 min-h-[48px] bg-muted border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none leading-relaxed text-foreground"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className="h-12 w-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-brand flex-shrink-0"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-background/50 text-muted-foreground">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Send className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="font-medium text-lg text-foreground">Your Messages</p>
          <p className="text-sm">Select a conversation to start chatting</p>
        </div>
      )}
    </div>
  );
}
