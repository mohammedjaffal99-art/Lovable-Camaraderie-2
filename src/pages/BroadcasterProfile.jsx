import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, MapPin, Star, Globe, Users, Calendar, ExternalLink, Video, MessageSquare, Phone, TrendingUp, Lock, Unlock, ChevronLeft, ChevronRight, X, Flag, Sparkles } from "lucide-react";
import { showToast } from "@/components/ui/toast-utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ChatBox from "../components/broadcaster/ChatBox";
import SessionBooking from "../components/broadcaster/SessionBooking";
import StreamPlayer from "../components/broadcaster/StreamPlayer";
import LevelProgress from '../components/broadcaster/LevelProgress';
import IcebreakerPrompts from '../components/session/IcebreakerPrompts';
import StreamerNationalityFlag from '../components/broadcaster/StreamerNationalityFlag';
import { useLanguage } from "@/components/LanguageContext";


const SocialIcons = {
  instagram: (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  tiktok: (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
    </svg>
  ),
  twitter: (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  snapchat: (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.065 2c5.526 0 10.017 4.491 10.017 10.017 0 4.425-2.865 8.18-6.839 9.504-.5.092-.682-.217-.682-.483 0-.237.008-.868.013-1.703 2.782.605 3.369-1.343 3.369-1.343.454-1.158 1.11-1.466 1.11-1.466.908-.62-.069-.608-.069-.608-1.003.07-1.531 1.032-1.531 1.032-.892 1.53-2.341 1.088-2.91.832-.092-.647.35-1.088.636-1.338 2.22-.253 4.555-1.113 4.555-4.951 0-1.093-.39-1.988-1.029-2.688.103-.253.446-1.272-.098-2.65 0 0-.84-.27-2.75 1.026A9.564 9.564 0 0012 6.844c-.85.004-1.705.115-2.504.337-1.909-1.296-2.747-1.027-2.747-1.027-.546 1.379-.202 2.398-.1 2.651-.64.7-1.028 1.595-1.028 2.688 0 3.848 2.339 4.695 4.566 4.943-.286.246-.544.678-.635 1.318-.571.257-2.021.698-2.917-.832-.544-.943-1.529-1.021-1.529-1.021-.973-.006-.064.606-.064.606.65.299 1.105 1.459 1.105 1.459.585 1.782 3.361 1.181 3.361 1.181 0 .834.013 1.626.013 1.847 0 .27-.184.583-.688.483C4.848 20.196 2 16.443 2 12.017 2 6.491 6.49 2 12.065 2z"/>
    </svg>
  )
};

export default function BroadcasterProfile() {
  const { t } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const broadcasterId = urlParams.get('id');
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();
  const [photoGalleryOpen, setPhotoGalleryOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  // Country code mapping for flags
  const getCountryCode = (countryName) => {
    const countryMap = {
      'United States': 'us', 'United Kingdom': 'gb', 'Canada': 'ca', 'Australia': 'au',
      'Germany': 'de', 'France': 'fr', 'Italy': 'it', 'Spain': 'es', 'Netherlands': 'nl',
      'Sweden': 'se', 'Norway': 'no', 'Denmark': 'dk', 'Finland': 'fi', 'Poland': 'pl',
      'Russia': 'ru', 'Ukraine': 'ua', 'Turkey': 'tr', 'Greece': 'gr', 'Portugal': 'pt',
      'Brazil': 'br', 'Mexico': 'mx', 'Argentina': 'ar', 'Colombia': 'co', 'Chile': 'cl',
      'Japan': 'jp', 'China': 'cn', 'South Korea': 'kr', 'India': 'in', 'Thailand': 'th',
      'Vietnam': 'vn', 'Philippines': 'ph', 'Indonesia': 'id', 'Malaysia': 'my',
      'Singapore': 'sg', 'South Africa': 'za', 'Egypt': 'eg', 'Morocco': 'ma',
      'Nigeria': 'ng', 'Kenya': 'ke', 'Israel': 'il', 'Saudi Arabia': 'sa',
      'United Arab Emirates': 'ae', 'Lebanon': 'lb', 'New Zealand': 'nz', 'Ireland': 'ie',
      'Switzerland': 'ch', 'Austria': 'at', 'Belgium': 'be', 'Czech Republic': 'cz',
      'Hungary': 'hu', 'Romania': 'ro', 'Bulgaria': 'bg', 'Croatia': 'hr'
    };
    return countryMap[countryName];
  };

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      console.log('👤 BroadcasterProfile: Current user loaded', {
        userId: u.id,
        email: u.email,
        viewingBroadcasterId: broadcasterId
      });
      setUser(u);
      
      // Track that user viewed this broadcaster
      if (u && broadcasterId) {
        try {
          await base44.functions.invoke('trackViewerInteraction', {
            preference_type: 'broadcaster_view',
            broadcaster_id: broadcasterId,
            weight: 2
          });
        } catch (error) {
          console.log('Failed to track view:', error);
        }
      }
    }).catch(() => setUser(null));
  }, [broadcasterId]);

  const { data: broadcaster, isLoading } = useQuery({
    queryKey: ['broadcaster', broadcasterId],
    queryFn: async () => {
      console.log('🔍 Fetching broadcaster via function:', broadcasterId);
      const response = await base44.functions.invoke('getBroadcaster', { broadcasterId });
      console.log('📊 Broadcaster response:', response.data);
      console.log('🎯 Broadcaster ID for host detection:', response.data.broadcaster?.id);
      return response.data.broadcaster;
    },
    enabled: !!broadcasterId,
  });

  const { data: isFavorited } = useQuery({
    queryKey: ['favorite', user?.id, broadcasterId],
    queryFn: async () => {
      if (!user?.id) return false;
      const favorites = await base44.entities.Favorite.filter({
        user_id: user.id,
        broadcaster_id: broadcasterId
      });
      return favorites.length > 0;
    },
    enabled: !!user?.id && !!broadcasterId,
    initialData: false,
  });

  const { data: favoriteCount } = useQuery({
    queryKey: ['favoriteCount', broadcasterId],
    queryFn: async () => {
      const favorites = await base44.entities.Favorite.filter({ broadcaster_id: broadcasterId });
      return favorites.length;
    },
    enabled: !!broadcasterId,
    initialData: 0,
  });

  const { data: completedSessions } = useQuery({
    queryKey: ['broadcasterSessions', broadcasterId],
    queryFn: async () => {
      if (!broadcasterId) return [];
      return await base44.entities.Session.filter({
        broadcaster_id: broadcasterId,
        status: 'completed'
      }, '-created_date', 10);
    },
    enabled: !!broadcasterId,
    initialData: [],
  });

  const { data: socialLinkPrice } = useQuery({
    queryKey: ['socialLinkPrice'],
    queryFn: async () => {
      const settings = await base44.entities.PlatformSettings.filter({ setting_key: 'pricing_social_link' });
      return settings.length > 0 ? parseFloat(settings[0].setting_value) : 9.99;
    },
    initialData: 9.99,
  });

  const [checkingUnlock, setCheckingUnlock] = React.useState(false);

  const { data: hasUnlocked, refetch: refetchUnlock } = useQuery({
    queryKey: ['socialUnlock', user?.id, broadcasterId],
    queryFn: async () => {
      if (!user?.id || !broadcasterId) return false;

      // Check localStorage first
      const cacheKey = `social_unlock_${user.id}_${broadcasterId}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached === 'true') return true;

      // Check database
      const unlocks = await base44.entities.SocialUnlock.filter({
        user_id: user.id,
        broadcaster_id: broadcasterId
      });

      const isUnlocked = unlocks.length > 0;
      if (isUnlocked) {
        localStorage.setItem(cacheKey, 'true');
      }

      return isUnlocked;
    },
    enabled: !!user?.id && !!broadcasterId,
    initialData: false,
  });

  React.useEffect(() => {
    const sessionId = urlParams.get('session_id');
    if (sessionId && user?.id && broadcasterId && !hasUnlocked) {
      setCheckingUnlock(true);

      base44.functions.invoke('checkSocialUnlock', {
        session_id: sessionId,
        broadcaster_id: broadcasterId
      }).then((response) => {
        if (response.data?.unlocked) {
          const cacheKey = `social_unlock_${user.id}_${broadcasterId}`;
          localStorage.setItem(cacheKey, 'true');
          refetchUnlock();
        }
        setCheckingUnlock(false);
      }).catch((error) => {
        console.error('Unlock check failed:', error);
        setCheckingUnlock(false);
      });
    }
  }, [urlParams.get('session_id'), user?.id, broadcasterId, hasUnlocked]);



  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorited) {
        const favorites = await base44.entities.Favorite.filter({
          user_id: user.id,
          broadcaster_id: broadcasterId
        });
        if (favorites[0]) {
          await base44.entities.Favorite.delete(favorites[0].id);
        }
      } else {
        await base44.entities.Favorite.create({
          user_id: user.id,
          broadcaster_id: broadcasterId
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['favorite', user?.id, broadcasterId]);
      queryClient.invalidateQueries(['favoriteCount', broadcasterId]);
    },
  });

  const reportMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Report.create({
        reporter_id: user.id,
        reported_user_id: broadcasterId,
        reason: reportReason,
        description: reportDescription
      });
    },
    onSuccess: () => {
      showToast.success('Report submitted successfully. Our team will review it.');
      setReportDialogOpen(false);
      setReportReason('');
      setReportDescription('');
    },
    onError: () => {
      showToast.error('Failed to submit report. Please try again.');
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(135deg, #0055A4 0%, #4A90E2 25%, #00BFFF 50%, #87CEEB 75%, #A8D8EA 100%)' }}>
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white shadow-xl"></div>
      </div>
    );
  }

  if (!broadcaster) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
        <Card className="shadow-2xl border-4 max-w-md" style={{ borderColor: '#00BFFF' }}>
          <CardContent className="p-12 text-center">
            <p className="text-3xl font-extrabold" style={{ color: '#0055A4' }}>{t('broadcaster.notFound')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const languages = [broadcaster.native_language, broadcaster.language_2, broadcaster.language_3, broadcaster.language_4].filter(Boolean);
  const categories = [broadcaster.category_1, broadcaster.category_2].filter(Boolean);
  const photos = [broadcaster.photo_1, broadcaster.photo_2, broadcaster.photo_3].filter(Boolean);

  const handlePhotoClick = (index) => {
    setCurrentPhotoIndex(index);
    setPhotoGalleryOpen(true);
  };

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Row: Stream and Chat side by side */}
        <div className="grid gap-4" style={{ gridTemplateColumns: '70% 30%' }}>
          {/* Streaming Frame - Pass broadcaster and currentUser for host detection */}
          <StreamPlayer broadcaster={broadcaster} currentUser={user} />

          {/* Public Chat Frame */}
          <ChatBox broadcasterId={broadcasterId} currentUser={user} broadcaster={broadcaster} />
        </div>

        {/* Bottom Strip: Combined Session Booking and About */}
        <Card className="shadow-xl border-2" style={{ borderColor: '#00BFFF' }}>
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Session Booking Section */}
              <div>
                <div className="text-center mb-3">
                  <h2 className="text-xl font-extrabold" style={{ color: '#0055A4' }}>Private Call Sessions</h2>
                </div>
                <SessionBooking broadcaster={broadcaster} currentUser={user} />
              </div>

              {/* Level Progress Display */}
              <LevelProgress broadcasterId={broadcaster.id} isOwner={user?.id === broadcaster.id} />

              {/* Divider */}
              <div className="border-t" style={{ borderColor: '#E0F4FF' }}></div>

              {/* About Section */}
              <div>
                <div className="text-center mb-3">
                  <h2 className="text-xl font-extrabold" style={{ color: '#0055A4' }}>About {broadcaster.full_name}</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Profile Info */}
                  <Card className="border-2 shadow-lg" style={{ borderColor: '#00BFFF' }}>
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center text-center">
                        <h1 className="text-2xl font-extrabold" style={{ color: '#0055A4', marginBottom: '16px' }}>{broadcaster.full_name}</h1>

                        {user && user.id !== broadcaster.id && (
                          <div className="flex flex-col items-center w-full">
                            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                              <img 
                                src="/mnt/data/9bf5608b-0246-4912-be1d-80e58cb61fee.png"
                                alt="Flag"
                                style={{ width: '24px', height: 'auto', borderRadius: '4px' }}
                              />
                            </div>
                            <div className="flex gap-2 w-full">
                              <Button
                                onClick={() => favoriteMutation.mutate()}
                                disabled={!user || favoriteMutation.isPending}
                                className="flex-1 h-8 font-bold shadow text-xs"
                                variant={isFavorited ? "default" : "outline"}
                                style={isFavorited ? { backgroundColor: '#0055A4' } : { borderColor: '#0055A4', color: '#0055A4', borderWidth: '2px' }}
                              >
                                <Heart className={`w-3 h-3 mr-1 ${isFavorited ? 'fill-current' : ''}`} />
                                {isFavorited ? 'Favorited' : 'Add Favorite'}
                              </Button>
                              <Button
                                onClick={() => setReportDialogOpen(true)}
                                variant="outline"
                                className="flex-1 h-8 font-bold shadow text-xs"
                                style={{ borderColor: '#DC2626', color: '#DC2626', borderWidth: '2px' }}
                              >
                                <Flag className="w-3 h-3 mr-1" />
                                Report
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center p-2 rounded-lg shadow-sm" style={{ backgroundColor: '#E0F4FF' }}>
                          <p className="text-xl font-extrabold" style={{ color: '#0055A4' }}>{favoriteCount}</p>
                          <p className="text-xs font-bold" style={{ color: '#4A90E2' }}>Followers</p>
                        </div>
                        <div className="text-center p-2 rounded-lg shadow-sm" style={{ backgroundColor: '#E0F4FF' }}>
                          <p className="text-xl font-extrabold flex items-center justify-center gap-1" style={{ color: '#0055A4' }}>
                            <Star className="w-4 h-4" /> {broadcaster.level || 0}
                          </p>
                          <p className="text-xs font-bold" style={{ color: '#4A90E2' }}>Level</p>
                        </div>
                        <div className="text-center p-2 rounded-lg shadow-sm" style={{ backgroundColor: '#E0F4FF' }}>
                          <p className="text-xl font-extrabold" style={{ color: '#0055A4' }}>{completedSessions.length}</p>
                          <p className="text-xs font-bold" style={{ color: '#4A90E2' }}>Sessions</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {languages.length > 0 && (
                          <div className="p-2 rounded-lg shadow-sm" style={{ backgroundColor: '#F0F9FF' }}>
                            <p className="text-sm font-bold mb-1" style={{ color: '#4A90E2' }}>Languages</p>
                            <p className="font-bold text-xs" style={{ color: '#0055A4' }}>{languages.join(', ')}</p>
                          </div>
                        )}

                        {categories.length > 0 && (
                          <div className="p-2 rounded-lg shadow-sm" style={{ backgroundColor: '#F0F9FF' }}>
                            <p className="text-sm font-bold mb-1" style={{ color: '#4A90E2' }}>Categories</p>
                            <p className="font-bold text-xs" style={{ color: '#0055A4' }}>{categories.map(cat => t(`category.${cat}`)).join(', ')}</p>
                          </div>
                        )}

                        {(broadcaster.goal || broadcaster.ethnicity) && (
                          <div className="grid grid-cols-2 gap-2">
                            {broadcaster.goal && (
                              <div className="p-2 rounded-lg shadow-sm" style={{ backgroundColor: '#F0F9FF' }}>
                                <p className="text-sm font-bold mb-1" style={{ color: '#4A90E2' }}>Goal</p>
                                <p className="font-bold text-xs" style={{ color: '#0055A4' }}>{t(`goal.${broadcaster.goal}`)}</p>
                              </div>
                            )}

                            {broadcaster.ethnicity && (
                              <div className="p-2 rounded-lg shadow-sm" style={{ backgroundColor: '#F0F9FF' }}>
                                <p className="text-sm font-bold mb-1" style={{ color: '#4A90E2' }}>Ethnicity</p>
                                <p className="font-bold text-xs" style={{ color: '#0055A4' }}>{t(`ethnicity.${broadcaster.ethnicity}`)}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Photos & Social */}
                  <div className="space-y-4">
                    <Card className="shadow-lg border-2" style={{ borderColor: '#00BFFF' }}>
                      <CardHeader className="p-3">
                        <CardTitle className="text-base font-extrabold text-center" style={{ color: '#0055A4' }}>
                          Photos
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3">
                        <div className="grid grid-cols-3 gap-2">
                          {photos.map((photo, idx) => (
                            <img
                              key={idx}
                              src={photo}
                              alt={`Photo ${idx + 1}`}
                              className="w-full aspect-square object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => handlePhotoClick(idx)}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Social Media Card */}
                    {(broadcaster.instagram || broadcaster.tiktok || broadcaster.twitter || broadcaster.snapchat) && (
                      <Card className="shadow-lg border-2" style={{ borderColor: '#00BFFF' }}>
                        <CardHeader className="p-3">
                          <CardTitle className="text-base font-extrabold text-center" style={{ color: '#0055A4' }}>
                            Social Media
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3">
                        {checkingUnlock ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-lg font-bold" style={{ color: '#0055A4' }}>Unlocking social media...</p>
                            <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
                          </div>
                        ) : hasUnlocked ? (
                          <div className="grid grid-cols-4 gap-2">
                            {broadcaster.instagram && (
                              <a
                                href={broadcaster.instagram.startsWith('http') ? broadcaster.instagram : `https://instagram.com/${broadcaster.instagram}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-pink-50 transition-colors border-2"
                                style={{ borderColor: '#E1306C' }}
                              >
                                <SocialIcons.instagram className="w-8 h-8 mb-1" style={{ color: '#E1306C' }} />
                                <span className="font-bold text-xs" style={{ color: '#0055A4' }}>Instagram</span>
                              </a>
                            )}
                            {broadcaster.tiktok && (
                              <a
                                href={broadcaster.tiktok.startsWith('http') ? broadcaster.tiktok : `https://tiktok.com/@${broadcaster.tiktok}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-50 transition-colors border-2"
                                style={{ borderColor: '#000000' }}
                              >
                                <SocialIcons.tiktok className="w-8 h-8 mb-1" style={{ color: '#000000' }} />
                                <span className="font-bold text-xs" style={{ color: '#0055A4' }}>TikTok</span>
                              </a>
                            )}
                            {broadcaster.twitter && (
                              <a
                                href={broadcaster.twitter.startsWith('http') ? broadcaster.twitter : `https://x.com/${broadcaster.twitter}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-blue-50 transition-colors border-2"
                                style={{ borderColor: '#1DA1F2' }}
                              >
                                <SocialIcons.twitter className="w-8 h-8 mb-1" style={{ color: '#1DA1F2' }} />
                                <span className="font-bold text-xs" style={{ color: '#0055A4' }}>X</span>
                              </a>
                            )}
                            {broadcaster.snapchat && (
                              <a
                                href={broadcaster.snapchat.startsWith('http') ? broadcaster.snapchat : `https://snapchat.com/add/${broadcaster.snapchat}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-yellow-50 transition-colors border-2"
                                style={{ borderColor: '#FFFC00' }}
                              >
                                <SocialIcons.snapchat className="w-8 h-8 mb-1" style={{ color: '#FFFC00' }} />
                                <span className="font-bold text-xs" style={{ color: '#0055A4' }}>Snapchat</span>
                              </a>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={async () => {
                              try {
                                const response = await base44.functions.invoke('createCheckoutSession', {
                                  purchaseType: 'social_links',
                                  streamerId: broadcaster.id,
                                  minutes: 0
                                });
                                if (response.data?.url) {
                                  window.top.location.href = response.data.url;
                                }
                              } catch (error) {
                                console.error('Checkout error:', error);
                              }
                            }}
                            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                          >
                            🔓 Unlock Social Media – ${socialLinkPrice.toFixed(2)}
                          </button>
                        )}
                        </CardContent>
                      </Card>
                    )}
                    </div>
                    </div>
                    </div>
                    </div>
                    </CardContent>
                    </Card>
                    </div>

                    <Dialog open={photoGalleryOpen} onOpenChange={setPhotoGalleryOpen}>
                    <DialogContent className="max-w-4xl p-0 bg-black">
                      <div className="relative">
                        <button
                          onClick={() => setPhotoGalleryOpen(false)}
                          className="absolute top-4 right-4 z-50 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                        >
                          <X className="w-6 h-6" />
                        </button>

                        <div className="relative">
                          <img
                            src={photos[currentPhotoIndex]}
                            alt={`Photo ${currentPhotoIndex + 1}`}
                            className="w-full h-[80vh] object-contain"
                          />

                          {photos.length > 1 && (
                            <>
                              <button
                                onClick={handlePrevPhoto}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-3 hover:bg-black/70 transition-colors"
                              >
                                <ChevronLeft className="w-8 h-8" />
                              </button>
                              <button
                                onClick={handleNextPhoto}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-3 hover:bg-black/70 transition-colors"
                              >
                                <ChevronRight className="w-8 h-8" />
                              </button>

                              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full">
                                {currentPhotoIndex + 1} / {photos.length}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2" style={{ color: '#DC2626' }}>
                          <Flag className="w-5 h-5" />
                          Report {broadcaster.full_name}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Reason for Report</Label>
                          <Select value={reportReason} onValueChange={setReportReason}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sexual_content">Sexual Content</SelectItem>
                              <SelectItem value="nudity">Nudity</SelectItem>
                              <SelectItem value="fake_profile">Fake Profile</SelectItem>
                              <SelectItem value="promoting_adult_websites">Promoting Adult Websites</SelectItem>
                              <SelectItem value="underage_content">Underage Content</SelectItem>
                              <SelectItem value="sexual_harassment">Sexual Harassment</SelectItem>
                              <SelectItem value="predator_behavior">Predator Behavior</SelectItem>
                              <SelectItem value="spam">Spam</SelectItem>
                              <SelectItem value="inappropriate_content">Inappropriate Content</SelectItem>
                              <SelectItem value="hate_speech">Hate Speech</SelectItem>
                              <SelectItem value="violence">Violence</SelectItem>
                              <SelectItem value="scam_fraud">Scam/Fraud</SelectItem>
                              <SelectItem value="copyright_violation">Copyright Violation</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            placeholder="Please provide details about this report..."
                            value={reportDescription}
                            onChange={(e) => setReportDescription(e.target.value)}
                            rows={4}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setReportDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="flex-1"
                            style={{ backgroundColor: '#DC2626' }}
                            onClick={() => reportMutation.mutate()}
                            disabled={!reportReason || !reportDescription || reportMutation.isPending}
                          >
                            Submit Report
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
    </div>
  );
}