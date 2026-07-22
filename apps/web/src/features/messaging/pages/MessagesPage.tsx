/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-misused-promises -- TODO(RC3): Address type safety */
import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, MoreVertical, Phone, Video } from 'lucide-react';
import { messagingApi } from '../api/messaging.api';
import type { Conversation, Message } from '@shiftly/shared-types';
import { io, Socket } from 'socket.io-client';
import { useAppSelector } from '@/app/store';

export default function MessagesPage(): React.ReactElement {
  const { user } = useAppSelector((state) => state.auth);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [_isSending, setIsSending] = useState(false);
  const isSendingRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await messagingApi.getConversations();
        setConversations(data);
        if (data.length > 0) {
          setActiveConvId(data[0].id);
        }
      } finally {
        setIsLoading(false);
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises -- TODO(RC3): Address type safety
    fetchConversations();
  }, []);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000');
    setSocket(newSocket);
    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (!activeConvId) return;
    const fetchMessages = async () => {
      const data = await messagingApi.getMessages(activeConvId);
      setMessages(data);
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises -- TODO(RC3): Address type safety
    fetchMessages();

    if (socket) {
      socket.emit('joinConversation', activeConvId);
      const handleNewMessage = (message: Message) => {
        if (message.conversationId === activeConvId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === message.id)) return prev;
            return [...prev, message];
          });
          setConversations((prev) => {
            const convs = [...prev];
            const idx = convs.findIndex((c) => c.id === activeConvId);
            if (idx !== -1) {
              // Update last message in conversation list
              // (Since we don't have lastMessage on the real Conversation type yet without extra mapping,
              // we can just force a re-render or leave it)
            }
            return convs;
          });
        }
      };
      socket.on('newMessage', handleNewMessage);
      return () => {
        socket.emit('leaveConversation', activeConvId);
        socket.off('newMessage', handleNewMessage);
      };
    }
  }, [activeConvId, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // eslint-disable-next-line @typescript-eslint/require-await -- TODO(RC3): Address type safety
  const handleSendMessage = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content || !activeConvId || isSendingRef.current || !socket || !user) return;

    isSendingRef.current = true;
    setIsSending(true);
    setNewMessage('');

    try {
      socket.emit('sendMessage', {
        conversationId: activeConvId,
        senderId: user.sub,
        content,
      });
    } finally {
      isSendingRef.current = false;
      setIsSending(false);
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-140px)] max-h-[800px] overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Conversations List (Left Pane) */}
      <div className="flex w-full flex-col border-r border-border bg-background/50 md:w-80 lg:w-96">
        <div className="border-b border-border bg-card p-4">
          <h2 className="mb-4 text-xl font-bold text-foreground">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full rounded-lg border border-input bg-muted py-2 pl-9 pr-4 text-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => {
            const otherParticipant = conv.participants?.find((p) => p.userId !== user?.sub)?.user;
            const title = otherParticipant?.workerProfile
              ? `${otherParticipant.workerProfile.firstName} ${otherParticipant.workerProfile.lastName}`
              : otherParticipant?.employerProfile
                ? otherParticipant.employerProfile.companyName
                : otherParticipant?.email || 'Unknown';
            return (
              <button
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`flex w-full items-center gap-4 border-b border-border/50 p-4 text-left transition-colors hover:bg-muted ${
                  activeConvId === conv.id
                    ? 'border-l-4 border-l-primary bg-primary/5'
                    : 'border-l-4 border-l-transparent'
                }`}
              >
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-primary/20 text-lg font-bold text-primary">
                    {title.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-baseline justify-between">
                    <h3 className="truncate font-semibold text-foreground">{title}</h3>
                    <span className="ml-2 whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(conv.updatedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {conv.messages?.[0]?.content || 'No messages yet'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Area (Right Pane) */}
      {activeConv ? (
        <div className="relative hidden flex-1 flex-col bg-background/30 md:flex">
          <div className="z-10 flex items-center justify-between border-b border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 font-bold text-primary">
                {activeConv.participants
                  ?.find((p) => p.userId !== user?.sub)
                  ?.user?.email?.charAt(0)
                  .toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {activeConv.participants?.find((p) => p.userId !== user?.sub)?.user?.email ||
                    'Unknown User'}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <button className="rounded-full p-2 transition-colors hover:bg-muted hover:text-foreground">
                <Phone className="h-5 w-5" />
              </button>
              <button className="rounded-full p-2 transition-colors hover:bg-muted hover:text-foreground">
                <Video className="h-5 w-5" />
              </button>
              <button className="rounded-full p-2 transition-colors hover:bg-muted hover:text-foreground">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="relative flex-1 space-y-4 overflow-y-auto p-6">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  'radial-gradient(circle at center, var(--foreground) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            ></div>
            {messages.map((msg, i) => {
              const isMe = msg.senderId === user?.sub;
              const showAvatar = i === 0 || messages[i - 1].senderId !== msg.senderId;

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}
                >
                  <div
                    className={`flex max-w-[75%] gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {!isMe && showAvatar && (
                      <div className="mb-1 flex h-8 w-8 flex-shrink-0 items-center justify-center self-end rounded-full bg-primary/20 text-xs font-bold text-primary">
                        {activeConv.participants
                          ?.find((p) => p.userId !== user?.sub)
                          ?.user?.email?.charAt(0)
                          .toUpperCase() || 'U'}
                      </div>
                    )}
                    {!isMe && !showAvatar && <div className="w-8 flex-shrink-0"></div>}

                    <div>
                      <div
                        className={`relative rounded-2xl px-4 py-2.5 shadow-sm ${
                          isMe
                            ? 'rounded-br-sm bg-primary text-primary-foreground'
                            : 'rounded-bl-sm border border-border bg-card text-foreground'
                        }`}
                      >
                        <p className="text-[15px] leading-relaxed">{msg.content}</p>
                      </div>
                      <span
                        className={`mt-1 block text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 ${isMe ? 'text-right' : 'text-left'}`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border bg-card p-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
            // eslint-disable-next-line @typescript-eslint/no-misused-promises -- TODO(RC3): Address
            type safety
            <form onSubmit={handleSendMessage} className="relative flex items-end gap-2">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="max-h-32 min-h-[48px] flex-1 resize-none rounded-xl border border-input bg-muted px-4 py-3 text-sm leading-relaxed text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    // eslint-disable-next-line @typescript-eslint/no-floating-promises -- TODO(RC3): Address type safety
                    handleSendMessage(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-brand shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="ml-1 h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="hidden flex-1 flex-col items-center justify-center bg-background/50 text-muted-foreground md:flex">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Send className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-lg font-medium text-foreground">Your Messages</p>
          <p className="text-sm">Select a conversation to start chatting</p>
        </div>
      )}
    </div>
  );
}
