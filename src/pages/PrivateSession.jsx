import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Video, Phone, MessageSquare, Clock, Send, AlertCircle, Maximize, Volume2, VolumeX, Minimize, Sliders, Languages, Loader2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import { formatDistanceToNow } from "date-fns";
import IcebreakerPrompts from '../components/session/IcebreakerPrompts';
import CallControls from '../components/calls/CallControls';

export default function PrivateSession() {
  const { t, language, languages } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('sessionId');
  const [user, setUser] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionEnded, setSessionEnded] = useState(false);
  // Renamed 'message' to 'currentMessage' based on the outline
  const [currentMessage, setCurrentMessage] = useState('');
  const [showControls, setShowControls] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([80]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [streamLoaded, setStreamLoaded] = useState(false);
  const [videoQuality, setVideoQuality] = useState('medium');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translatedMessages, setTranslatedMessages] = useState({});
  // New states introduced based on the outline's reference to 'translationEnabled' and 'translationCache'
  const [inputTranslationEnabled, setInputTranslationEnabled] = useState(false); // Assuming a separate toggle for input translation
  const [inputTranslationCache, setInputTranslationCache] = useState({});
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: session, refetch: refetchSession } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      const sessions = await base44.entities.Session.list();
      return sessions.find(s => s.id === sessionId);
    },
    enabled: !!sessionId,
    refetchInterval: 5000,
  });

  const { data: broadcaster } = useQuery({
    queryKey: ['broadcaster', session?.broadcaster_id],
    queryFn: async () => {
      const users = await base44.entities.User.list();
      return users.find(u => u.id === session.broadcaster_id);
    },
    enabled: !!session?.broadcaster_id,
  });

  const { data: messages, refetch: refetchMessages } = useQuery({
    queryKey: ['sessionMessages', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      return await base44.entities.ChatMessage.filter(
        { session_id: sessionId, is_private: true },
        '-created_date',
        50
      );
    },
    enabled: !!sessionId && session?.session_type === 'text',
    refetchInterval: 2000,
    initialData: [],
  });

  const autoTranslateEnabled = user?.auto_translate_enabled !== false;

  // Variable from the outline, assuming it's for displaying a translated version of the user's input.
  // It relies on inputTranslationEnabled and inputTranslationCache, which are newly added states.
  const translatedMessage = inputTranslationEnabled && currentMessage && inputTranslationCache[currentMessage] 
    ? inputTranslationCache[currentMessage] 
    : currentMessage;

  const userRole = user?.user_role || 'guest';
  const isCustomer = user?.id === session?.customer_id;
  const isBroadcaster = user?.id === session?.broadcaster_id;
  
  // Generate VDO.ninja URLs based on role
  const vdoRoomId = session?.vdo_room_id || `session${sessionId?.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12) || 'default'}`;
  
  const getVdoUrl = () => {
    if (!session) return '';
    
    const audioParam = session.session_type === 'audio' ? '&audioonly' : '';
    
    if (isBroadcaster && ['streamer', 'admin'].includes(userRole)) {
      return `https://vdo.ninja/?push=${vdoRoomId}&director=${vdoRoomId}&scene&autostart&webcam${audioParam}${getQualityParams(videoQuality)}`;
    }
    
    return `https://vdo.ninja/?view=${vdoRoomId}&scene&autostart&webcam=0${audioParam}${getQualityParams(videoQuality)}`;
  };

  const viewUrl = getVdoUrl();

  // Auto-translate messages when language changes or when translation is enabled
  useEffect(() => {
    if (!autoTranslateEnabled || language === 'en' || !messages || messages.length === 0) {
      setTranslatedMessages({});
      return;
    }

    const translateMessages = async () => {
      setTranslating(true);
      try {
        const languageName = languages.find(l => l.code === language)?.name || language;
        const translations = {};

        for (const msg of messages) {
          if (!translatedMessages[msg.id]) {
            try {
              const translated = await base44.integrations.Core.InvokeLLM({
                prompt: `Translate this message to ${languageName}. Only return the translation, nothing else:\n\n${msg.message}`,
                add_context_from_internet: false
              });
              translations[msg.id] = translated;
            } catch (error) {
              translations[msg.id] = msg.message;
            }
          } else {
            translations[msg.id] = translatedMessages[msg.id];
          }
        }

        setTranslatedMessages(translations);
      } catch (error) {
        console.error('Translation error:', error);
      } finally {
        setTranslating(false);
      }
    };

    translateMessages();
  }, [autoTranslateEnabled, language, messages?.length, translatedMessages, languages]); // Added translatedMessages and languages to deps for linting

  // Replaced the useMutation for sending messages with a direct async function, as per outline
  const sendMessage = async () => {
    if (!user || !currentMessage?.trim() || !session) return;
    
    const messageText = currentMessage.trim();
    setCurrentMessage('');
    
    try {
      await base44.entities.ChatMessage.create({
        broadcaster_id: session.broadcaster_id,
        sender_id: user.id,
        sender_name: user.full_name || 'User', // Added 'User' fallback for sender_name
        message: messageText,
        is_private: true,
        session_id: sessionId
      });
      
      // Invalidate the specific query for session messages to trigger a refetch
      queryClient.invalidateQueries(['sessionMessages', sessionId]); 
    } catch (error) {
      console.error('Failed to send message:', error);
      setCurrentMessage(messageText); // Revert message content on error
    }
  };

  useEffect(() => {
    if (!session) return;
    
    const startTime = session.started_at ? new Date(session.started_at) : new Date();
    const durationMs = session.duration_minutes * 60 * 1000;
    
    const timer = setInterval(() => {
      const now = new Date();
      const elapsed = now - startTime;
      const remaining = Math.max(0, durationMs - elapsed);
      
      setTimeLeft(Math.floor(remaining / 1000));
      
      if (remaining <= 0) {
        setSessionEnded(true);
        clearInterval(timer);
        base44.entities.Session.update(sessionId, { status: 'completed', ended_at: new Date().toISOString() });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [session, sessionId]);

  const toggleFullscreen = () => {
    const element = document.getElementById('video-container');
    if (!document.fullscreenElement) {
      element.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const getQualityParams = (quality) => {
    switch (quality) {
      case 'low':
        return '&width=640&height=360&bitrate=500';
      case 'medium':
        return '&width=1280&height=720&bitrate=1500';
      case 'high':
        return '&width=1920&height=1080&bitrate=3000';
      default:
        return '&width=1280&height=720&bitrate=1500';
    }
  };

  const getDisplayMessage = (msg) => {
    if (!autoTranslateEnabled || language === 'en') return msg.message;
    return translatedMessages[msg.id] || msg.message;
  };

  const handleEndCall = () => {
    setSessionEnded(true);
  };

  if (!session || !broadcaster) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#0055A4' }}></div>
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percentageLeft = (timeLeft / (session.duration_minutes * 60)) * 100;

  const getSessionIcon = () => {
    switch (session.session_type) {
      case 'video': return Video;
      case 'audio': return Phone;
      case 'text': return MessageSquare;
      default: return Video;
    }
  };

  const SessionIcon = getSessionIcon();

  const reversedMessages = [...messages].reverse();

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
      <div className="max-w-6xl mx-auto">
        {sessionEnded && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">{t('privateSession.completed')}</h2>
                <p className="text-gray-600">
                  {t('privateSession.thankYou')}
                </p>
              </div>

              <Button
                onClick={() => window.location.href = '/'}
                style={{ backgroundColor: '#0055A4' }}
              >
                {t('privateSession.returnHome')}
              </Button>
            </CardContent>
          </Card>
        )}

        {session.status === 'active' && !sessionEnded && (
          <div className="grid lg:grid-cols-[65%,35%] gap-6">
            <div className="space-y-6">
              {session.session_type === 'text' ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={broadcaster.photo_1}
                          alt={broadcaster.full_name}
                          className="w-12 h-12 rounded-full object-cover ring-2"
                          style={{ ringColor: '#0055A4' }}
                        />
                        <div>
                          <p className="font-bold text-lg">{broadcaster.full_name}</p>
                          <p className="text-sm text-gray-600">{t('privateSession.textSession')}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${
                          timeLeft < 60 ? 'text-red-600 animate-pulse' : 
                          timeLeft < 300 ? 'text-orange-600' : 
                          'text-green-600'
                        }`}>
                          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </div>
                        <p className="text-xs text-gray-600">{t('privateSession.timeRemaining')}</p>
                      </div>
                    </div>

                    {autoTranslateEnabled && language !== 'en' && (
                      <div className="mb-3 flex justify-center">
                        <Badge variant="outline" className="font-semibold text-xs" style={{ borderColor: '#00BFFF', color: '#0055A4' }}>
                          <Languages className="w-3 h-3 mr-1" />
                          {translating ? 'Translating...' : 'Auto-translated'}
                        </Badge>
                      </div>
                    )}

                    <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                      <div 
                        className={`absolute left-0 top-0 h-full transition-all duration-1000 ${
                          percentageLeft < 10 ? 'bg-red-500' : 
                          percentageLeft < 25 ? 'bg-orange-500' : 
                          'bg-green-500'
                        }`}
                        style={{ width: `${percentageLeft}%` }}
                      />
                    </div>

                    {timeLeft < 60 && timeLeft > 0 && (
                      <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-sm text-red-800 font-semibold">
                          Less than 1 minute remaining!
                        </p>
                      </div>
                    )}
                    
                    <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto mb-4">
                      {translating && reversedMessages.length > 0 && (
                        <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 rounded-lg mb-3">
                          <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#0055A4' }} />
                          <span className="text-sm font-semibold" style={{ color: '#0055A4' }}>
                            Translating messages...
                          </span>
                        </div>
                      )}
                      {reversedMessages.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">
                          Start your private conversation with {broadcaster.full_name}
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {reversedMessages.map((msg) => {
                            return (
                              <div key={msg.id} className="flex justify-start">
                                <div className="max-w-[70%]">
                                  <div className="flex items-center gap-2 mb-1 justify-start">
                                    <span className="text-xs font-semibold" style={{ color: '#0055A4' }}>
                                      {msg.sender_name}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-sm break-words" style={{ color: '#000000' }}>{getDisplayMessage(msg)}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        sendMessage(); // Call the new sendMessage function
                      }}
                      className="flex gap-2"
                    >
                      <Input
                        value={currentMessage} // Use currentMessage state for input
                        onChange={(e) => setCurrentMessage(e.target.value)} // Update currentMessage state
                        placeholder="Type your message..."
                        className="flex-1"
                        maxLength={500}
                      />
                      <Button
                        type="submit"
                        disabled={!currentMessage.trim() || !user || !session} // Updated disabled condition
                        style={{ backgroundColor: '#0055A4' }}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <div 
                  id="video-container"
                  className="relative bg-black rounded-xl overflow-hidden shadow-2xl group"
                  onMouseEnter={() => setShowControls(true)}
                  onMouseLeave={() => setShowControls(false)}
                >
                  <div className="aspect-video relative">
                    <iframe
                      key={`${vdoRoomId}-${videoQuality}`}
                      src={viewUrl}
                      className="w-full h-full border-0"
                      allow="camera; microphone; fullscreen; display-capture; autoplay; picture-in-picture"
                      allowFullScreen
                      style={{ border: 'none' }}
                    />

                    <div className="absolute top-4 right-4 z-30 bg-black/80 px-4 py-3 rounded-xl shadow-xl">
                      <div className={`text-3xl font-bold text-white ${timeLeft < 60 ? 'animate-pulse text-red-500' : timeLeft < 300 ? 'text-orange-500' : 'text-green-500'}`}>
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                      </div>
                      <p className="text-xs text-gray-400 text-center mt-1">Time Left</p>
                    </div>

                    <div className={`absolute top-4 left-4 z-30 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                      <div className="flex items-center gap-2 bg-black/80 px-4 py-2 rounded-xl shadow-xl">
                        <img
                          src={broadcaster.photo_1}
                          alt={broadcaster.full_name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                        />
                        <div>
                          <p className="text-white font-bold text-sm">{broadcaster.full_name}</p>
                          <p className="text-gray-400 text-xs capitalize">{session.session_type} session</p>
                        </div>
                      </div>
                    </div>

                    {showControls && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6 pointer-events-auto z-30 transition-opacity">
                        <div className="relative h-1 bg-gray-600 rounded-full overflow-hidden mb-4">
                          <div 
                            className={`absolute left-0 top-0 h-full transition-all duration-1000 ${
                              percentageLeft < 10 ? 'bg-red-500' : 
                              percentageLeft < 25 ? 'bg-orange-500' : 
                              'bg-green-500'
                            }`}
                            style={{ width: `${percentageLeft}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={toggleMute}
                              className="bg-white/20 hover:bg-white/30 text-white h-10 w-10 p-0 rounded-full"
                            >
                              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </Button>
                            
                            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                              <Volume2 className="w-4 h-4 text-white" />
                              <Slider
                                value={volume}
                                onValueChange={setVolume}
                                max={100}
                                step={1}
                                className="w-24"
                              />
                              <span className="text-white text-sm font-bold w-8">{volume[0]}%</span>
                            </div>

                            <div className="relative">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setShowQualityMenu(!showQualityMenu)}
                                className="bg-white/20 hover:bg-white/30 text-white h-10 w-10 p-0 rounded-full"
                              >
                                <Sliders className="w-5 h-5" />
                              </Button>
                              
                              {showQualityMenu && (
                                <div className="absolute bottom-full mb-2 right-0 bg-black/95 rounded-lg shadow-2xl p-2 min-w-[160px]">
                                  <p className="text-white text-xs font-bold px-3 py-2 border-b border-gray-700">Video Quality</p>
                                  {['low', 'medium', 'high'].map((quality) => (
                                    <button
                                      key={quality}
                                      onClick={() => {
                                        setVideoQuality(quality);
                                        setShowQualityMenu(false);
                                      }}
                                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                        videoQuality === quality
                                          ? 'bg-white/20 text-white font-bold'
                                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span>
                                          {quality === 'low' && '360p Low'}
                                          {quality === 'medium' && '720p Medium'}
                                          {quality === 'high' && '1080p High'}
                                        </span>
                                        {videoQuality === quality && <span className="text-green-500">✓</span>}
                                      </div>
                                      <span className="text-xs text-gray-500">
                                        {quality === 'low' && 'Low bandwidth'}
                                        {quality === 'medium' && 'Balanced'}
                                        {quality === 'high' && 'Best quality'}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {session.session_type === 'video' && (
                              <div className="flex items-center gap-2 bg-red-600 px-3 py-1.5 rounded-full">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                <span className="text-white text-xs font-bold">● REC</span>
                              </div>
                            )}
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={toggleFullscreen}
                              className="bg-white/20 hover:bg-white/30 text-white h-10 w-10 p-0 rounded-full"
                            >
                              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {timeLeft < 60 && timeLeft > 0 && (
                      <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-40">
                        <div className="bg-red-600 px-6 py-3 rounded-xl shadow-2xl animate-pulse">
                          <p className="text-white font-bold text-base flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            ⚠️ Less than 1 minute remaining!
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Call Controls */}
                    <CallControls session={session} onEndCall={handleEndCall} />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <Card className="shadow-2xl border-4" style={{ borderColor: '#00BFFF' }}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <SessionIcon className="w-10 h-10 text-blue-600" />
                    <div>
                      <p className="font-bold text-xl capitalize">{session.session_type} Session</p>
                      <p className="text-sm text-gray-600">Session ID: {session.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <img
                      src={broadcaster.photo_1}
                      alt={broadcaster.full_name}
                      className="w-12 h-12 rounded-full object-cover ring-2"
                      style={{ ringColor: '#0055A4' }}
                    />
                    <div>
                      <p className="font-bold text-lg">{broadcaster.full_name}</p>
                      <p className="text-sm text-gray-600">{t('privateSession.broadcaster') || 'Broadcaster'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {session.session_type !== 'text' && (
                <IcebreakerPrompts broadcaster={broadcaster} sessionType={session.session_type} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}