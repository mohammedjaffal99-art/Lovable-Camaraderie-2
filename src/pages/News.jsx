import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Newspaper, Calendar, Sparkles, Info } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

export default function News() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['platformEvents'],
    queryFn: async () => {
      const settings = await base44.entities.PlatformSettings.filter({ setting_type: 'event' });
      return settings
        .map(s => {
          try {
            const parsedData = JSON.parse(s.setting_value);
            return {
              ...s,
              data: parsedData
            };
          } catch (error) {
            console.error('Failed to parse event data:', error);
            return {
              ...s,
              data: {
                title: s.description || 'Event',
                content: 'Event details unavailable',
                category: 'platform'
              }
            };
          }
        })
        .filter(event => event.data && event.data.title)
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    initialData: [],
  });

  const getCategoryColor = (category) => {
    const colors = {
      platform: 'bg-blue-100 text-blue-800',
      feature: 'bg-green-100 text-green-800',
      event: 'bg-purple-100 text-purple-800',
      news: 'bg-orange-100 text-orange-800',
      insight: 'bg-pink-100 text-pink-800',
      maintenance: 'bg-red-100 text-red-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'platform': return <Sparkles className="w-5 h-5" />;
      case 'feature': return <Sparkles className="w-5 h-5" />;
      case 'event': return <Calendar className="w-5 h-5" />;
      case 'news': return <Newspaper className="w-5 h-5" />;
      case 'insight': return <Info className="w-5 h-5" />;
      case 'maintenance': return <Info className="w-5 h-5" />;
      default: return <Newspaper className="w-5 h-5" />;
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      platform: 'Platform Update',
      feature: 'New Feature',
      event: 'Upcoming Event',
      news: 'Industry News',
      insight: 'Insights & Tips',
      maintenance: 'Maintenance',
    };
    return labels[category] || category;
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(135deg, #A8D8EA 0%, #87CEEB 50%, #00BFFF 100%)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white" style={{ textShadow: '0 2px 10px rgba(0,85,164,0.3)' }}>
            News & Events
          </h1>
          <p className="text-base font-semibold text-white" style={{ textShadow: '0 1px 5px rgba(0,85,164,0.2)' }}>Latest updates and announcements from Camaraderie.tv</p>
        </div>

        <Card className="mb-8 shadow-2xl border-2" style={{ backgroundColor: '#E0F4FF', borderColor: '#00BFFF' }}>
          <CardContent className="p-8">
            <h2 className="font-extrabold text-2xl mb-3" style={{ color: '#0055A4' }}>
              Stay Updated
            </h2>
            <p className="text-lg font-bold leading-relaxed" style={{ color: '#4A90E2' }}>
              Your hub for platform updates, news, and announcements. Check back for new features, events, and important changes for streamers and followers.
            </p>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="space-y-6">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-48 bg-white bg-opacity-30 animate-pulse rounded-2xl shadow-lg"></div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <Card className="shadow-2xl border-2" style={{ borderColor: '#00BFFF' }}>
            <CardContent className="py-20 text-center">
              <Newspaper className="w-20 h-20 mx-auto mb-6" style={{ color: '#87CEEB' }} />
              <h3 className="text-3xl font-extrabold mb-4" style={{ color: '#0055A4' }}>
                No News Yet
              </h3>
              <p className="text-xl font-bold" style={{ color: '#4A90E2' }}>
                Check back soon for the latest updates, articles, and announcements!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {events.map((event) => {
              const category = event.data?.category || 'platform';
              const title = event.data?.title || 'Untitled Event';
              const content = event.data?.content || '';

              return (
                <Card key={event.id} className="bg-white hover:shadow-3xl transition-shadow shadow-2xl border-2" style={{ borderColor: '#E0F4FF' }}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${getCategoryColor(category)}`}>
                        {getCategoryIcon(category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                          <h2 className="text-xl font-extrabold" style={{ color: '#0055A4' }}>
                            {title}
                          </h2>
                          <Badge className={`${getCategoryColor(category)} font-bold text-sm`}>
                            {getCategoryLabel(category)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-base font-bold" style={{ color: '#87CEEB' }}>
                          <Calendar className="w-5 h-5" />
                          {formatDistanceToNow(new Date(event.created_date), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold leading-relaxed whitespace-pre-wrap" style={{ color: '#4A90E2' }}>
                      {content}
                    </p>
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