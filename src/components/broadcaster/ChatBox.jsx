import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Users, MessageCircle, Languages, Loader2, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/components/AuthContext';
import IcebreakerPrompts from '../session/IcebreakerPrompts';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function ChatBox({ broadcasterId, currentUser, broadcaster }) {
  const { language, languages } = useLanguage();
  const { user: authUser } = useAuth();
  const autoTranslateEnabled = authUser?.auto_translate_enabled !== false;
  const [message, setMessage] = useState('');
  const [translating, setTranslating] = useState(false);
  const [translatedMessages, setTranslatedMessages] = useState({});
  const [activeView, setActiveView] = useState('chat');
  const queryClient = useQueryClient();

  const { data: messages, refetch } = useQuery({
    queryKey: ['chatMessages', broadcasterId],
    queryFn: async () => {
      const msgs = await base44.entities.ChatMessage.filter(
        { broadcaster_id: broadcasterId, is_private: false },
        '-created_date',
        50
      );
      return msgs.reverse();
    },
    enabled: !!broadcasterId,
    refetchInterval: 2000,
    initialData: [],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageText) => {
      await base44.entities.ChatMessage.create({
        broadcaster_id: broadcasterId,
        sender_id: currentUser.id,
        sender_name: currentUser.full_name,
        message: messageText,
        is_private: false
      });

      try {
        await base44.functions.invoke('moderateContent', {
          content: messageText,
          contentType: 'chat_message',
          userId: currentUser.id,
          broadcasterId: broadcasterId
        });
      } catch (error) {
        console.log('Moderation check initiated');
      }
    },
    onSuccess: () => {
      refetch();
      setMessage('');
    },
  });

  // Auto-translate messages
  useEffect(() => {
    if (!autoTranslateEnabled || !messages || messages.length === 0) {
      setTranslatedMessages({});
      return;
    }

    const translateNewMessages = async () => {
      const languageName = languages.find(l => l.code === language)?.name || 'English';
      
      // Only translate messages that haven't been translated yet
      const newMessages = messages.filter(msg => !translatedMessages[msg.id]);
      
      if (newMessages.length === 0) return;

      setTranslating(true);
      const translations = { ...translatedMessages };

      try {
        for (const msg of newMessages) {
          try {
            const translated = await base44.integrations.Core.InvokeLLM({
              prompt: `Translate this message to ${languageName}. If the message is already in ${languageName}, return it unchanged. Only return the translation, nothing else:\n\n${msg.message}`,
              add_context_from_internet: false
            });
            translations[msg.id] = translated;
          } catch (error) {
            console.error('Translation error for message:', msg.id, error);
            translations[msg.id] = msg.message;
          }
        }
        setTranslatedMessages(translations);
      } catch (error) {
        console.error('Translation error:', error);
      } finally {
        setTranslating(false);
      }
    };

    translateNewMessages();
  }, [messages?.length, autoTranslateEnabled, language]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !currentUser) return;

    sendMessageMutation.mutate(message.trim());
  };

  const uniqueMembers = React.useMemo(() => {
    if (!messages) return [];
    
    const memberMap = new Map();
    messages.forEach(msg => {
      if (!memberMap.has(msg.sender_id)) {
        memberMap.set(msg.sender_id, {
          id: msg.sender_id,
          name: msg.sender_name,
          lastActive: msg.created_date
        });
      } else {
        const existing = memberMap.get(msg.sender_id);
        if (new Date(msg.created_date) > new Date(existing.lastActive)) {
          memberMap.set(msg.sender_id, {
            ...existing,
            lastActive: msg.created_date
          });
        }
      }
    });
    
    return Array.from(memberMap.values());
  }, [messages]);

  const getDisplayMessage = (msg) => {
    if (!autoTranslateEnabled) return msg.message;
    return translatedMessages[msg.id] || msg.message;
  };

  return (
    <Card className="shadow-2xl border-2" style={{ borderColor: '#00BFFF' }}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => {
              const views = ['chat', 'members', 'icebreaker'];
              const currentIndex = views.indexOf(activeView);
              const prevIndex = (currentIndex - 1 + views.length) % views.length;
              setActiveView(views[prevIndex]);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all hover:scale-110 animate-pulse"
            aria-label="Previous"
            style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
          >
            <ChevronLeft className="w-5 h-5" style={{ color: '#0055A4' }} />
          </button>

          <div className="flex items-center gap-2 flex-1 justify-center">
            {activeView === 'chat' ? (
              <>
                <MessageCircle className="w-5 h-5" style={{ color: '#0055A4' }} />
                <h3 className="text-lg font-extrabold" style={{ color: '#0055A4' }}>Public Chat</h3>
              </>
            ) : activeView === 'members' ? (
              <>
                <Users className="w-5 h-5" style={{ color: '#0055A4' }} />
                <h3 className="text-lg font-extrabold" style={{ color: '#0055A4' }}>Members ({uniqueMembers.length})</h3>
              </>
            ) : (
              <>
                <h3 className="text-lg font-extrabold" style={{ color: '#0055A4' }}>Icebreaker</h3>
                {activeView === 'icebreaker' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const refreshEvent = new CustomEvent('refreshIcebreaker');
                      window.dispatchEvent(refreshEvent);
                    }}
                    className="hover:bg-blue-50 h-6 w-6 p-0 ml-2"
                  >
                    <RefreshCw className="w-4 h-4" style={{ color: '#00BFFF' }} />
                  </Button>
                )}
              </>
            )}
          </div>

          <button
            onClick={() => {
              const views = ['chat', 'members', 'icebreaker'];
              const currentIndex = views.indexOf(activeView);
              const nextIndex = (currentIndex + 1) % views.length;
              setActiveView(views[nextIndex]);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all hover:scale-110 animate-pulse"
            aria-label="Next"
            style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
          >
            <ChevronRight className="w-5 h-5" style={{ color: '#0055A4' }} />
          </button>
        </div>

        {autoTranslateEnabled && activeView === 'chat' && (
          <Badge variant="outline" className="font-semibold text-xs mb-4" style={{ borderColor: '#00BFFF', color: '#0055A4' }}>
            <Languages className="w-3 h-3 mr-1" />
            {translating ? 'Translating...' : 'Auto-translate ON'}
          </Badge>
        )}

        {activeView === 'icebreaker' && broadcaster ? (
          <div className="h-96">
            <IcebreakerPrompts broadcaster={broadcaster} sessionType="video" />
          </div>
        ) : activeView === 'chat' ? (
          <div>
            <div className="h-96 overflow-y-auto mb-4 space-y-3 bg-gray-50 rounded-lg p-4">
              {!messages || messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageCircle className="w-12 h-12 mb-3" style={{ color: '#87CEEB' }} />
                  <p className="font-semibold" style={{ color: '#4A90E2' }}>
                    No messages yet. Start the conversation!
                  </p>
                </div>
              ) : (
                <>
                  {translating && (
                    <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 rounded-lg">
                      <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#0055A4' }} />
                      <span className="text-sm font-semibold" style={{ color: '#0055A4' }}>
                        Translating new messages...
                      </span>
                    </div>
                  )}
                  {messages.map((msg) => {
                    return (
                      <div key={msg.id} className="flex justify-start">
                        <div className="max-w-[75%]">
                          <div className="flex items-center gap-2 mb-1 justify-start">
                            <span className="text-xs font-bold" style={{ color: '#0055A4' }}>
                              {msg.sender_name}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium break-words" style={{ color: '#000000' }}>{getDisplayMessage(msg)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {currentUser ? (
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 font-semibold"
                  maxLength={200}
                />
                <Button
                  type="submit"
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  className="font-bold shadow-lg"
                  style={{ backgroundColor: '#0055A4' }}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            ) : (
              <div className="text-center p-4 rounded-lg border-2" style={{ borderColor: '#87CEEB', backgroundColor: '#F0F9FF' }}>
                <p className="text-sm font-semibold" style={{ color: '#4A90E2' }}>
                  Sign in to join the conversation
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="h-96 overflow-y-auto space-y-2">
            {uniqueMembers.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border-2 hover:bg-blue-50 transition-colors" style={{ borderColor: '#E0F4FF' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#0055A4' }}>
                  {member.name[0]}
                </div>
                <div className="flex-1">
                  <p className="font-bold" style={{ color: '#0055A4' }}>{member.name}</p>
                  <p className="text-xs text-gray-500">
                    Active {formatDistanceToNow(new Date(member.lastActive), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}