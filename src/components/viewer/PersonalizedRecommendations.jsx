import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, TrendingUp, Heart, Star, Users } from 'lucide-react';
import BroadcasterCard from '../home/BroadcasterCard';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PersonalizedRecommendations({ currentUser }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['personalizedRecommendations', currentUser?.id, refreshKey],
    queryFn: async () => {
      if (!currentUser?.id) return { broadcasters: [], reasons: {} };

      // Fetch user's interaction history
      const [sessions, favorites, preferences, allBroadcasters] = await Promise.all([
        base44.entities.Session.filter({ customer_id: currentUser.id }, '-created_date', 50),
        base44.entities.Favorite.filter({ user_id: currentUser.id }),
        base44.entities.ViewerPreference.filter({ viewer_id: currentUser.id }, '-created_date', 100),
        base44.entities.User.filter({ role: 'broadcaster', broadcaster_approved: true })
      ]);

      const adminBroadcasters = await base44.entities.User.filter({ role: 'admin', broadcaster_approved: true });
      const broadcasters = [...allBroadcasters, ...adminBroadcasters].filter(b => b.status === 'online' || b.status === 'offline');

      // Build user profile
      const sessionedBroadcasters = [...new Set(sessions.map(s => s.broadcaster_id))];
      const favoritedBroadcasters = favorites.map(f => f.broadcaster_id);
      const viewedCategories = preferences.filter(p => p.category).map(p => p.category);
      const viewedLanguages = preferences.filter(p => p.language).map(p => p.language);
      const preferredSessionTypes = sessions.map(s => s.session_type);

      const prompt = `You are an AI recommendation engine for a live streaming platform. Generate personalized broadcaster recommendations for a viewer.

Viewer Profile:
- Total Sessions Completed: ${sessions.length}
- Favorites: ${favoritedBroadcasters.length}
- Previously Interacted With: ${sessionedBroadcasters.length} broadcasters
- Browsed Categories: ${[...new Set(viewedCategories)].join(', ') || 'None'}
- Language Interests: ${[...new Set(viewedLanguages)].join(', ') || 'None'}
- Preferred Session Types: ${[...new Set(preferredSessionTypes)].join(', ') || 'None'}

Available Broadcasters: ${broadcasters.length}
Sample Broadcasters:
${broadcasters.slice(0, 20).map(b => `- ${b.full_name} (${b.country || 'Unknown'}): ${[b.category_1, b.category_2].filter(Boolean).join(', ')}, Languages: ${[b.native_language, b.language_2].filter(Boolean).join(', ')}, Level ${b.level || 0}, Status: ${b.status}`).join('\n')}

Task: Recommend 6 broadcasters from the available list that would best match this viewer's preferences. Consider:
1. Previously successful interactions (similar categories/languages)
2. New discoveries that align with their interests
3. Highly-rated broadcasters in their preferred categories
4. Online broadcasters for immediate interaction
5. Balance between familiar and new experiences

For each recommendation, provide:
- broadcaster_name: exact name from the list
- reason: why this broadcaster is recommended (max 100 chars)
- match_score: 0-100 confidence score
- recommendation_type: "based_on_history" | "new_discovery" | "trending" | "similar_to_favorites"

Return as JSON with array of recommendations.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  broadcaster_name: { type: "string" },
                  reason: { type: "string" },
                  match_score: { type: "number" },
                  recommendation_type: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Map recommendations to actual broadcaster objects
      const recommendedBroadcasters = response.recommendations
        .map(rec => {
          const broadcaster = broadcasters.find(b => b.full_name === rec.broadcaster_name);
          return broadcaster ? { ...broadcaster, recommendation: rec } : null;
        })
        .filter(Boolean)
        .slice(0, 6);

      const reasons = {};
      recommendedBroadcasters.forEach(b => {
        if (b.recommendation) {
          reasons[b.id] = b.recommendation.reason;
        }
      });

      return { broadcasters: recommendedBroadcasters, reasons };
    },
    enabled: !!currentUser?.id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (!currentUser) {
    return (
      <Card className="shadow-xl border-2" style={{ borderColor: '#00BFFF' }}>
        <CardContent className="p-8 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4" style={{ color: '#87CEEB' }} />
          <p className="text-lg font-bold mb-4" style={{ color: '#0055A4' }}>Sign in to get personalized recommendations</p>
          <Button onClick={() => base44.auth.redirectToLogin()} style={{ backgroundColor: '#0055A4' }}>
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-2" style={{ borderColor: '#00BFFF' }}>
      <CardHeader className="rounded-t-lg" style={{ background: 'linear-gradient(90deg, #0055A4, #00BFFF)' }}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-extrabold text-white">Recommended For You</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="text-white hover:bg-white/20"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-200 animate-pulse rounded-xl"></div>
            ))}
          </div>
        ) : recommendations?.broadcasters?.length > 0 ? (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {recommendations.broadcasters.map((broadcaster) => (
                <BroadcasterCard key={broadcaster.id} broadcaster={broadcaster} currentUser={currentUser} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 mx-auto mb-4" style={{ color: '#87CEEB' }} />
            <p className="text-lg font-bold mb-2" style={{ color: '#0055A4' }}>Start exploring to get recommendations!</p>
            <p className="font-semibold mb-4" style={{ color: '#4A90E2' }}>Watch streams, favorite broadcasters, and book sessions</p>
            <Link to={createPageUrl('Home')}>
              <Button style={{ backgroundColor: '#0055A4' }}>Browse Broadcasters</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}