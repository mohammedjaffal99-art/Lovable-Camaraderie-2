import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, Users, Sparkles, RefreshCw, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function ContentSuggestions({ broadcaster }) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: suggestions, isLoading, refetch } = useQuery({
    queryKey: ['contentSuggestions', broadcaster?.id, refreshKey],
    queryFn: async () => {
      if (!broadcaster?.id) return null;

      const sessions = await base44.entities.Session.filter(
        { broadcaster_id: broadcaster.id, status: 'completed' },
        '-created_date',
        50
      );

      const favorites = await base44.entities.Favorite.filter({ broadcaster_id: broadcaster.id });
      
      const prompt = `You are an AI content strategist for live streamers. Generate 5 personalized content suggestions for a broadcaster.

Broadcaster Profile:
- Name: ${broadcaster.full_name}
- Categories: ${[broadcaster.category_1, broadcaster.category_2].filter(Boolean).join(', ') || 'Not set'}
- Languages: ${[broadcaster.native_language, broadcaster.language_2, broadcaster.language_3, broadcaster.language_4].filter(Boolean).join(', ') || 'Not set'}
- Level: ${broadcaster.level || 0}
- Total Sessions: ${broadcaster.total_sessions || 0}
- Recent Session Count: ${sessions.length}
- Followers: ${favorites.length}

Based on this profile, suggest 5 specific content ideas that would:
1. Align with their categories and languages
2. Engage their current audience
3. Attract new viewers
4. Help them grow their following
5. Stand out from other streamers

For each suggestion, provide:
- A catchy title (max 60 characters)
- Brief description (max 120 characters)
- Why this would work for them (max 100 characters)
- Difficulty level (Beginner/Intermediate/Advanced)

Format as JSON array of objects with fields: title, description, reason, difficulty`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  reason: { type: "string" },
                  difficulty: { type: "string" }
                }
              }
            }
          }
        }
      });

      return response.suggestions || [];
    },
    enabled: !!broadcaster?.id,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success('Copied to clipboard!');
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.success('Generating fresh suggestions...');
  };

  const difficultyColors = {
    'Beginner': '#4CAF50',
    'Intermediate': '#FF9800',
    'Advanced': '#E91E63'
  };

  return (
    <Card className="shadow-xl border-4" style={{ borderColor: '#00BFFF' }}>
      <CardHeader className="rounded-t-lg" style={{ background: 'linear-gradient(90deg, #0055A4, #00BFFF)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lightbulb className="w-7 h-7 text-white" />
            <div>
              <CardTitle className="text-2xl font-extrabold text-white">AI Content Suggestions</CardTitle>
              <p className="text-sm font-semibold text-white/90 mt-1">Personalized ideas to grow your channel</p>
            </div>
          </div>
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
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mt-1"></div>
              </div>
            ))}
          </div>
        ) : suggestions && suggestions.length > 0 ? (
          <div className="space-y-4">
            {suggestions.map((suggestion, idx) => (
              <div key={idx} className="p-5 rounded-xl shadow-lg border-2 hover:shadow-xl transition-all" style={{ borderColor: '#87CEEB', backgroundColor: '#F0F9FF' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5" style={{ color: '#00BFFF' }} />
                      <h4 className="text-lg font-extrabold" style={{ color: '#0055A4' }}>{suggestion.title}</h4>
                    </div>
                    <p className="text-sm font-semibold mb-3" style={{ color: '#4A90E2' }}>{suggestion.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4" style={{ color: '#00BFFF' }} />
                      <p className="text-xs font-bold" style={{ color: '#87CEEB' }}>{suggestion.reason}</p>
                    </div>
                    <Badge className="font-bold text-white" style={{ backgroundColor: difficultyColors[suggestion.difficulty] || '#4A90E2' }}>
                      {suggestion.difficulty}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(suggestion.title, idx)}
                    className="h-8 w-8 p-0"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" style={{ color: '#4A90E2' }} />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 mx-auto mb-3" style={{ color: '#87CEEB' }} />
            <p className="font-semibold" style={{ color: '#4A90E2' }}>Click refresh to generate suggestions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}