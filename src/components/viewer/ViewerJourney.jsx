import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Heart, Clock, TrendingUp, Trophy, Calendar, MessageSquare, Phone } from 'lucide-react';
import { format } from 'date-fns';

export default function ViewerJourney({ currentUser }) {
  const { data: journeyData, isLoading } = useQuery({
    queryKey: ['viewerJourney', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;

      const [sessions, favorites, series] = await Promise.all([
        base44.entities.Session.filter({ customer_id: currentUser.id }, '-created_date', 100),
        base44.entities.Favorite.filter({ user_id: currentUser.id }),
        base44.entities.RecurringSeries.filter({ viewer_id: currentUser.id, status: 'active' })
      ]);

      const completedSessions = sessions.filter(s => s.status === 'completed');
      const totalMinutes = completedSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
      const totalSpent = completedSessions.reduce((sum, s) => sum + (s.total_price || 0), 0);
      
      // Calculate streaks and milestones
      const sessionDates = completedSessions.map(s => new Date(s.created_date).toDateString());
      const uniqueDates = [...new Set(sessionDates)];
      
      const sessionTypes = {
        video: completedSessions.filter(s => s.session_type === 'video').length,
        audio: completedSessions.filter(s => s.session_type === 'audio').length,
        text: completedSessions.filter(s => s.session_type === 'text').length
      };

      const uniqueBroadcasters = [...new Set(completedSessions.map(s => s.broadcaster_id))];

      return {
        totalSessions: completedSessions.length,
        totalMinutes,
        totalSpent,
        activeDays: uniqueDates.length,
        favorites: favorites.length,
        activeSeries: series.length,
        sessionTypes,
        uniqueBroadcasters: uniqueBroadcasters.length,
        recentSessions: completedSessions.slice(0, 5)
      };
    },
    enabled: !!currentUser?.id,
  });

  const getMilestoneProgress = (count, milestone) => {
    return Math.min(100, (count / milestone) * 100);
  };

  const milestones = [
    { label: 'First Session', target: 1, icon: Video },
    { label: '10 Sessions', target: 10, icon: Trophy },
    { label: '5 Favorites', target: 5, icon: Heart },
    { label: '100 Minutes', target: 100, icon: Clock },
    { label: '3 Active Series', target: 3, icon: Calendar },
  ];

  if (!currentUser) return null;

  if (isLoading) {
    return (
      <Card className="shadow-xl border-4" style={{ borderColor: '#00BFFF' }}>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!journeyData) return null;

  const sessionTypeIcons = {
    video: Video,
    audio: Phone,
    text: MessageSquare
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-xl border-4" style={{ borderColor: '#00BFFF' }}>
        <CardHeader className="rounded-t-lg" style={{ background: 'linear-gradient(90deg, #0055A4, #00BFFF)' }}>
          <div className="flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-white" />
            <div>
              <CardTitle className="text-2xl font-extrabold text-white">Your Journey</CardTitle>
              <p className="text-sm font-semibold text-white/90 mt-1">Track your progress and achievements</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl shadow-lg text-center" style={{ backgroundColor: '#E0F4FF' }}>
              <Video className="w-8 h-8 mx-auto mb-2" style={{ color: '#0055A4' }} />
              <p className="text-3xl font-extrabold" style={{ color: '#0055A4' }}>{journeyData.totalSessions}</p>
              <p className="text-xs font-bold" style={{ color: '#4A90E2' }}>Total Sessions</p>
            </div>
            <div className="p-4 rounded-xl shadow-lg text-center" style={{ backgroundColor: '#E0F4FF' }}>
              <Clock className="w-8 h-8 mx-auto mb-2" style={{ color: '#0055A4' }} />
              <p className="text-3xl font-extrabold" style={{ color: '#0055A4' }}>{journeyData.totalMinutes}</p>
              <p className="text-xs font-bold" style={{ color: '#4A90E2' }}>Minutes</p>
            </div>
            <div className="p-4 rounded-xl shadow-lg text-center" style={{ backgroundColor: '#E0F4FF' }}>
              <Heart className="w-8 h-8 mx-auto mb-2" style={{ color: '#0055A4' }} />
              <p className="text-3xl font-extrabold" style={{ color: '#0055A4' }}>{journeyData.favorites}</p>
              <p className="text-xs font-bold" style={{ color: '#4A90E2' }}>Favorites</p>
            </div>
            <div className="p-4 rounded-xl shadow-lg text-center" style={{ backgroundColor: '#E0F4FF' }}>
              <TrendingUp className="w-8 h-8 mx-auto mb-2" style={{ color: '#0055A4' }} />
              <p className="text-3xl font-extrabold" style={{ color: '#0055A4' }}>{journeyData.uniqueBroadcasters}</p>
              <p className="text-xs font-bold" style={{ color: '#4A90E2' }}>Broadcasters Met</p>
            </div>
          </div>

          {journeyData.activeSeries > 0 && (
            <div className="mb-6 p-4 rounded-xl shadow-lg" style={{ backgroundColor: '#E0F4FF' }}>
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-6 h-6" style={{ color: '#00BFFF' }} />
                <p className="font-extrabold text-lg" style={{ color: '#0055A4' }}>Active Series: {journeyData.activeSeries}</p>
              </div>
              <p className="text-sm font-semibold" style={{ color: '#4A90E2' }}>
                You have {journeyData.activeSeries} recurring series! These help you build deeper connections with your favorite broadcasters.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <p className="font-extrabold text-lg mb-4" style={{ color: '#0055A4' }}>Milestones & Achievements</p>
            {milestones.map((milestone, idx) => {
              const Icon = milestone.icon;
              const currentValue = 
                milestone.label.includes('Session') ? journeyData.totalSessions :
                milestone.label.includes('Favorite') ? journeyData.favorites :
                milestone.label.includes('Minutes') ? journeyData.totalMinutes :
                milestone.label.includes('Series') ? journeyData.activeSeries : 0;
              
              const progress = getMilestoneProgress(currentValue, milestone.target);
              const isCompleted = currentValue >= milestone.target;

              return (
                <div key={idx} className="p-4 rounded-lg shadow-md border-2" style={{ 
                  backgroundColor: isCompleted ? '#E0F4FF' : '#F0F9FF',
                  borderColor: isCompleted ? '#00BFFF' : '#87CEEB'
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" style={{ color: isCompleted ? '#00BFFF' : '#4A90E2' }} />
                      <span className="font-bold" style={{ color: '#0055A4' }}>{milestone.label}</span>
                    </div>
                    {isCompleted && (
                      <Badge className="font-bold" style={{ backgroundColor: '#00BFFF' }}>
                        ✓ Completed
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{ 
                          width: `${progress}%`,
                          background: isCompleted ? '#00BFFF' : 'linear-gradient(90deg, #0055A4, #00BFFF)'
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold" style={{ color: '#4A90E2' }}>
                      {currentValue} / {milestone.target}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {journeyData.sessionTypes.video > 0 || journeyData.sessionTypes.audio > 0 || journeyData.sessionTypes.text > 0 ? (
            <div className="mt-6 p-4 rounded-xl shadow-lg" style={{ backgroundColor: '#F0F9FF' }}>
              <p className="font-extrabold text-base mb-3" style={{ color: '#0055A4' }}>Session Type Breakdown</p>
              <div className="grid grid-cols-3 gap-3">
                {journeyData.sessionTypes.video > 0 && (
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#E0F4FF' }}>
                    <Video className="w-5 h-5 mx-auto mb-1" style={{ color: '#0055A4' }} />
                    <p className="text-2xl font-extrabold" style={{ color: '#0055A4' }}>{journeyData.sessionTypes.video}</p>
                    <p className="text-xs font-bold" style={{ color: '#4A90E2' }}>Video</p>
                  </div>
                )}
                {journeyData.sessionTypes.audio > 0 && (
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#E0F4FF' }}>
                    <Phone className="w-5 h-5 mx-auto mb-1" style={{ color: '#0055A4' }} />
                    <p className="text-2xl font-extrabold" style={{ color: '#0055A4' }}>{journeyData.sessionTypes.audio}</p>
                    <p className="text-xs font-bold" style={{ color: '#4A90E2' }}>Audio</p>
                  </div>
                )}
                {journeyData.sessionTypes.text > 0 && (
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#E0F4FF' }}>
                    <MessageSquare className="w-5 h-5 mx-auto mb-1" style={{ color: '#0055A4' }} />
                    <p className="text-2xl font-extrabold" style={{ color: '#0055A4' }}>{journeyData.sessionTypes.text}</p>
                    <p className="text-xs font-bold" style={{ color: '#4A90E2' }}>Text</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}