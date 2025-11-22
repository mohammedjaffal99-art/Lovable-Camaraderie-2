import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Heart, Star } from 'lucide-react';
import BroadcasterCard from '../components/home/BroadcasterCard';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

export default function MyFavorites() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: favorites, isLoading: favoritesLoading } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await base44.entities.Favorite.filter({ user_id: user.id });
    },
    enabled: !!user?.id,
    initialData: [],
  });

  const { data: broadcasters, isLoading: broadcastersLoading } = useQuery({
    queryKey: ['favoritedBroadcasters', favorites],
    queryFn: async () => {
      if (!favorites || favorites.length === 0) return [];
      const broadcasterIds = favorites.map(f => f.broadcaster_id);
      const allUsers = await base44.entities.User.list();
      return allUsers.filter(u => broadcasterIds.includes(u.id));
    },
    enabled: favorites.length > 0,
    refetchInterval: 10000,
    initialData: [],
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
        <div className="text-center bg-white rounded-3xl shadow-2xl p-16 max-w-lg border-2" style={{ borderColor: '#00BFFF' }}>
          <Heart className="w-24 h-24 mx-auto mb-6" style={{ color: '#87CEEB' }} />
          <h2 className="text-4xl font-extrabold mb-4" style={{ color: '#0055A4' }}>Sign In Required</h2>
          <p className="text-xl font-bold mb-8" style={{ color: '#4A90E2' }}>Please sign in to view your favorite broadcasters</p>
          <Button
            onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
            className="h-14 px-10 text-lg font-extrabold shadow-xl"
            style={{ backgroundColor: '#0055A4' }}
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const liveFavorites = broadcasters.filter(b => b.status === 'live' || b.status === 'online');
  const offlineFavorites = broadcasters.filter(b => b.status === 'offline' || b.status === 'in_session');

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white" style={{ textShadow: '0 2px 10px rgba(0,85,164,0.3)' }}>My Favorites</h1>
          <p className="text-base font-semibold text-white" style={{ textShadow: '0 1px 5px rgba(0,85,164,0.2)' }}>Streamers you've favorited • {broadcasters.length} total</p>
        </div>

        {favoritesLoading || broadcastersLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-white bg-opacity-30 animate-pulse rounded-2xl shadow-lg"></div>
            ))}
          </div>
        ) : broadcasters.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-2xl border-2" style={{ borderColor: '#00BFFF' }}>
            <Heart className="w-24 h-24 mx-auto mb-8" style={{ color: '#87CEEB' }} />
            <h3 className="text-3xl font-extrabold mb-4" style={{ color: '#0055A4' }}>No Favorites Yet</h3>
            <p className="text-xl font-bold mb-8" style={{ color: '#4A90E2' }}>Start adding your favorite streamers to see them here</p>
            <Button
              onClick={() => window.location.href = createPageUrl('Home')}
              className="h-14 px-10 text-lg font-extrabold shadow-xl"
              style={{ backgroundColor: '#0055A4' }}
            >
              Browse Streamers
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            {liveFavorites.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse shadow-lg" />
                  <h2 className="text-xl font-extrabold text-white" style={{ textShadow: '0 1px 5px rgba(0,85,164,0.2)' }}>Live Now ({liveFavorites.length})</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {liveFavorites.map((broadcaster) => (
                    <BroadcasterCard key={broadcaster.id} broadcaster={broadcaster} currentUser={user} />
                  ))}
                </div>
              </div>
            )}

            {offlineFavorites.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-4 h-4 bg-gray-400 rounded-full shadow-md" />
                  <h2 className="text-xl font-extrabold text-white" style={{ textShadow: '0 1px 5px rgba(0,85,164,0.2)' }}>Offline ({offlineFavorites.length})</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {offlineFavorites.map((broadcaster) => (
                    <BroadcasterCard key={broadcaster.id} broadcaster={broadcaster} currentUser={user} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}