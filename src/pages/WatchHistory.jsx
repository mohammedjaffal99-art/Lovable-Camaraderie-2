import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatDistanceToNow } from 'date-fns';

export default function WatchHistory() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {
      base44.auth.redirectToLogin(createPageUrl('WatchHistory'));
    });
  }, []);

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['watch-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await base44.entities.Session.filter(
        { customer_id: user.id, status: 'completed' },
        '-ended_at',
        50
      );
    },
    enabled: !!user?.id,
    initialData: [],
  });

  const { data: streamersMap, isLoading: loadingStreamers } = useQuery({
    queryKey: ['streamers-map', sessions],
    queryFn: async () => {
      if (!sessions || sessions.length === 0) return {};
      const streamerIds = [...new Set(sessions.map(s => s.broadcaster_id))];
      const streamers = await Promise.all(
        streamerIds.map(id => base44.entities.User.filter({ id }, '', 1))
      );
      return Object.fromEntries(
        streamers.map(arr => [arr[0]?.id, arr[0]]).filter(([id]) => id)
      );
    },
    enabled: sessions.length > 0,
    initialData: {},
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white shadow-xl"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white" style={{ textShadow: '0 2px 10px rgba(0,85,164,0.3)' }}>
            Watch History
          </h1>
          <p className="text-base font-semibold text-white" style={{ textShadow: '0 1px 5px rgba(0,85,164,0.2)' }}>Your completed session history • {sessions.length} total</p>
        </div>

        {isLoading || loadingStreamers ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-white bg-opacity-30 animate-pulse rounded-2xl shadow-lg"></div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <Card className="bg-white shadow-2xl border-2" style={{ borderColor: '#00BFFF' }}>
            <CardContent className="py-20 text-center">
              <h3 className="text-3xl font-extrabold mb-4" style={{ color: '#0055A4' }}>No Watch History Yet</h3>
              <p className="text-xl font-bold mb-8" style={{ color: '#4A90E2' }}>Start booking sessions to see your history here</p>
              <Link to={createPageUrl('Home')}>
                <Button className="text-white h-14 px-10 text-lg font-extrabold shadow-xl" style={{ backgroundColor: '#0055A4' }}>
                  <Users className="w-5 h-5 mr-2" />
                  Browse Streamers
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const streamer = streamersMap[session.broadcaster_id];
              return (
                <Card key={session.id} className="bg-white hover:shadow-2xl transition-shadow shadow-xl border-2" style={{ borderColor: '#E0F4FF' }}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-5">
                      <Link to={createPageUrl(`BroadcasterProfile?id=${session.broadcaster_id}`)}>
                        <img
                          src={streamer?.photo_1 || '/placeholder-avatar.png'}
                          alt={streamer?.full_name || 'Streamer'}
                          className="w-20 h-20 rounded-full object-cover border-4 shadow-lg" 
                          style={{ borderColor: '#0055A4' }}
                        />
                      </Link>

                      <div className="flex-1">
                        <Link to={createPageUrl(`BroadcasterProfile?id=${session.broadcaster_id}`)} className="hover:underline">
                          <h3 className="font-extrabold text-2xl" style={{ color: '#0055A4' }}>
                            {streamer?.full_name || 'Unknown Streamer'}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-3 text-base font-bold mt-2" style={{ color: '#4A90E2' }}>
                          <span className="capitalize">{session.session_type} Session</span>
                          <span>•</span>
                          <span>{session.duration_minutes} minutes</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(session.ended_at), { addSuffix: true })}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-3xl font-extrabold" style={{ color: '#00BFFF' }}>
                          ${session.total_price.toFixed(2)}
                        </div>
                        <div className="text-sm font-bold mt-1" style={{ color: '#87CEEB' }}>Total Cost</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}