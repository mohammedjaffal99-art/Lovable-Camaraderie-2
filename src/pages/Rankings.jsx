import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, Star, Coins } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Rankings() {
  const [activeTab, setActiveTab] = useState('top_earners');

  const { data: streamers, isLoading } = useQuery({
    queryKey: ['streamers'],
    queryFn: async () => {
      return await base44.entities.User.filter({ role: 'broadcaster', broadcaster_approved: true }, '-created_date', 100);
    },
    initialData: [],
  });

  const getTopStreamers = (sortBy) => {
    const sorted = [...streamers].sort((a, b) => {
      if (sortBy === 'top_earners') return (b.total_earnings || 0) - (a.total_earnings || 0);
      if (sortBy === 'most_sessions') return (b.total_sessions || 0) - (a.total_sessions || 0);
      if (sortBy === 'highest_level') return (b.level || 0) - (a.level || 0);
      return 0;
    });
    return sorted.slice(0, 20);
  };

  const topStreamers = getTopStreamers(activeTab);

  const getMedalColor = (rank) => {
    if (rank === 0) return 'bg-yellow-400';
    if (rank === 1) return 'bg-gray-300';
    if (rank === 2) return 'bg-orange-400';
    return 'bg-gray-100';
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
      <div className="max-w-6xl mx-auto">
        <Card className="bg-white mb-8 shadow-2xl border-2" style={{ borderColor: '#00BFFF' }}>
          <CardContent className="p-8">
            <h1 className="text-3xl font-bold mb-4" style={{ color: '#0055A4', letterSpacing: '1px' }}>
              Streamer Rankings
            </h1>
            <p className="text-base font-semibold" style={{ color: '#4A90E2' }}>
              Discover the top performers on Camaraderie.tv! Our rankings showcase streamers based on total earnings,
              number of completed sessions, and experience levels. Follow your favorite streamers to stay updated on their activity.
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => setActiveTab('top_earners')}
            className={`flex items-center gap-2 h-14 px-8 text-base font-extrabold shadow-lg ${activeTab === 'top_earners' ? '' : 'bg-white border-2 hover:bg-blue-50'}`}
            style={activeTab === 'top_earners' ? { backgroundColor: '#0055A4' } : { color: '#0055A4', borderColor: '#00BFFF' }}>
            <Coins className="w-5 h-5" />
            Top Earners
          </Button>
          <Button
            onClick={() => setActiveTab('most_sessions')}
            className={`flex items-center gap-2 h-14 px-8 text-base font-extrabold shadow-lg ${activeTab === 'most_sessions' ? '' : 'bg-white border-2 hover:bg-blue-50'}`}
            style={activeTab === 'most_sessions' ? { backgroundColor: '#0055A4' } : { color: '#0055A4', borderColor: '#00BFFF' }}>
            <Users className="w-5 h-5" />
            Most Sessions
          </Button>
          <Button
            onClick={() => setActiveTab('highest_level')}
            className={`flex items-center gap-2 h-14 px-8 text-base font-extrabold shadow-lg ${activeTab === 'highest_level' ? '' : 'bg-white border-2 hover:bg-blue-50'}`}
            style={activeTab === 'highest_level' ? { backgroundColor: '#0055A4' } : { color: '#0055A4', borderColor: '#00BFFF' }}>
            <Star className="w-5 h-5" />
            Highest Level
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array(10).fill(0).map((_, i) => (
              <div key={i} className="h-28 bg-white bg-opacity-30 animate-pulse rounded-2xl shadow-lg"></div>
            ))}
          </div>
        ) : topStreamers.length === 0 ? (
          <Card className="bg-white shadow-2xl border-2" style={{ borderColor: '#00BFFF' }}>
            <CardContent className="py-20 text-center">
              <h3 className="text-3xl font-extrabold mb-4" style={{ color: '#0055A4' }}>No Streamers Yet</h3>
              <p className="text-xl font-bold" style={{ color: '#4A90E2' }}>Check back later to see the top performers!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {topStreamers.map((streamer, index) => (
              <Card key={streamer.id} className="hover:shadow-2xl transition-shadow bg-white border-2" style={{ borderColor: index < 3 ? '#00BFFF' : '#E0F4FF' }}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center font-extrabold text-2xl shadow-lg ${getMedalColor(index)}`}>
                      {index < 3 ? '🏆' : index + 1}
                    </div>

                    <Link to={createPageUrl(`BroadcasterProfile?id=${streamer.id}`)} className="flex-shrink-0">
                      <img
                        src={streamer.photo_1 || '/placeholder-avatar.png'}
                        alt={streamer.full_name}
                        className="w-20 h-20 rounded-full object-cover border-4 shadow-lg" 
                        style={{ borderColor: '#0055A4' }}
                      />
                    </Link>

                    <div className="flex-1">
                      <Link to={createPageUrl(`BroadcasterProfile?id=${streamer.id}`)} className="hover:underline">
                        <h3 className="font-extrabold text-2xl" style={{ color: '#0055A4' }}>
                          {streamer.full_name}
                        </h3>
                      </Link>
                      <div className="flex gap-4 text-base font-bold mt-2" style={{ color: '#4A90E2' }}>
                        <span>Level {streamer.level || 0}</span>
                        <span>•</span>
                        <span>{streamer.country || 'Unknown'}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      {activeTab === 'top_earners' && (
                        <div className="text-4xl font-extrabold text-green-600">
                          ${(streamer.total_earnings || 0).toFixed(0)}
                        </div>
                      )}
                      {activeTab === 'most_sessions' && (
                        <div className="text-4xl font-extrabold" style={{ color: '#0055A4' }}>
                          {streamer.total_sessions || 0}
                        </div>
                      )}
                      {activeTab === 'highest_level' && (
                        <div className="text-4xl font-extrabold" style={{ color: '#00BFFF' }}>
                          {streamer.level || 0}
                        </div>
                      )}
                      <div className="text-sm font-bold mt-1" style={{ color: '#4A90E2' }}>
                        {activeTab === 'top_earners' && 'Total Earnings'}
                        {activeTab === 'most_sessions' && 'Sessions Completed'}
                        {activeTab === 'highest_level' && 'Experience Level'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}