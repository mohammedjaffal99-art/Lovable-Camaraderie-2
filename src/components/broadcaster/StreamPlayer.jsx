import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import CaptionDisplay from './CaptionDisplay';
import StreamHostView from './StreamHostView';
import StreamViewerView from './StreamViewerView';

export default function StreamPlayer({ broadcaster, currentUser }) {
  const { t } = useLanguage();

  const roomId = `camaraderie${broadcaster.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)}`;
  const streamerId = broadcaster.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);

  // Role-based host detection
  const isStreamer = currentUser?.id === broadcaster?.id;
  const isAdmin = currentUser?.role === 'admin';
  const isHost = isStreamer || isAdmin;

  console.log('🎥 STREAM PLAYER:', {
    broadcasterId: broadcaster?.id,
    currentUserId: currentUser?.id,
    currentUserRole: currentUser?.role,
    isStreamer,
    isAdmin,
    isHost,
    roomId,
    streamerId,
    status: broadcaster?.status
  });

  const { data: activeSessions } = useQuery({
    queryKey: ['activeSessions', broadcaster.id],
    queryFn: async () => {
      return await base44.entities.Session.filter({
        broadcaster_id: broadcaster.id,
        status: 'active'
      });
    },
    enabled: broadcaster.status === 'in_session',
    refetchInterval: 5000,
    initialData: [],
  });
  
  const userRole = currentUser?.user_role || 'guest';
  const canViewStream = ['guest', 'user', 'streamer', 'moderator', 'admin'].includes(userRole);

  if (!canViewStream) {
    return (
      <Card className="shadow-2xl border-4" style={{ borderColor: '#FF6B6B' }}>
        <CardContent className="p-8 text-center">
          <p className="text-xl font-bold mb-4" style={{ color: '#DC2626' }}>
            Sign in to view streams
          </p>
          <Button onClick={() => base44.auth.redirectToLogin(window.location.pathname)} style={{ backgroundColor: '#0055A4' }}>
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-2xl border-4 h-full" style={{ borderColor: '#00BFFF' }}>
      <CardContent className="p-0">
        {broadcaster.status === 'online' ? (
          <>
            {isHost ? (
              <StreamHostView streamerId={streamerId} roomId={roomId} />
            ) : (
              <StreamViewerView streamerId={streamerId} roomId={roomId} />
            )}

            <CaptionDisplay isLiveStream={true} sessionId={null} />

            <div className="p-4 border-t-2 shadow-inner" style={{ borderColor: '#87CEEB', backgroundColor: '#F0FDF4' }}>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                  <span className="font-bold" style={{ color: '#16A34A' }}>
                    {isHost ? '🎥 BROADCASTER' : 'WATCHING LIVE'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold" style={{ color: '#4A90E2' }}>{t('stream.viewers')}</span>
                  <span className="font-extrabold text-lg" style={{ color: '#0055A4' }}>
                    {Math.floor(Math.random() * 50) + 10}
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : broadcaster.status === 'in_session' ? (
          <div className="relative bg-gray-900" style={{ height: '550px' }}>
            {broadcaster.photo_1 && (
              <>
                <img
                  src={broadcaster.photo_1}
                  alt={broadcaster.full_name}
                  className="w-full h-full object-cover"
                  style={{ filter: 'brightness(0.3)' }}
                />
                <div className="absolute inset-0 bg-black/40"></div>
              </>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 z-10">
              <div className="relative mb-4">
                <Clock className="w-16 h-16 opacity-50 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 border-4 border-red-500 rounded-full animate-ping opacity-20"></div>
                </div>
              </div>
              <Badge className="mb-3 px-5 py-2 text-base font-bold bg-red-500 text-white">
                IN PRIVATE SESSION
              </Badge>
              <p className="text-sm text-gray-400 text-center mb-4">
                {broadcaster.full_name} {t('stream.busyUser')}
              </p>
            </div>
          </div>
        ) : (
          <div className="relative bg-gray-900" style={{ height: '550px' }}>
            {broadcaster.photo_1 && (
              <>
                <img
                  src={broadcaster.photo_1}
                  alt={broadcaster.full_name}
                  className="w-full h-full object-cover"
                  style={{ filter: 'brightness(0.3)' }}
                />
                <div className="absolute inset-0 bg-black/40"></div>
              </>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 z-10">
              {broadcaster.last_active && (
                <p className="text-gray-300 text-sm font-semibold mb-4">
                  Was online {formatDistanceToNow(new Date(broadcaster.last_active), { addSuffix: true })}
                </p>
              )}
              <p className="text-sm text-gray-400 text-center">
                {t('stream.addFavorites')}
              </p>
            </div>
          </div>
        )}

        {broadcaster.status === 'in_session' && (
          <div className="p-4 border-t-2 shadow-inner" style={{ borderColor: '#87CEEB', backgroundColor: '#FEF2F2' }}>
            <div className="text-center">
              <p className="text-sm font-extrabold" style={{ color: '#DC2626' }}>Currently in a private session</p>
              <p className="text-xs font-semibold mt-1" style={{ color: '#EF4444' }}>Available soon for new bookings</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}