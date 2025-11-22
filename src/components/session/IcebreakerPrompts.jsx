import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, RefreshCw, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function IcebreakerPrompts({ broadcaster, sessionType }) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: icebreakers, isLoading } = useQuery({
    queryKey: ['icebreakers', broadcaster?.id, sessionType, refreshKey],
    queryFn: async () => {
      if (!broadcaster?.id) return [];

      const prompt = `Generate 8 friendly icebreaker conversation starters for a viewer to use during a ${sessionType} session.

Broadcaster Info:
- Name: ${broadcaster.full_name}
- Categories: ${[broadcaster.category_1, broadcaster.category_2].filter(Boolean).join(', ') || 'General'}
- Languages: ${[broadcaster.native_language, broadcaster.language_2].filter(Boolean).join(', ') || 'English'}
- Goal: ${broadcaster.goal || 'Making connections'}
- Country: ${broadcaster.country || 'Unknown'}

Session Type: ${sessionType} (${sessionType === 'video' ? 'Face-to-face video call' : sessionType === 'audio' ? 'Voice call only' : 'Text chat'})

Create icebreakers that:
1. Are friendly, respectful, and appropriate
2. Match the broadcaster's interests/categories
3. Work well for ${sessionType} format
4. Help start engaging conversations
5. Reference their background naturally
6. Are fun and easy to respond to

Return as JSON array of strings (just the icebreaker text, max 100 characters each).`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            icebreakers: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      return response.icebreakers || [];
    },
    enabled: !!broadcaster?.id,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success('Copied! Ready to send');
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    const handleRefreshEvent = () => {
      handleRefresh();
    };
    window.addEventListener('refreshIcebreaker', handleRefreshEvent);
    return () => window.removeEventListener('refreshIcebreaker', handleRefreshEvent);
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : icebreakers && icebreakers.length > 0 ? (
          <div className="space-y-2">
            {icebreakers.map((icebreaker, idx) => (
              <button
                key={idx}
                onClick={() => handleCopy(icebreaker, idx)}
                className="flex items-center gap-2 p-3 rounded border hover:shadow-sm transition-all text-left w-full"
                style={{ borderColor: '#E0F4FF', backgroundColor: 'white' }}
              >
                <p className="text-sm font-semibold flex-1" style={{ color: '#0055A4' }}>{icebreaker}</p>
                {copiedIndex === idx ? (
                  <Check className="w-4 h-4 flex-shrink-0 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 flex-shrink-0" style={{ color: '#4A90E2' }} />
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="w-8 h-8 mx-auto mb-2" style={{ color: '#87CEEB' }} />
            <p className="text-xs font-semibold" style={{ color: '#4A90E2' }}>Click refresh for icebreakers</p>
          </div>
        )}
      </div>
    </div>
  );
}