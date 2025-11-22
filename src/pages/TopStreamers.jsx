import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import BroadcasterCard from '../components/home/BroadcasterCard';

export default function TopStreamers() {
  const { data: streamers, isLoading } = useQuery({
    queryKey: ['top-streamers'],
    queryFn: async () => {
      const all = await base44.entities.User.filter({ role: 'broadcaster', broadcaster_approved: true, status: 'live' }, '-created_date', 100);
      return all.sort((a, b) => (b.level || 0) - (a.level || 0)).slice(0, 20);
    },
    initialData: [],
  });

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white" style={{ textShadow: '0 2px 10px rgba(0,85,164,0.3)' }}>
            Top Streamers
          </h1>
          <p className="text-base font-semibold text-white" style={{ textShadow: '0 1px 5px rgba(0,85,164,0.2)' }}>The hottest streamers on Camaraderie.tv</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(12).fill(0).map((_, i) => (
              <div key={i} className="h-96 bg-white bg-opacity-30 animate-pulse rounded-2xl shadow-lg"></div>
            ))}
          </div>
        ) : streamers.length === 0 ? (
          <Card className="bg-white shadow-2xl border-2" style={{ borderColor: '#00BFFF' }}>
            <CardContent className="py-20 text-center">
              <h3 className="text-3xl font-extrabold mb-4" style={{ color: '#0055A4' }}>No Top Streamers Live</h3>
              <p className="text-xl font-bold" style={{ color: '#4A90E2' }}>Check back later to see who's streaming!</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {streamers.map((streamer, index) => (
                <div key={streamer.id} className="relative">
                  {index < 3 && (
                    <div className="absolute -top-2 -right-2 z-10 w-14 h-14 rounded-full flex items-center justify-center font-extrabold text-2xl shadow-2xl"
                      style={{
                        backgroundColor: index === 0 ? '#FCD34D' : index === 1 ? '#D1D5DB' : '#FB923C'
                      }}>
                      #{index + 1}
                    </div>
                  )}
                  <BroadcasterCard broadcaster={streamer} />
                </div>
              ))}
            </div>

            <div className="mt-16 bg-white rounded-3xl p-12 shadow-2xl border-2" style={{ borderColor: '#00BFFF' }}>
              <h2 className="text-4xl font-extrabold mb-6" style={{ color: '#0055A4' }}>
                More Top Streamers
              </h2>
              <p className="text-xl font-bold mb-8" style={{ color: '#4A90E2' }}>
                These are our most popular and highest-rated streamers based on engagement, viewer satisfaction, and activity.
                Follow them to get notifications when they go live!
              </p>
              <a
                href={'/'}
                className="inline-block px-10 py-5 rounded-full text-white font-extrabold text-xl hover:shadow-3xl transition-all shadow-2xl"
                style={{ backgroundColor: '#0055A4' }}>
                Browse All Streamers
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}